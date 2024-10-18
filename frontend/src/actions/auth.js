import { EDIT_USER_SUCCESS, LOGIN_SUCCESS, LOGOUT } from "./actionTypes"
import { APIUrls } from "../utils/"
import { getFormBody } from "../utils"
import toast from "react-hot-toast"
import apiLoader from "../utils/apiLoader"

export function loginSuccess(user) {
	return {
		type: LOGIN_SUCCESS,
		user,
	}
}

function loginDrill(user, dispatch) {
	toast.success(`Hello ${user.name}`, { icon: "👋" })
	dispatch(loginSuccess(user))
}
function notLoggedIn(dispatch) {
	dispatch({
		type: LOGOUT,
	})
}

export function login(email, password) {
	return async function (dispatch) {
		apiLoader(
			async () => {
				const url = APIUrls.login()
				let res = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					credentials: "include",
					body: getFormBody({ email, password }),
				})
				let data = await res.json()
				if (data.success) {
					let user = data.data.user
					loginDrill(user, dispatch)
					return [true]
				}
				return [false, data.message]
			},
			{
				loading: "Logging in...",
				success: false,
				error: "Oops, something went wrong!",
			}
		)
	}
}

export function signup(email, password, confirmPassword, username, otp) {
	return async function (dispatch) {
		apiLoader(
			async () => {
				const url = APIUrls.user()
				let res = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					credentials: "include",
					body: getFormBody({
						email,
						password,
						confirm_password: confirmPassword,
						name: username,
						otp,
					}),
				})
				let data = await res.json()
				if (data.success) {
					let user = data.data.user
					loginDrill(user, dispatch)
					return [true]
				}
				return [false, data.message]
			},
			{
				loading: "Signing Up...",
				success: false,
				error: "Oops, Some sort of mysterious error!",
			}
		)
	}
}

export function startup(user) {
	return async dispatch => {
		apiLoader(
			async () => {
				const url = APIUrls.startup()
				let res = await fetch(url, {
					credentials: "include",
				})
				let data = await res.json()
				if (!data.success) {
					return [false, data.message]
				}
				let { user } = data.data
				if (data.isLoggedIn) {
					loginDrill(user, dispatch)
				} else {
					toast("Please login to access the dashboard", { icon: "⚠️" })
					notLoggedIn(dispatch)
				}
				return [true]
			},
			{
				loading: "Loading your details...",
				success: false,
				error: "Oops, Error in loading your details!",
			}
		)
	}
}

export function logoutUser() {
	return async dispatch => {
		apiLoader(
			async () => {
				const url = APIUrls.logout()
				let res = await fetch(url, {
					method: "POST",
					credentials: "include",
				})
				let data = await res.json()
				if (!data.success) return [false, data.message]

				dispatch({
					type: LOGOUT,
				})
				toast.success("Logged out successfully,\nSee Ya!", { icon: "👋" })
				return [true]
			},
			{
				loading: "logging out...",
				success: false,
				error: "Oops, Some sort of mysterious error",
			}
		)
	}
}

export function googleLogin(token) {
	return async function (dispatch) {
		apiLoader(
			async () => {
				const url = APIUrls.googleLogin()
				let res = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					credentials: "include",
					body: getFormBody({ token }),
				})
				let data = await res.json()
				if (data.success) {
					let user = data.data.user
					loginDrill(user, dispatch)
					return [true]
				}
				return [false, data.message]
			},
			{
				loading: "Googling Inn...",
				success: false,
				error: "Google Log In, Failed 🥺!",
			}
		)
	}
}

export function editUser(name, password, confirmPassword, profilePhoto, emoji) {
	return async dispatch => {
		apiLoader(
			async () => {
				const url = APIUrls.userUpdate()
				const body = getFormBody(
					{
						password,
						confirm_password: confirmPassword,
						name,
						profile_photo: profilePhoto,
						emoji,
					},
					"multipart"
				)

				let res = await fetch(url, {
					method: "PATCH",
					credentials: "include",
					body,
				})
				let data = await res.json()
				if (!data.success) {
					return [false, data.message]
				}
				dispatch(editUserSuccessful(data.data.user))
				return [true]
			},
			{
				loading: "Updating, Just a Minute...",
				success: "Profile edited nicely,\nBOOYA!",
				error: "Oops, Some Issue, Cannot Update Your Profile",
			}
		)
	}
}

export function editUserSuccessful(user) {
	return {
		type: EDIT_USER_SUCCESS,
		user,
	}
}
