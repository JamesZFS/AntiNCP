const schedule = require('node-schedule');

const twiceADay = new schedule.RecurrenceRule();
twiceADay.hour = [12, 24];  // trigger at 12, 24'o clock every day

const onceADay = new schedule.RecurrenceRule();
onceADay.hour = [24];  // trigger at 24'o clock every day

module.exports = {scheduleJob: schedule.scheduleJob, twiceADay, onceADay};
