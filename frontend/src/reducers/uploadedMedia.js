import { SET_MEDIA_LIST } from "../actions/actionTypes"

const defaultState = []
export default function search(state = defaultState, action) {
	switch (action.type) {
		case SET_MEDIA_LIST:
			return action.updatedMediaFunct(state)
		default:
			return state
	}
}
