'use strict';

const get = function(idOrEmail) {
  if (!idOrEmail) {
    throw new Error('User id or email not found');
  }

  return /@/.test(idOrEmail) ? { email: idOrEmail } : { id: idOrEmail };
}

const create = function(email) {
  if (!email) {
    throw new Error('User id not found');
  }

  const ctrl = this.units.get('resources.user.controller');
  const schema = this.units.get('resources.user.api').create().request;
  const validator = this.units.require('core.validator');
  const v = validator.compile(schema);

  const newUser = { email };

  if (!v(newUser)) {
    throw new Error(validator.errorsText(v.errors));
  }

  return ctrl
    .create(newUser)
    .then(id => `Created user ${id}`);
};

const deleteUser = function(idOrEmail) {
  const user = get(idOrEmail);

  return this.units
    .require('resources.user.controller')
    .delete(user)
    .then(id => `Deleted user ${id}`);
};

const show = function(idOrEmail) {
  const user = get(idOrEmail);

  return this.units
    .require('resources.user.controller')
    .get(user);
};

const list = function(status) {
  return this.units
    .require('resources.user.controller')
    .getAll({ status });
};

const count = function(status) {
  return this.units
    .require('resources.user.controller')
    .getAll({ status, count: true });
};

module.exports = {
  __expose: true,
  create: {
    description: '<email>. Creates a new user',
    call: create
  },

  delete: {
    description: '<id or email>. Deletes the user',
    call: deleteUser
  },

  show: {
    description: '<id or email>. Shows the user data',
    call: show
  },

  list: {
    description: '[status]. Shows all users',
    call: list
  },

  count: {
    description: '[status]. Shows number of users',
    call: count
  }
};

/* O invite: {
    description: '<email>. Sends invite to the user',
    call: invite
  },

  setInvitations: {
    description: '<email> <number>. Sets invitations number for the user',
    call: setInvitations
  },

  sendTestEmail: {
    description: '<type> <email>. Sends test email',
    call: sendTestEmail
  }

const invite = function(email, cb) {
  if (!cb) {
    email(new Error('Usage: invite <email>'));
  }

  let ctrl = this.units.require('resources.user.controller');

  ctrl
    .getByEmail(email)
    .then(res => {
      if (res) {
        throw new Error('User with this email is already registered');
      }

      return ctrl.sendInvitation(email);
    })
    .asCallback(cb);
};

const setInvitations = function(email, invitations, cb) {
  if (cb === undefined) {
    cb = typeof email === 'function' ? email : invitations;
    cb(new Error('Usage <email> <invitations number>'));
    return;
  }

  this.units.require('resources.user.controller')
    .updateByEmail(email, { invitations })
    .asCallback(cb);
};

const sendTestEmail = function(type, email, cb) {
  if (cb === undefined) {
    cb = typeof email === 'function' ? email : type;
    cb(new Error('Usage <type> <email>'));
    return;
  }

  this.units.require('resources.user.controller')
    .sendEmail(type, { id: email })
    .asCallback(cb);
};*/
