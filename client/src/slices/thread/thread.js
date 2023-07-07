import {
  addComment,
  applyPost,
  createPost,
  dislikePostFromSocket,
  likePostFromSocket,
  loadMorePosts,
  loadPosts,
  reactPost,
  toggleExpandedPost
} from './actions.js';
import { actions } from './thread.slice.js';

const allActions = {
  ...actions,
  loadPosts,
  loadMorePosts,
  applyPost,
  createPost,
  toggleExpandedPost,
  reactPost,
  addComment,
  likePostFromSocket,
  dislikePostFromSocket
};

export { allActions as actions };
export { reducer } from './thread.slice.js';
