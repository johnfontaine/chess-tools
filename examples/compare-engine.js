/*
    A script that takes a set of positions from an .epd file and 
    compares them against komodo and stockfish (as defined by komodo_path and stockfish path below)
    shows the best move and the evaluation (if provided by the engine)
*/
const ChessTools = require("../index.js");
const epd = new ChessTools.EPD();
const EPD_FILE_PATH = process.cwd() + "/test/sample-data/epd-test.epd"
const komodo_path = process.cwd() +  '/bin/komodo-9.02-64-osx';
const stockfish_path = '/usr/local/bin/stockfish';
const fs = require("fs");
epd.on("loaded", ()=> {
    console.log("epd loaded");
    start();
});
epd.load_stream(fs.createReadStream(EPD_FILE_PATH));

const ponder_time = 5000;
const komodo_conn = new ChessTools.Engines.Connection.LocalProcess(komodo_path);
const komodo =new ChessTools.Engines.Manager.UCI(komodo_conn, {ponder_timeout : ponder_time, 'name' : 'komodo'});
komodo.on("initialized", ()=>{ 
    console.log("komodo initialized");
    start();
});

const stockfish_conn = new ChessTools.Engines.Connection.LocalProcess(stockfish_path);
const stockfish = new ChessTools.Engines.Manager.UCI(stockfish_conn, {ponder_timeout : ponder_time, 'name' : 'stockfish'});
stockfish.on("initialized", ()=>{ 
    console.log("stockfish initialized");
    start();
})

async function start() {
    if (!epd.loaded || !komodo.state.initialized || !stockfish.state.initialized) {
        console.log("initializing...");
        return;
    }
    for (let entry of epd.entries) {
        let fen = entry.fen;
        let lines = [];
        let best_move = entry.best_move[0];
        let chess = await entry.toChess()
        console.log("\n\n================\nPondering Position\n=========")
        console.log(chess.ascii());
        let m = chess.move(best_move, {sloppy: true});
        console.log("\tEPD Test:      " + m.from + m.to + "("+ best_move +")");
        let komodo_r = await komodo.ponderPosition(fen, {});
        console.log("\tKomodo:        " + komodo_r );
        show_line_details(komodo.getLinesForMove(komodo_r));
        let stockfish_r = await stockfish.ponderPosition(fen, {});
        console.log("\tStockfish:     " + stockfish_r);
        show_line_details(stockfish.getLinesForMove(stockfish_r));

    }
    end();
}
function end() {
    stockfish.quit()
    komodo.quit();

}
process.on("exit", ()=>{ 
    stockfish.quit();
    komodo.quit();
});
function show_line_details(lines) {
    let s = false;
    for (let line of lines) {
        if (line && line.pv) {
        s= true;
         console.log("\t\tScore:", line.score, "Line:", line.pv);
        }
    }
    return s;
}