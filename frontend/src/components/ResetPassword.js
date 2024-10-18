import { useParams } from "react-router-dom"
import React, { Component } from "react"
import { toast } from "react-hot-toast"
import { apiLoader } from "../utils"
import { APIUrls } from "../utils/"

class ResetPassword extends Component {
	constructor(props) {
		super(props)
		this.state = {
			password: "",
			confirmPassword: "",
			lastRequest: 0,
		}
	}
	handleInputChange = (fieldName, value) => {
		this.setState({
			[fieldName]: value,
			lastRequest: 0,
		})
	}
	handleResetPassword = e => {
		e.preventDefault()
		if (this.state.lastRequest + 1000 > Date.now()) return
		const { password, confirmPassword } = this.state
		if (password && !confirmPassword) {
			toast.error("Fill in the fields Baby!")
			return
		}
		this.setState({ lastRequest: Date.now() })
		this.callResetPasswordAPI()
	}
	callResetPasswordAPI = e => {
		apiLoader(
			async () => {
				const { password, confirmPassword } = this.state
				if (password.length < 7)
					return [false, "Password must be at least 7 characters"]
				if (password !== confirmPassword)
					return [false, "Pasword, does not match Confirm Password"]
				const url = APIUrls.resetPassword(password, confirmPassword)
				let res = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						password,
						confirm_password: confirmPassword,
						token: this.props.params.token,
						user_id: this.props.params.userID,
					}),
				})
				let data = await res.json()
				if (!data.success) {
					return [false, data.message]
				}
				return [true]
			},
			{
				success:
					"Hooray,\nPassword's changed,\nand don't forget your password this time",
				error:
					"Whoops.\nSeems like there's some issue in changing your password",
				loading: "Resetting your password...",
			}
		)
	}
	render() {
		return (
			<div>
				<h1 style={{ textAlign: "center" }}>Reset Password</h1>

				<form action="" className="login-form">
					<div className="field">
						<input
							type="password"
							placeholder="Password"
							required
							onChange={e => this.handleInputChange("password", e.target.value)}
						/>
					</div>
					<div className="field">
						<input
							type="password"
							placeholder="Confirm Password"
							required
							onChange={e =>
								this.handleInputChange("confirmPassword", e.target.value)
							}
						/>
					</div>
					<div className="field">
						<button onClick={this.handleResetPassword} type="submit">
							Reset Password
						</button>
					</div>
				</form>
			</div>
		)
	}
}

function ResetPasswordWithParams(props) {
	return <ResetPassword {...props} params={useParams()} />
}

export default ResetPasswordWithParams
