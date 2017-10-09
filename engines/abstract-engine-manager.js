"use strict";
const EventEmitter = require("events");
const debug = require("debug")("EngineManager");

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
        console.log("SUPER FINISH", this.engine.onmessage);    
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

module.exports = AbstractEngineManager;

