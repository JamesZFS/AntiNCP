import dateFormat from 'dateformat';

Date.prototype.addDay = function (days = 1) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

Date.prototype.addSec = function (secs = 1) {
  let date = new Date(this.valueOf());
  date.setSeconds(date.getSeconds() + secs);
  return date;
};

Date.prototype.format = function (mask, utc, gmt) {
  return dateFormat(this, mask, utc, gmt);
};

const timeDisplayInterval = 10 * 60 * 1000; // 10 mins

export function processArticles(articles) {
  let res = [];
  let curDate = '';
  let prevTime = 0;
  articles.forEach((x, i) => {
    x.img = require(`../assets/avatar/${x.sourceName}.png`);
    x.content = `<span class='text--primary'>${x.creator}</span> &mdash; ${x.content}`;
    let d = new Date(x.date);
    if (d.toLocaleDateString() !== curDate) { // date changed
      curDate = d.toLocaleDateString();
      if (i > 0) res.push({divider: true, inset: false});  // add separator
      res.push({header: curDate, bold: true}); // date
    }
    if (Math.abs(prevTime - d.valueOf()) >= timeDisplayInterval) {
      prevTime = d.valueOf();
      res.push({header: d.toLocaleTimeString()});
    }
    res.push(x);
  });
  return res;
}
