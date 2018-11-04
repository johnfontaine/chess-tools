"use strict;"
const PGNPly = require("pgnply.js")
const field_handlers = require('field-handlers.js');
class PGN {
    constructor(pgn) {
        let entries = pgn.split("\n");
        for (let entry of entries) {
            if (entry && entry != '') {
                if ( entry.startsWith("[") ) {
                    let data = entry.match(/\[(.+) "(.+)"/);
                    if (data) {
                        if (data[1] == "TimeControl") {
                            //TODO parse Time control info http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm#c9.6.1
                            /*
                                Valid formats include
                                \d+ (just a value in seconds)
                                ? (unknown)
                                - (no time control)
                                \d+\/\d+ (showing moves / duration) may have optional *1800 (remaining time e.g. 40/4500*3600 = 40 moves in 90 minutes, game 60 ))
                                \d+\+\d+ (increment /delay  "4500+60" (90 minutes, 60 second delay)
                            */

                        }
                        this[data[1]] = data[2];
                    } 
                } else if ( entry.startsWith("1.") ) {
                    this.pgnplys = entry.replace(/\d\-\d$/, "").split(/\d+\.+\s/).map((value)=> { return value.trim() }).slice(1).map((value)=>{ return new PGNPly(value)});
                    this.moves = entry;
                } 
            }             
        }
    }
    _handleField( field, data) {
        if (typeof field_handlers[field] == 'functon' ) {
            field_handlers[field](this, data);
        } else {
            this[field] = data;
        }
    }
}



module.exports=PGN