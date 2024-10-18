import React, { Component } from "react"
import { Link } from "react-router-dom"
import {  ResponsiveRemovalHOC, UserProfile } from "./"
import "../scss/Navbar.scss"

class Navbar extends Component {
	render() {
		return (
			<nav className="nav">
				<div className="nav-inner">
					<div className="left-nav">
						<Link to="/">
							Home
							{/* <img src="/logo.svg" alt="logo" height="50" /> */}
						</Link>
					</div>
					<div className="right-nav">
						<ResponsiveRemovalHOC child={UserProfile} removalWidth={600} />
					</div>
				</div>
			</nav>
		)
	}
}

export default Navbar
