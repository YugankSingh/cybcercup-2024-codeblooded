import {
	CLEAR_PROFILE_STATE,
	FETCH_USER_PROFILE_SUCCESS,
} from "../actions/actionTypes"

const defaultState = {
	user: {},
}
export default function profile(state = defaultState, action) {
	switch (action.type) {
		case FETCH_USER_PROFILE_SUCCESS:
			return {
				...state,
				user: action.user,
			}
		case CLEAR_PROFILE_STATE:
			return { ...state }
		default:
			return state
	}
}
