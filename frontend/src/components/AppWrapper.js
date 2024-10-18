import React, { useEffect, Suspense } from "react"
import { useDispatch } from "react-redux"

import { App } from "."
import { startup } from "../actions/auth"
import toast from "react-hot-toast"
import { Route, Switch } from "react-router-dom"

const LazyApp = React.lazy(() => import("./App"))
const LazyLoginSignup = React.lazy(() => import("./LoginSignup"))

function AppWrapper(props) {
	const dispatch = useDispatch()

	useEffect(() => {
		// I don't know why I have to do this but without this, the toast won't work

		setTimeout(() => {
			const initToastID = toast(".")
			toast.dismiss(initToastID)
		}, 1)
		dispatch(startup())
	})

	return (
		<>
			<Suspense fallback={<div>Loading</div>}>
				<Switch>
					<Route path="/login" component={LazyLoginSignup} />
					<Route path="/signup" component={LazyLoginSignup} />
					<Route path="" component={LazyApp} />
					<App></App>
				</Switch>
			</Suspense>
		</>
	)
}
export default AppWrapper
