# chess-tools

Purpose

The goal of of this package is to provide useful functionality for those seeking to integrate various chess related datasets.  This project is not intended to perform analysis its own analysis or serve as a chess engine.  Instead it is meant as a utlity to bridge different datasources such as games played online, ECO codes, opening books, and engine analysis, and tablebases.  

Installation

Use

    const ChessTools = require('chess-tools');


Organization

    ChessTools
        -OpeningBooks
            CTG
            Polyglot
            Arena
        -ECO

Dependencies

This module depends on the chess.js package.  


References:
Polyglot Format
Sample File https://github.com/michaeldv/donna_opening_books/raw/master/gm2001.bin



CTG Format
Forum post http://rybkaforum.net/cgi-bin/rybkaforum/topic_show.pl?tid=2319
CTGReader by https://github.com/sshivaji
https://github.com/sshivaji/ctgreader/
Sample file http://americanfoot.free.fr/echecs/ctg-thematique.htm
