"use strict";
const ChessTools = require("../index.js");
const fs = require("fs");

 const assert = require('assert');

 let test_fen = [
     'rnbqk2r/ppppppbp/5np1/8/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq'
    ];
 
describe('ABK', function() {
    let abk = new ChessTools.OpeningBooks.ABK();
    before(function(done) {
        abk.on("loaded", ()=>{ 
            done();
        });
        abk.load_book(fs.createReadStream(process.cwd() + "/test/sample-data/libra8.abk"));
    });
    describe('check loaded', function() {
        it('loaded is true', function() {
            assert.equal(abk.loaded, true);
        });
        it('has entries', function() {
          assert.equal(Object.keys(abk.entries).length, 277);
        });
      });
    describe('check move lookup', function() {
        for (let fen of test_fen) {
            it(fen + ' has data', function() {
                let r = abk.find(fen);
               // console.log(JSON.stringify(r.book_moves,null, ' '));
                assert.notEqual(typeof r, 'undefined');
            });
        }
       
    })
});