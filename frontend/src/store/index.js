import { createStore, applyMiddleware } from "redux"
import { composeWithDevTools } from "@redux-devtools/extension"
import thunk from "redux-thunk"
import reducers from "../reducers"

let middlewares = [thunk]

export function configureStore() {
	const store = createStore(
		reducers,
		composeWithDevTools(
			applyMiddleware(...middlewares)
			// other store enhancers if any
		)
	)

	return store
}
