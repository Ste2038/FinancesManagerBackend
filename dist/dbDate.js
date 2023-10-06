"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbDate = void 0;
var MSTOGG = 1000 * 60 * 60 * 24;
var dbDate = /** @class */ (function () {
    function dbDate(old) {
        if (old === void 0) { old = null; }
        //console.log(old);
        if (old == null) {
            this.date = new Date();
        }
        else {
            switch (typeof (old)) {
                case "number":
                case "string":
                case "object":
                    this.date = new Date(old);
                    //console.log(this.date);
                    //console.log(typeof(this.date));
                    break;
                default:
                    console.log(typeof (old));
                    break;
            }
        }
    }
    dbDate.prototype.toDateString = function () {
        var out = this.date.getFullYear().toString() + "-";
        if (this.date.getMonth() + 1 < 10) {
            out += "0" + (this.date.getMonth() + 1).toString() + "-";
        }
        else {
            out += (this.date.getMonth() + 1).toString() + "-";
        }
        if (this.date.getDate() < 10) {
            out += "0" + this.date.getDate().toString();
        }
        else {
            out += this.date.getDate().toString();
        }
        return out;
    };
    dbDate.prototype.toMilliseconds = function () {
        return this.date.valueOf();
    };
    dbDate.prototype.addDays = function (days) {
        return new dbDate(this.date.valueOf() + (days * MSTOGG));
    };
    dbDate.prototype.getMonth = function () {
        return this.date.getMonth() + 1;
    };
    dbDate.prototype.addMonth = function (months) {
        return new dbDate(this.date.setMonth(this.date.getMonth() + months));
    };
    return dbDate;
}());
exports.dbDate = dbDate;
