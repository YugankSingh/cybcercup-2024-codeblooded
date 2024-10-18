import {
	EDIT_USER_SUCCESS,
	LOGIN_SUCCESS,
	SIGNUP_SUCCESS,
	LOGOUT,
} from "../actions/actionTypes"

const initialState = {
	user: {},
	isLoggedIn: null,
}

export default function auth(state = initialState, action) {
	switch (action.type) {
		case LOGIN_SUCCESS:
		case SIGNUP_SUCCESS:
		case EDIT_USER_SUCCESS: {
			return {
				...state,
				user: action.user,
				isLoggedIn: true,
			}
		}
		case LOGOUT: {
			return {
				user: {},
				isLoggedIn: false,
			}
		}
		default:
			return state
	}
}
