"use strict;"
class PGNPly {
    constructor(data) {
        if (data.indexOf(" ") > -1) {
            this.algebraic_move = data.split(" ")[0];
        } else {
            this.algebraic_move = data;
            return
        }
        let remainder = data.substring(this.algebraic_move.length);
        this.comments = []
        let items = remainder.match(/([^\[^\]^{^}]+)/g).map((item)=>{ 
            let t = item.trim();
            if (t) {
                if (t.startsWith("%")) {
                    let field_name = t.substring(1, t.indexOf(' '));
                    let field_value = t.substring(t.indexOf(' ')).trim();
                    if (field_name == "clk") {
                        let hms = field_value.split(":");
                        field_value = ( hms[0] * 3600 ) + (hms[1] * 60) + Number(hms[2]);
                    }
                    this[field_name] = field_value
                } else {
                    this.comments.push(t);
                }
            }
         });
    }
}
module.exports=PGNPly