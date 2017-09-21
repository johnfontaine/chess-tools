"use strict";
//see https://chessprogramming.wikispaces.com/ABK
//http://www.talkchess.com/forum/viewtopic.php?topic_view=threads&p=184321&t=20661
const debug = require('debug')('ABK');
const utils  = require('../../utils.js');
const Transform = require('stream').Transform;
const EventEmitter = require('events');
const ENTRY_SIZE= 28; //bytes
const START_ADDRESS = ENTRY_SIZE * 900;
const Chess = require('chess.js').Chess;
//var chess = new Chess();
const files = utils.board.FILES;
const ABKEntry = require("./entry.js");
class ABKStream extends Transform {
    constructor() {
        super({readableObjectMode: true});
        this.start = 900 * ENTRY_SIZE;
        this.last_read = this.start;
        this.entry_num = 0;
        this.current_depth = 0;
        this.current_address = 900;
        this.read_to_start = false;
        this.received_bytes = 0;
        this.can_read = true;
        this.current_path = [];
    }
    _flush(callback) {
        callback();
    }
    _transform(chunk, encoding, callback) {
        this.received_bytes += chunk.length;
        if (this._data) {
            this._data = Buffer.concat([this._data, chunk]);
        } else {
            this._data = chunk;
        }
        if (this.received_bytes > this.start + ENTRY_SIZE) {
            this.read_to_start = true;
        }
        if (this.read_to_start) {
            let t0 = new Date().getTime();
            while(this.can_read == true) {
                this.read_record();
            }
            let t3 = new Date().getTime();
        }
        callback();
    }
    read_record() {
        let offset = ENTRY_SIZE * this.entry_num;
        let record = this._data.slice(START_ADDRESS + offset, START_ADDRESS + ENTRY_SIZE + offset);
        this.last_read = START_ADDRESS + offset;
        let entry = ABKEntry.fromBuffer(record, this.entry_num + 900);
        if (this.current_path.length > 0 ) {
            this.current_path[this.current_path.length-1].children.push(entry);
            for (let p of this.current_path) {
                entry.path.push(p);
            }
            if (entry.first_child > -1 ) {
                this.current_path.push(entry);
            } else if (entry.first_child === -1 && entry.next_sibling === -1) {
                let remove = 0;
                for (let p of this.current_path) {
                    if (p.next_sibling === -1) {
                        remove++;
                    }
                }
                this.current_path = this.current_path.slice(0, this.current_path.length - remove);
            } else {

            }
        } else {
            this.current_path = [entry];
        }
        this.entry_num++;
        entry.entry_num = this.entry_num;
        this.push(entry);
        this.can_read = (this._data.length > START_ADDRESS + ENTRY_SIZE + offset + ENTRY_SIZE);
    }
    push(e) {

        super.push(e);
    }
}
class ABK extends EventEmitter {
    constructor() {
        super();
        this.entries = {};
        this.stream = new ABKStream();
    }
    load_book(stream) {
        this.entries = [];
        this.loaded = false;
        this.stream.on("data", (entry)=>{ 
            let key = utils.key_from_fen(entry.fen);
            if (this.entries[key]) {
                this.entries[key].push(entry);
            } else {
                this.entries[key] = [ entry ];
            }
        });
        this.stream.on('finish', ()=>{
            this.loaded= true;
            this.emit("loaded");
        });
        this.stream.on('error', (error)=>{
          console.log("error", error);
          this.emit("error", error);
        });
        stream.pipe(this.stream);
      }
    find(fen) {
        let key = utils.key_from_fen(fen);
        return this.entries[key];
    }
}

module.exports=ABK;