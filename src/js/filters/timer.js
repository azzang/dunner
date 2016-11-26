angular.module('dunner').filter('timer', () => seconds => _.map([
  parseInt(seconds / 3600, 10),
  parseInt(seconds / 60, 10) % 60,
  seconds % 60,
], time => (time < 10 ? `0${time}` : time))
.join(':'));
