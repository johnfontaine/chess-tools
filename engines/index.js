"use strict";
const UCI = require("./uci.js");
const Xboard = require("./xboard.js");
const {LocalProcess, AbstractConenction, AbstractEngineManager } = require("./abstract-engine-manager.js");

module.exports = {
    Manager : {
        AbstractEngineManager : AbstractEngineManager,
        UCI: UCI,
        Xboard : Xboard
    },
    Connection : {
        LocalProcess : LocalProcess,
        AbstractConenction : AbstractConenction
    }
};