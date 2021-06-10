// enhances log messages with timestamps etc
const betterLogging = require('better-logging');

const { Theme } = betterLogging;
betterLogging(console, {
  color: Theme.green,
});

const path = require('path'); // helper library for resolving relative paths
const expressSession = require('express-session');
const socketIOSession = require('express-socket.io-session');
const express = require('express');
const https = require('https');
const fs = require('fs');


console.logLevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 8080; // The port that the server will listen to
const app = express(); // Creates express app

const certificate = {
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.cert')),
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
};

const httpsServer = https.createServer(certificate, app);
const io = require('socket.io').listen(httpsServer); // Creates socket.io app

// Setup middleware
app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true, color: Theme.green.base },
  method: { show: true, color: Theme.green.base },
  header: { show: false },
  path: { show: true },
  body: { show: true },
}));
app.use(express.json()); /*
This is a middleware that parses the body of the request into a javascript object.
It's basically just replacing the body property like this:
req.body = JSON.parse(req.body)
*/
app.use(express.urlencoded({ extended: true }));

// Setup session
const session = expressSession({
  secret: 'Super secret! Shh! Do not tell anyone...',
  resave: true,
  saveUninitialized: true,
});
app.use(session);
io.use(socketIOSession(session, {
  autoSave: true,
  saveUninitialized: true,
}));

// Serve client
app.use(express.static(publicPath));/*
express.static(absolutePathToPublicDirectory)
This will serve static files from the public directory, starting with index.html
*/

// Init model
const model = require('./model.js');

// Bind REST controllers to /api/*
const auth = require('./controllers/auth.controller.js');
const menu = require('./controllers/menu.controller.js');
const profile = require('./controllers/profile.controller.js');
const ad = require('./controllers/ad.controller.js');
const { SessionHandler } = require('./sessionhandler.js');

app.use('/', (req, res, next) => {
  const { userID } = req.session;
  if (userID !== undefined) {
    if (SessionHandler.checkUserID(userID)) {
      next();
    } else {
      res.redirect('/menu');
    }
  } else {
    next();
  }
});
app.use('/api', auth.router);
app.use('/api', menu.router);
app.use('/api', ad.router);
app.use('/api', auth.requireAuth, profile.router);

app.get('/image/:adID', (req, res) => {
  const { adID } = req.params;
  const Ad = model.getAd(adID);
  if (Ad === undefined) {
    res.status(404).json({
      msg: 'Ad does not exist',
    });
    return;
  }
  res.status(200).sendFile(path.join(__dirname, '..', 'src', 'Images', Ad.imageName));
});

model.init({ io });

// Handle connected socket.io sockets
io.on('connection', (socket) => {
  // This function serves to bind socket.io connections to user models
  if (socket.handshake.session.socketID
    && model.getUser(socket.handshake.session.userID) !== undefined
  ) {
    // If the current user already logged in and then reloaded the page
    model.updateUserSocket(socket.handshake.session.userID, socket);
  } else {
    socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
    socket.handshake.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved socketID: ${socket.handshake.session.socketID}`);
    });
  }
});

// Start server
httpsServer.listen(port, () => {
  console.log(`Listening on https://localhost:${port}`);
});
