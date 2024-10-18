import {
	ADD_COMMENT,
	UPDATE_COMMENTS,
	ADD_POST,
	UPDATE_POSTS,
	ADD_COMMENT_LIKE,
	ADD_POST_LIKE,
	REMOVE_COMMENT_LIKE,
	REMOVE_POST_LIKE,
	REMOVE_POST,
	REMOVE_COMMENT,
} from "./actionTypes"

import { APIUrls } from "../utils"
import apiLoader from "../utils/apiLoader"

export function fetchMorePosts(posts) {
	return dispatch => {
		const lastPostTime = posts[posts.length - 1].createdAt
		apiLoader(
			async () => {
				const url = APIUrls.fetchPosts(lastPostTime)
				const res = await fetch(url, {
					method: "GET",
				})
				const data = await res.json()
				if (!data.success) return [false]
				dispatch(updatePosts(data.data.posts))
				return [true]
			},
			{
				loading: "Fetching More Posts...",
				success: false,
				error: "Error in fetching posts",
			}
		)
	}
}

export function fetchMoreComments(post, number, onCompletion) {
	onCompletion = onCompletion || function () {}
	return dispatch => {
		apiLoader(
			async () => {
				if (!(number === 5 || number === 7)) {
					onCompletion()
					return [false, "Invalid number of comments"]
				}

				let lastCommentTime,
					comments = post.comments
				if (!comments || !comments.length)
					lastCommentTime = new Date().toISOString()
				else lastCommentTime = comments[comments.length - 1].createdAt

				const url = APIUrls.fetchComments(post._id, lastCommentTime, number)
				const res = await fetch(url, {
					method: "GET",
				})
				const data = await res.json()
				if (!data.success) {
					onCompletion()
					return [false]
				}
				dispatch(updateComments(data.data.comments, post._id))
				onCompletion()
				return [true]
			},
			{
				loading: "Fetching Comments...",
				success: false,
				error: "Error in fetching comments",
			}
		)
	}
}

export function updatePosts(posts) {
	return {
		type: UPDATE_POSTS,
		posts,
	}
}

export function updateComments(comments, postID) {
	return { type: UPDATE_COMMENTS, comments, postID }
}

export function removePost(postID) {
	return {
		type: REMOVE_POST,
		postID,
	}
}
export function addPost(post) {
	return {
		type: ADD_POST,
		post,
	}
}

export function removeComment(postID, commentID) {
	return {
		type: REMOVE_COMMENT,
		postID,
		commentID,
	}
}
export function addComment(comment) {
	return {
		type: ADD_COMMENT,
		comment,
	}
}

// in case of comment send both postID and commentID
const TYPE_POST = "Post"
const TYPE_COMMENT = "Comment"
export function addLike(userID, parent, parentType) {
	if (parentType === TYPE_COMMENT)
		return {
			type: ADD_COMMENT_LIKE,
			userID,
			postID: parent.post,
			commentID: parent._id,
		}
	if (parentType === TYPE_POST)
		return {
			type: ADD_POST_LIKE,
			userID,
			postID: parent._id,
		}
	throw new Error(
		`Please send parent-type as either '${TYPE_POST}' or '${TYPE_COMMENT}'`
	)
}

export function removeLike(userID, parent, parentType) {
	if (parentType === TYPE_COMMENT)
		return {
			type: REMOVE_COMMENT_LIKE,
			userID,
			postID: parent.post,
			commentID: parent._id,
		}
	if (parentType === TYPE_POST)
		return {
			type: REMOVE_POST_LIKE,
			userID,
			postID: parent._id,
		}
	throw new Error(
		`Please send parent-type as either '${TYPE_POST}' or '${TYPE_COMMENT}'`
	)
}
