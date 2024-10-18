import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import "./index.scss"
import { AppWrapper } from "./components"
import { configureStore } from "./store"
import { Toaster } from "react-hot-toast"
import { BrowserRouter as Router } from "react-router-dom"

const store = configureStore()
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development"
console.dev = (...args) => {
	if (isDev) console.log(...args)
}
ReactDOM.render(
	<Provider store={store}>
		<React.StrictMode>
			<Toaster />
			<Router>
				<AppWrapper />
			</Router>
		</React.StrictMode>
	</Provider>,
	document.getElementById("root")
)
