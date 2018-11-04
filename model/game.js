/*
 An object for storing a more normalized view of a game to allow cross api compatibility between various chess sites. 
 Note currently built around supporting Classical Chess, not variants like 960, 3check, etc)
*/
"use strict";
const debug = require("debug")("Game");
const BaseModel = require("./base-model.js");
let FIELDS = {
    source_url : "",
    location_name : "",
    rated : false,
    pgn : "",
    plys : [

    ], //positions by fen
    players : {
        white : {},
        black : {}
    },
    winner : 0, // 0 none, 1 = white, 2 = black
    result : 0, // 0 stalemate, 1 draw_by_repetition, 2 draw by agreement, 
                //3 mate, 4 timeout/flag, 5 resign
    clock : {
        time_class : "", //daily / rapid / blitz / bullet
        time_control : "", //pgn time control
        total_game_time : 0 //total amount of time the game took
    },
    opening : {
        code : "",
        name : ""
    }
};
class Game extends BaseModel {
    constructor(data) {
       super(data);
    }
    get _fields() {
        return FIELDS;
    }
}
Game.Winner = {};
Game.Winner.WIN_WHITE = 1
Game.Winner.WIN_BLACK = 2
Game.Winner.DRAW = 0
Game.Result = {};
Game.Result.STALEMATE = 0;
Game.Result.DRAW_BY_REPITITION=1;
Game.Result.DRAW_BY_AGREEMENT=2
Game.Result.MATE=3
Game.Result.TIMEOUT=4
Game.Result.RESIGN=5
module.exports = Game;

