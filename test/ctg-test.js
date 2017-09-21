"use strict";
const CTG = require("../opening-books/ctg/index.js");
const fs = require("fs");
const assert = require('assert');
const test_fen =  [ 'rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq',
                    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq',
                    'rnbqkbnr/ppp1pppp/8/3p4/8/8/PPPPPPPP/RNBQKBNR w KQkq',
                    'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq' ];
describe('CTG', function() {
    let ctg = new CTG();
    before(function(done) {
        ctg.on("loaded", ()=>{ 
            done();
        });
        ctg.load_book(fs.createReadStream(process.cwd() + "/test/sample-data/simple.ctg"));
    });
    describe('check loaded', function() {
        it('loaded is true', function() {
            assert.equal(ctg.loaded, true);
        });
        it('has entries', function() {
          assert.equal(Object.keys(ctg.entries.b).length, 4);
        });
      });
    describe('check move lookup', function() {
        for (let fen of test_fen) {
            it(fen + ' has data', function() {
                let r = ctg.find(fen);
               // console.log(JSON.stringify(r.book_moves,null, ' '));
                assert.notEqual(typeof r, 'undefined');
            });
        }
       
    })
});