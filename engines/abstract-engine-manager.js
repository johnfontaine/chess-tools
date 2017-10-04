"use strict";
const EventEmitter = require("events");
const debug = require("debug")("EngineManager");
const child_process = require("child_process");
class AbstractEngineManager extends EventEmitter {
    constructor(engine, options) {
        super();
        this.heartbeat = setInterval(()=> {
            debug("HEARTBEAT");
         }, 60000);
         this.engine = engine;
         this.engine.onmessage = (message) => {
            try {
             this.handleMessage(message);
            } catch (error) {
                this.emit("error", error);
                console.log("error", error);
            }
        }
    }
    async ponderPosition(fen, options) {
        throw new Error("Not implemented");
    }
    quit() {
        clearInterval(this.heartbeat);
    }
    handleMessage(message) {
        throw new Error("Not Implemented");
    }
    _sendMessage(message) {
        setTimeout(()=>{ 
            debug("SEND: " + message);
            this.engine.postMessage(message + "\n");
        }, 100);
       
    }
}
class AbstractEngine extends EventEmitter {
    constructor() {
        super();

    }
    postMessage(message) {
        throw new Error("Must implement in subclass");
    }
    onmessage(message) {
        throw new Error("Must implement local version");
    }
}
class LocalProcessEngine extends AbstractEngine {
    constructor(executable, args) {
        super();
        debug("cmd: " + executable + " " + args);
        this.message_buffer;
        if (args) {
            this.engine = child_process.spawn(executable, args);
        } else {
            this.engine = child_process.spawn(executable);
        }
        this.engine.stderr.on('data', (error)=>{ 
            this.emit("error", error);
        });
        this.engine.stdout.on("data", (data)=>{
            let data_str = data.toString();
            if (this.message_buffer) {
               data_str = this.message_buffer + data_str;
            }
            let messages = data_str.split("\n");
            if (messages[messages.length-1] !== '') {
                this.message_buffer = messages.pop();
            }
            for (let message of messages) {
                if (message) {
                    this.onmessage(message);
                }
            }
            
        });
        this.engine.on("close", (code)=>{
          this.emit("close", code);
        });
    }
    postMessage(message) {
        if (!message.endsWith("\n")) {
            message += "\n";
        }
        this.engine.stdin.write(message);
    }
}
module.exports = {
    AbstractEngine : AbstractEngine,
    AbstractEngineManager : AbstractEngineManager,
    LocalProcessEngine : LocalProcessEngine
}


