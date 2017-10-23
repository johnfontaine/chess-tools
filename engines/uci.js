"use strict";
const debug = require("debug")("UCI");
const AbstractEngineManager = require("./abstract-engine-manager.js");
//UCI Protocol
//http://wbec-ridderkerk.nl/html/UCIProtocol.html
const EventEmitter = require('events');
const stream = require("stream");

class UCIEngineManager extends AbstractEngineManager {
    constructor(engine, options) {
        super(engine,options);
        let ponder_timeout = 30000;
        if (options && options.ponder_timeout) {
            ponder_timeout = options.ponder_timeout;
        }
        this.options = {
            ponder_timeout : ponder_timeout //default 30 seconds
        };
        if (options.registration) {
            this.options.registration = {
                name : options.registration.name,
                code : options.registration.code,
                later : false,
            };
        } else {
            this.options.registration = {
                later : true
            };
        }

        this.engine= engine;
        this.info = [];
        this.state = {
            initialized : false,
            is_calculating : false,
            is_ready : false,
            debug_enabled : false,
            is_evaluating : false,
        };
        this._clear_stats();
        this.positions = [];
        this.current_position = {};
        this.engine_options = {

        };
        this.engine_info = {
            options : {},
            registration : null,
            copyprotection : null,
            id : { name : '', author : '' }
        };
        this.on("initialized", this.onInitialized.bind(this));
        this.on("readyok", this.onReadyOK.bind(this));
        this._sendMessage(" ");
        this._sendMessage("uci");
        this._sendMessage("debug on");

    }
    _clear_stats() {
        this.handling_best_move = false;
        this.current_stats = {
            depth : 0,
            time : 0,
            node : 0,
            lines : [],
            currmove : "",
            currmovenumber : 0,
            hashfull : 0,
            nps : 0,
            tbhits : 0,
            cpuload : 0,
            string : "",
            refutation : "",
            currline : ""
        };
    }
    onInitialized() {
        this.state.initialized = true;

    }
    onReadyOK() {
        this.state.is_ready = true;
        this.emit("ready");
    }
    setOption(option, value) {
        if ( this.engine_info.options[option] ) {
            this.engine_info.options[option].value = value;
            this._sendMessage(this.engine_info.options[option].generateMesssage());
        } else {
            throw new Error("invalid option" + option);
        }
    }
    async ponderPosition(fen, options) {
        return new Promise(
            (resolve, reject) =>{ 
                let ponder_options = make_ponder_options_string(options, this.options.ponder_timeout);
                this._clear_stats();

                let messages = [
                    "ucinewgame"
                ]
                if (this.engine_info.options["Clear Hash"]) {
                    messages.push(this.engine_info.options["Clear Hash"].generateMesssage());
                }
                if (this.engine_info.options.UCI_ShowCurrLine) {
                    this.engine_info.options.UCI_ShowCurrLine.value = false;
                    messages.push(this.engine_info.options.UCI_ShowCurrLine.generateMesssage())
                }
                if (this.engine_info.options.UCI_AnalyseMode) {
                    this.engine_info.options.UCI_AnalyseMode.value = true;
                    messages.push(this.engine_info.options.UCI_AnalyseMode.generateMesssage())
                }
                if (options.lines && this.engine_info.options.MultiPV) {
                    if (options.lines <= this.engine_info.options.MultiPV.max ) {
                        this.engine_info.options.MultiPV.value = options.lines;
                        messages.push(this.engine_info.options.MultiPV.generateMesssage())
                    } else {
                        throw new Error("Number of lines requested exceeds engine max", this.engine_info.options.MultiPV.max);
                    }
                }
                messages.push("position fen " + fen);
                messages.push("go " + ponder_options);
                this.state.is_calculating = true;
                for (let m of messages) {
                    this._sendMessage(m);
                }
                this.current_position.fen = fen;
                this.current_position.resolve = resolve;
                this.current_position.reject = reject;
                this.ponderaction = setTimeout(()=> {
                    this.stop(); },
                 this.options.ponder_timeout+5000);        
            });
        }
    stop() {
        if (this.ponderaction) {
            clearTimeout(this.ponderaction);
            this.ponderaction = null;
        }
        this._sendMessage("stop");
    }
    quit() {
        this._sendMessage("quit");
        this.engine.quit();
    }
    clearInfo() {
        this.info = [];
    }
    handleMessage(message) {
        debug("RECV-" + this.name + ":" + message);
        if (typeof message !== 'string') {
            this.emit("unknown_message", message);
            return;
        }
        if (message.startsWith("info")) {
            this._handleInfo(message);
        } else if (message.startsWith("bestmove") && !this.handling_best_move) {
            this.handling_best_move = true;

            //this.state.is_calculating = false;
            this.info.push({
                raw: message
            });

            if (this.ponderaction) {
                clearTimeout(this.ponderaction);
            }
            let match = message.match(/bestmove (\w+)/);
            this.is_calculating = false;
            this.current_position.best_move = match[1];
            let move_lines = this.getLinesForMove(this.current_position.best_move);
            this.send_best_move();
        } else if (message.startsWith("readyok")) {
            this.emit("isready");
            return;
        } else {
            this._handleInitMessages(message);
        }
    }
    send_best_move() {
        return this.current_position.resolve(this.current_position.best_move);
    }
    _handleInfo(message) {
        let info = {
            raw: message,
            data : parse_info_message(message)
        }
        this.info.push(info);
        this.is_calculating = true;

        if (info.data.multipv) {
            let line = info.data.multipv -1;
            this.current_stats.lines[line] = {
                 pv:  info.data.pv, 
                 score: info.data.score 
                };
            this.emit("line", (line, this.current_stats.lines[line]))
        } else if (info.data.pv && this.current_stats.lines.length < 2) {
            
            this.current_stats.lines[0] = {
                pv:  info.data.pv, 
                score: info.data.score 
               };
            this.emit("line", (0, this.current_stats.lines[0]))
        }
        for (let key of Object.keys(info.data)) {
            if (key === 'multpv' || key === 'pv' || key === 'score') {
                continue;
            }      
            this.current_stats[key] = info.data[key];
        }
        //console.log("info-" + this.name, info);
        this.emit("info", info);
    }
    _handleInitMessages(message) {
        if (message.startsWith("uciok")) {
            this.state.initialized = true;
            this.emit('initialized');
        }
        if (message.startsWith("id")) {
            if (message.startsWith("id author ")) {
                this.engine_info.author = message.match(/id author (.+)/)[1];
            }
            if (message.startsWith("id name ")) {
                this.engine_info.author = message.match(/id name (.+)/)[1];
            }
        }
        if (message.startsWith("option")) {
            try {
                let option = UCIEngineOption.fromMessage(message);
                this.engine_info.options[option.name] = option;
            } catch (e) {
                this.emit('error', e);
            }
        }
        if (message.startsWith("copyprotection")) {
            this.engine_info.copyprotection = message.match(/copyprotection (\w+)/)[1];

        }
        if (message.startsWith("registration")) {
            this.engine_info.registration = message.match(/registration (\w+)/)[1];
            if (this.engine_info.registration === 'error') {
                this._sendMessage()
            }
        }
    }
    getLinesForMove(move) {
        let l = [];
        for (let line of this.current_stats.lines) {
            if (line && line.pv) {
                //console.log("line.pv", line.pv);
                let match = line.pv.startsWith(move);
                if (match) {
                    l.push(line);
                }
            }
        }
        return l;
    }
}

module.exports = UCIEngineManager;

function extract_option(message, param, options) {
    if (param === 'name') {
        let regex = new RegExp(param + '\\s' + '(.+)\\stype');
        let match = message.match(regex);
        if (match) {
            options[param] = match[1];
        }
    }
    if (param === 'var') {
        let regex = new RegExp(param + '\\s' + '(\\w+(\\sHash)?)', 'g');
        let match = message.match(regex);
        if (match) {
            match.shift();
            let results = new Set();
            for (let m of match) {
                regex = new RegExp(param + '\\s' + '(\\w+(\\sHash)?)');
                let submatch = m.match(regex);
                if (submatch) {
                    results.add(submatch[1]);
                }
            }
            options[param] = results;
        }
    } else {
        let regex = new RegExp(param + '\\s' + '(\\w+(\\sHash)?)');
        let match = message.match(regex);
        if (match) {
            options[param] = match[1];
        }
    }
}


const UCI_TYPES = new Set();
UCI_TYPES.add("check");
UCI_TYPES.add("spin");
UCI_TYPES.add("combo");
UCI_TYPES.add("button");
UCI_TYPES.add("string");

let UCI_INFO = new Set();
UCI_INFO.add("depth");
UCI_INFO.add("seldepth");
UCI_INFO.add("time");
UCI_INFO.add("nodes");
UCI_INFO.add("pv");
UCI_INFO.add("multipv");
UCI_INFO.add("score");
UCI_INFO.add("currmove");
UCI_INFO.add("currmovenumber");
UCI_INFO.add("hashfull");
UCI_INFO.add("nps");
UCI_INFO.add("tbhits");
UCI_INFO.add("cpuload");
UCI_INFO.add("string");
UCI_INFO.add("refutation");
UCI_INFO.add("currline");

function make_ponder_options_string(options, max_movetime) {
    let options_options = [];
    if (options.searchmoves) {
        if (typeof options.searchmoves === 'object' && Array.isArray(options.searchmoves) ) {
            options_options.push("searchmoves " + options.searchmoves.join(" "));
        }
    }
    if (options.wtime) {
        options_options.push("wtime " + options.wtime)
    }
    if (options.btime) {
        options_options.push("btime " + options.btime);
    }
    if (options.winc) {
        options_options.push("winc " + options.winc);
    }
    if (options.binc) {
        options_options.push("binc " + options.binc); 
    }
    if (options.movestogo) {
        options_options.push("movestogo " + options.movestogo); 
    }
    if (options.depth) {
        options_options.push("depth " + options.depth); 
    }
    if (options.nodes) {
        options_options.push("nodes " + options.nodes); 
    }
    if (options.mate) {
        options_options.push("mate " + options.mate); 
    }
    if (options.movetime < max_movetime ) {
        options_options.push("movetime " + options.movetime);
    } else {
        options_options.push("movetime " + max_movetime);
    }
    return options_options.join(" ");
}


class UCIEngineOption {
    static fromMessage(message) {
        let option = new UCIEngineOption();
        extract_option(message, 'name', option);
        extract_option(message, 'type', option);
        extract_option(message, 'var', option);
        extract_option(message, 'min', option);
        extract_option(message, 'max', option);
        extract_option(message, 'default', option);
        return option;
    }
    constructor() {
        this._data = {};
    }
    set name(name) {
        this._data.name = name;
    }
    get name() {
       return this._data.name;
    }
    set type(type) {
        if (UCI_TYPES.has(type)) {
            this._data.type = type;
        } else {
            throw new Error("Invalid type", type);
        } 
    }
    get type() {
        return this._data.type;
    }
    set default(value) {
        this._data.default = value;
    }
    get default() {
        return this._data_default;
    }
    set var(value) {
        this._data.var = value;
    }
    get var() {
        return this._data.var;
    }
    set min(value) {
        this._data.min = parseInt(value);
    }
    get min() {
        return this._data.min;
    }
    set max(value) {
        this._data.max = parseInt(value);
    }
    get max() {
        return this._data.max;
    }
    set value(value) {
        if (this.type === 'check') {
            if (value) {
                this._value = true;
            } else {
                this._value = false;
            }
        } else if (this.type === 'spin') {
            if (this._data.min < value && this._data.max >= value) {
                this._value = value;
            } else {
                throw new Error("Invalid Spin value " + value + " must be > "  + this._data.min + " " + this._data.max );
            }
        } else if (this.type === 'combo') {
            if (this.var && this.var.has(value)) {
                this._value = value;
            } else {
                throw new Error("Invalid combo value " + value + " allowed only " + this.var + "]")
            }
        } else if (this.type === 'button') {

        } else if (this.type === 'string') {
            this._value = value;
        }
    }
    get value() {
        return this._value;
    }

    generateMesssage() {
        let message = "setoption name " + this.name;
        if (this.type !== 'button') {
            message +=  " value " + this.value;
        }
        return message;
    }
}

function parse_info_message(message) {
    let words = message.split(" ");
    let current_type;
    let info = {};
    let values = [];
    for (let word of words) {
        if (word === 'info') {
            continue;
        }
        if (UCI_INFO.has(word)) {
            if (current_type) {
                info[current_type] = values.join(" ");
            }
            values= [];
            current_type = word;
        } else {
            values.push(word)
        }
    }
    if (current_type) {
        if (current_type) {
            info[current_type] = values.join(" ");
        }
    }
    return info;
}