"use strict";
const UCI = require("./uci.js");
const Xboard = require("./xboard.js");
const AbstractEngineManager = require("./abstract-engine-manager.js");
const { AbstractConnection, LocalProcess } = require("./connection.js");
module.exports = {
    Manager : {
        AbstractEngineManager : AbstractEngineManager,
        UCI: UCI,
        Xboard : Xboard
    },
    Connection : {
        LocalProcess : LocalProcess,
        AbstractConnection : AbstractConnection
    }
};