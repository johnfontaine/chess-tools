"use strict";
const UCIEngineManager = require("./uci.js");
const XboardEngineManager = require("./xboard.js");
const {LocalProcessEngine, AbstractEngine } = require("./abstract-engine-manager.js");
module.exports = {
    UCIEngineManager: UCIEngineManager,
    XboardEngineManager : XboardEngineManager,
    Engine : {
        LocalProcessEngine : LocalProcessEngine,
        AbstractEngine : AbstractEngine
    }
};