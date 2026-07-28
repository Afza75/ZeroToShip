class User {
  constructor(userId, username, hashedPassword) {
    this.userId = userId;
    this.username = username;
    this.hashedPassword = hashedPassword;
  }

  toDict() {
    return {
      user_id: this.userId,
      username: this.username,
      hashed_password: this.hashedPassword,
    };
  }

  static fromDict(data) {
    return new User(data.user_id, data.username, data.hashed_password);
  }
}

module.exports = User;