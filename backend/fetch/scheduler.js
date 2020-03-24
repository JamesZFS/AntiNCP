const schedule = require('node-schedule');

const twiceADay = new schedule.RecurrenceRule();
Object.assign(twiceADay, {hour: [4, 16], minute: [0], second: [0]});  // trigger at 4, 16'o clock every day

const onceADay = new schedule.RecurrenceRule();
Object.assign(onceADay, {hour: [4], minute: [0], second: [0]});  // trigger at 4'o clock every day

module.exports = {scheduleJob: schedule.scheduleJob, twiceADay, onceADay};
