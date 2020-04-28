Date.prototype.addSec = function (secs = 1) {
    let date = new Date(this.valueOf());
    date.setSeconds(date.getSeconds() + secs);
    return date;
};

Date.prototype.addDay = function (days = 1) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

const MILLISECONDS_PER_DAY = 86400000;

/**
 * @param other{Date}
 * @return {number} float
 */
Date.prototype.dayDiff = function (other) {
    return (this - other) / MILLISECONDS_PER_DAY
}
