const Ad = require('./models/ad.model.js');
const db = require('./database.js');
const User = require('./models/user.model.js');

/**
 * rooms & users are effectively hash maps with the name of the entry serving as a unique key.
 */
const ads = {};
const users = {};
let nextAdID = 0;

db.serialize(() => {
  db.all('SELECT * FROM AdDatabase;', (err, rows) => {
    if (err) {
      console.error(err);
    }
    rows.map((row) => {
      if (row.adID > nextAdID) {
        nextAdID = row.adID;
      }
      ads[row.adID] = new Ad(row.adID, row.adName, row.adDescription, row.adCost,
        row.adUsername, row.imageName);
      return row;
    });
    nextAdID += 1;
  });
});

exports.newAdID = () => {
  const retID = nextAdID;
  nextAdID += 1;
  return retID;
};

/**
 * unregisteredSockets is used as a temporary pool of sockets
 * that belonging to users who are yet to login.
 */
let nextUnregisteredSocketID = 0;
let unregisteredSockets = {};

// Will be initialized in the exports.init function
exports.io = undefined;

/**
 * Initialize the model
 * @param { { io: SocketIO.Server} } config - The configurations needed to initialize the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;
};

/**
 * Add a socket.io socket to the pool of unregistered sockets
 * @param {SocketIO.Socket} socket - The socket.io socket to add to the pool.
 * @returns {Number} The ID of the socket in the pool of unregistered sockets.
 */
exports.addUnregisteredSocket = (socket) => {
  const socketID = nextUnregisteredSocketID;
  nextUnregisteredSocketID += 1;
  unregisteredSockets[socketID] = socket;
  return socketID;
};
const assignUnregisteredSocket = (socketID) => {
  const socket = unregisteredSockets[socketID];
  unregisteredSockets = Object.keys(unregisteredSockets)
    .filter((sockID) => sockID !== socketID)
    .reduce((res, sockID) => ({ ...res, [sockID]: unregisteredSockets[sockID] }), {});

  return socket;
};

exports.loginUser = (userID, username, displayname, isAdmin, socketID, phone, email) => {
  users[userID] = new User(userID, username, displayname, isAdmin, socketID, phone, email);
  if (socketID !== undefined) {
    users[userID].socket = assignUnregisteredSocket(socketID);
  }
};

exports.logoutUser = (userID) => {
  delete users[userID];
};

exports.getUser = (userID) => users[userID];

exports.updateUserSocket = (userID, socket) => {
  users[userID].socket = socket;
};

exports.getAd = (adID) => ads[adID];

exports.getAds = () => Object.values(ads);

exports.addAd = (adID, adName, adDescription, adCost, adUsername, imageName) => {
  const ad = new Ad(adID, adName, adDescription, adCost, adUsername, imageName);
  ads[adID] = ad;
};

exports.removeAd = (adID) => {
  delete ads[adID];
};

exports.getUserAds = (username) => {
  const userAds = Object.values(ads).filter((ad) => {
    if (ad.adUsername === username) {
      return true;
    }
    return false;
  });
  return userAds;
};
