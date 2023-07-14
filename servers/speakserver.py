# In the CWD, there should be a clone of https://git.ecker.tech/a-One-Fan/ai-voice-cloning-oneapi
# And you should use the venv it creates.

import socket
import struct
import torch
import torchaudio

import importlib
tts_api = importlib.import_module("ai-voice-cloning-oneapi.modules.tortoise-tts.tortoise.api")

modelDict = {"one": ["./models/One_350_model.pth", "./models/One_350_latents.pth"], "misaka": ["./models/Misaka_240_model.pth", "./models/Misaka_240_latents.pth"]}

currentModel = None
currentLatents = None
tts = None

BATCHSIZE = 8

def reloadTts(model):
    global currentModel
    global currentLatents
    global tts
    
    currentModel = model
    currentLatents = torch.load(modelDict[currentModel][1])
    del tts
    tts = tts_api.TextToSpeech(autoregressive_model_path = modelDict[currentModel][0], autoregressive_batch_size = BATCHSIZE)

reloadTts("one")

addr = ("127.0.0.1", 6101)
sock = socket.socket()
sock.bind(addr)
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

    if currentModel != model:
        reloadTts(model)

    aud_te = tts.tts(text = text, conditioning_latents = currentLatents, 
                     num_autoregressive_samples = samples, sample_batch_size = BATCHSIZE, diffusion_iterations = iters,
                     length_penalty = length_pen, repetition_penalty = repetition_pen,
                     temperature = temp, diffusion_temperature = diff_temp, top_p = p, cond_free_k = cond_k
                    )
    
    torchaudio.save("generated_aud.wav", aud_te.squeeze(0).cpu(), tts.output_sample_rate)
    print("Saved generated audio")
    file = open("generated_aud.wav", "rb")
    chunk = True
    while(chunk):
        chunk = file.read(4096)
        connected_sock.send(chunk, 4096)

    connected_sock.close()
