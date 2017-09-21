"use strict";
var debug = require('debug')('CTG');
var utils = require(__dirname + '/../../utils.js');
const CTGEntry = require("./entry.js");
//Based on notes  from http://rybkaforum.net/cgi-bin/rybkaforum/topic_show.pl?tid=2319
const Transform = require('stream').Transform;
const EventEmitter = require('events');
const Chess = require('chess.js').Chess;
const chess = new Chess();
const chess_black = new Chess();
const files = utils.board.FILES;
const ranks = utils.board.RANKS;
const board_index = utils.board.BOARD_INDEX;
const flip_board = utils.board.FLIP_BOARD;
const mirror_file = utils.board.MIRROR_FILE;
const CTGMoveService = require("./moves.js");
const moveService = new CTGMoveService();
const {peice_encoding, peice_encoding_black, flip_ep_column, castle_encoding,en_passant_encoding,en_passant_encoding_black,ep_mask, castle_mask, po, ep, ca } = require("./encoding.js");
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
      utils.debug_buffer_to_string(page.slice(this.record_start-3, this.record_start+3));
      process.exit();
    }
    // console.log(utils.pad_number_string(header_byte.toString(2), 8));
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
      binary_string += utils.pad_number_string(element.toString(2), 8);
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
  find(fen) {
    if (!this.loaded) {
      throw new Error("No book is loaded")
    }
    let to_move = fen.split(" ")[1];
    let key = utils.key_from_fen(fen);
    return this.entries[to_move][key];
  }
}
module.exports=CTG;
CTG.CTGStream = CTGStream;
CTG.CTGEntry = CTGEntry;


function read_24(dataview, start) {
  let byte1 = dataview.getUint8(start);
  let byte2 = dataview.getUint8(start+2);
  let byte3 = dataview.getUint8(start+4);
  let res = (byte1 << 16) + (byte2 << 8) + byte3;
  return res; 
}
