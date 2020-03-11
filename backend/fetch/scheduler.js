const schedule = require('node-schedule');
const debug = require('debug')('backend:scheduler');

const twiceADay = new schedule.RecurrenceRule();
twiceADay.hour = [12, 24];  // trigger at 12, 24'o clock every day

const jobTwiceADay = schedule.scheduleJob(twiceADay, (time) => {
    debug(Date.toLocaleString(time));
});

module.exports = {jobTwiceADay};
