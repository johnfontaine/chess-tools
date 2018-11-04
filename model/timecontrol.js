const debug = require("debug")("Game");
const BaseModel = require("./base-model.js");

const FIELDS = {
    _time: null,
    increment: null,
    delay: null,
    bronstein_delay: null,
    moves: null,
};

class TimeControl extends BaseModel {
    constructor(data) {
       super(data);
    }

    get _fields() {
        return FIELDS;
    }
    get hasTime() {
        return this._time != null;
    }
    get hasDelay() {
        return this.delay != null;
    }
    get hasBronsteinDelay() {
        return this.bronstein_delay != null;
    }
    get hasMoveLimit() {
        return this.moves != null;
    }
    get hasIncrement() {
        return this.increment != null;
    }
    get time() {
        return this._time;
    }
    set time(time) {
        this._time = time;
    }
    add_carryover_time(extra) {
        this.time += extra;
    }
    compute_duration_and_update_time(end) {
        let duration = 0;
        //TODO: more research needed.
        if (this.hasIncrement) {
            duration = (Number(this.increment) + Number(this.time) )  - Number(end);
        } else if (this.hasDelay) {
            duration = (Number(this.delay) + Number(this.time) )  - Number(end);
        } else if (this.hasBronsteinDelay) {
            duration = ( Number(this.bronstein_delay) + Number(this.time))  - Number(end);
            // Assume full delay for now.  Howver its difficult to know because of the crazyness of the delay  
            /* From wikipeida: https://en.wikipedia.org/wiki/Chess_clock
            Bronstein delay—this timing method adds time but unlike increment not always the maximum amount of time is added. 
            If a player expends more than the specified delay, then the entire delay is added to the player's clock but if
            a player moves faster than the delay, only the exact amount of time expended by the player is added. For example, 
            if the delay is ten seconds and a player uses ten or more seconds for a move, ten seconds is added after they complete their move. 
            If the player uses five seconds for a move, five seconds is added after they complete their move. This ensures that the base time left 
            on the clock can never increase even if a player makes fast moves. As with increment, you get the delay time for move one 
            under FIDE and US Chess rules.
            */
        } else {
            duration = Number(this.time) - Number(end);
        }
        this.time = Number(end);
        return duration;
    }
    static fromPGNTimeControlSegment(value) {

        let timecontrol = new TimeControl();
        if (value == '?' || value == "-") {
            return timecontrol;
        }
        if (value.match(/^\d+$/)) { //entire string is only digit characters
            timecontrol.time = Number(value);
        }
        if (value.match(/^\d+\/\d+/)) { //starts with digit/digit
            let moves_time = value.match(/^(\d+)\/(\d+)/);
            timecontrol.moves = Number(moves_time[1]);
            timecontrol.time = Number(moves_time[2]);
        }
        if (value.match(/\d+\+\d+/)) { //has digit+digit
            let time_delay = value.match(/(\d+)\+(\d+)/);
            timecontrol.time = time_delay[1];
            timecontrol.delay = time_delay[2];
        }
        return timecontrol;
    }
}

module.exports=TimeControl;