"use strict";
const Utils = require("../utils.js");
const fs = require("fs");
const assert = require('assert');

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
const END_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq -";
let FLIP_TESTS = [
    ["8/8/8/8/8/nk2b3/8/K7 b - -", "k7/8/NK2B3/8/8/8/8/8 w - -"],
    ["rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR b KQkq -", "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -"]
];
describe('Utils', function() {
    describe('check_flip_board', function() {
      it('flip basic board', function() {
          let flip = Utils.flip_board(START_FEN);
          assert.equal(flip, END_FEN);
        
      });
      it('flip_test_boards', function() {
        for (let i = 0; i < FLIP_TESTS.length; i++) {
            assert.equal(FLIP_TESTS[i][1], Utils.flip_board(FLIP_TESTS[i][0]) );
        }      
       
      });
      it("compress uncompress", function() {
        let c = Utils.compress_fen(START_FEN);
        console.log("C", "|" + c + "|");
        let p = Utils.uncompress_fen(c);
        console.log("P", p);
        assert.equal(START_FEN, p);
      });
      
    });
 
  });
  