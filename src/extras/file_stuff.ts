import fs from "fs"
import { Json } from "sequelize/types/utils";

class CachedJson {
    // In miliseconds
    #lastModifiedTime: Date;
    #stringCache: string;
    #jsonCache: any;
    #filepath: string;
    #reload_nocheck() {
        this.#stringCache = fs.readFileSync(this.#filepath).toString();
        this.#jsonCache = JSON.parse(this.#stringCache);
    }
    get JSON() {
        return this.#jsonCache;
    }
    get text() {
        return this.#stringCache;
    }
    get filepath() {
        return this.#filepath;
    }
    #writeString(stuff: string): any {
        try {
            fs.writeFileSync(this.#filepath, stuff);
            this.reload();
        } catch (err) {
            return err;
        }
        return 0;
    }
    write(stuff: string | any): any {
        if (typeof stuff != "string") {
            stuff = JSON.stringify(stuff, null, 2);
        }
        return this.#writeString(stuff);
    }
    reload() {
        try {
            const stats = fs.statSync(this.#filepath);
            if (stats.mtime != this.#lastModifiedTime) {
                this.#lastModifiedTime = stats.mtime;
                this.#reload_nocheck();
            }
        } catch (err) {
            return err;
        }
        return 0;
    }
    constructor (filepath: string) {
        this.#filepath = filepath;
        this.#stringCache = "";
        this.#lastModifiedTime = new Date(10000);
        if (!fs.existsSync(this.#filepath)) {
            this.#writeString('');
        }
        this.reload();
    }
}

function cleanup(dirs: string[] | undefined){
    if(!dirs) {
        return;
    }
    let dir: string;
    for (dir of dirs) {
        fs.rm(dir, { recursive: true, force: true }, (err) => { if (err) console.log("Got error while deleting:", err); });
    }
}

export { CachedJson, cleanup };