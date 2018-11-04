const debug = require("debug")("Game");
const BaseModel = require("./base-model.js");
const TimeControl = require("./timecontrol.js");
function convertToSeconds(hhMMssdec) {
    let parts = hhMMssdec.split(":");
    return Number(parts[0] * 3600) + Number(parts[1] * 60) + Number(parts[2]);
}
const FIELDS = {
    controls: {
        move_count: {
            WHITE: 0,
            BLACK: 0
        },
        current_control: {
            WHITE: 0,
            BLACK: 0,
        },
        WHITE: [],
        BLACK: []
    },
    ply_durations: []
};
function check_color(color) {
    if (color != "BLACK" && color != "WHITE") {
        throw new Exception("Color must be BLACK or WHITE");
    }
}
class Clock extends BaseModel {
    constructor(data) {
       super(data);
    }
    get _fields() {
        return FIELDS;
    }
    _current_control(color) {
        return this.controls[color][this.controls.current_control[color]];
    }
    get_initial_time(color) {
        check_color(color);
        return this._current_control(color).time;
    }
    update_clock(color, hhMMssdec) {
        check_color(color);
        let seconds = convertToSeconds(hhMMssdec);
        this.controls.move_count[color]++;
        let move_count = this.controls.move_count[color];
        let control = this._current_control(color);
        if (control.hasMoveLimit && move_count > control.moves) {
            let remainder = control.time;
            this.controls.current_control[color]++;
            control = this._current_control(color);
            control.add_carryover_time(remainder);
        } 
        let duration = control.compute_duration_and_update_time(seconds);
        this.ply_durations.push(duration);
    }
    static parsePgnTimeControl(timecontrol) {
        let clock = new Clock();
        clock.controls.WHITE = timecontrol.split(":").map((value)=>{ 
            return TimeControl.fromPGNTimeControlSegment(value);
        });
        clock.controls.BLACK = timecontrol.split(":").map((value)=>{ 
            return TimeControl.fromPGNTimeControlSegment(value);
        });
        return clock;
    }

}
module.exports=Clock;