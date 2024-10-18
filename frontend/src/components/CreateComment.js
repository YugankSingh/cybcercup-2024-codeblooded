import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { addComment } from "../actions/posts"
import { getFormBody, APIUrls } from "../utils"
import apiLoader from "../utils/apiLoader"

function CreateComment(props) {
	const { postID } = props

	const [content, setContent] = useState("")
	const [lastRequest, setLastRequest] = useState(0)
	const dispatch = useDispatch()
	const postComment = async () => {
		if (lastRequest + 1400 > Date.now()) return
		setLastRequest(Date.now())
		apiLoader(
			async () => {
				if (!content) return [false, "the comment cannot be Empty :D"]
				const data = await callPostCommentAPI()

				if (data.success) {
					setContent("")
					dispatch(addComment(data.data.comment))
					return [true]
				}
				return [false, data.message]
			},
			{
				success: "Comment Posted",
				error: "Error Posting Comment",
				loading: "Commenting....",
			}
		)
	}

	const callPostCommentAPI = async () => {
		const url = APIUrls.createComment()
		let res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			credentials: "include",
			body: getFormBody({
				content,
				post: postID,
			}),
		})
		let data = await res.json()

		return data
	}

	return (
		<div className="post-comment-box">
			<input
				placeholder="Start typing a comment"
				onChange={e => {
					setContent(e.target.value)
					setLastRequest(0)
				}}
				value={content}
				required
			/>
			<button className=".save-btn" onClick={postComment}>
				{" "}
				{">>"}{" "}
			</button>
		</div>
	)
}

export default CreateComment
