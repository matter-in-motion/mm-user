# Matter In Motion. User resource extension

[![NPM Version](https://img.shields.io/npm/v/mm-mail.svg?style=flat-square)](https://www.npmjs.com/package/mm-mail)
[![NPM Downloads](https://img.shields.io/npm/dt/mm-mail.svg?style=flat-square)](https://www.npmjs.com/package/mm-mail)

This extension adds a __user__ resource.

## Usage

[Extensions installation intructions](https://github.com/matter-in-motion/mm/blob/master/docs/extensions.md)

## Settings

Adds `user` to the settings.

* new — object, properties that will be added to the newly created user. If `status` not present it will be equal `created`;

## API

**User resource controller makes sure all the emails are unique.**

### get(options)

Returns the user object from the database or trows `UserNotFound` error with code **4541**. This also removes `status` if status equals `active` i.e. normal active user.

`options`:

* **id** — string, returns user by `id`
* **email** — string, returns user by `email`
* status — string, returns only user with status
* auth — boolean, default fasle, returns user without auth records

### _get(options)

The same as `get` but returns a rethinkdb query promise

### __get(options)

Returns rethinkdb query promise with single user selected by `id` or `email`. No other filtering or transformations perfomed.

### getAll(options)

returns list or count of users.

`options`:

* status — string, filter users by status
* count — boolean, count number of selected users

### _getAll(options)

The same as `getAll` but returns a rethinkdb query promise

### create(data, options)

Creates new user and returns a new user id.

Options:

* status — string, status to create new user with.

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

© velocityzen
