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
