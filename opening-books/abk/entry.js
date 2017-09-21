"use strict";
const utils  = require('../../utils.js');
const files = utils.board.FILES;
const Chess = require('chess.js').Chess;
function decode_move(pos) {
    let file_num = pos % 8;
    let rank = parseInt(pos/8) + 1;
    return files[file_num] + "" + rank;
}
function decode_promotion(promotion) {
    if (!promotion) {
        return "";
    }
    switch(promotion) {
        case 1:
            return 'r';
            break;
        case 2:
            return 'n';
            break;
        case 3: 
            return 'b';
            break;
        case 4: 
            return 'q';
            break;
        default:
            return false;
    }
}

class ABKEntry {
       // Everything is little endian because reasons
        // c byte alignment applies so the structure is 28
        // struct BOOK { 
        //     unsigned char move_from; //1 byte
        //     unsigned char move_to; // 1 byte
        //     unsigned char move_promo; //1 byte
        //     unsigned char priority; //1 byte
        //     unsigned int games; //4 bytes
        //     unsigned int won_games; // 4 bytes
        //     unsigned int lost_games; //4 bytes
        //     unsigned int hz; //4 bytes
        //     int first_child; //4 bytes
        //     int next_sibling; //4 bytes
        //   } *book; 
    static fromBuffer(buffer, address, parent) {
        let entry = new ABKEntry();
        entry.address = address;
        entry.move_from = decode_move(buffer.readInt8(0));
        entry.move_to = decode_move(buffer.readInt8(1));
        entry.move_promo = buffer.readInt8(2);
        entry.priority = buffer.readInt8(3);
        entry.games = buffer.readUInt32LE(4);
        entry.won_games  = buffer.readUInt32LE(8);
        entry.lost_games = buffer.readUInt32LE(12);
        entry.ply_count = buffer.readUInt32LE(16);
        entry.first_child = buffer.readInt32LE(20);
        entry.next_sibling = buffer.readInt32LE(24);
        return entry;
    }
    constructor() {
        this.children = [];
        this.path = [];
    }
    toChess() {
        let chess = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        for (let p of this.path) {
    
            chess.move(p.current_move_raw, {sloppy: true});
        }
        chess.move(this.current_move_raw, {sloppy: true});
        return chess;
    }
    get current_move() {
        let history = this.toChess().history();
        return history[history.length-1];
    }
    get current_move_raw() {
        let move = this.move_from + "" + this.move_to;
                // let move = { from: p.move_from, to: p.move_to, sloppy : true }
            // if (p.move_promo) {
            //     move.flags = 'p';
            //     move.peice = p.move_promo;
            // }
        if (this.move_promo) {
            move += this.move_promo;
        }
        return move;
    }
    get fen() {
        if (!this._fen) { 
           this._fen = this.toChess().fen();
        }
        return this._fen;
    }
    get book_moves() {
       return this.children;
    }
    toPGN() {
        return this.toChess().pgn();
    }
}
module.exports = ABKEntry;