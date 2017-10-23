"use strict";
const EventEmitter = require("events");
const debug = require("debug")("EngineManager");

class AbstractEngineManager extends EventEmitter {
    constructor(engine, options) {
        super();
        this.name = "";
        this.heartbeat = setInterval(()=> {
            debug("HEARTBEAT-" + this.name  );
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
        if (options && options.name) {
            this.name = options.name;
        } 
    }
    async ponderPosition(fen, options) {
        throw new Error("Not implemented");
    }
    quit() {
        this.engine.quit();
        clearInterval(this.heartbeat);
    }
    handleMessage(message) {
        throw new Error("Not Implemented");
    }
    _sendMessage(message) {
        setTimeout(()=>{ 
            debug("SEND-" + this.name + ":" + message);
            this.engine.postMessage(message + "\n");
        }, 100);
       
    }
    getLinesForMove(move) {
        throw new Error("Not implemented");
    }
}

module.exports = AbstractEngineManager;

