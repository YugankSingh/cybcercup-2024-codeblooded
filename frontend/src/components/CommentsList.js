import React, { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { Comment } from "."
import { fetchMoreComments } from "../actions/posts"

function CommentsList(props) {
	const { post, shouldShowComments } = props
	const { commentsCount, comments } = post
	const [isLoading, setIsLoading] = useState(false)
	const dispatch = useDispatch()

	const loadMoreComments = async () => {
		if (isLoading) return
		setIsLoading(true)
		const onCompletion = () => {
			setIsLoading(false)
		}
		dispatch(fetchMoreComments(post, 7, onCompletion))
	}
	useEffect(() => {
		if (isLoading) return
		if (shouldShowComments && (!post.comments || !post.comments.length)) {
			setIsLoading(true)
			dispatch(fetchMoreComments(post, 5))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shouldShowComments])

	useEffect(() => {
		if (post.comments.length === 5) setIsLoading(false)
	}, [post])

	if (!shouldShowComments) {
		return <></>
		// return <div className="post-comments-list"></div>
	}
	return (
		<div className="post-comments-list">
			{comments.map(comment => (
				<Comment key={comment._id} comment={comment} />
			))}
			{comments.length === 0 && <p>People haven't commented yet!</p>}
			{comments.length < post.commentsCount && (
				<button onClick={loadMoreComments}>Load More</button>
			)}
			{!!comments.length && comments.length >= commentsCount && (
				<p>-----------end-of-comments-----------</p>
			)}
		</div>
	)
}

export default CommentsList
