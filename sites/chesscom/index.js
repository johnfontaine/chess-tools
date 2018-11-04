"use strict";
const Site = require("../site.js");
const rp = require('request-promise');
const EventEmitter = require('events');
const Game = require("../../model/game.js");
const PlayerModel = require("../../model/player.js");
const Ply = require("../../model/ply.js");
const PGN = require("../../pgn/index.js");
const Chess = require('chess.js').Chess;
let chess = new Chess();

function compute_winnner(game) {
    if (game.white.result == "win") {
        return 1;
    } else if (game.black.result == "win") {
        return 2;
    } else {
        return 0;
    }
}
function compute_result(game) {
  //See Game.Result.*
    if (game.black.result == 'checkmated' || game.white.result == 'checkmated') {
        return Game.Result.MATE;
    }
    if (game.black.result == 'resigned' || game.white.result == 'resigned') {
        return Game.Result.RESIGN;
    }
    if (game.black.result == 'timeout' || game.white.result == 'timeout') {
        return Game.Result.TIMEOUT;
    }

}
/* Note Chess.com has a bug and isn't reporting start time correctly :-(
*/
function compute_total_game_time(pgn, game) {
    let startDate = pgn.EndDate.replace(/\./g, "-");
    let endDate = pgn.EndDate.replace(/\./g, "-");
    let startTime = pgn.StartTime;
    let endTime = pgn.EndTime;
    if (pgn.StartDate) {
        startDate = pgn.StartDate.replaceAll(".", "-")
    }
    let start = Date.parse(startDate + " " + startTime);
    let end = Date.parse(endDate + " " + endTime);
    return end-start;
}
function make_ply(chess, ply_number, move, pgn) {
    let ply = new Ply({
        algebraic_move : move,
        ply_number: ply_number,
        fen: chess.fen(),
        is_evaluated : false
    });
    if (pgn.pgnply[ply_number].clk != undefined) {
        ply.clock = Number(pgn.pgnply[ply_number].clk);
        if (ply_number > 1) {
            ply.time_taken = Number(pgn.pgnply[ply_number-2].clk); - ply.clock 
        } else {
            ply.time_taken = pgn.TimeControl; - ply.clock 
        }
    }
    return ply;
}
function transform_game(game) {
    chess.clear();
    chess.load_pgn(game.pgn);
    let pgn = new PGN(game.pgn);
    let history = chess.history();
    let plys = new Array(history.length);
    let ply_number = history.length -1;
    plys[ply_number] = make_ply(chess, ply_number, history[ply_number], pgn);
    while(ply_number >=0 ) {
        ply_number--;
        plys[ply_number] = make_ply(chess, ply_number, history[ply_number])
    }

   return new Game({
        source_url : game.url,
        location_name : 'chess.com',
        rated : game.rated,
        pgn : pgn,
        plys : plys,
        players : {
            white : new PlayerModel({
                username : game.white.username,
                profile_url : game.white['@id'],
                site_data : game.white
            }),
            black :  new PlayerModel({
                username : game.black.username,
                profile_url : game.black['@id'],
                site_data : game.black
            }),      
        },
        winner: compute_winnner(game),
        result: compute_result(game),
        clock: {
            time_class: game.time_class,
            time_control: game.time_control,
            total_game_time: compute_total_game_time(pgn, game)
        },
        opening: {
            code: "",
            name: "",
        }
    });
}
class ChessCom extends Site {
    constructor() {
        super({"min_interval" : 2500});
    }
    _create_fetch_player_promise(username) {
        let player = new PlayerModel();
        player.profile_url = 'https://api.chess.com/pub/player/' + username;
        player.username = username;
        let options = {
            json: true,
            uri: player.profile_url,
            transform: function (player_data) {
                player.name = player_data.name;
                delete player_data['name'];
                player.site_data = player_data;
                return player;
            }
        };
        return rp(options);
    }

    fetch_games_for_player(player) { 
        let source = new EventEmitter();
        source.execute = ()=> { 
            this._fetch_archives(player)
            .then(async (archives)=>{
                for (let url of archives) {
                    let results = await this._fetch_games(url);
                    source.emit("data", results)
                }
                source.emit("end");
            });
        }
        let readable = new Site.Readable(source);
        return readable;
    }
    async _fetch_games(url) {
        var options = {
            json: true,
            uri: url,
            transform: function(result) {
                let transformed_games = [];
                if (result.games) {
                    for (let game of result.games) {
                        if (game && game.white) {
                            console.log("result: ", JSON.stringify(game, null, ' '));
                            transformed_games.push(
                                transform_game(game)
                            );   
                        }   
                    }
                    return transformed_games;
                }
            }
        }
        return await this._queue_fetch_promise(
            rp(options)
        );
        
    }
    async _fetch_archives(player) {
        let options = {
            json: true,
            uri: player.profile_url + "/games/archives",
            transform: function(archive_data) {
                return archive_data.archives;
            }
        }
        return await this._queue_fetch_promise(
            rp(options)
        );
    }
    async fetch_game_by_id(game_id) {
        
    }
}
module.exports=ChessCom
