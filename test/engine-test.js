"use strict";
const Engines = require("../engines/index.js");
const XboardEngineManager = Engines.XboardEngineManager;
const LocalProcessEngine = Engines.Engine.LocalProcessEngine;
//let engine_path = process.cwd() + "/bin/crafty-25.2"
//let engine_path = '/usr/local/Cellar/gnu-chess/6.2.5/bin/gnuchess';
let engine_path = 'java';
let engine_args = ["-jar", process.cwd() + '/bin/Frittle-1.0.jar' ];
const engine = new LocalProcessEngine(engine_path, engine_args);
const engineManager = new XboardEngineManager(engine, {});
engineManager.on("initialized", async ()=>{ 
let bestmove = await engineManager.ponderPosition(
    //"rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0",
    "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2", 
     {lines : 5});
console.log("BESTMOVE ", bestmove);
console.log("STATS", JSON.stringify(engineManager.current_stats, null, ' '));
});