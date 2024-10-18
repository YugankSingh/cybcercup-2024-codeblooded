import * as React from "react"
import "../scss/ActionsMenu.scss"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

const ActionsMenu = () => {
	const isLoggedIn = useSelector(state => state.auth.isLoggedIn)
	return (
		<div id="actions-menu">
			<Link to="/search" className="round-button">
				<img src="/search-icon.svg" alt="Search" width="50px" />
			</Link>
			<Link to="/godslist" className="round-button">
				<img src="/gods-list.svg" alt="Gods list" />
			</Link>
			<Link to="/chat" className="round-button">
				<img
					src="chat-icon.svg"
					alt="Post"
					height="50px"
					style={{
						marginBottom: -8,
						marginRight: -2,
					}}
				/>
			</Link>
			{isLoggedIn === null && (
				<p className="round-button" onClick={() => toast("Loading...")}>
					<img src="/profile-icon.svg" alt="Profile" height="42.5px" />
				</p>
			)}
			{isLoggedIn === false && (
				<a href="/login" className="round-button">
					<img src="/profile-icon.svg" alt="Profile" height="42.5px" />
				</a>
			)}

			{isLoggedIn === true && (
				<Link to="/settings" className="round-button">
					<img src="/profile-icon.svg" alt="Profile" height="42.5px" />
				</Link>
			)}
		</div>
	)
}

export default ActionsMenu
