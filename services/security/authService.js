"use strict";
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + './../../config/config.json')[env];
const db = require('./../../models/index');
const User = db.user;
const Redis = require('redis');
const Uuid = require('uuid');

/**
 * Saves/Updates a userSession.
 *
 * @param {Object} user - A user boject.
 * @param {Boolean} keeplogedIn - Whether or not to keep the session alive.
 * @param {String} uuid - A session key if you want to update a session.
 * @return {String} uuid - The session key.
 */
export function saveUserSession(user, keepLogedIn, uuid) {
  const client = getClient();

  let session = {
    userId: user.id,
    keeplogedIn: keepLogedIn
  }

  if (!uuid) {
    uuid = Uuid.v4();
  }

  client.HMSET(uuid, session, (err, res) => {
    if (!keepLogedIn) {
      client.expire(uuid, 3000);
    }
    client.end(true);
  });

  return uuid;
};

/**
 * This is the deleteUserSession callback.
 * @callback AuthService-DeleteSessionCB
 * @param {String} err
 */

/**
 * This will delete a user Session.
 * @param {String} uuid
 * @param {AuthService-DeleteSessionCB} cb
 */
export function deleteUserSession(uuid, cb) {
  const client = getClient();
  client.delete(uuid, (err, value) => {
    if (err) {
      cb(err);
    }
    cb();
  });
  client.end();
}

/**
 * Use this to autherize a user and save it to the session.
 *
 * @param {Request} req
 * @param {Response} res
 * @param function next
 */
export function userSessionMiddleware(req, res, next) {
  let sessionId = {};

  if (req.cookies.hasOwnProperty('session')) {
    const session = JSON.parse(req.cookies.session);
    sessionId = session.session_id;
  } else {
    sessionId = req.get('authorization');
  }

  if (!sessionId) {
    res.status(401).send({message: "Unathorized Access."});
    return;
  }

  const client = getClient();
  client.hgetall(sessionId, function(err, value) {
    if (err) {
      res.status(500).send(err);
      return;
    }

    if (!value) {
      res.status(401).send({message: "Unathorized Access."});
      return;
    }

    if (value.hasOwnProperty('keepLogedIn') && value.keepLogedIn) {
      client.PERSIST(uuid);
    }

    if (value) {
      User.findById(value.userId)
        .then( (user) => {
          value.user = user;
          req.session = value;
          next();
        });

    }
    client.end(true);
  });

};

/**
 * Build the redis client.
 * @return RedisClient
 */
function getClient() {
  return Redis.createClient(config['redis']['port'], config['redis']['host']);
}