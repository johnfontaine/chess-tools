"use strict";
let Chess = require("chess.js");
class Opening {
    constructor() {
        this.eco_code = "";
        this.variation = "";
        this.name = "";
        this.pgn = "";
    }
    toChess() {
        let pgn_short = this.pgn.substring(0, this.pgn.length-2);
        let chess = new Chess();
        chess.load_pgn(pgn_short);
        return chess;
    }
    get fen() {
        return this.toChess().fen();
    }
}
module.exports = Opening;
