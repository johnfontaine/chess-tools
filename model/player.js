"use strict";
const debug = require("debug")("Player");
const BaseModel = require("./base-model.js");
const FIELDS = {
    name : "",
    username : "",
    profile_url : "",
    site_data : {}
}

class Player extends BaseModel {

    constructor(data) {
        super(data);
    }
    get fields() {
        return FIELDS;
    }
}
module.exports=Player;