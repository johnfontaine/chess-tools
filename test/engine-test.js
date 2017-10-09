"use strict";
//const Engines = require("../engines/index.js");
const ChessTools = require("../index.js");
const assert = require('assert');
const test_fen = [  "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2" ];
describe('UCI Engine', function() {
    let engine_path = '/usr/local/Cellar/gnu-chess/6.2.5/bin/gnuchess';
    let engine_args = ['--uci'];
    let conn ;
    let engineManager;
    before(function(done) {
        conn = new ChessTools.Engines.Connection.LocalProcess(engine_path, engine_args);
        engineManager = new ChessTools.Engines.Manager.UCI(conn, {ponder_timeout : 10000});
        engineManager.on("initialized", ()=>{ 
            done();
        });
    });
    describe('ponderPositions', function() {
        for (let fen of test_fen) {
            it(fen + ' ponder ', async function() {
               let r = await engineManager.ponderPosition(fen, {});
               assert.notEqual(typeof r, 'undefined');
               console.log("Got move", r);
               return true;
            });

        }
    });
});

//let engine_path = process.cwd() + "/bin/crafty-25.2"
