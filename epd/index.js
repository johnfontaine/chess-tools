const EventEmitter = require('events');
const EPDEntry = require("./entry.js");
const Transform = require("stream").Transform;
const utils = require(__dirname + '/../utils.js');
class EPDStream extends Transform {
    constructor() {
        super({ readableObjectMode: true });
        this._lines = [];
    }
    _flush(callback) {
        this._make_records_from_lines();
        callback();
    }
    _transform(chunk, encoding, callback) {
        let data = chunk.toString();
        let lines = data.split(/\n/m);
        if (this._lines.length > 0) {
          this._lines[this.lines.length - 1] += lines.shift();
        }
        for (let line of lines) {
          this._lines.push(line);
        }
        this._make_records_from_lines();
        callback();
      }
      _make_records_from_lines() { 
        let len = this._lines.length;
        for (let i = 0; i < len; i++) {
         
          let line = this._lines.shift();
          if (line) {
            let entry = EPDEntry.fromLine(line);
            this.push(entry);
          }
        }
      }
}
class EPD extends EventEmitter {
    constructor() {
        super();
        this.loaded = false;
        this.entries = [];
        this.stream = new EPDStream();

    }
    load_stream(stream) {
        this.stream.on("finish", () => {
          this.loaded = true;
          this.emit("loaded");
        });
        this.stream.on("data", (entry) => {
          this.entries.push(entry);
        });
        stream.pipe(this.stream);
    }
    find(fen) {
        if (!this.loaded) {
            throw new Error("EPD not loaded")
        }
        let match_key = utils.key_from_fen(fen);
        let entries = [];
        for (let entry of this.entries) {
          
            if (utils.key_from_fen(entry.fen) == match_key) {
                entries.push(entry);
            }
        }
        return entries;
    }
}
module.exports = EPD