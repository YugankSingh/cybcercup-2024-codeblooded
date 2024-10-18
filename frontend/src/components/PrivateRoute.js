import React from 'react';
import { Redirect, Route } from "react-router"
import toast from "react-hot-toast"

const PrivateRoute = props => {
	const { isLoggedin, path, component: Component } = props
	return (
		<Route
			path={path}
			render={props => {
				if (isLoggedin == null) { 
					return (<div><h2>Loading ...</h2></div>)
				}
				if (!isLoggedin) {
					toast.error("You need to be logged in to access this page")
				}
				return isLoggedin ? (
					<Component {...props} />
				) : (
					<Redirect
						to={{
							pathname: "/",
							state: {
								from: props.location,
							},
						}}
					/>
				)
			}}
		/>
	)
}

export default PrivateRoute
