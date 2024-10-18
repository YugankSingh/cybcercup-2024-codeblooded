import { useDispatch, useSelector } from "react-redux"
import { addLike, removeLike } from "../actions/posts"
import { APIUrls, formatNumber } from "../utils"
import apiLoader from "../utils/apiLoader"
import React, { useState } from "react"

function Like(props) {
	const { parent, parentType } = props
	const { likes } = parent
	const userID = useSelector(state => state.auth.user.id)
	const dispatch = useDispatch()

	const [lastRequest, setLastRequest] = useState(0)

	const checkIfLiked = () => {
		const isLiked = likes.find(like => like.user === userID)
		return !!isLiked
	}
	const isLiked = checkIfLiked()

	const onLike = async () => {
		if (lastRequest + 500 > Date.now()) return
		setLastRequest(Date.now())
		apiLoader(async () => {
			const data = await callLikeAPI()
			if (!data.success) return [false, data.message]
			if (data.data.deleted) {
				dispatch(removeLike(userID, parent, parentType))
				return [true, "Unliked"]
			} else {
				dispatch(addLike(userID, parent, parentType))
				return [true, "Liked 👍"]
			}
		})
	}

	// always send parentType with first letter capital like Post or Comment or Music or Etc
	const callLikeAPI = async () => {
		const url = APIUrls.like(parent._id, parentType)
		let res = await fetch(url, {
			method: "POST",
			credentials: "include",
		})

		let data = await res.json()
		return data
	}
	return (
		<div className="like" onClick={onLike}>
			{isLiked ? (
				<img src="/heart-pink.png" alt="unlike" />
			) : (
				<img src="/heart-black.png" alt="like" />
			)}
			<span className="like-count">{formatNumber(likes.length)}</span>
		</div>
	)
}

export default Like
