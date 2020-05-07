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

const MILLISECONDS_PER_DAY = 86400000;

/**
 * @param other{Date}
 * @return {number} float
 */
Date.prototype.dayDiff = function (other) {
    return (this - other) / MILLISECONDS_PER_DAY
};

const timeDisplayInterval = 10 * 60 * 1000; // 10 mins

export function processArticles(articles) {
    let res = [];
    let curDate = '';
    let prevTime = 0;
    articles.forEach((x, i) => {
        x.img = require(`../assets/avatar/${x.sourceName}.jpg`);
        x.content = `<span class='text--primary'>${x.creator}</span> &mdash; ${x.content}`;
        let d = new Date(x.date);
        if (d.toLocaleDateString() !== curDate) { // date changed
            curDate = d.toLocaleDateString();
            if (i > 0) res.push({divider: true, inset: false});  // add separator
            res.push({header: curDate, bold: true}); // date
        }
        if (Math.abs(prevTime - d.valueOf()) >= timeDisplayInterval) { // significant time change
            prevTime = d.valueOf();
            res.push({header: d.toLocaleTimeString()});
        }
        res.push(x);
    });
    return res;
}

/**
 * Color interpolation
 * @param alpha{number} [0, 1]
 * @param c1{int[]}
 * @param c2{int[]}
 * @return {int[]}
 */
export function colorLerp(alpha, c1, c2) {
    let beta = 1 - alpha;
    return [
        Math.round(beta * c1[0] + alpha * c2[0]),
        Math.round(beta * c1[1] + alpha * c2[1]),
        Math.round(beta * c1[2] + alpha * c2[2]),
    ];
}

/**
 * @param c{number}
 * @return {string}
 */
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

/**
 * @param rgb{int[]}
 * @return {string}
 */
export function rgbToHex(rgb) {
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

/**
 * @param hex{string}
 * @return {int[] | null} rgb
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ] : null;
}

export const chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};
