"use strict";


const ECO = require("../index.js").ECO;
const assert = require('assert');

describe('ECO', function() {
    let eco;
    before(function(done) {
        eco = new ECO()
        eco.on('loaded', ()=> {
            done();
        });
    });
    describe('check loaded', function() {
        it('loaded is true', function() {
            assert.equal(eco.loaded, true);
        });
           
    });
    describe('test lookup opening', function() {
        it('opening 1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 is C55', function() {
            let opening = eco.lookup_opening("1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3");
            assert.equal('C55', opening.eco_code);
        });
    });
});


