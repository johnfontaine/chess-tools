"use strict";
const CTG = require("../opening-books/ctg/index.js");
const fs = require("fs");
let ctg = new CTG();
let stream = fs.createReadStream(process.cwd() + "/test/sample-data/PowerPlay17-Sicilienne.ctg").pipe(ctg.ctgStream);
stream.on("data", (data)=>{ 
     console.log("PAGE", data.page, data.pos, data.to_move, data.is_mirrored, data.board.length);
      console.log("\t", data.fen);
   // console.log(JSON.stringify(data.book_moves));
});