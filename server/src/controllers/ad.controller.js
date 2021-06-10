const express = require('express');
const model = require('../model.js');
const db = require('../database.js');

const router = express.Router();

router.post('/ad', (req, res) => {
  const Ad = model.getAd(req.body.adID);
  if (Ad === undefined) {
    res.status(404).json({
      msg: `No ad with ID: ${req.body.adID}`,
    });
  } else {
    db.get('SELECT phone, email FROM UserDatabase WHERE username=?', [Ad.adUsername], (err, row) => {
      if (err) {
        console.error(err);
      }
      if (row === undefined) {
        res.status(404).json({
          msg: `No user with username: ${Ad.adUsername}`,
        });
      } else {
        res.status(200).json({
          status: 200,
          ad: Ad,
          phone: row.phone,
          email: row.email,
        });
      }
    });
  }
});

module.exports = { router };
