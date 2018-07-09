"use strict"
const ChessCom = require("../sites/chesscom/index.js");
const assert = require('assert');


describe("chess.com", function() {
    let site;
    before(function() {
        site = new ChessCom();
    })
    describe("player", function() {
        it("shold fetch player", function() {
           let player = site.fetch_player("tryingtolearn1234");
           console.log("got player", JSON.stringify(player, null, "\t"));
           player.should.have.profile_url;
        })

    });
    describe("fetch_games", function() {

    })
}

async function main() {
    let player = await site.fetch_player("tryingtolearn1234");
    
    let games = await site.fetch_games_for_player(player);
    console.log("Total Games", games.length);
}
main();