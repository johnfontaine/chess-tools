"use strict";


const assert = require('assert');
const should = require('should');
const PGN = require("../pgn/index.js");
var test_pgn = "[Event \"Live Chess\"]\n[Site \"Chess.com\"]\n[Date \"2017.06.01\"]\n[Round \"-\"]\n[White \"tryingtolearn1234\"]\n[Black \"HifiPhil\"]\n[Result \"1-0\"]\n[ECO \"C00\"]\n[ECOUrl \"https://www.chess.com/openings/C00-French-Defense-St-George-Defense\"]\n[WhiteElo \"1118\"]\n[BlackElo \"953\"]\n[TimeControl \"600\"]\n[Termination \"tryingtolearn1234 won by checkmate\"]\n[StartTime \"02:52:32\"]\n[EndDate \"2017.06.01\"]\n[EndTime \"02:52:32\"]\n[Link \"https://www.chess.com/live/game/2130752173\"]\n\n1. e4 a6 2. d4 e6 3. Nc3 h6 4. Nf3 d6 5. d5 e5 6. Bc4 b5 7. Bb3 Nd7 8. a4 b4 9. Na2 Nb6 10. Nxb4 Bd7 11. a5 Rb8 12. Nc6 Bxc6 13. dxc6 Nc8 14. Be3 Nf6 15. O-O g5 16. h3 g4 17. hxg4 Nxg4 18. Qd5 Qe7 19. Rab1 Nf6 20. Qc4 Rg8 21. Qxa6 Nh5 22. Bc4 f6 23. b4 Qg7 24. Nh4 Qg4 25. Bxg8 Qxh4 26. b5 f5 27. exf5 Be7 28. b6 cxb6 29. axb6 d5 30. b7 d4 31. bxc8=Q+ Rxc8 32. Qxc8+ Bd8 33. Qe6+ Be7 34. c7 dxe3 35. c8=Q# 1-0";
var pgnObj
before(function() {
    pgnObj = new PGN(test_pgn);
});
describe("pgn", function() {
    it("should have Event", function() {
        pgnObj.should.have.property("Event");
    })
});