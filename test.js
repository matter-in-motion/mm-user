'use strict';
const test = require('ava');
const extension = require('./index');
const createApp = require('mm-test').createApp;

const rxUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

process.env.NODE_ENV = 'production';
const app = createApp({
  extensions: [
    'http',
    'rethinkdb',
    'rethinkdb-unique',
    'rethinkdb-schema',
    'db-schema',
    extension
  ],

  rethinkdb: {
    db: 'test',
    silent: true
  },

  http: {
    port: 3000,
    host: '0.0.0.0'
  },

  user: {
    new: {
      status: 'created'
    }
  }
});

const user = app.units.require('resources.user.controller');

test.before(() => app.run('db', 'updateSchema'));
test.after.always(() => app.run('db', 'dropSchema'));

test.serial('creates a user', t => user
  .create({
    email: 'test@test.com',
    name: 'test name'
  })
  .then(id => t.regex(id, rxUUID))
);

test.serial('fails to create a user with the same email', t => user
  .create({ email: 'test@test.com' })
  .then(() => t.fail())
  .catch(err => t.is(err.code, 4500))
);

test.serial('fails to create a user with id', t => user
  .create({ id: 'test@test.com' })
  .then(() => t.fail())
  .catch(err => t.is(err.message, 'New user data has a forbidden property id'))
);

test.serial('fails to get inactive user', t => user
  .get({
    email: 'test@test.com',
    status: 'active'
  })
  .then(() => t.fail())
  .catch(e => t.is(e.code, 4540))
);

test.serial('updates user status', t => user
  .update({ email: 'test@test.com' }, { status: 'active' })
  .then(id => t.regex(id, rxUUID))
);

test.serial('fails to update not existed user', t => user
  .update({ email: 'unknown@test.com' }, { some: 'update' })
  .then(() => t.fail())
  .catch(e => t.is(e.code, 4540))
);

test.serial('fails to delete not existed user', t => user
  .delete({ email: 'unknown@test.com' })
  .then(() => t.fail())
  .catch(e => t.is(e.code, 4540))
);

test.serial('gets a user by email then gets it by id', t => user
  .get({ email: 'test@test.com' })
  .then(user1 => {
    t.is(user1.email, 'test@test.com');
    t.is(user1.status, undefined);
    t.is(typeof user1.created, 'number');
    t.regex(user1.id, rxUUID);

    return user.get({ id: user1.id })
      .then(user2 => t.deepEqual(user1, user2));
  })
);

test.serial('updates user email', t => user
  .update({ email: 'test@test.com' }, { email: 'newtest@test.com' })
  .then(id => t.regex(id, rxUUID))
);

test.serial('creates another user', t => user
  .create({
    email: 'test@test.com',
    name: 'name'
  }, { status: 'active' })
  .then(id => t.regex(id, rxUUID))
);

test.serial('gets all active users', t => user
  .getAll({ status: 'active' })
  .then(users => t.is(users.length, 2))
)

test.serial('counts active users', t => user
  .getAll({ count: true })
  .then(users => t.is(users, 2))
)

test.serial('deletes user', t => user
  .delete({ email: 'test@test.com' })
  .then(id => t.regex(id, rxUUID))
);

test.serial('deletes another user', t => user
  .delete({ email: 'newtest@test.com' })
  .then(id => t.regex(id, rxUUID))
);

//commands
test.serial('creates user with command', t => app
  .run('user', 'create', 'cmd@test.com')
  .then(msg => t.regex(msg, /^Created user/))
);

test.serial('failes to create a user with no data with command', t => app
  .run('user', 'create')
  .then(() => t.fail())
  .catch(err => t.truthy(err))
);

test.serial('failes to create a user with wrong data with command', t => app
  .run('user', 'create', 'not a email')
  .then(() => t.fail())
  .catch(err => t.truthy(err))
);

test.serial('gets user by email then by id with command', t => app
  .run('user', 'show', 'cmd@test.com')
  .then(user => {
    t.is(user.email, 'cmd@test.com')
    return app
      .run('user', 'show', user.id)
      .then(user => t.is(user.email, 'cmd@test.com'));
  })
);

test.serial('fails to get user with command', t => app
  .run('user', 'show')
  .then(() => t.fail())
  .catch(err => t.truthy(err))
);

test.serial('lists all the user with command', t => app
  .run('user', 'list')
  .then(users => t.is(users.length, 1))
);

test.serial('counts all the user with command', t => app
  .run('user', 'count')
  .then(users => t.is(users, 1))
);

test.serial('deletes user with command', t => app
  .run('user', 'delete', 'cmd@test.com')
  .then(msg => t.regex(msg, /^Deleted user/))
);
