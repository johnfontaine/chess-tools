"use strict";
const Site = require("../site.js");
const rp = require('request-promise');
var PlayerModel = require("../../model/player.js");
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

    async fetch_games_for_player(player) {    
        let archives = await this._fetch_archives(player);
        let games = [];
        if (archives && archives.length) {
            for (let url of archives) {
                let results = await this._fetch_games(url);
                games.concat(results);
            }
        }
        return games;
    }
    async _fetch_games(url) {
        var options = {
            json: true,
            uri: url,
            transform: function(games) {
                return games.games;
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
}
module.exports=ChessCom
