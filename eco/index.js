"use strict";
const fs = require("fs");
const EventEmitter = require('events');
class Opening {
  constructor() {
      this.eco_code = "";
      this.name = "";
      this.variation = "";
      this.pgn = "";
  }
}
function extract_value(text) {
  let match = text.match(/\"(.+)\"/)
  if (match) {
    // console.log("match", match[1]);
      return match[1];
  } else {
    return "";
  }
}


class Eco extends EventEmitter {
  constructor() {
    super();
    this.loaded = false;
    this.comment = "";
    this.records = [];
    fs.readFile(__dirname + "/eco.pgn", (err, data) => {
      if (err) {
        throw err;
      }
      this.data = this._parse_data(data.toString());
      this.loaded = true;
      this.emit("loaded");
    });

  }

  lookup_opening(pgn) {
    if (!this.loaded) {
      throw new Error("wait for loaded event");
    }
    let best_match;
    for (let record of this.records) {
      let r_pgn = record.pgn.substring(0, record.pgn.indexOf("*"));
      if (pgn.includes(r_pgn)) {
        if (best_match && record.pgn.length > best_match.pgn.length) {
          best_match = record;
        } else {
          best_match = record;
        }
      }
    }
    return best_match;
  }

  _parse_data(data) {
    let lines = data.split("\n");
    let in_comment = false;
    let in_pgn = false;
    let record;

    for (let line of lines) {
      if (line.startsWith("{")) {
        in_comment = true;
      }
      if (line.startsWith("}")) {
        in_comment = false;
      }
      if (in_comment && line !== "{") {
        this.comment = this.comment + line + "\n";
      }
      if (line.startsWith("[ECO")) {
        if (record) {
          this.records.push(record);
        }
        record = new Opening();
        record.eco_code = extract_value(line);
      } else if (line.startsWith("[Opening")) {
        record.name = extract_value(line);
      } else if (line.startsWith("[Variation")) {
        record.variation = extract_value(line);
      } else if (line.startsWith("1.")) {
        in_pgn = true;
        record.pgn = line;
      } else if (in_pgn && line) {
        record.pgn = record.pgn + " " + line;
      } else if (in_pgn && !line) {
        in_pgn = false;
      }
    }
  }
}
module.exports = Eco;
