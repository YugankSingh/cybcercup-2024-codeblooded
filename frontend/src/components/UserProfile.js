import React from "react"
import { Link } from "react-router-dom"
import "../scss/Navbar.scss"
import { useSelector } from "react-redux"
import {getTruncatedName} from "../utils"
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
					{/* Yup these are anchors and not Link as I have to reload the page inorder to get different res.headers so that Google Sign In can work */}
					<div className="nav-login-button">
						<a href="/login">Enter</a>
					</div>
				</>
			)}
		</>
	)
}

export default UserProfile
