const express = require('express');
const model = require('../model.js');

const router = express.Router();

router.get('/ads', (req, res) => {
  const ads = model.getAds();
  res.status(200).json({
    list: ads,
  });
});

module.exports = { router };
