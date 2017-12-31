# Matter In Motion. User resource extension

[![NPM Version](https://img.shields.io/npm/v/mm-user.svg?style=flat-square)](https://www.npmjs.com/package/mm-user)
[![NPM Downloads](https://img.shields.io/npm/dt/mm-user.svg?style=flat-square)](https://www.npmjs.com/package/mm-user)

This extension adds a __user__ resource.

## Usage

[Extensions installation instructions](https://github.com/matter-in-motion/mm/blob/master/docs/extensions.md)

## Dependencies

* __[rethinkdb](https://github.com/matter-in-motion/mm-rethinkdb)__
* __[rethinkdb-unique](https://github.com/matter-in-motion/mm-rethinkdb-unique)__
* [db-schema](https://github.com/matter-in-motion/mm-db-schema)
* [rethinkdb-schema](https://github.com/matter-in-motion/mm-rethinkdb-schema)

## Settings

Adds `user` to the settings.

* new — object, properties that will be added to the newly created user. If `status` not present it will be set to `created`;

## API

### user.get

Returns authenticated user profile

**Request**

`null`

**Response**

* user data with at least two properties `id` and `email`

* `Unauthorized` error, code 4100 — when no user authenticated
* `NotFound` error, code 4540 — when user not found

### user.create

Creates a new user

**Request**

* **email** — string, user's email
* name — string, user's name

**Response**

* user id

### user.update

Updates authenticated user properties

**Request**

* **to** — object
  - name — string, user's name
  - email — string, user's email

**Response**

* user id

* `Unauthorized` error, code 4100 — when no user authenticated

### user.delete

Deletes authenticated user

**Request**

`null`

**Response**

* user id

* `Unauthorized` error, code 4100 — when no user authenticated
* `NotFound` error, code 4540 — when user not found


## Controller methods

**User resource controller makes sure all the emails are unique.**

### get(options)

Returns the user object from the database or throws `NotFound` error with code **4540**. This also removes `status` if status equals `active` i.e. normal active user.

`options`:

* **id** — string, returns user by `id`
* **email** — string, returns user by `email`
* status — string, returns the only user with status
* auth — boolean, default false, returns user without auth records

### _get(options)

The same as `get` but returns a rethinkdb query promise

### __get(options)

Returns rethinkdb query promise with single user selected by `id` or `email`. No other filtering or transformations performed.

### getAll(options)

returns list or count of users.

`options`:

* status — string, filter users by status
* count — boolean, count number of selected users

### _getAll(options)

The same as `getAll` but returns a rethinkdb query promise

### create(data, options)

Creates a new user and returns a new user id.

Options:

* status — string, status to create a new user with.

**Will hooks** will get user object with all new user data applied

**Did hooks** will get full user object with id

### update(opts, to)

Updates the user properties and returns updated user id

`options`:
* **id** — string, returns user by `id`
* **email** — string, returns user by `email`

**Will hooks** will get all the arguments

**Did hooks** will get changes object with `new_val` and `old_val` properties

### delete(opts)

Deletes the user and returns deleted user id.

`options`:
* **id** — string, returns user by `id`
* **email** — string, returns user by `email`

**Will hooks** will get all the arguments

**Did hooks** will get changes object with `new_val` and `old_val` properties

License MIT;
