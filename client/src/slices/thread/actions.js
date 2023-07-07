import { createAsyncThunk } from '@reduxjs/toolkit';

import { ActionType } from './common.js';

const loadPosts = createAsyncThunk(
  ActionType.SET_ALL_POSTS,
  async (filters, { getState, extra: { services } }) => {
    const {
      posts: { count }
    } = getState();

    const posts = await services.post.getAllPosts({
      from: 0,
      count,
      ...filters
    });
    return { posts };
  }
);

const loadMorePosts = createAsyncThunk(
  ActionType.LOAD_MORE_POSTS,
  async (filters, { getState, extra: { services } }) => {
    const {
      posts: { posts, from, count }
    } = getState();
    const loadedPosts = await services.post.getAllPosts({
      from,
      count,
      ...filters
    });
    const filteredPosts = loadedPosts.filter(
      post => !(posts && posts.some(loadedPost => post.id === loadedPost.id))
    );

    return { posts: filteredPosts };
  }
);

const applyPost = createAsyncThunk(
  ActionType.ADD_POST,
  async ({ id: postId, userId }, { getState, extra: { services } }) => {
    const {
      profile: { user }
    } = getState();
    if (userId === user.id) {
      return { post: null };
    }

    const post = await services.post.getPost(postId);
    return { post };
  }
);

const createPost = createAsyncThunk(
  ActionType.ADD_POST,
  async (post, { extra: { services } }) => {
    const { id } = await services.post.addPost(post);
    const newPost = await services.post.getPost(id);

    return { post: newPost };
  }
);

const toggleExpandedPost = createAsyncThunk(
  ActionType.SET_EXPANDED_POST,
  async (postId, { extra: { services } }) => {
    const post = postId ? await services.post.getPost(postId) : undefined;
    return { post };
  }
);

const reactPost = createAsyncThunk(
  ActionType.REACT,
  async ({ postId, reaction }, { getState, extra: { services } }) => {
    const response = await services.post[reaction](postId);

    const mapReactions = post => ({
      ...post,
      dislikeCount: Number(response.dislikeCount),
      likeCount: Number(response.likeCount)
    });

    const {
      posts: { posts, expandedPost }
    } = getState();
    const updated = posts.map(post =>
      post.id === postId ? mapReactions(post) : post
    );
    const updatedExpandedPost =
      expandedPost?.id === postId ? mapReactions(expandedPost) : undefined;

    return { posts: updated, expandedPost: updatedExpandedPost };
  }
);

const likePostFromSocket = createAsyncThunk(
  ActionType.LIKE,
  async ({ id: postId, likeCount, dislikeCount }, { getState }) => {
    const {
      posts: { posts, expandedPost }
    } = getState();
    const updated = posts.map(post =>
      post.id === postId ? { ...post, likeCount, dislikeCount } : post
    );
    const updatedExpandedPost =
      expandedPost?.id === postId
        ? { ...expandedPost, likeCount, dislikeCount }
        : undefined;

    return { posts: updated, expandedPost: updatedExpandedPost };
  }
);

const dislikePostFromSocket = createAsyncThunk(
  ActionType.DISLIKE,
  async ({ id: postId, dislikeCount, likeCount }, { getState }) => {
    const {
      posts: { posts, expandedPost }
    } = getState();
    const updated = posts.map(post =>
      post.id === postId ? { ...post, dislikeCount, likeCount } : post
    );
    const updatedExpandedPost =
      expandedPost?.id === postId
        ? { ...expandedPost, dislikeCount, likeCount }
        : undefined;

    return { posts: updated, expandedPost: updatedExpandedPost };
  }
);

const addComment = createAsyncThunk(
  ActionType.COMMENT,
  async (request, { getState, extra: { services } }) => {
    const { id } = await services.comment.addComment(request);
    const comment = await services.comment.getComment(id);

    const mapComments = post => ({
      ...post,
      commentCount: Number(post.commentCount) + 1,
      comments: [...(post.comments || []), comment] // comment is taken from the current closure
    });

    const {
      posts: { posts, expandedPost }
    } = getState();
    const updated = posts.map(post =>
      post.id === comment.postId ? mapComments(post) : post
    );

    const updatedExpandedPost =
      expandedPost?.id === comment.postId
        ? mapComments(expandedPost)
        : undefined;

    return { posts: updated, expandedPost: updatedExpandedPost };
  }
);

export {
  addComment,
  applyPost,
  createPost,
  dislikePostFromSocket,
  likePostFromSocket,
  loadMorePosts,
  loadPosts,
  reactPost,
  toggleExpandedPost
};
