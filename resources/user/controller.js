'use strict';
const hooks = require('async-hooks');
const errors = require('mm-errors');

const Controller = function() {
  hooks(this)
    .will('create')
    .will('update')
    .will('delete');
};

Controller.prototype.schema = {
  user: {
    db: 'rethinkdb',
    table: 'users',
    indexes: [ 'email' ]
  },

  emails: {
    db: 'rethinkdb',
    table: 'users_emails'
  }
};

Controller.prototype.__init = function(units) {
  this.r = units.require('db.rethinkdb');
  this.settings = units.require('core.settings').user || {};

  this.table = this.schema.user.table;
  this.emails = this.schema.emails.table;
};

Controller.prototype.get = function(opts) {
  return this._get(opts)
    .default(false)
    .run();
};

Controller.prototype._get = function(opts) {
  let q = this.__get(opts);

  if (!opts.auth) {
    q = q.without('auth');
  }

  if (opts.status) {
    q = q.do(user => this.r.branch(
      user('status').eq(opts.status),
      user,
      null
    ));
  }

  return q
    .do(user => this.r.branch(
      user('status').eq('active'),
      user.without('status'),
      user
    ));
};

Controller.prototype.__get = function(opts) {
  let q = this.r.table(this.table);

  if (opts.id) {
    return q.get(opts.id);
  }

  if (opts.email) {
    return q.getAll(opts.email, { index: 'email' }).nth(0);
  }
};

Controller.prototype.getAll = function(opts) {
  return this._getAll(opts).run();
};

Controller.prototype._getAll = function(opts = {}) {
  let q = this.r.table(this.table);

  if (opts.status) {
    q = q.filter({
      status: opts.status
    });
  }

  if (opts.count) {
    q = q.count().default(0);
  } else {
    q = q.without('auth').default(null);
  }

  return q;
};

Controller.prototype.willCreate = function(user, opts = {}) {
  if (user.id) {
    throw new Error('New user data has forbidden property id');
  }

  Object.assign(user, { status: 'created' }, this.settings.new);

  if (opts.status) {
    user.status = opts.status;
  }
};

Controller.prototype.create = function(user) {
  user.created = Date.now();

  return this
    .ensureUnique(user.email)
    .then(() => this.r.table(this.table)
      .insert(user)
      .run()
    )
    .then(res => {
      user.id = res.generated_keys[0];
      return user;
    });
};

Controller.prototype.didCreate = function(user) {
  return user.id;
};

Controller.prototype.update = function(opts, to) {
  return Promise.resolve(to)
    .then(to => {
      if (to.email) {
        return this.__get(opts)('email')
          .run()
          .then(email => this.renameUnique(email, to.email));
      }
    })
    .then(() => this.__get(opts)
      .update(to, { returnChanges: true })('changes').nth(0)
      .run()
    )
};

Controller.prototype.didUpdate = function(changes) {
  return changes.old_val.id;
};

Controller.prototype.delete = function(opts) {
  return this.__get(opts)
    .delete({ returnChanges: true })('changes').nth(0)
    .run()
    .then(changes => this
      .deleteUnique(changes.old_val.email)
      .then(() => changes)
    )
};

Controller.prototype.didDelete = function(changes) {
  return changes.old_val.id;
};

Controller.prototype.ensureUnique = function(email) {
  return this.r.table(this.emails)
    .insert({ id: email })
    .run()
    .then(res => {
      if (res && res.errors && res.errors > 0) {
        const message = res.first_error;
        if (/Duplicate primary key/.test(message)) {
          throw errors.Duplicate();
        }

        const e = new Error(message);
        e.errors = res.errors;
        throw e;
      }

      return res;
    });
};

Controller.prototype.deleteUnique = function(email) {
  return this.r.table(this.emails)
    .get(email)
    .delete()
    .run();
};

Controller.prototype.renameUnique = function(oldEmail, newEmail) {
  return this
    .ensureUnique(newEmail)
    .then(() => this.deleteUnique(oldEmail))
    .then(() => newEmail);
};

module.exports = Controller;
