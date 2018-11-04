"use strict";
const BaseModel = require("./base-model.js");
const debug = require("debug")("Ply");
const FIELDS = {
    algebraic_move : "",
    ply_number : 0,
    fen : "", //fen after move 
    eval_key: "", //hash based on fen with move number stripped and flipped to white.
    evalutation : 0, //centipawns
    eval_delta : 0, //change from previous evaluation
    time_taken : -1,
    eval_delta : 0,
    is_evalutated : false,
    clock : -1,
    notes : ""
};



class Ply extends BaseModel {
    constructor(data) {
        super(data);
    }
    get _fields() {
        return FIELDS;
    }

}
module.exports=Ply