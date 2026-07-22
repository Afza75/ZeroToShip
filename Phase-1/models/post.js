class Post {
  constructor(postId, title, description, ownerId, status) {
    this.postId = postId;
    this.title = title;
    this.description = description;
    this.ownerId = ownerId;
    this.status = status || "Open";
  }

  toDict() {
    return {
      post_id: this.postId,
      title: this.title,
      description: this.description,
      owner_id: this.ownerId,
      status: this.status,
    };
  }

  static fromDict(data) {
    return new Post(data.post_id, data.title, data.description, data.owner_id, data.status);
  }
}

module.exports = Post;