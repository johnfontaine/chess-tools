"use strict";
const Models = require("../../model/index.js");
const fs = require("fs");
const assert = require('assert');
describe('Model', function() {
    describe('Game Model', function() {
        it('constructor', function() {
            let game = new Models.Game();
            
            assert.equal(game.source_url, ""); 
        });
    });
});