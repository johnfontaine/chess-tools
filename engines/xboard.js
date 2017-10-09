"use strict";
const debug = require("debug")("XBoard");
const AbstractEngineManager = require("./abstract-engine-manager.js");
//See https://www.gnu.org/software/xboard/engine-intf.html

class XBoardEngineManager extends AbstractEngineManager {
    constructor(engine, options) {
        super(engine, options);
        this.options = {};
        let ponder_timeout = 30000;
        if (options.ponder_timeout) {
            ponder_timeout = options.ponder_timeout;
        }
        this.options.ponder_timeout = ponder_timeout;
        this.engine_state = {
            initialized : false,
            analyzing : false
        };
        this.engine.on("close", (code)=>{
            this.emit("exit");
        });
        this.engine_features = {};
        this._sendMessage("xboard");
        this._sendMessage("protover 2");
        setTimeout(()=>{ 
            this.emit("initialized");
            this.engine_state.initialized = true;
        }, 1000); //give it time to respond 
    }
    async ponderPosition(fen, options) {
        return new Promise( (resolve, reject)=> {
            this._clear_stats();

            this.current_position = {
                fen : fen,
                resolve : resolve,
                reject : reject 
            };
            let messages = ["hard", "new"];
            messages.push("setboard " + fen);
            if (fen.split(" ")[1]=='b') {
                messages.push("black");
            }
            messages.push("analyze");
            messages.push("post");
            messages.push("eval");
            this.engine_state.analyzing = true; 
            for (let message of messages) {
                this._sendMessage(message);
            }
            this.ponderaction = setTimeout(()=> {
                this.end_analysis(); },
             this.options.ponder_timeout+5000); 
        });
    }
    end_analysis() {
        this._sendMessage("nopost");
        this.engine_state.analyzing = false;
        setTimeout(()=> {
            this.emit("bestmove", this.best_move.move);
            if (this.current_position.resolve) {
                this.current_position.resolve(this.best_move.move);
                
            }
        }, 500);
    }
    _clear_stats() {
        this.current_stats = { lines : [] };  
        this.best_move = {
            score : null,
            move : "",
            pv : "",
            ply : 0,
        };
    }
    handleMessage(message) {
        debug("RECV", message);
        let parsed = message.match(/(\w+)\s?(\(\d+\))\s?:\s+(.+)/);
        let side = "";
        let ply = "";
        let local_message ="";
        if (parsed) {
            this.current_side = side === 'White' ? 'w' : 'b';
            side = parsed[1];
            ply = parsed[2];
            local_message = parsed[3];
        } else {
            local_message = message;
        }
        local_message = local_message.trim();
        if (local_message.startsWith("feature")) {
            return this._handleFeatures(local_message.substring("features".length, local_message.length));
        }
        if (this.engine_state.analyzing && local_message.match(/^\s?\d/)) {
            //starts with a digit ion analysis mode
            this._handleAnalysis(local_message);
        }
    }
    _handleFeatures(message) {
        
        let features = [];
        let in_word = false;
        let in_quotes = false;
        let word = "";
        for (let char of message.split("")) {
            if (!in_word) {
                if (char !== ' ' && char !== '=') {
                    in_word = true;
                    if (char === '"') {
                        in_quotes = true;
                    } else {
                        word += char;
                    }   
                }
             } else {
                let end =  (!in_quotes && char.match(/\s/));
                if (char === '=' || char === '"' || end) {
                    if (char === '"') {
                        in_quotes = false;
                    }
                    in_word = false;
                    features.push(word.toString());
                    word = "";
                    //end word
                } else {
                    word += char;
                }
            } 
        }
        features.push(word); // put the last word in.
        for (let i = 0; i < features.length; i += 2) {
            let key = features[i];
            let value = features[i+1];
            if (!key) {
                continue;
            }
            if (this.engine_features[key] && typeof this.engine_features[key] === "string") {
                let v1 = this.engine_features[key];
                this.engine_features[key] = [v1, value];             
            } else if (this.engine_features[key] && typeof this.engine_features[key] === "object"){
                this.engine_features[key].push(value);
            } else {
               this.engine_features[key] = value;
            }
        }
    }
    _handleAnalysis(message) {
        let info = {};
        let r = [];
        if (message.includes("\t")) {
            let p = message.split("\t");
            r = p[0].split(' ');
            info.ply = parseInt(r[0]);
            info.score = parseInt(r[1]);
            info.time = r[2];
            info.nodes = r[3];
            info.selective_depth = r[4];
            info.speed = r[5];
            info.reserved = r[6];
            info.tbhits = r[7];
            info.pv = p[1];
        } else {
            r = message.split(/\s+/);
            info.ply = parseInt(r[0]);
            info.score = parseInt(r[1]);
            info.time = r[2];
            info.nodes = r[3];
            info.pv = r.slice(4).join(" ");
        }
        console.log(JSON.stringify(info, null, ' '));
        let eval_score = info.score;
        if (this.current_side === 'b') {
            eval_score = Math.abs(eval_score);
        }
        if (this.best_move.ply < info.ply) {
            this.best_move.ply = info.ply;
           
            this.best_move.move =  extract_move(info.pv);
            this.best_move.score = eval_score;
            this.best_move.pv = info.pv;
        } else if (this.best_move.ply === info.ply && this.best_move.score < eval_score) {
            this.best_move.ply = info.ply;
            this.best_move.move =  extract_move(info.pv);
            this.best_move.score = eval_score;
            this.best_move.pv = info.pv;
        }
        this.emit("line", info);
        this.current_stats.lines.push(info);
    }
    quit() {
        this._sendMessage("quit");
        super.quit()
    }
}
function extract_move(pv) {
    if (pv.startsWith("1.")) {
        //crafty style pv
        let moves = pv.match(/\d\.\s([\w\.]+)\s(\w+)/);
        if (moves) {
            if (moves[1] == '...') {
                return moves[2];
            } else {
                return moves[1];
            }
        }
    } else {
        return pv.split(" ")[0]
    }
    
}
module.exports=XBoardEngineManager;