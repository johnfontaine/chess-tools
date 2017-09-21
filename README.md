# chess-tools

## Purpose

The goal of of this package is to provide useful functionality for those seeking to integrate various chess related datasets.  This project is not intended to perform analysis its own analysis or serve as a chess engine.  Instead it is meant as a utlity to bridge different datasources such as games played online, ECO codes, opening books, and engine analysis, and tablebases.  

## Installation

## Usage

```
 const ChessTools = require('chess-tools');
```
## Organization

* ChessTools
.* OpeningBooks
.. Allows for reading opening books in various formats with a generic interface.

..* General Interface
```
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
..* Supported Formats:
...* CTG
...* Polyglot
...* Arena

.* ECO
..Allows for openings to be classified based on a pgn string.
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


## References
* Chess Programming Wiki
.. https://chessprogramming.wikispaces.com/


* ABK Format 
.. https://chessprogramming.wikispaces.com/ABK

* Polyglot Format
..Sample File .. https://github.com/michaeldv/donna_opening_books/raw/master/gm2001.bin


* CTG Format
.. Forum post .. http://rybkaforum.net/cgi-bin/rybkaforum/topic_show.pl?tid=2319

* CTGReader
.. https://github.com/sshivaji/ctgreader/
.. Sample file http://americanfoot.free.fr/echecs/ctg-thematique.htm


ECO Codes
.. ftp://ftp.cs.kent.ac.uk/pub/djb/pgn-extract/eco.pgn
