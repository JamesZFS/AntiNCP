const schedule = require('node-schedule');

const twiceADay = new schedule.RecurrenceRule();
Object.assign(twiceADay, {hour: [0, 12], minute: [0], second: [0]});  // trigger at 0, 12'o clock every day

const onceADay = new schedule.RecurrenceRule();
Object.assign(onceADay, {hour: [12], minute: [0], second: [0]});  // trigger at 12'o clock every day

const every = {
    Hour: '15 * * * *',
    thirtyMins: '*/30 * * * *',
    tenMins: '*/10 * * * *',
};

const fetchingPolicy = {
    maxTrials: 4, // maximum times of fetching if download fails
    interval: 5 * 60 * 1000, // interval between each trial in ms, 5mins
};

async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}


module.exports = {scheduleJob: schedule.scheduleJob, twiceADay, onceADay, every, fetchingPolicy, sleep};
