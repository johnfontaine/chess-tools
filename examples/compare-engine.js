const ChessTools = require("../index.js");
const epd = new ChessTools.EPD();
const fs = require("fs");
epd.on("loaded", ()=> {
    console.log("epd loaded");
    start();
});
epd.load_stream(fs.createReadStream(process.cwd() + "/test/sample-data/epd-test.epd"));

const ponder_time = 5000;
const komodo_path = process.cwd() +  '/bin/komodo-9.02-64-osx';
const komodo_conn = new ChessTools.Engines.Connection.LocalProcess(komodo_path);
const komodo =new ChessTools.Engines.Manager.UCI(komodo_conn, {ponder_timeout : ponder_time, 'name' : 'komodo'});
komodo.on("initialized", ()=>{ 
    console.log("komodo initialized");
    start();
});
const stockfish_path = '/usr/local/bin/stockfish';
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
        console.log(chess.ascii());
        let m = chess.move(best_move, {sloppy: true});
        console.log("\tEPD Test:\t" + m.from + m.to + "("+ best_move +")");
        let komodo_r = await komodo.ponderPosition(fen, {});
        console.log("\Komodo:\t" + komodo_r );
        show_line_details(komodo.getLinesForMove(komodo_r));
        let stockfish_r = await stockfish.ponderPosition(fen, {});
        console.log("\tStockfish:\t" + stockfish_r);
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
         console.log("\tScore:", line.score, "Continuation:", line.pv);
        }
    }
    return s;
}