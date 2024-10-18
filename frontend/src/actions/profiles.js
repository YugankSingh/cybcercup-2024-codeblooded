import {
	FETCH_USER_PROFILE_SUCCESS,
	CLEAR_PROFILE_STATE,
} from "./actionTypes"
import { APIUrls } from "../utils/"
import apiLoader from "../utils/apiLoader"

export function fetchUserProfileSuccess(user) {
	return {
		type: FETCH_USER_PROFILE_SUCCESS,
		user,
	}
}

export function fetchUserProfile(userID) {
	return async dispatch => {
		apiLoader(
			async () => {
				const url = APIUrls.userData(userID)
				let res = await fetch(url, {
					method: "GET",
					credentials: "include",
				})
				let data = await res.json()
				if (data.success) {
					dispatch(fetchUserProfileSuccess(data.data.user))
					return [true]
				}
				return [false, data.message]
			},
			{ success: false, loading: "....." }
		)
	}
}

export function clearProfileState() {
	return {
		type: CLEAR_PROFILE_STATE,
	}
}
