'use strict';

const name = function() {
  return {
    type: 'string',
    minLength: 1,
    maxLength: 222
  }
};

module.exports = { name };
