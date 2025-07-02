const moment = require('moment');

async function updateStreak(user) {
  const today = moment().startOf('day');
  const lastActive = user.lastActiveDate ? moment(user.lastActiveDate).startOf('day') : null;

  if (!lastActive) {
    user.streak = 1;
  } else if (today.diff(lastActive, 'days') === 1) {
    user.streak += 1;
  } else if (today.diff(lastActive, 'days') > 1) {
    user.streak = 1;
  }

  user.lastActiveDate = new Date();
  await user.save();
}

module.exports = updateStreak;
