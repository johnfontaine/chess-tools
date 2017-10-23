"use strict";
const child_process = require("child_process");
const EventEmitter = require("events");
const debug = require("debug")("ChessTools");
class AbstractConnection extends EventEmitter {
    constructor() {
        super();

    }
    postMessage(message) {
        throw new Error("Must implement in subclass");
    }
    onmessage(message) {
        throw new Error("Must implement local version on message");
    }
    quit() {

    }
}
class LocalProcess extends AbstractConnection {
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
    quit() {
        if (this.engine && !this.engine.killed) {
            this.engine.kill();
        }
    }
}
module.exports = {
    AbstractConnection : AbstractConnection,
    LocalProcess : LocalProcess
};