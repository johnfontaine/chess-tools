"use strict";
class Opening {
    constructor() {
        this.eco_code = "";
        this.variation = "";
        this.name = "";
        this.pgn = "";
        this.parent = false;
        this.children = new Set();
    }

}
module.exports = Opening;
