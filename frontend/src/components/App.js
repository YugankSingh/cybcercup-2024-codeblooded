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
const LazyProfile = React.lazy(() => import("./Profile"))
const LazySearchPage = React.lazy(() => import("./SearchPage"))
const LazyGodsListPage = React.lazy(() => import("./GodsListPage"))
const LazyChatPage = React.lazy(() => import("./ChatPage"))

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
						<PrivateRoute
							path="/users/:id"
							component={LazyProfile}
							isLoggedin={props.auth.isLoggedIn}
							userFriends={props.auth.userFriends}
						/>
						<Route path="/search" component={LazySearchPage} />
						<Route path="/godslist" component={LazyGodsListPage} />
						<Route path="" component={Page404} />
					</Switch>
				</Suspense>
				<ActionsMenu />
				<Traffic />
				<ResponsiveRemovalHOC child={Chat} removalWidth={600} />
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
