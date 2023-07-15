# In the CWD, there should be a clone of https://git.ecker.tech/a-One-Fan/ai-voice-cloning-oneapi
# And you should have set it up

import socket
import struct
import subprocess
import os
import time

# Change the port here?
ADDR = ("127.0.0.1", 6101)
BATCHSIZE = 8

modelDict = {"one": ["./models/One_350_model.pth", "./models/One_350_latents.pth"], "misaka": ["./models/Misaka_240_model.pth", "./models/Misaka_240_latents.pth"]}

CHILD_ADDR = ("127.0.0.1", 6102)

SOCK_RETRY_TIME = 0.5
# I don't want to have multiple files, this file will create the other file
def gen_child_code(modelpath, latentspath):
    return f"""
import socket
import struct
import torch
import torchaudio
import importlib
import time
tts_api = importlib.import_module("ai-voice-cloning-oneapi.modules.tortoise-tts.tortoise.api")

latents = torch.load("{latentspath}")
tts = tts_api.TextToSpeech(autoregressive_model_path = "{modelpath}", autoregressive_batch_size = {BATCHSIZE})

sock = socket.socket()

# Linux is bad because it will not release sockets of killed programs in a timely manner
success = False
while not success:
    try:
        sock.bind({CHILD_ADDR})
        success = True
    except:
        time.sleep({SOCK_RETRY_TIME})

sock.listen()
while True:
    connected_sock = sock.accept()[0]
    msg = connected_sock.recv(4096)

    command, samples, iters, temp, diff_temp, p, length_pen, repetition_pen, cond_k, text = struct.unpack("16s2i6f2048s", msg)
    command = command.decode('ascii').split("\\x00")[0]

    if command == "stop":
        connected_sock.close()
        sock.close()
        exit()

    if command == "ping":
        connected_sock.send(b'ping' + bytearray(2096-4))
        connected_sock.close()
        continue
    
    text = text.decode('ascii').split("\\x00")[0]

    aud_te = tts.tts(text = text, conditioning_latents = latents, 
                     num_autoregressive_samples = samples, sample_batch_size = {BATCHSIZE}, diffusion_iterations = iters,
                     length_penalty = length_pen, repetition_penalty = repetition_pen,
                     temperature = temp, diffusion_temperature = diff_temp, top_p = p, cond_free_k = cond_k
                    )
    
    torchaudio.save("generated_aud.wav", aud_te.squeeze(0).cpu(), tts.output_sample_rate)

    connected_sock.send("Done.".encode("ascii"), 5)
    connected_sock.close()
"""

childstart = """
#!/bin/bash
source /opt/intel/oneapi/mkl/latest/env/vars.sh
source /opt/intel/oneapi/compiler/latest/env/vars.sh
source ./ai-voice-cloning-oneapi/venv/bin/activate
python ./speakserver_child.py
"""

class TTSwrapper:
    modelname = None

    def stopchild(self):
        print("Stopping child...")
        sock = socket.socket()
        sock.connect(CHILD_ADDR)
        sock.send(b'stop' + bytearray(2096-4))
        sock.close()
        time.sleep(0.5) # Is this necessary? Probably a good idea to have this here
        print("Child stopped")

    def startchild(self, modelname):
        print("Starting child...")
        childcode = gen_child_code(modelDict[modelname][0], modelDict[modelname][1])
        childfile = open("speakserver_child.py", "w")
        childfile.write(childcode)
        childfile.close()

        childstartfile = open("speakserver_child_start.sh", "w")
        childstartfile.write(childstart)
        childstartfile.close()

        subprocess.Popen(["bash", f"{os.getcwd()}/speakserver_child_start.sh"],
                         #stdin=None, stdout=None, stderr=None,
                         )
        
        sock = socket.socket()
        success = False
        while not success:
            try:
                sock.connect(CHILD_ADDR)
                success = True
            except:
                time.sleep(SOCK_RETRY_TIME)

        sock.send(b'ping' + bytearray(2096-4), 2096)
        sock.recv(2096)
        sock.close()
        print("Child started")

    def query_child(self, query):
        sock = socket.socket()
        sock.connect(CHILD_ADDR)
        sock.send(query, 2096)
        sock.recv(2096)
        sock.close()
        
    def reload(self, model):
        self.stopchild()
        self.startchild(model)

    def maybe_reload(self, model):
        if self.modelname != model:
            self.modelname = model
            self.reload(model)
    
    def __init__(self):
        self.modelname = 'one'
        self.startchild('one')

wrapper = TTSwrapper()

sock = socket.socket()
success = False
while not success:
    try:
        sock.bind(ADDR)
        success = True
    except:
        time.sleep(SOCK_RETRY_TIME)
sock.listen()

print("Server listening...")
while True:
    connected_sock = sock.accept()[0]

    msg = connected_sock.recv(4096)
    # Model, autoregressive samples, diffusion iters, temperature, diffusion temperature, P value, length penalty, repetition penalty, conditioning free k, text

    model, samples, iters, temp, diff_temp, p, length_pen, repetition_pen, cond_k, text = struct.unpack("16s2i6f2048s", msg)
    model = model.decode('ascii').split("\x00")[0]
    text = text.decode('ascii').split("\x00")[0]
    print(f"Received request: {(model, samples, iters, temp, diff_temp, p, length_pen, repetition_pen, cond_k, text)}")

    wrapper.maybe_reload(model)
    wrapper.query_child(msg)

    file = open("generated_aud.wav", "rb")
    chunk = True
    while(chunk):
        chunk = file.read(4096)
        connected_sock.send(chunk, 4096)

    connected_sock.close()
