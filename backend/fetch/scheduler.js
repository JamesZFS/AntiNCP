const schedule = require('node-schedule');

const twiceADay = new schedule.RecurrenceRule();
Object.assign(twiceADay, {hour: [0, 12], minute: [0], second: [0]});  // trigger at 0, 12'o clock every day

const onceADay = new schedule.RecurrenceRule();
Object.assign(onceADay, {hour: [12], minute: [0], second: [0]});  // trigger at 12'o clock every day

module.exports = {scheduleJob: schedule.scheduleJob, twiceADay, onceADay};
