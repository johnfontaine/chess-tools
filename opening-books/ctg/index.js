"use strict";
var debug = require('debug')('CTG')
//Based on notes  from http://rybkaforum.net/cgi-bin/rybkaforum/topic_show.pl?tid=2319
const Transform = require('stream').Transform;
const EventEmitter = require('events');
var Chess = require('chess.js').Chess;
var chess = new Chess();
var chess_black = new Chess();
const peice_encoding = {
  '0' :     { txt : ' ', type : null, color : null},
 '110' :    { txt : 'P', type : chess.PAWN, color : chess.WHITE },
 '10110' :  { txt : 'R', type : chess.ROOK, color : chess.WHITE},
 '10100' :  { txt : 'B', type : chess.BISHOP, color : chess.WHITE},
 '10010' :  { txt : 'N', type : chess.KNIGHT, color : chess.WHITE},
 '100010' : { txt : 'Q', type : chess.QUEEN, color : chess.WHITE},
 '100000' : { txt : 'K', type : chess.KING, color : chess.WHITE},
 '111' :    { txt : 'p', type : chess.PAWN, color : chess.BLACK},
 '10111' :  { txt : 'r', type : chess.ROOK, color : chess.BLACK},
 '10101' :  { txt : 'b', type : chess.BISHOP, color : chess.BLACK},
 '10011' :  { txt : 'n', type : chess.KNIGHT, color : chess.BLACK},
 '100011' : { txt : 'q', type : chess.QUEEN, color : chess.BLACK},
 '100001' : { txt : 'k', type : chess.KING, color : chess.BLACK},
};
const peice_encoding_black = {
  '0' :     { txt : ' ', type : null, color : null},
  '110' :    { txt : 'p', type : chess.PAWN, color : chess.BLACK },
  '10110' :  { txt : 'r', type : chess.ROOK, color : chess.BLACK },
  '10100' :  { txt : 'b', type : chess.BISHOP, color : chess.BLACK },
  '10010' :  { txt : 'n', type : chess.KNIGHT, color : chess.BLACK },
  '100010' : { txt : 'q', type : chess.QUEEN, color : chess.BLACK },
  '100000' : { txt : 'k', type : chess.KING, color : chess.BLACK },
  '111' :    { txt : 'P', type : chess.PAWN, color : chess.WHITE },
  '10111' :  { txt : 'R', type : chess.ROOK, color : chess.WHITE },
  '10101' :  { txt : 'B', type : chess.BISHOP, color : chess.WHITE },
  '10011' :  { txt : 'N', type : chess.KNIGHT, color : chess.WHITE },
  '100011' : { txt : 'Q', type : chess.QUEEN, color : chess.WHITE },
  '100001' : { txt : 'K', type : chess.KING, color : chess.WHITE },
}

const board_index = {
  'a1' : 0,
  'a2' : 1,
  'a3' : 2,
  'a4' : 3,
  'a5' : 4,
  'a6' : 5,
  'a7' : 6,
  'a8' : 7,
  'b1' : 8,
  'b2' : 9,
  'b3' : 10,
  'b4' : 11,
  'b5' : 12,
  'b6' : 13,
  'b7' : 14,
  'b8' : 15,
  'c1' : 16,
  'c2' : 17,
  'c3' : 18,
  'c4' : 19,
  'c5' : 20,
  'c6' : 21,
  'c7' : 22,
  'c8' : 23,
  'd1' : 24,
  'd2' : 25,
  'd3' : 26,
  'd4' : 27,
  'd5' : 28,
  'd6' : 29,
  'd7' : 30,
  'd8' : 31,
  'e1' : 32,
  'e2' : 33,
  'e3' : 34,
  'e4' : 35,
  'e5' : 36,
  'e6' : 37,
  'e7' : 38,
  'e8' : 39,
  'f1' : 40,
  'f2' : 41,
  'f3' : 42,
  'f4' : 43,
  'f5' : 44,
  'f6' : 45,
  'f7' : 46,
  'f8' : 47,
  'g1' : 48,
  'g2' : 49,
  'g3' : 50,
  'g4' : 51,
  'g5' : 52,
  'g6' : 53,
  'g7' : 54,
  'g8' : 55,
  'h1' : 56,
  'h2' : 57,
  'h3' : 58,
  'h4' : 59,
  'h5' : 60,
  'h6' : 61,
  'h7' : 62,
  'h8' : 63
};

const flip_board = {
  'a1' : 'a8',
  'a2' : 'a7',
  'a3' : 'a6',
  'a4' : 'a5',
  'a5' : 'a4',
  'a6' : 'a3',
  'a7' : 'a2',
  'a8' : 'a1',
  'b1' : 'b8',
  'b2' : 'b7',
  'b3' : 'b6',
  'b4' : 'b5',
  'b5' : 'b4',
  'b6' : 'b3',
  'b7' : 'b2',
  'b8' : 'b1',
  'c1' : 'c8',
  'c2' : 'c7',
  'c3' : 'c6',
  'c4' : 'c5',
  'c5' : 'c4',
  'c6' : 'c3',
  'c7' : 'c2',
  'c8' : 'c1',
  'd1' : 'd8',
  'd2' : 'd7',
  'd3' : 'd6',
  'd4' : 'd5',
  'd5' : 'd4',
  'd6' : 'd3',
  'd7' : 'd2',
  'd8' : 'd1',
  'e1' : 'e8',
  'e2' : 'e7',
  'e3' : 'e6',
  'e4' : 'e5',
  'e5' : 'e4',
  'e6' : 'e3',
  'e7' : 'e2',
  'e8' : 'e1',
  'f1' : 'f8',
  'f2' : 'f7',
  'f3' : 'f6',
  'f4' : 'f5',
  'f5' : 'f4',
  'f6' : 'f3',
  'f7' : 'f2',
  'f8' : 'f1',
  'g1' : 'g8',
  'g2' : 'g7',
  'g3' : 'g6',
  'g4' : 'g5',
  'g5' : 'g4',
  'g6' : 'g3',
  'g7' : 'g2',
  'g8' : 'g1',
  'h1' : 'h8',
  'h2' : 'h7',
  'h3' : 'h6',
  'h4' : 'h5',
  'h5' : 'h4',
  'h6' : 'h3',
  'h7' : 'h2',
  'h8' : 'h1',
}
const mirror_file = {
  'a' : 'h',
  'b' : 'g',
  'c' : 'f',
  'd' : 'e',
  'e' : 'd',
  'f' : 'c',
  'g' : 'b',
  'h' : 'a'
};
const flip_ep_column = [
  0x07,
  0x06,
  0x05,
  0x04,
  0x03,
  0x02,
  0x00
];
const castle_encoding = [
  { code : 0x02, value : 'K'},
  { code : 0x01, value : 'Q'},
  { code : 0x8, value: 'k' },
  { code : 0x04, value : 'q'}
];
const en_passant_encoding = [
  { code : 0x00 , value : 'a6' },
  { code : 0x01 , value : 'b6' },
  { code : 0x02 , value : 'c6' },
  { code : 0x03 , value : 'd6' },
  { code : 0x04 , value : 'e6' },
  { code : 0x05 , value : 'f6' },
  { code : 0x06, value : 'g6' },
  { code : 0x07 , value : 'h6' }
];
const en_passant_encoding_black = [
  { code : 0x00 , value : 'a4' },
  { code : 0x01 , value : 'b4' },
  { code : 0x02 , value : 'c4' },
  { code : 0x03 , value : 'd4' },
  { code : 0x04 , value : 'e4' },
  { code : 0x05 , value : 'f4' },
  { code : 0x06, value : 'g4' },
  { code : 0x07 , value : 'h4' }
]

function read_24(dataview, start) {
  let byte1 = dataview.getUint8(start);
  let byte2 = dataview.getUint8(start+2);
  let byte3 = dataview.getUint8(start+4);
  let res = (byte1 << 16) + (byte2 << 8) + byte3;
  return res; 
}
const CTGMoveService = require("./moves.js");
const moveService = new CTGMoveService();
const ep_mask = parseInt('11100000', 2);
const castle_mask = parseInt('00011110',2);
const po = 0x1f;
const ep = 0x20;
const ca = 0x40;
const files = "abcdefgh".split("");
const ranks = "12345678".split("");
function key_from_fen(fen) {
  return fen.split(" ").slice(0,3).join(" ");
}
function pad_number_string(str, expected_length) {
  if (str.length < expected_length) {
    let pad = expected_length - str.length;
    for (let x= 0; x < pad; x++) {
      str= '0'+str;
    } 
  }
  return str;
}
function debug_buffer_to_string(buffer) {
  let array = new Uint8Array(buffer);
  process.stdout.write("\nSTART_BUFFER_DUMP\n");
  for (let i = 0; i < array.length; i++) {
    if (i % 32 == 0) {
      process.stdout.write("\n");
    }
    process.stdout.write(to_hex_string(array[i]) + " ");
  }
  process.stdout.write("\nEND_BUFFER_DUMP\n");
}
function to_hex_string(number) {
  return "0x" + pad_number_string(number.toString(16), 2);
}

class CTGEntry {

  constructor(to_move) {
    if (!to_move) {
      this.to_move = 'w';
    } else {
      this.to_move = to_move;
    }
    this.book_moves = [];
    this.ratings = [];
    this.total_games = 0;
    this.white_wins = 0;
    this.black_wins = 0;
    this.draws = 0;
    this.unknown1;
    this.unknown2;
    this.is_mirrored = false;
    
  }
  setFen(fen) {
    if (this.has_castling) {
      let castle_string = "";
      for (let encoding of castle_encoding) {
        if (this.castling_data & encoding.code) {
          castle_string += encoding.value;
        }
      }
      fen = fen.replace("-", castle_string);
    }
    if (this.has_en_passant) {
      let ep_coding = this.to_move === 'w' ? en_passant_encoding : en_passant_encoding_black;
      for (let coding of ep_coding) {
        if (coding.code & this.en_passant_data) {
          let fen_items = fen.split(" ");
          fen_items[3] = coding.value;
          fen = fen_items.join(" ");
        }
      }
    }
    if (this.to_move === 'b') {
      let fen_items = fen.split(" ");
      fen_items[1] = 'b';
      fen = fen_items.join(" ");
    }
    this.fen = fen;
    this.key = key_from_fen(fen);
  }
  toString() {
    return JSON.stringify(this, null, '');
  }
}


class CTGStream extends Transform {
  constructor() {
    super({readableObjectMode : true });
    this.page = -1;
    this.entry_num = 0;
  }
  _flush(callback) {
    callback();
  }
  _transform(chunk, encoding, callback) {
    if (this._data) {
      this._data = Buffer.concat(this._data, chunk);
    } else {
      this._data = chunk;
    }
    let dataview = new DataView(this._data.buffer);
    if (this.page === -1) {
      if (this._data.length > 32 && typeof this.number_of_games === 'undefined') {
        this.number_of_games = dataview.getUint32(28);
        // console.log("Number of Games", this.number_of_games);
      }
      if (this._data.length >= 4096) {
        this.page++;
        this._data =  Buffer.from(this._data.buffer.slice(4096, this._data.length));
        dataview = new DataView(this._data.buffer);
      }
    }
    if (this.page > -1 && this._data.length >= 4096) { 
      //we have pages.
      let num_pages = parseInt(this._data.length / 4096);
      //  console.log("Got " + num_pages + " pages", this._data.length );
      let remainder = this._data.length % 4096;
      //  console.log("remainder length is", remainder);
      let extra_data;
      if (remainder > 0) {
        extra_data = new Buffer(this._data.buffer.slice(this._data.buffer.length - remainder, this._data.buffer.length));
      }
      for (let page_num = 0 ; page_num < num_pages; page_num++) {

        this.process_page(page_num, dataview);
      }
      this._data = extra_data;
    }
    callback();
  }
  process_page(page_num, dataView) {
    this.page++;
      let page_start = page_num * 4096;
      let number_of_positions = dataView.getUint16(page_start);
      let bytes_in_page = dataView.getUint16(page_start+2);
      // console.log("Page Start", page_start, page_start + bytes_in_page)
      let page = this._data.buffer.slice(page_start, page_start + bytes_in_page);
      let pageView = new DataView(page);
      // console.log("Page Len", page);
      // console.log("page", this.page, "number_of_positions", number_of_positions);
      //  console.log("page", this.page, "bytes_in_page", bytes_in_page);
      this.record_start = 4;
      this.last_record_start =4;
      for (let pos = 0; pos < number_of_positions; pos++) {
        this.process_entry(pos, page, pageView);
      }
  }
  process_entry(pos, page, pageView) {
    this.entry_num++;
    let entry = new CTGEntry();
    let entry_black = new CTGEntry('b');
    entry.entry_num = this.entry_num;
    entry.page = this.page;
    entry.record_start = this.record_start;
    entry.pos = pos;
    entry_black.entry_num = this.entry_num;
    entry_black.page = this.page;
    entry_black.record_start = this.record_start;
    entry_black.pos = pos;
    this.last_record_start = this.record_start;
    let header_byte = pageView.getUint8(this.record_start);
    let position_length = header_byte & 0x1f;
    let en_passant = header_byte & 0x20;
    let castling = header_byte & 0x40;
    if (!header_byte) {
      // console.log("INVALID HEADER BYTE WTF!!!", this.record_start);
      debug_buffer_to_string(page.slice(this.record_start-3, this.record_start+3));
      process.exit();
    }
    // console.log(pad_number_string(header_byte.toString(2), 8));
    entry.position_length = position_length;
    // console.log("POSITION LENGTH", position_length);
    entry.has_en_passant = en_passant;
    entry.has_castling = castling;
    entry_black.position_length = position_length;
    entry_black.has_en_passant = en_passant;
    entry_black.has_castling = castling;
    let p1 = this.record_start + 1;
    let p2 = p1 + position_length;
    let position_buffer = page.slice(p1, p2);
    let position_view = new Uint8Array(position_buffer);
    let binary_string = "";
    position_view.forEach((element)=>{
      binary_string += pad_number_string(element.toString(2), 8);
    });
    entry.encoded_position = binary_string;
    entry_black.encoded_position = binary_string;
    let board = [];
    let board_black = [];
    let str_position = 0;
    let max = 6;
    let rank = 0;
    let file = 0;
    let black_is_mirrored = false;
    chess.clear();
    chess_black.clear();
    POSITION_LOOP:
    for (let board_position = 0; board_position < 64; board_position++) {
      EVAL_LOOP:
      for (let str_len = 1; str_len <= max; str_len++) {
        let eval_string = binary_string.substring(str_position, str_position+str_len);
        for (let peice_code of Object.keys(peice_encoding)) {
          if (String(eval_string) === String(peice_code)) {
            if (rank == 8) {
              file++;
              rank = 0;
            }
            let algebraic_position = files[file] + "" + ranks[rank]; 
            let black_position = flip_board[algebraic_position];
            if (peice_encoding[String(peice_code)] && peice_encoding[String(peice_code)].txt !== ' ') {
              chess.put(peice_encoding[String(peice_code)], algebraic_position);
              if (peice_encoding_black[String(peice_code)].txt == 'K') {
                if (black_position.match(/[abcd]\d/)) {
                  if (!entry.has_castling) {
                    black_is_mirrored = true;
                  }
                }
              }
              chess_black.put(peice_encoding_black[String(peice_code)], black_position);
            };

            board.push({ peice: peice_encoding[String(peice_code)], position : algebraic_position });
            board_black[board_index[black_position]] = { peice: peice_encoding_black[String(peice_code)], position : black_position }
            str_position += String(peice_code).length;
            str_len=1;
            rank++;
            continue POSITION_LOOP;
          }
        }
      }
    }
    if (black_is_mirrored) {
      entry_black.is_mirrored = true;
      chess_black.clear();
      let tmp_board_black = [];
      entry_black.has_castling = 0;
      for (let position of board_black) {
        let pos_elements = position.position.split("");
        pos_elements[0] = mirror_file[pos_elements[0]];
        position.position = pos_elements.join("");
        let updated = board_index[position.position];
        tmp_board_black[updated] = position;
        if (position.peice.txt != ' ') {
          chess_black.put(position.peice, position.position);
        }
      }
      board_black = tmp_board_black;
    }

    entry.board = board;
    entry_black.board = board_black;
    this.record_start += position_length;
    if (en_passant || castling) {
      let ep_castle = pageView.getUint8(this.record_start-1);
      let ep_value = ep_castle & ep_mask;
      ep_value = ep_value >> 5;
      entry.en_passant_data = ep_value;
      entry_black.en_passant_data = black_is_mirrored ? flip_ep_column[ep_value] : ep_value;
      let castle_value = ep_castle & castle_mask;
      castle_value = castle_value >> 1;
      entry.castling_data = castle_value;
      entry_black.castling_data = castle_value;
    }
    entry.setFen(chess.fen());
    entry_black.setFen(chess_black.fen());
    let book_moves_size = pageView.getUint8(this.record_start);
    let number_book_moves = 0;
    if (book_moves_size > 0) {
      number_book_moves = ( book_moves_size - 1 ) /2;
    }
    let move_start = this.record_start + 1;
    for (let m = 0; m < number_book_moves; m++) {
      let book_move = pageView.getUint8(move_start+(m*2));
      let book_annotation = pageView.getUint8(move_start+(m*2)+1);
      let move_and_analysis = moveService.decode_move(book_move, book_annotation, board);
      let move_and_analysis_black = moveService.decode_move(book_move, book_annotation, board_black, 'b', black_is_mirrored);
      entry.book_moves.push(move_and_analysis);
      entry_black.book_moves.push(move_and_analysis_black);
    }
    this.record_start += book_moves_size;
    let num_games = read_24(pageView, this.record_start);
    entry.total_games = num_games;
    this.record_start += 3;
    let num_white_wins = read_24(pageView, this.record_start);
    entry.white_wins = num_white_wins;
    entry_black.black_wins = num_white_wins;
    this.record_start += 3;
    let num_black_wins = read_24(pageView, this.record_start);
    entry.black_wins = num_black_wins;
    entry_black.white_wins = num_black_wins;
    this.record_start += 3;
    let num_draws = read_24(pageView, this.record_start);
    entry.draws = num_draws;
    entry_black.draws = entry.draws;
    this.record_start += 3;
    let unkown_integer = pageView.getUint32(this.record_start);
    entry.unknown1 = unkown_integer
    this.record_start += 4;
    let rating1_num_games = read_24(pageView, this.record_start);
    this.record_start += 3;
    let rating1_rating_total = pageView.getUint32(this.record_start);
    let rating1_rating = rating1_rating_total/rating1_num_games;
    entry.ratings.push({ games : rating1_num_games, rating : rating1_rating, total_ratings : rating1_rating_total  });
    this.record_start += 4;
    let rating2_num_games = read_24(pageView, this.record_start);
    this.record_start += 3;
    let rating2_rating_total = pageView.getUint32(this.record_start);
    this.record_start += 4;
    let rating2_rating =   rating2_rating_total / rating2_num_games;
    entry.ratings.push({ games : rating2_num_games, rating : rating2_rating, total_ratings : rating2_rating_total  });
    entry_black.ratings = entry.ratings;
    let recommendation = pageView.getUint8(this.record_start);
    entry.recommendation = moveService.decode_analysis(recommendation);
    entry_black.recommendation;
    this.record_start += 1;
    let unknown2 = pageView.getUint8(this.record_start);
    entry.unknown2 = unknown2;
    this.record_start += 1;
    let commentary = pageView.getUint8(this.record_start);
    entry.commentary = moveService.decode_analysis(commentary);
    entry_black.commentary =  entry.commentary;
    this.record_start +=1;
    let statistics_size = 12 + 4 + 14 + 3; //stats, unknown, ratings, recommendation, commentary;
    let record_offset = ( position_length + book_moves_size + statistics_size);
    entry.record_offset = record_offset;
    entry_black.record_offset = record_offset;
    // console.log(entry.record_start, entry.record_offset);
    this.push(entry);
    this.push(entry_black);
  }
}
class CTG  extends EventEmitter {
  constructor() {
    super();
    this.loaded = false;
    this.stream = new CTGStream();
    this.entries = {
      b : {},
      w : {},
    }
  }
  load_book(stream) {
    this.stream.on( "data", (entry)=>{
      if (this.entries[entry.to_move][entry.key]) {
        console.log("possible duplicate for entry")
        console.log("New Entry:", JSON.stringify(entry, null, ' '));
        console.log("OLD ENTRY:", JSON.stringify(this.entries[entry.to_move][entry.key]));
      }
      this.entries[entry.to_move][entry.key] = entry;
    });
    this.stream.on('finish', ()=>{
        this.loaded= true;
        this.emit("loaded");
    });
    this.stream.on('error', (error)=>{
      console.log("error", error);
      this.emit("error", error);
    })
    stream.pipe(this.stream);
  }
  findAll(fen) {
    if (!this.loaded) {
      throw new Error("No book is loaded")
    }
    let to_move = fen.split(" ")[1];
    let key = key_from_fen(fen);
    return this.entries[to_move][key];
  }
}
module.exports=CTG;
