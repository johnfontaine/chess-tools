/*
A page of games
*/

"use strict";
const debug = require("debug")("Page");
const BaseModel = require("./base-model.js");

const FIELDS = {
    url : "",
    page_number : "",
    next_page : "",
    games : "",
}

class Page extends BaseModel {

    constructor(data) {
        super(data);
    }
    get _fields() {
        return FIELDS;
    }
}