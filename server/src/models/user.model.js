/**
 * @class User
 */
class User {
  constructor(userID, username, displayname, isAdmin, socketID, phone, email) {
    this.userID = userID;
    this.username = username;
    this.displayname = displayname;
    this.isAdmin = isAdmin;
    this.socketID = socketID;
    this.socket = null;
    this.phone = phone;
    this.email = email;
  }
}

module.exports = User;
