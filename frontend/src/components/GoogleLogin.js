import React, { useRef } from "react"
import {
	GoogleLogin as ReactGoogleLogin,
	GoogleOAuthProvider,
} from "@react-oauth/google"
import toast from "react-hot-toast"
import { googleLogin } from "../actions/auth"
import { useDispatch } from "react-redux"
import { REACT_APP_GOOGLE_CLIENT_ID } from "../constants"

function GoogleLogin(props) {
	const toastID = useRef(null)
	const dispatch = useDispatch()
	const onGoogleLoginSuccess = res => {
		toast.dismiss(toastID.current)
		toastID.current = null
		dispatch(googleLogin(res.credential))
	}
	const onGoogleLoginFailure = res => {
		toast.dismiss(toastID.current)
		toastID.current = null
		toast.error("Google Login Failed " + res.type)
		console.error("error in Google Login", res)
	}
	const onGoogleLoginStart = res => {
		toast.dismiss(toastID.current)
		toastID.current = toast.loading("Loading...")
	}
	return (
		<div
			style={{ backgroundColor: "#ddd", padding: 0 }}
			onClick={onGoogleLoginStart}
		>
			<GoogleOAuthProvider clientId={REACT_APP_GOOGLE_CLIENT_ID}>
				<ReactGoogleLogin
					onSuccess={onGoogleLoginSuccess}
					onFailure={onGoogleLoginFailure}
				></ReactGoogleLogin>
			</GoogleOAuthProvider>
		</div>
	)
}

export default GoogleLogin
