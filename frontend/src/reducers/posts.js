import {
	ADD_COMMENT,
	ADD_COMMENT_LIKE,
	ADD_POST,
	ADD_POST_LIKE,
	REMOVE_COMMENT_LIKE,
	REMOVE_POST_LIKE,
	REMOVE_COMMENT,
	REMOVE_POST,
	UPDATE_POSTS,
	UPDATE_COMMENTS,
} from "../actions/actionTypes"

const defaultState = []
const isObjectIDEqual = (ob1, ob2) => {
	return ob1._id === ob2._id
}
const removeDuplicates = (newObjects, oldObjects, equalityFunction, type) => {
	const updatedObjects = []
	const newObjectDuplicateIndexes = []
	oldObjects.forEach(oldObject => {
		const sameObjectIndex = newObjects.findIndex(newObject =>
			equalityFunction(newObject, oldObject)
		)
		if (sameObjectIndex === -1) updatedObjects.push(oldObject)
		else {
			const temp = newObjects[sameObjectIndex]
			if (type === "post");
			temp.comments = oldObject.comments
			updatedObjects.push(temp)
			newObjectDuplicateIndexes.push(sameObjectIndex)
		}
	})
	newObjects.forEach((newObject, index) => {
		if (!newObjectDuplicateIndexes.includes(index))
			updatedObjects.push(newObject)
	})
	return updatedObjects
}

export default function posts(state = defaultState, action) {
	switch (action.type) {
		case UPDATE_POSTS:
			const oldPosts = state
			const newPosts = action.posts
			const updatedPost = removeDuplicates(
				newPosts,
				oldPosts,
				isObjectIDEqual,
				"post"
			)
			return updatedPost
		case UPDATE_COMMENTS: {
			let newPosts = state.map(post => {
				if (post._id === action.postID) {
					const oldComments = post.comments
					const newComments = action.comments
					const updatedComments = removeDuplicates(
						newComments,
						oldComments,
						isObjectIDEqual,
						"comment"
					)
					if (updatedComments.length === oldComments.length) {
						return {
							...post,
							comments: updatedComments,
							commentsCount: updatedComments.length,
						}
					}
					return {
						...post,
						comments: updatedComments,
					}
				}
				return post
			})
			return [...newPosts]
		}
		case ADD_POST:
			return [action.post, ...state]
		case ADD_COMMENT: {
			let newPosts = state.map(post => {
				if (post._id === action.comment.post) {
					return {
						...post,
						comments: [action.comment, ...post.comments],
						commentsCount: post.commentsCount + 1,
					}
				}
				return post
			})
			return newPosts
		}
		case REMOVE_POST: {
			let newPosts = state.filter(post => post._id !== action.postID)
			return newPosts
		}
		case REMOVE_COMMENT: {
			let newPosts = state.map(post => {
				if (post._id === action.postID)
					return {
						...post,
						comments: post.comments.filter(
							comment => comment._id !== action.commentID
						),
						commentsCount: post.commentsCount - 1,
					}
				return post
			})
			return newPosts
		}
		case ADD_POST_LIKE: {
			let newPosts = state.map(post => {
				if (post._id === action.postID)
					return {
						...post,
						likes: [...post.likes, { user: action.userID }],
					}
				return post
			})
			return newPosts
		}
		case ADD_COMMENT_LIKE: {
			let newPosts = state.map(post => {
				if (post._id === action.postID) {
					let newComments = post.comments.map(comment => {
						if (comment._id === action.commentID)
							return {
								...comment,
								likes: [...comment.likes, { user: action.userID }],
							}
						return comment
					})
					return {
						...post,
						comments: newComments,
					}
				}
				return post
			})
			return newPosts
		}
		case REMOVE_POST_LIKE: {
			let newPosts = state.map(post => {
				if (post._id === action.postID)
					return {
						...post,
						likes: post.likes.filter(like => like.user !== action.userID),
					}
				return post
			})
			return newPosts
		}
		case REMOVE_COMMENT_LIKE: {
			let newPosts = state.map(post => {
				if (post._id === action.postID) {
					let newComments = post.comments.map(comment => {
						if (comment._id === action.commentID)
							return {
								...comment,
								likes: comment.likes.filter(
									like => like.user !== action.userID
								),
								// likes: [...comment.likes, { user: action.userID }],
							}
						return comment
					})
					return {
						...post,
						comments: newComments,
					}
				}
				return post
			})
			return newPosts
		}
		default:
			return state
	}
}
