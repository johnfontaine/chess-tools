"use strict";
const ChessCom = require("../../sites/chesscom/index.js");
const assert = require('assert');
const should = require('should');
const Writable = require('stream').Writable;
let site;
before(function() {
    site = new ChessCom();
})
describe("chess.com", function() {

    describe("#player", function() {
    
        it("should fetch player and get url", async function() {
            this.timeout(60*1000);
            let player = await site.fetch_player("tryingtolearn1234");
           console.log("got player", JSON.stringify(player, null, "\t"));
           assert.equal(player.site_data.player_id, 34515766);
        })
    });
    describe("#fetch_games", function() {
        it("should have games", async function() {
            this.timeout(60*1000);
            let games = await new Promise((resolve, reject)=>{ 
                site.fetch_games_for_player({
                    profile_url : 'https://api.chess.com/pub/player/tryingtolearn1234'
                }).pipe(
                    new Writable({objectMode : true, 
                        write : (chunk, encoding, callback)=> {
                            if (chunk) {
                                console.log(JSON.stringify(chunk, null, ' '));
                                resolve(chunk);
                            }
                            callback();
                        }
                    })
                );
            })    
            games.should.have.property("length")
        });
    });
});
