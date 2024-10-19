import React, { Component } from "react"
import { connect } from "react-redux"
import { signup } from "../actions/auth"
import { toast } from "react-hot-toast"
import { APIUrls, apiLoader } from "../utils"

class Signup extends Component {
	constructor(props) {
		super(props)
		this.state = {
			email: "",
			password: "",
			confirmPassword: "",
			username: "",
			OTP: "",
			lastRequest: 0,
			isOTPRequested: false,
			inProgress: false,
			mfaQr: "",
		}
	}

	handleInputChange = (field, value) => {
		this.setState({
			[field]: value,
			lastRequest: 0,
		})
	}
	handleFormSubmit = e => {
		e.preventDefault()
		// prevent resubmission of request if with 2 seconds
		const { email, password, confirmPassword, username, OTP: otp } = this.state
		if (!this.checkInputFields(email, password, confirmPassword, username))
			return
		if (isNaN(otp)) return toast.error("Invalid OTP.")
		if (!otp || otp.length !== 6) return toast.error("OTP must be 6 characters")
		this.props.dispatch(signup(email, password, confirmPassword, username, otp))
	}
	checkInputFields = () => {
		const { email, password, confirmPassword, username } = this.state
		if (!email || !password || !confirmPassword || !username) {
			toast("Please fill all the fields", { icon: "⚠️" })
			return false
		}
		if (password !== confirmPassword) {
			toast("Password and Confirm Password didn't match", { icon: "⚠️" })
			return false
		}
		let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,6}$/
		if (!emailPattern.test(email)) {
			toast("Email is incorrect", { icon: "⚠️" })
			return false
		}
		if (username.length > 50 || username.length < 0) {
			toast("User Name must be less than 50 characters", { icon: "⚠️" })
			return false
		}
		if (password.length < 7) {
			toast("Password must be atleast 7 characters", { icon: "⚠️" })
			return false
		}
		return true
	}
	requestOTP = async e => {
		e.preventDefault()
		if (this.state.inProgress) return toast("Patience!", { icon: "⚠️" })

		if (!this.checkInputFields()) return
		const { email } = this.state
		this.setState({ inProgress: false })
		await apiLoader(
			async () => {
				const url = APIUrls.getOTP(email)
				const res = await fetch(url)
				const data = await res.json()
				if (!data.success) {
					this.setState({ inProgress: false })
					return [false, data.message]
				}

				const mfaQr = data?.data?.qrCode
				if (!mfaQr) return [false, data.message]

				this.setState({ isOTPRequested: true, inProgress: false, mfaQr: mfaQr })
				return [true, data.message]
			},
			{
				loading: "Requesting OTP",
				error: "Error in Sending OTP",
				success: true,
			},
			() => {
				this.setState({ inProgress: false })
			}
		)
	}

	render() {
		return (
			<div className="signup">
				<h1 style={{ textAlign: "center" }}>Register</h1>
				<form action="" className="login-form">
					<div className="field">
						<input
							type="text"
							placeholder="Name"
							required
							onChange={e => this.handleInputChange("username", e.target.value)}
						/>
					</div>
					<div className="field">
						<input
							type="email"
							placeholder="Email"
							required
							onChange={e => this.handleInputChange("email", e.target.value)}
							pattern="^[^ ]+@[^ ]+\.[a-z]{2,6}$"
						/>
					</div>
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
					{!this.state.isOTPRequested && (
						<div className="field">
							<button onClick={this.requestOTP} type="submit">
								Setup MFA
							</button>
						</div>
					)}

					{this.state.isOTPRequested && (
						<>
							<div className="field">
								<input
									type="number"
									size="6"
									placeholder="OTP"
									required
									onChange={e => this.handleInputChange("OTP", e.target.value)}
								/>
							</div>
							<div className="field">
								{this.state.mfaQr ? (
									<>
										<img src={this.state.mfaQr} alt="MFA QR Code" />
									</>
								) : (
									<>Loading MFA QR... </>
								)}
							</div>

							<div className="field">
								<button onClick={this.handleFormSubmit} type="submit">
									Sign Up
								</button>
							</div>
						</>
					)}
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
export default connect(mapStateToProps)(Signup)
