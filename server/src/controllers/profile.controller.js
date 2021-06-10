const express = require('express');
const multer = require('multer');
const path = require('path');
const model = require('../model.js');
const db = require('../database.js');

const router = express.Router();

const storeEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'Images'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storeEngine });

router.post('/addAd', upload.single('image'), (req, res) => {
  const { newTitle } = req.body;
  const { newDescription } = req.body;
  const { newCost } = req.body;
  const { userID } = req.session;
  const user = model.getUser(userID);
  if (user !== undefined) {
    const newAdID = model.newAdID();
    model.addAd(newAdID, newTitle, newDescription, newCost, user.username, req.file.originalname);
    db.run('INSERT INTO AdDatabase (adID, adName, adDescription, adCost, adUsername, imageName) VALUES(?, ?, ?, ?, ?, ?)',
      [newAdID, newTitle, newDescription, newCost, user.username, req.file.originalname], (err) => {
        if (err) {
          console.error(err);
        }
        const Ad = model.getAd(newAdID);
        res.status(200).json({
          status: 200,
          msg: 'Successfully added an ad',
          ad: Ad,
        });
        model.io.sockets.emit('addAd', {
          ad: Ad,
        });
      });
  } else {
    res.status(404).json({
      msg: 'User not authenticated',
    });
  }
});

router.get('/userAds', (req, res) => {
  const { userID } = req.session;
  const user = model.getUser(userID);
  const userads = model.getUserAds(user.username);
  if (user === undefined || userads === undefined) {
    res.status(404).json({
      msg: 'Unexpected server error',
    });
    return;
  }
  res.status(200).json({
    status: 200,
    user: { username: user.username, displayname: user.displayname, isAdmin: user.isAdmin },
    userAds: userads,
  });
});

router.post('/removeAd', (req, res) => {
  const { adID } = req.body;
  const { userID } = req.session;
  const ad = model.getAd(adID);
  const user = model.getUser(userID);
  if (ad.adUsername === user.username || user.isAdmin) {
    model.removeAd(adID);
    db.run('DELETE FROM AdDatabase WHERE adID=?', [adID], (err) => {
      if (err) {
        console.error(err);
        res.status(404).json({
          msg: 'Could not remove the ad',
        });
        return;
      }
      res.status(200).json({
        status: 200,
        msg: 'Successfully removed an ad',
      });
      model.io.sockets.emit('removeAd', { id: adID });
    });
  } else {
    res.status(404).json({
      msg: "Deletion failed, attempted to remove another users ad"
    })
  }
});


router.get('/logout', (req, res) => {
  const { userID } = req.session;
  if (userID === undefined) {
    res.status(405).json({
      msg: 'Tried to logout non-existing user',
    });
    return;
  } if (model.getUser(userID) === undefined) {
    res.status(405).json({
      msg: 'Tried to logout non-existing user',
    });
    return;
  }
  req.session.destroy();
  model.logoutUser(userID);
  res.status(200).json({
    msg: 'Successful logout',
    status: 200,
  });
});

module.exports = { router };
