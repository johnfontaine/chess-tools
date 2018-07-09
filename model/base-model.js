"use strict";

class BaseModel {
    constructor(data) {
        for (let key in this.fields) {
            if (data && typeof(data[key]) != "undefined") {
                this[key] = data[key];
            } else {
                this[key] = this.fields[key];
            }
        }
    }
    get fields() {
        throw new Error("Implement in subclass");
    }
}
module.exports = BaseModel;