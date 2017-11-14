'use strict';
const errors = require('mm-errors');
const types = require('../types');

const ReqlDriverError = function(e) {
  if (e.name === 'ReqlDriverError') {
    throw errors.ServerError(null, e.msg);
  } else {
    throw e;
  }
}

module.exports = {
  __expose: true,

  get: function() {
    return {
      auth: {
        provider: 'user',
        required: true
      },
      title: 'User',
      description: 'Returns authenticated user profile',
      request: {
        type: 'null'
      },

      response: {
        type: 'object',
        required: [ 'id', 'email' ],
        additionalProperties: true,
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },

          email: {
            type: 'string',
            format: 'email'
          }
        }
      },

      call: auth => this
        .get({ id: auth.id })
        .catch(ReqlDriverError)
        .catch(errors.NotFound)
    }
  },

  create: function() {
    return {
      auth: {
        provider: 'user',
        required: 'optional'
      },
      title: 'User',
      description: 'Creates a new user',
      request: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email'
          },

          name: types.name()
        },
        required: [ 'email' ],
        additionalProperties: false
      },

      response: {
        type: 'string',
        format: 'uuid'
      },

      call: (auth, data) => this
        .create(data)
        .catch(ReqlDriverError)
        .catch(errors.BadRequest)
    }
  },

  update: function() {
    return {
      auth: {
        provider: 'user',
        required: true
      },
      title: 'User',
      description: 'Updates authenticated user properties',
      request: {
        type: 'object',
        required: [ 'to' ],
        additionalProperties: false,
        properties: {
          to: {
            type: 'object',
            required: [ 'name' ],
            additionalProperties: false,
            properties: {
              name: types.name()
            }
          }
        }
      },

      response: {
        type: 'string',
        format: 'uuid'
      },

      call: (auth, data) => this
        .update({ id: auth.id }, data.to)
        .catch(ReqlDriverError)
        .catch(errors.BadRequest)
    }
  },

  delete: function() {
    return {
      auth: {
        provider: 'user',
        required: true
      },
      title: 'User',
      description: 'Deletes authenticated user',
      request: {
        type: 'null'
      },

      response: {
        type: 'string',
        format: 'uuid'
      },

      call: auth => this
        .delete({ id: auth.id })
        .catch(ReqlDriverError)
        .catch(errors.NotFound)
    }
  }
};
