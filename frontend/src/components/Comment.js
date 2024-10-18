import { prettifyMongooseDate } from "../utils"
import { Like, Modal } from "./"
import React, { useState } from "react"
import { Link } from "react-router-dom"
import APIUrls from "../utils/APIUrls"
import { useDispatch } from "react-redux"
import { removeComment } from "../actions/posts.js"
import { apiLoader, getTruncatedName } from "../utils"

function Comment(props) {
	const { comment } = props
	const [lastDeleteRequest, setLastDeleteRequest] = useState(0)
	const [isDeletionConfirmationModalOpen, setIsDeletionConfirmationModalOpen] =
		useState(false)
	const dispatch = useDispatch()

	const callDeleteCommentAPI = async () => {
		apiLoader(
			async () => {
				const url = APIUrls.deleteComment(comment._id)
				let res = await fetch(url, {
					method: "DELETE",
					credentials: "include",
				})
				let data = await res.json()
				if (data.success) {
					dispatch(removeComment(comment.post, comment._id))
					return [true]
				}
				return [false, data.message]
			},
			{
				success: "Comment Deleted",
				error: "whopsies, error in deleting comment",
				loading: "deleting comment...",
			}
		)
	}
	const openConfirmationModal = () => {
		setIsDeletionConfirmationModalOpen(true)
	}
	const closeModal = () => {
		setIsDeletionConfirmationModalOpen(false)
	}
	const deleteComment = () => {
		if (lastDeleteRequest + 1500 > Date.now()) return
		setLastDeleteRequest(Date.now())
		setIsDeletionConfirmationModalOpen(false)
		callDeleteCommentAPI()
	}

	return (
		<div className="post-comment-item">
			{isDeletionConfirmationModalOpen && (
				<Modal
					heading="You wanna delete this comment?"
					handleClose={closeModal}
					handleCancel={closeModal}
					handleProceed={deleteComment}
					text={
						"I mean if it was just a mistake then you can just go back from here,\nbut there is no going back after this.\nAre you sure you want to delete this comment?"
					}
				/>
			)}
			<div className="post-comment-header">
				<span className="post-comment-author">
					<Link to={`/users/${comment.user.__id}`}>
						{getTruncatedName(comment.user.name, 20)}
					</Link>
				</span>
				<span className="post-comment-time">
					{prettifyMongooseDate(comment?.createdAt)}
				</span>
				<Like parent={comment} parentType={"Comment"} />
				<div className="delete" onClick={openConfirmationModal}>
					<img src="/delete-icon.png" alt="delete" />
				</div>
			</div>

			<div className="post-comment-content">{comment.content}</div>
		</div>
	)
}

export default Comment
