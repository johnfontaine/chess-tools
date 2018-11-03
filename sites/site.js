const EventEmitter = require('events');
const debug = require("debug")("Site");
const stream = require('stream');
class Job extends EventEmitter {
    constructor(promise) {
        super();
        this.promise = promise;
    }
    async run() {
       let result = await this.promise;
       this.emit("finish", result);
    }
}

class JobQueue extends EventEmitter {
    constructor(options) {
        super();
        this._running = false;
        this._requestQueue = [];
        this.min_inteval = 2500;
        if ( options && options.min_inteval) {
            this.min_inteval = options.min_inteval;
        }
        this._interval = setInterval(()=>{ 
         
            this._queueRunner();
        }, this.min_inteval);
        this._running = true;
    }
    end() {
        clearInterval(this._interval);
    }
    _queueRunner() {
        console.log(this._requestQueue.length);
        if (this._requestQueue.length > 0) {
            let job = this._requestQueue.shift();
            if (job) {
                job.run();
            }
        }
    }
    async queue_promise(promise) {
        let job = new Job(promise);
        let internal_promise = new Promise((resolve, reject) =>{ 
            job.on("finish", (data)=>{ 
                resolve(data);
            })
        }); 
        this._requestQueue.push(
            job
        );
        return await internal_promise;

    }
}
class SiteReadable extends stream.Readable {
    constructor(source) {
        super({objectMode : true });
        this._source = source;
        this._source.on("data",(results)=>{ this.push(results)});
        this._source.on("end", ()=> { this.push(null)});
    }
    _read(size) {
        this._source.execute();
    }
}


class Site extends EventEmitter {
    constructor(options) {
        super();
        this.jq = new JobQueue(options)
    }
    end() {
        this.jq.end();
    }

    async _queue_fetch_promise(promise) {
        let result = await this.jq.queue_promise(promise);
        return result;
    }
    async fetch_player(username) {
        if (!(typeof this._create_fetch_player_promise) == 'function') {
            throw new Error("Not Implemented");
        }
        return await this._queue_fetch_promise(
            this._create_fetch_player_promise(username)
        );
    }
    //Returns Readable Stream
    fetch_games_for_player(player) {
        throw new Error("Not Implemented");
    }
    async fetch_game_by_id(game_id) {
        throw new Error("Not Implemented");
    }
    _fetch_player_job(player_id, resolve, reject) {
        throw new Error("Not Implemented");
    }
    _fetch_game_pages_for_player_job(player) {
        throw new Error("Not Implemented");
    }
}
Site.Readable = SiteReadable;
module.exports=Site;