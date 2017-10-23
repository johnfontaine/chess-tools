# chess-tools

## Purpose

The goal of of this project is to provide useful functionality for those seeking to integrate chess  datasets (ABK, Polyglot, CTG, ECO, EPD) and engine protocols (Winboard/Xboard, UCI).  This library isn't an engine, or a chess database; but instead is designed to help people who want to integrate engines and databases in order to perform more detailed analysis.  For example one could take an existing game, classify the opening by ECO code, and then send the game for analysis against various engines (e.g. Komodo, Stockfish, etc) and opening book databases.  

## Installation

    npm install chess-tools

## Usage

```
 const ChessTools = require('chess-tools');
 //See the examples/ folder in this package.
```

## Organization

### ChessTools

All the submodules are under the ChessTools namespace.   


#### OpeningBooks
Allows for reading opening books in various formats with a generic interface.

##### General Interface
```
    const ChessTools = require('chess-tools');
    const OpeningBook = ChessTools.OpeningBook.<type>
    const book = new OpeningBook();
    const fen = "rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq";
    stream = getFileOrBytesStreamSomehow();
    book.load_book(stream);
    book.on("loaded", ()=> {
        let entries = book.find(fen);
        for (let entry of entries) {
            //See entry.js for each module to manage data.
        }
    });
```
##### Supported Formats:
* CTG -- used by products such as Chessbase
* Polyglot -- used by a number of open source projects
* ABK -- used by products such as Arena 

#### Other Data Formnats
##### EPD
Allows for loading and parsing EPD files into individual entries organized by position.

```
    const ChessTools = require('chess-tools');
    const EPD = ChessTools.EPD;
    const epd = new EPD();
    const fen =  '3r1rk1/1p3pnp/p3pBp1/1qPpP3/1P1P2R1/P2Q3R/6PP/6K1 w - -'
    stream = getFileOrBytesStreamSomehow();
    epd.load_stream(stream);
    epd.on("loaded"=>{ 
      let epdEntry = epd.find(fen);
      console.log("Best move is", epd.best_move);
      console.log("Comments are", epd.comments);
      //see epd/entry.js for more details.
    });
```
##### ECO
Allows for openings to be classified based on a pgn string.
```
    const ECO = ChessTools.ECO;
    const eco = new ECO();
    let pgn = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3";
    eco.on("loaded", ()=>{ 
        let opening = eco.find(pgn);
        console.log("ECO CODE", opening.eco_code);
        console.log("NAME", opening.name);
        console.log("VARIATION", opening.variation);
        //See entry.js in the eco folder for more details.
    });
    eco.load_default(); //loads a default opening database (see sources below)
    //alternatively eco.load(stream) for a stream of a standard pgn file of openings.
```

#### Chess Engine Integration

Simplify communications with chess engines using either the XBoard/Winboard protocol or UCI.   Default support is provided for running engines and communicating over stdin/stdout; but an abstact interface is defined below that can be extened to support other forms of interprocess/interserver communications (e.g. Sockets)

##### Engines

An abstract interface to chess engines.  Provides an Abstract Manager class with a generic API interface and a Connetion class that handles the low level communications.  Two concrete Manager classes are available:
* ChessTools.Engines.Manager.Xboard -- provides support for the Xboard/Winboard protocol
* ChessTools.Engines.Manager.UCI -- provides support for the UCI protocol (recommended if available from your engine of choice).

A generic async ponderPosition(fen, options) interface is provided.  See xboard.js and uci.js for protocol specifc features.  

```
    const ChessTools = require('chess-tools');
    const enginePath = "/path/to/engine/executable" //e.g. /usr/local/bin/gnuchess
    const engineArgs = [] //additional args e.g. "--uci"
    const conn = new ChessTools.Engines.Connection.LocalProcess(engine_path, engine_args);
    const engineManager = new ChessTools.Engines.Manager.UCI(conn, {ponder_timeout : 30000 });
    /* ponderTimeout is the amount of time in milliseconds the engine should contemplate before we force it to move (30 seconds (30000) default) */
    engineManager.on("initialized", async ()=>{ 
      let bestmove = await engineManager.ponderPosition(
      "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2", 
      {lines : 5} ); //number of lines to consider at the same time.
      console.log("BESTMOVE ", bestmove);
      engine.quit(); //closes teh engine and teh 
    });
```

## Future Plans / Roadmap

Eventually I want to expand to support various tablebase and game databases.  

## References
Note: Sample Files are believed to be in the public domain or licensed under GPL.  Sources are provided below.

* Chess Programming Wiki
  https://chessprogramming.wikispaces.com/


* ABK Format 
  https://chessprogramming.wikispaces.com/ABK

* Polyglot Format
  Sample File https://github.com/michaeldv/donna_opening_books/raw/master/gm2001.bin


* CTG Format
  Forum post .. http://rybkaforum.net/cgi-bin/rybkaforum/topic_show.pl?tid=2319

* CTGReader
  https://github.com/sshivaji/ctgreader/
  Sample file http://americanfoot.free.fr/echecs/ctg-thematique.htm

* ECO Codes
  ftp://ftp.cs.kent.ac.uk/pub/djb/pgn-extract/eco.pgn

* Winboard/ XBoard Protocol
  https://www.gnu.org/software/xboard/engine-intf.html  

* UCI 
  https://chessprogramming.wikispaces.com/UCI
