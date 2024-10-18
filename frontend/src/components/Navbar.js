import React, { Component } from "react"
import { Link } from "react-router-dom"
import { Search, ResponsiveRemovalHOC, UserProfile } from "./"
import "../scss/Navbar.scss"


class Navbar extends Component {
	render() {
		return (
			<nav className="nav">
				<div className="nav-inner">
					<div className="left-nav">
						<Link to="/">
							<img src="/logo.svg" alt="logo" height="50" />
						</Link>
						<ResponsiveRemovalHOC child={Search} removalWidth={600} />
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
