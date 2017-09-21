"use strict";
const utils  = require('../../utils.js');
let peices = {
    'Pawn' : 'P',
    'Knight': 'N',
    'King': 'K',
    'Queen': 'Q',
    'Bishop': 'B'
};
let files = utils.board.FILES;
function algebraic_position_to_xy(algebraic) {
    let file_and_rank = algebraic.split("");
    let x;
    for (x = 0; x < 8; x++) {
        if (files[x] === file_and_rank[0]) {
            break;
        }
    }
    return {
        x : parseInt(x),
        y : parseInt(file_and_rank[1])-1
    }
}
function xy_to_algebraic_notation(xy) {
    let rank = xy.y + 1;
    let file = files[xy.x];
    return file + "" + rank;
}

class CTGMoveService {
   constructor() {

   }
   decode_move(code, analysis_code, board, is_black, is_mirrored) {
    var move;
    var start_position = "";
    var end_position = "";
    var move_notation = "";
    for (move of CTGMoveService.moves) {
        if (Number(code) === Number(move.code)) {
            break;
        }
    }
    if (move.move === 'O-O' || move.move === 'O-O-O') {
        move_notation= move.move;
    } else {
        let peice_number = move.peice.match(/([A-Za-z]+) (\d)/);
        if (peice_number) {
            let peice_short = peices[peice_number[1]];
            let peice_num = peice_number[2];
            let pn= 1;
            let i = 0;
             for (let position of board) {
                //
                if (!position || !position.peice) {
                    console.log("BOARD ERROR", is_black, is_mirrored, i, board.length);
                    console.log(JSON.stringify(board, null, ' '));
                   process.exit();
                } 
                 if (position.peice.txt === peice_short) {
                     if (pn == peice_num) {
                       start_position = position.position;
                          let move_info = move.move.match(/(\w)(\d) ?(\w?)(\d?)/);
                          if (move_info) {
                              let x_dir = 1;
                              let y_dir = 1;
                              let x = 0;
                              let y = 0;
                              if (move_info[1] === 'b') {
                                  y_dir = is_black ? 1 : -1;
                              }
                              if (move_info[1] === 'r' || move_info[3] === 'r') {
                                  x_dir = (is_black && !is_mirrored ) ? 1 :  -1;
                              }
                              if (move_info[1] === 'b' || move_info[1] === 'f') {
                                  y = move_info[2];
                              } else {
                                  x = move_info[2];
                              }
                              if (move_info[3]) {
                                  x = move_info[4];
                              }
                              x = x * x_dir;
                              y = y * y_dir;
                              let xy = algebraic_position_to_xy(start_position);
                              xy.y = xy.y + y;
                              xy.x = xy.x + x;
                              move_notation = start_position + "" + xy_to_algebraic_notation(xy);
                          }
      
                       break;
                     } else {
                       pn++;
                     }
                 }
                 i++;
             } 
          }
    }
    return { "move" : move, "analysis" : this.decode_analysis(analysis_code), "move_notation" : move_notation };
   }
   decode_analysis(analysis_code) {
    var analysis;
    for (analysis of CTGMoveService.analysis) {
        if (Number(analysis.code) === Number(analysis_code)) {
            break;
        }
    }
    return analysis;
   }

}

CTGMoveService.analysis = [
    {"code" : "0x00", "description" : "No annotation"},
    {"code" : "0x01", "description" : "!"},
    {"code" : "0x02", "description" : "?"},
    {"code" : "0x03", "description" : "!!"},
    {"code" : "0x04", "description" : "??"},
    {"code" : "0x05", "description" : "!?"},
    {"code" : "0x06", "description" : "?!"},
    {"code" : "0x08", "description" : "Only move"},
    {"code" : "0x16", "description" : "Zugzwang"},
    { "code" : "0x0b", "description" : "="},
    { "code" : "0x0d", "description" : "Unclear"},
    { "code" : "0x0e", "description" : "=+"},
    { "code" : "0x0f", "description" : "+="},
    { "code" : "0x10", "description" : "-/+"},
    { "code" : "0x11", "description" : "+/-"},
    { "code" : "0x13", "description" : "+-"},
    { "code" : "0x20", "description" : "Development adv."},
    { "code" : "0x24", "description" : "Initiative"},
    { "code" : "0x28", "description" : "With attack"},
    { "code" : "0x2c", "description" : "Compensation"},
    { "code" : "0x84", "description" : "Counterplay"},
    { "code" : "0x8a", "description" : "Zeitnot"},
    { "code" : "0x92", "description" : "Novelty"}
];


CTGMoveService.moves= [
    { "code" : "0x00", "peice": "Pawn 5", "move": "f1 r1" },
    { "code" : "0x01", "peice": "Knight 2", "move": "b1 l2" },
    { "code" : "0x03", "peice": "Queen 2", "move": "r2" },
    { "code" : "0x04", "peice": "Pawn 2", "move": "f1" },
    { "code" : "0x05", "peice": "Queen 1", "move": "f1" },
    { "code" : "0x06", "peice": "Pawn 4", "move": "f1 l1" },
    { "code" : "0x08", "peice": "Queen 2", "move": "r4" },
    { "code" : "0x09", "peice": "Bishop 2", "move": "f6 r6" },
    { "code" : "0x0a", "peice": "King ", "move": "b1" },
    { "code" : "0x0c", "peice": "Pawn 1", "move": "f1 l1" },
    { "code" : "0x0d", "peice": "Bishop 1", "move": "f3 r3" },
    { "code" : "0x0e", "peice": "Rook 2", "move": "r3" },
    { "code" : "0x0f", "peice": "Knight 1", "move": "b1 l2" },
    { "code" : "0x12", "peice": "Bishop 1", "move": "f7 r7" },
    { "code" : "0x13", "peice": "King ", "move": "f1" },
    { "code" : "0x14", "peice": "Pawn 8", "move": "f1 r1" },
    { "code" : "0x15", "peice": "Bishop 1", "move": "f5 r5" },
    { "code" : "0x18", "peice": "Pawn 7", "move": "f1" },
    { "code" : "0x1a", "peice": "Queen 2", "move": "f6" },
    { "code" : "0x1b", "peice": "Bishop 1", "move": "f1 l1" },
    { "code" : "0x1d", "peice": "Bishop 2", "move": "f7 r7" },
    { "code" : "0x21", "peice": "Rook 2", "move": "r7" },
    { "code" : "0x22", "peice": "Bishop 2", "move": "f2 l2" },
    { "code" : "0x23", "peice": "Queen 2", "move": "f6 r6" },
    { "code" : "0x24", "peice": "Pawn 8", "move": "f1 l1" },
    { "code" : "0x26", "peice": "Bishop 1", "move": "f7 l7" },
    { "code" : "0x27", "peice": "Pawn 3", "move": "f1 l1" },
    { "code" : "0x28", "peice": "Queen 1", "move": "f5 r5" },
    { "code" : "0x29", "peice": "Queen 1", "move": "r6" },
    { "code" : "0x2a", "peice": "Knight 2", "move": "b2 r1" },
    { "code" : "0x2d", "peice": "Pawn 6", "move": "f1 r1" },
    { "code" : "0x2e", "peice": "Bishop 1", "move": "f1 r1" },
    { "code" : "0x2f", "peice": "Queen 1", "move": "r1" },
    { "code" : "0x30", "peice": "Knight 2", "move": "b2 l1" },
    { "code" : "0x31", "peice": "Queen 1", "move": "r3" },
    { "code" : "0x32", "peice": "Bishop 2", "move": "f5 r5" },
    { "code" : "0x34", "peice": "Knight 1", "move": "f2 r1" },
    { "code" : "0x36", "peice": "Knight 1", "move": "f1 r2" },
    { "code" : "0x37", "peice": "Queen 1", "move": "f4" },
    { "code" : "0x38", "peice": "Queen 2", "move": "f4 l4" },
    { "code" : "0x39", "peice": "Queen 1", "move": "r5" },
    { "code" : "0x3a", "peice": "Bishop 1", "move": "f6 r6" },
    { "code" : "0x3b", "peice": "Queen 2", "move": "f5 l5" },
    { "code" : "0x3c", "peice": "Bishop 1", "move": "f5 l5" },
    { "code" : "0x41", "peice": "Queen 2", "move": "f5 r5" },
    { "code" : "0x42", "peice": "Queen 1", "move": "f7 l7" },
    { "code" : "0x44", "peice": "King ", "move": "b1 r1" },
    { "code" : "0x45", "peice": "Queen 1", "move": "f3 r3" },
    { "code" : "0x4a", "peice": "Pawn 8", "move": "f2" },
    { "code" : "0x4b", "peice": "Queen 1", "move": "f5 l5" },
    { "code" : "0x4c", "peice": "Knight 2", "move": "f2 r1" },
    { "code" : "0x4d", "peice": "Queen 2", "move": "f1" },
    { "code" : "0x50", "peice": "Rook 1", "move": "f6" },
    { "code" : "0x52", "peice": "Rook 1", "move": "r6" },
    { "code" : "0x54", "peice": "Bishop 2", "move": "f1 l1" },
    { "code" : "0x55", "peice": "Pawn 3", "move": "f1" },
    { "code" : "0x5c", "peice": "Pawn 7", "move": "f1 r1" },
    { "code" : "0x5f", "peice": "Pawn 5", "move": "f2" },
    { "code" : "0x61", "peice": "Queen 1", "move": "f6 r6" },
    { "code" : "0x62", "peice": "Pawn 2", "move": "f2" },
    { "code" : "0x63", "peice": "Queen 2", "move": "f7 l7" },
    { "code" : "0x66", "peice": "Bishop 1", "move": "f3 l3" },
    { "code" : "0x67", "peice": "King ", "move": "f1 r1" },
    { "code" : "0x69", "peice": "Rook 2", "move": "f7" },
    { "code" : "0x6a", "peice": "Bishop 1", "move": "f4 r4" },
    { "code" : "0x6b", "peice": "Short Castle", "move": "O-O"},
    { "code" : "0x6e", "peice": "Rook 1", "move": "r5" },
    { "code" : "0x6f", "peice": "Queen 2", "move": "f7 r7" },
    { "code" : "0x72", "peice": "Bishop 2", "move": "f7 l7" },
    { "code" : "0x74", "peice": "Queen 1", "move": "r2" },
    { "code" : "0x79", "peice": "Bishop 2", "move": "f6 l6" },
    { "code" : "0x7a", "peice": "Rook 1", "move": "f3" },
    { "code" : "0x7b", "peice": "Rook 2", "move": "f6" },
    { "code" : "0x7c", "peice": "Pawn 3", "move": "f1 r1" },
    { "code" : "0x7d", "peice": "Rook 2", "move": "f1" },
    { "code" : "0x7e", "peice": "Queen 1", "move": "f3 l3" },
    { "code" : "0x7f", "peice": "Rook 1", "move": "r1" },
    { "code" : "0x80", "peice": "Queen 1", "move": "f6 l6" },
    { "code" : "0x81", "peice": "Rook 1", "move": "f1" },
    { "code" : "0x82", "peice": "Pawn 6", "move": "f1 l1" },
    { "code" : "0x85", "peice": "Knight 1", "move": "f2 l1" },
    { "code" : "0x86", "peice": "Rook 1", "move": "r7" },
    { "code" : "0x87", "peice": "Rook 1", "move": "f5" },
    { "code" : "0x8a", "peice": "Knight 1", "move": "b2 r1" },
    { "code" : "0x8b", "peice": "Pawn 1", "move": "f1 r1" },
    { "code" : "0x8c", "peice": "King ", "move": "b1 l1" },
    { "code" : "0x8e", "peice": "Queen 2", "move": "f2 l2" },
    { "code" : "0x8f", "peice": "Queen 1", "move": "r7" },
    { "code" : "0x92", "peice": "Queen 2", "move": "f1 r1" },
    { "code" : "0x94", "peice": "Queen 1", "move": "f3" },
    { "code" : "0x96", "peice": "Pawn 2", "move": "f1 r1" },
    { "code" : "0x97", "peice": "King ", "move": "l1" },
    { "code" : "0x98", "peice": "Rook 1", "move": "r3" },
    { "code" : "0x99", "peice": "Rook 1", "move": "f4" },
    { "code" : "0x9a", "peice": "Queen 1", "move": "f6" },
    { "code" : "0x9b", "peice": "Pawn 3", "move": "f2" },
    { "code" : "0x9d", "peice": "Queen 1", "move": "f2" },
    { "code" : "0x9f", "peice": "Bishop 2", "move": "f4 l4" },
    { "code" : "0xa0", "peice": "Queen 2", "move": "f3" },
    { "code" : "0xa2", "peice": "Queen 1", "move": "f2 r2" },
    { "code" : "0xa3", "peice": "Pawn 8", "move": "f1" },
    { "code" : "0xa5", "peice": "Rook 2", "move": "f5" },
    { "code" : "0xa9", "peice": "Rook 2", "move": "r2" },
    { "code" : "0xab", "peice": "Queen 2", "move": "f6 l6" },
    { "code" : "0xad", "peice": "Rook 2", "move": "r4" },
    { "code" : "0xae", "peice": "Queen 2", "move": "f3 r3" },
    { "code" : "0xb0", "peice": "Queen 2", "move": "f4" },
    { "code" : "0xb1", "peice": "Pawn 6", "move": "f2" },
    { "code" : "0xb2", "peice": "Bishop 1", "move": "f6 l6" },
    { "code" : "0xb5", "peice": "Rook 2", "move": "r5" },
    { "code" : "0xb7", "peice": "Queen 1", "move": "f5" },
    { "code" : "0xb9", "peice": "Bishop 2", "move": "f3 r3" },
    { "code" : "0xbb", "peice": "Pawn 5", "move": "f1" },
    { "code" : "0xbc", "peice": "Queen 2", "move": "r5" },
    { "code" : "0xbd", "peice": "Queen 2", "move": "f2" },
    { "code" : "0xbe", "peice": "King ", "move": "r1" },
    { "code" : "0xc1", "peice": "Bishop 1", "move": "f2 r2" },
    { "code" : "0xc2", "peice": "Bishop 2", "move": "f2 r2" },
    { "code" : "0xc3", "peice": "Bishop 1", "move": "f2 l2" },
    { "code" : "0xc4", "peice": "Rook 2", "move": "r1" },
    { "code" : "0xc5", "peice": "Rook 2", "move": "f4" },
    { "code" : "0xc6", "peice": "Queen 2", "move": "f5" },
    { "code" : "0xc7", "peice": "Pawn 7", "move": "f1 l1" },
    { "code" : "0xc8", "peice": "Pawn 7", "move": "f2" },
    { "code" : "0xc9", "peice": "Queen 2", "move": "f7" },
    { "code" : "0xca", "peice": "Bishop 2", "move": "f3 l3" },
    { "code" : "0xcb", "peice": "Pawn 6", "move": "f1" },
    { "code" : "0xcc", "peice": "Bishop 2", "move": "f5 l5" },
    { "code" : "0xcd", "peice": "Rook 1", "move": "r2" },
    { "code" : "0xcf", "peice": "Pawn 4", "move": "f1" },
    { "code" : "0xd1", "peice": "Pawn 2", "move": "f1 l1" },
    { "code" : "0xd2", "peice": "Knight 2", "move": "f1 r2" },
    { "code" : "0xd3", "peice": "Knight 2", "move": "f1 l2" },
    { "code" : "0xd7", "peice": "Queen 1", "move": "f1 l1" },
    { "code" : "0xd8", "peice": "Rook 2", "move": "r6" },
    { "code" : "0xd9", "peice": "Queen 1", "move": "f2 l2" },
    { "code" : "0xda", "peice": "Knight 1", "move": "b2 l1" },
    { "code" : "0xdb", "peice": "Pawn 1", "move": "f2" },
    { "code" : "0xde", "peice": "Pawn 5", "move": "f1 l1" },
    { "code" : "0xdf", "peice": "King ", "move": "f1 l1" },
    { "code" : "0xe0", "peice": "Knight 2", "move": "b1 r2" },
    { "code" : "0xe1", "peice": "Rook 1", "move": "f7" },
    { "code" : "0xe3", "peice": "Rook 2", "move": "f3" },
    { "code" : "0xe5", "peice": "Queen 1", "move": "r4" },
    { "code" : "0xe6", "peice": "Pawn 4", "move": "f2" },
    { "code" : "0xe7", "peice": "Queen 1", "move": "f4 r4" },
    { "code" : "0xe8", "peice": "Rook 1", "move": "f2" },
    { "code" : "0xe9", "peice": "Knight 1", "move": "b1 r2" },
    { "code" : "0xeb", "peice": "Pawn 4", "move": "f1 r1" },
    { "code" : "0xec", "peice": "Pawn 1", "move": "f1" },
    { "code" : "0xed", "peice": "Queen 1", "move": "f7 r7" },
    { "code" : "0xee", "peice": "Queen 2", "move": "f1 l1" },
    { "code" : "0xef", "peice": "Rook 1", "move": "r4" },
    { "code" : "0xf0", "peice": "Queen 2", "move": "r7" },
    { "code" : "0xf1", "peice": "Queen 1", "move": "f1 r1" },
    { "code" : "0xf3", "peice": "Knight 2", "move": "f2 l1" },
    { "code" : "0xf4", "peice": "Rook 2", "move": "f2" },
    { "code" : "0xf5", "peice": "Bishop 2", "move": "f1 r1" },
    { "code" : "0xf6", "peice": "Long Castle", "move": "O-O-O" },
    { "code" : "0xf7", "peice": "Knight 1", "move": "f1 l2" },
    { "code" : "0xf8", "peice": "Queen 2", "move": "r1" },
    { "code" : "0xf9", "peice": "Queen 2", "move": "f6" },
    { "code" : "0xfa", "peice": "Queen 2", "move": "r3" },
    { "code" : "0xfb", "peice": "Queen 2", "move": "f2 r2" },
    { "code" : "0xfd", "peice": "Queen 1", "move": "f7" },
    { "code" : "0xfe", "peice": "Queen 2", "move": "f3 l3" }
];
module.exports = CTGMoveService;
