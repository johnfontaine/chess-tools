"use strict";
const Chess = require("chess.js");
const {peice_encoding, peice_encoding_black, flip_ep_column, castle_encoding,en_passant_encoding,en_passant_encoding_black,ep_mask, castle_mask, po, ep, ca } = require("./encoding.js");
var utils = require(__dirname + '/../../utils.js');
class CTGEntry {
    constructor(to_move) {
      if (!to_move) {
        this.to_move = 'w';
      } else {
        this.to_move = to_move;
      }
      this.book_moves = [];
      this.ratings = [];
      this.total_games = 0;
      this.white_wins = 0;
      this.black_wins = 0;
      this.draws = 0;
      this.unknown1;
      this.unknown2;
      this.is_mirrored = false;
      
    }
    toChess() {
      let chess = new Chess(this.fen);
      return chess;
    }
    setFen(fen) {
      if (this.has_castling) {
        let castle_string = "";
        for (let encoding of castle_encoding) {
          if (this.castling_data & encoding.code) {
            castle_string += encoding.value;
          }
        }
        fen = fen.replace("-", castle_string);
      }
      if (this.has_en_passant) {
        let ep_coding = this.to_move === 'w' ? en_passant_encoding : en_passant_encoding_black;
        for (let coding of ep_coding) {
          if (coding.code & this.en_passant_data) {
            let fen_items = fen.split(" ");
            fen_items[3] = coding.value;
            fen = fen_items.join(" ");
          }
        }
      }
      if (this.to_move === 'b') {
        let fen_items = fen.split(" ");
        fen_items[1] = 'b';
        fen = fen_items.join(" ");
      }
      this._fen = fen;
      this.key = utils.key_from_fen(fen);
    }
    get fen() {
      return this._fen;
    } 
    toPGN() {
      throw new Error("PGN not available");
    }
    toString() {
      return JSON.stringify(this, null, '');
    }
  }
  module.exports=CTGEntry;