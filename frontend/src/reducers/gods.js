import {
	ADD_GOD,
	REMOVE_GOD,
	ADD_GODS_LIST,
	REMOVE_GODS_LIST,
} from "../actions/actionTypes"

const defaultState = []
export default function profile(state = defaultState, action) {
	switch (action.type) {
		case ADD_GODS_LIST:
			return action.gods
		case REMOVE_GODS_LIST:
			return []
		case ADD_GOD:
			return [...state, action.god]
		case REMOVE_GOD:
			return state.filter(god => god._id !== action.godID)
		default:
			return state
	}
}
