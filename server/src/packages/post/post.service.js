class PostService {
  constructor({ postRepository, postReactionRepository }) {
    this._postRepository = postRepository;
    this._postReactionRepository = postReactionRepository;
  }

  getPosts(filter) {
    return this._postRepository.getPosts(filter);
  }

  getById(id) {
    return this._postRepository.getPostById(id);
  }

  create(userId, post) {
    return this._postRepository.create({
      ...post,
      userId
    });
  }

  async setReaction(userId, { postId, isLike = true }) {
    let isReactionAdded;
    // define the callback for future use as a promise
    const updateOrDelete = react => {
      if (react.isLike === isLike) {
        isReactionAdded = false;
        return this._postReactionRepository.deleteById(react.id);
      } else {
        isReactionAdded = true;
        return this._postReactionRepository.updateById(react.id, { isLike });
      }
    };

    const reaction = await this._postReactionRepository.getPostReaction(
      userId,
      postId
    );

    if (reaction) {
      await updateOrDelete(reaction);
    } else {
      isReactionAdded = true;
      await this._postReactionRepository.create({ userId, postId, isLike });
    }

    const updatedPost = await this._postRepository.getPostById(postId);

    return { updatedPost, isReactionAdded };
  }
}

export { PostService };
