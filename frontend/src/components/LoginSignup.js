import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { Route, Switch } from "react-router-dom"
import { Login, Signup, LoginNavbar } from "./"

function LoginSignup(props) {
	const isLoggedIn = useSelector(state => state.auth.isLoggedIn)
	useEffect(() => {
		if (isLoggedIn) window.location = "/"
	}, [isLoggedIn])
	return (
		<div>
			<LoginNavbar />
			<Switch>
				<Route path="/login" component={Login} />
				<Route path="/signup" component={Signup} />
			</Switch>
		</div>
	)
}
export default LoginSignup
