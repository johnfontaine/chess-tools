"use strict";
const Polyglot = require("../opening-books/polyglot/index.js");
const fs = require("fs");
const assert = require('assert');
const test_data = {
  "starting position": {
    "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "key": "463b96181691fc9c"
  },
    "position after e2e4": {
      "FEN": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "key": "823c9b50fd114196"
    },
    "position after e2e4 d75": {
      "FEN": "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
      "key": "0756b94461c50fb0"
    },

};

describe('Polyglot', function() {
  let polyglot = new Polyglot();
  before(function(done) {

    polyglot.on("loaded", () => {
      done();
    });
    polyglot.load_book(fs.createReadStream(process.cwd() + "/test/sample-data/gm2001.bin"));

  });
  describe('check loaded', function() {
    it('loaded is true', function() {
        assert.equal(polyglot.loaded, true);
    });
    it('has entries', function() {
      assert.equal(Object.keys(polyglot.entries).length, 23807);
    });
  })
  describe('test hashes', function() {
    for (let name of Object.keys(test_data)) {
      it(name + " " + test_data[name].FEN + ' should equal ' + test_data[name].key , function() {
        assert.equal(polyglot.generate_hash(test_data[name].FEN), test_data[name].key);
      });
    }
  });
  describe('test move lookups', function() {
    for (let name of Object.keys(test_data)) {
      it(name + ' has moves ', function() {
        let r = polyglot.findAll(test_data[name].FEN);
        assert.notEqual(typeof r, 'undefined');
      });
    }
  });
});
