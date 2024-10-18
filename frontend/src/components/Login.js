import React, { Component } from "react"
import { connect } from "react-redux"
import { login } from "../actions/auth"
import { toast } from "react-hot-toast"
import { apiLoader } from "../utils"
import { APIUrls } from "../utils/"
import { GoogleLogin } from "./"

class Login extends Component {
	constructor(props) {
		super(props)
		// this.emailInputRef = React.createRef()
		// this.passwordInputRef = React.createRef()
		this.state = {
			email: "",
			password: "",
			lastRequest: 0,
			lastForgotPassword: 0,
		}
	}

	handleEmailChange = e => {
		this.setState({
			email: e.target.value,
			lastRequest: 0,
			lastForgotPassword: 0,
		})
	}
	handlePasswordChange = e => {
		this.setState({
			password: e.target.value,
			lastRequest: 0,
		})
	}
	handleForgotPassword = e => {
		e.preventDefault()
		if (this.state.lastForgotPassword + 2000 > Date.now()) return

		const { email } = this.state
		if (!email) {
			toast.error(`Please enter your email`)
			return
		}
		this.setState({
			lastForgotPassword: Date.now(),
		})
		this.callForgotPasswordAPI()
	}
	callForgotPasswordAPI = async () => {
		const { email } = this.state
		apiLoader(
			async () => {
				const url = APIUrls.resetPasswordMail(email)
				let res = await fetch(url)
				let data = await res.json()
				if (!data.success) {
					return [false, data.message]
				}
				return [true]
			},
			{
				loading: "Sending the mail...",
				success:
					"A link is sent on your mail,\nVisit the link to reset your password",
				error: "Oh, some unexpected error!",
			}
		)
	}
	handleFormSubmit = e => {
		e.preventDefault()
		if (this.state.lastRequest + 2000 > Date.now()) return

		const { email, password } = this.state
		if (!email || !password) {
			let missing = email ? "password" : "email"
			toast.error(`Please enter your ${missing}`)
			return
		}

		this.setState({
			lastRequest: Date.now(),
		})
		this.props.dispatch(login(email, password))
	}

	render() {
		const { error, inProgress } = this.props.auth

		return (
			<div className="login">
				<h1 style={{textAlign: "center"}}>Log In</h1>
				<form action="" className="login-form">
					<span className="login-signup-header">
						{error && <div className="alert error-dialog">{error}</div>}
					</span>
					<div className="field">
						<input
							type="email"
							placeholder="Email"
							required
							// ref={this.passwordInputRef}
							onChange={this.handleEmailChange}
							pattern="^[^ ]+@[^ ]+\.[a-z]{2,6}$"
						/>
					</div>
					<div className="field">
						<input
							type="password"
							placeholder="Password"
							required
							// ref={this.emailInputRef}
							onChange={this.handlePasswordChange}
						/>
						<a onClick={this.handleForgotPassword} href="/login">
							Forgot Password
						</a>
					</div>

					<div className="field">
						{inProgress ? (
							<button onClick={this.handleFormSubmit} type="submit" disabled>
								Logging in...
							</button>
						) : (
							<button onClick={this.handleFormSubmit} type="submit">
								Log In
							</button>
						)}
					</div>
					<GoogleLogin />
				</form>
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
	}
}
export default connect(mapStateToProps)(Login)
