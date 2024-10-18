import React from "react"
import { Link } from "react-router-dom"
import "../scss/Navbar.scss"
import { useSelector } from "react-redux"
import { getTruncatedName } from "../utils"
// helper function

function UserProfile(props) {
	const auth = useSelector(state => state.auth)
	return (
		<>
			{auth.isLoggedIn ? (
				<div className="user-container">
					<Link to="/settings" className="user-link">
						<span className="user-profile-name">
							{getTruncatedName(auth.user.name, 15)}
						</span>
					</Link>
				</div>
			) : (
				<>
					<div className="nav-login-button">
						<Link to="/login">Enter</Link>
					</div>
				</>
			)}
		</>
	)
}

export default UserProfile
