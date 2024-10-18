import React, { Suspense } from "react"
import { connect } from "react-redux"
import { Route, Switch } from "react-router-dom"

import {
	Navbar,
	Page404,
	PrivateRoute,
	Footer,
	ResetPassword,
	Chat,
	ResponsiveRemovalHOC,
	ActionsMenu,
} from "."
import Traffic from "./Traffic"

const LazyHome = React.lazy(() => import("./Home"))
const LazySettings = React.lazy(() => import("./Settings"))

function App(props) {
	return (
		<div id="app">
			<Navbar />
			<div id="main-app">
				<Suspense fallback={<div>Loading</div>}>
					<Switch>
						<Route exact path="/" component={LazyHome} />
						<Route
							path="/reset-password/:token/:userID"
							component={ResetPassword}
						/>
						<PrivateRoute
							path="/settings"
							component={LazySettings}
							isLoggedin={props.auth.isLoggedIn}
						/>
						<Route path="" component={Page404} />
					</Switch>
				</Suspense>
			</div>
			<Switch>
				<Route path="/godslist" />
				<Route path="" component={Footer} />
			</Switch>
			<div id="after-footer"></div>
		</div>
	)
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
	}
}

export default connect(mapStateToProps)(App)
