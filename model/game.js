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

    plys : [

    ],
    players : {
        white : '',
        black : ''
    },
    winner : 0, // 0 none, 1 = white, 2 = black
    result : 0, // 0 stalemate, 1 draw_by_repetition, 3 draw by agreement, 4 mate, 5 flag
    clock : {
        time_class : "", //daily / rapid / blitz / bullet
        time_control : "", //pgn time control
        totalGameTime : 0 //total amount of time the game took
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
    get fields() {
        return FIELDS;
    }
}

module.exports = Game;

