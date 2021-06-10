const express = require('express');
const bcrypt = require('bcrypt');
const model = require('../model.js');
const db = require('../database.js');
const { SessionHandler } = require('../sessionhandler.js');

const router = express.Router();

const saltRounds = 10;

/**
 * requireAuth is an endpoint guard for logged in users.
 * aka: A middle ware used to limit access to an endpoint to authenticated users
 * @param {Request} req
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
  const maybeUser = model.getUser(req.session.userID);
  if (maybeUser === undefined) {
    res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
    return;
  }
  next();
};

/**
 * Tells the client if they are in an authenticated user-session.
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.get('/isAuthenticated', (req, res) => {
  const user = model.getUser(req.session.userID);
  res.status(200).json({
    isAuthenticated: user !== undefined,
    isAdmin: user !== undefined ? user.isAdmin : false,
  });
});

/**
 * Attempts to authenticate the user-session
 * @param {String} req.body.username - The username of the user attempting to authenticate
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.post('/authenticate', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  const { socketID } = req.session;

  if (username !== undefined && password !== undefined) {
    db.get('SELECT password, displayname, admin, phone, email FROM UserDatabase WHERE username=?', [username], (err1, row) => {
      if (err1) {
        console.error(err1);
      }
      if (row === undefined) {
        res.status(203).json({
          msg: 'Wrong username and password',
        });
        return;
      }
      bcrypt.compare(password, row.password, (err2, result) => {
        if (err2) {
          console.error(err2);
        }
        if (result) {
          const userID = Math.random();
          req.session.userID = userID;
          req.session.save((err3) => {
            if (err3) {
              console.error(err3);
            } else {
              console.info(`Saved userID: ${userID}`);
            }
          });
          model.loginUser(userID, username, row.displayname, row.admin, socketID,
            row.phone, row.email);
          SessionHandler.setTimestamp(userID);
          res.status(200).json({
            status: 200,
            isAdmin: row.admin,
          });
        } else {
          res.status(203).json({
            msg: 'Wrong username and password',
          });
        }
      });
    });
  } else {
    res.status(203).json({
      msg: 'Could not process login attempt',
    });
  }
});

router.post('/register', (req, res) => {
  const requirements = /^(([a-zA-Z]+[0-9]+)|([0-9]+[a-zA-Z]+))([0-9a-zA-Z])*$/;
  console.info(req.body);
  const { username } = req.body;
  const { password1 } = req.body;
  const { password2 } = req.body;
  const { displayname } = req.body;
  const { email } = req.body;
  const { phone } = req.body;

  if (username === undefined || password1 === undefined || password2 === undefined) {
    res.status(203).json({
      msg: 'Could not process registration',
    });
    return;
  } if (password1 !== password2) {
    res.status(203).json({
      msg: 'Passwords not equal',
    });
    return;
  } if (username.length < 5 || password1.length < 5) {
    res.status(203).json({
      msg: 'To short username or password',
    });
    return;
  } if (!username.match(requirements) || !password1.match(requirements)) {
    res.status(203).json({
      msg: 'Username and password must contain both letters and numbers, no special characters allowed',
    });
    return;
  }
  db.get('SELECT EXISTS(SELECT * FROM UserDatabase WHERE username=?) AS existValue;', [username], (err1, row1) => {
    if (err1) {
      console.error(err1);
    }
    if (row1.existValue === 1) {
      res.status(203).json({
        msg: 'Username already taken',
      });
    } else {
      db.get('SELECT EXISTS(SELECT * FROM UserDatabase WHERE displayname=?) AS existValue;', [displayname], (err2, row2) => {
        if (err2) {
          console.error(err2);
        }
        if (row2.existValue === 1) {
          res.status(203).json({
            msg: 'Displayname already taken',
          });
        } else {
          db.get('SELECT EXISTS(SELECT * FROM UserDatabase WHERE email=?) AS existValue;', [email], (err3, row3) => {
            if (err3) {
              console.error(err3);
            }
            if (row3.existValue === 1) {
              res.status(203).json({
                msg: 'Email already registered',
              });
            } else {
              db.get('SELECT EXISTS(SELECT * FROM UserDatabase WHERE phone=?) AS existValue;', [phone], (err4, row4) => {
                if (err4) {
                  console.error(err4);
                }
                if (row4.existValue === 1) {
                  res.status(203).json({
                    msg: 'Phonenumber already registered',
                  });
                } else {
                  bcrypt.hash(password1, saltRounds, (error, hash) => {
                    if (error) {
                      console.error(error);
                    }
                    db.run('INSERT INTO UserDatabase (username, password, displayname, admin, phone, email) VALUES (?, ?, ?, ?, ?, ?);', [username, hash, displayname, false, phone, email], (err5) => {
                      if (err5) {
                        console.error(err5);
                        res.status(203).json({
                          msg: 'Database malfunction',
                        });
                      } else {
                        res.status(200).json({
                          status: 200,
                          msg: 'Successful registration',
                        });
                      }
                    });
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

module.exports = { router, requireAuth };
