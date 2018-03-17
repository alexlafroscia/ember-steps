'use strict';

module.exports = function() {
  let s = '';
  const x = 6;
  while (s.length < x && x > 0) {
    const r = Math.random();
    s +=
      r < 0.1
        ? Math.floor(r * 100)
        : String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65));
  }
  return s;
};
