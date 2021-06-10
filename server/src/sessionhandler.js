const model = require('./model.js');

const SessionHandler = (() => {
  const context = {
    timestamps: new Map(),
  };

  const api = {
    setTimestamp(userID) {
      context.timestamps.set(userID, {
        timestamp: Date.now(),
      });
    },
    checkUserID(userID) {
      if (context.timestamps.has(userID)) {
        if (context.timestamps.get(userID).timestamp + 100000 < Date.now()) {
          context.timestamps.delete(userID);
          model.logoutUser(userID);
          return false;
        }
        context.timestamps.set(userID, {
          timestamp: Date.now(),
        });
        return true;
      }
      return true;
    },
  };

  return api;
})();

module.exports = { SessionHandler };
