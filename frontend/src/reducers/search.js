import { ADD_SEARCH_RESULTS } from "../actions/actionTypes"

const defaultState = []
export default function search(state = defaultState, action) {
	switch (action.type) {
		case ADD_SEARCH_RESULTS:
			return action.result
		default:
			return state
	}
}
