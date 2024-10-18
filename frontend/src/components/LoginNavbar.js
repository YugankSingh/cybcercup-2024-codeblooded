import React, { Component } from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import "../scss/Navbar.scss"
import { Route, Switch } from "react-router-dom"
class LoginNavbar extends Component {
	render() {
		return (
			<nav className="nav">
				<div className="nav-inner">
					<div className="left-nav">
						<a href="/">
							<img src="/logo.svg" alt="logo" height="50" />
						</a>
					</div>
					<div className="right-nav">
						<div className="nav-links">
							<div className="nav-login-button">
								<Switch>
									<Route path="/login">
										<Link to="/signup">Register</Link>
									</Route>
									<Route path="/signup">
										<Link to="/login">Log In</Link>
									</Route>
								</Switch>
							</div>
						</div>
					</div>
				</div>
			</nav>
		)
	}
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
	}
}
export default connect(mapStateToProps)(LoginNavbar)
