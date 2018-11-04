"use strict"
const Clock = require("../../model/clock.js");
const assert = require('assert');
describe("Chess Clock Tests", function() {
    describe("Simple 5 minute blitz game", function() {
        let clock = null;
        before(function() {
            clock = Clock.parsePgnTimeControl("600");
        });
        it("initial time for black is 600 seconds", function() {
            assert.equal(600,clock.get_initial_time("BLACK"));
        });
        it("initial time for white is 600 seconds", function() {
            assert.equal(600,clock.get_initial_time("WHITE"));
        }); 
        after(function() {
            clock = null;
        })
    });
    describe("40 moves / 4500 seconds", function() {
        let clock = null;
        before(function() {
            clock = Clock.parsePgnTimeControl("40/4500:3600");
        });
        it("initial time for black is 4500 seconds", function() {
            assert.equal(clock.get_initial_time("BLACK"),4500);
        });
        it("initial time for white is 4500 seconds", function() {
            assert.equal(clock.get_initial_time("WHITE"),4500);
        });
        it("Has two segments for black and white", function() {
            assert.equal(clock.controls.WHITE.length, 2);
            assert.equal(clock.controls.BLACK.length, 2)
        });
        after(function() {
            clock = null;
        })
    });
    describe("carry over and duration testing", function() {
        let clock = null;
        before(function() {
            clock = Clock.parsePgnTimeControl("2/300:300");
            clock.update_clock("WHITE", "0:03:30");
            clock.update_clock("BLACK", "0:04:55");
            clock.update_clock("WHITE", "0:01:30");
            clock.update_clock("BLACK", "0:04:00");
            clock.update_clock("WHITE", "0:06:00"); //duration should be 30 seconds
        })

        it("first ply duration is 90 seconds", function() {
            assert.equal(90, clock.ply_durations[0]);
        });
        it("sescond ply duration is 5 seconds", function() {
            assert.equal(5, clock.ply_durations[1]);
        });
        it("third ply duration is 120 seconds", function () {
            assert.equal(120, clock.ply_durations[2]);
        })
        it("fourth ply duration is 55 seconds", function() {
            assert.equal(55, clock.ply_durations[3]);
        });
        it("fifth duration should be 30 seconds", function() {
            assert.equal(30, clock.ply_durations[4])
        });
    });
    describe("increment testing", function() {
        let clock = null;
        before(function() {
            clock = Clock.parsePgnTimeControl("300+5");
            clock.update_clock("WHITE", "0:03:35");
            clock.update_clock("BLACK", "0:05:00");
            clock.update_clock("WHITE", "0:01:30");
            clock.update_clock("BLACK", "0:05:02");
            console.log(JSON.stringify(clock.ply_durations, null, " "));
        });
        it("first ply duration is 90 seconds", function() {
            assert.equal(90, clock.ply_durations[0]);
        });
        it("sescond ply duration is 5 seconds", function() {
            assert.equal(5, clock.ply_durations[1]);
        });
        it("third ply duration is 130 seconds", function () {
            assert.equal(130, clock.ply_durations[2]);
        })
        it("fourth ply duration is 3 seconds", function() {
            assert.equal(3, clock.ply_durations[3]);
        });     
    })
});

/*
const time_controls = [
    {
        pgn: "600",
        test: (clock)=> {
            
        }
    },
    {
        pgn: "40/4500",
        test: (clock)=> {
            
        } 
    },
    {
        pgn: "40/4500:3600",
        test: (clock)=> {
            
        } 
    },
    {
        pgn: "600+5" ,
        test: (clock)=> {
            
        }
    },
    {
        pgn:"40/7200:20/3600:900+30",
        test: (clock)=> {
            
        }
    }, //7200 seconds for the first 40 move3600 seconds for the moves 41-60 900 seconds with 30 second increment for moves 61-
];
*/