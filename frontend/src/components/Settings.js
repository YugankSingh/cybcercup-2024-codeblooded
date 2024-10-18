import React, { Component } from "react"
import { connect } from "react-redux"
import { editUser } from "../actions/auth"
import { UserPhotoURL } from "../constants"
import { logoutUser } from "../actions/auth"
import "../scss/UserProfile.scss"
import EmojiPicker from "emoji-picker-react"
class Settings extends Component {
	constructor(props) {
		super(props)
		const { user } = this.props.auth
		this.state = {
			isEditModeOn: false,
			password: "",
			confirmPassword: "",
			name: user.name,
			emoji: "",
			profilePhoto: "",
			profilePhotoUrl: "", // this is just temprory
			lastLogoutRequest: 0,
			lastEditRequest: 0,
		}
	}
	logout = () => {
		if (this.state.lastLogoutRequest + 1000 > Date.now()) return
		this.setState({ lastLogoutRequest: Date.now() })
		this.props.dispatch(logoutUser())
	}
	handleInputChange = (fieldName, value) => {
		this.setState({
			[fieldName]: value,
			lastEditRequest: Date.now(),
		})
	}
	handleFormSubmit = e => {
		e.preventDefault()
		if (this.state.lastEditRequest + 1000 > Date.now()) return
		const { password, confirmPassword, name, profilePhoto, emoji } = this.state
		if (!name) return
		if (password && !confirmPassword) return

		this.setState({ lastEditRequest: Date.now() })
		this.props.dispatch(
			editUser(name, password, confirmPassword, profilePhoto, emoji)
		)
	}
	endEditMode = () => {
		const { user } = this.props.auth
		this.setState({
			isEditModeOn: false,
			password: "",
			confirmPassword: "",
			name: user.name,
			profilePhoto: "",
			profilePhotoUrl: "",
			lastEditRequest: 0,
		})
	}
	render() {
		const { user, error, inProgress, isSuccessful } = this.props.auth
		const { isEditModeOn } = this.state
		return (
			<div className="profile-wrapper">
				<div className="profile">
					{!inProgress && error && (
						<div className="alert error-dailog">{error}</div>
					)}
					{isSuccessful && (
						<div className="alert success-dailog">
							Profile Updated Successfullyy!!
						</div>
					)}
					<div className="field">
						<div className="field-label">Email</div>
						<div className="field-value">{user.email}</div>
					</div>
					<div className="field">
						<div className="field-label">Name</div>

						<div className="field-value">{user.name}</div>
					</div>

					{isEditModeOn && (
						<>
							<div className="field">
								<div className="field-label">New Password</div>
								<input
									type="password"
									onChange={e =>
										this.handleInputChange("password", e.target.value)
									}
									value={this.state.password}
								/>
							</div>
							<div className="field">
								<div className="field-label">Confirm Password</div>
								<input
									type="password"
									onChange={e =>
										this.handleInputChange("confirmPassword", e.target.value)
									}
									value={this.state.confirmPassword}
								/>
							</div>
						</>
					)}
					<div className="btn-grp">
						{isEditModeOn ? (
							<>
								<button
									className="button save-btn"
									onClick={this.handleFormSubmit}
								>
									Save
								</button>
								<div className="go-back" onClick={this.endEditMode}>
									Go Back
								</div>
							</>
						) : (
							<button
								className="edit edit-btn"
								onClick={e => this.handleInputChange("isEditModeOn", true)}
							>
								Change Password
							</button>
						)}
					</div>
					<div className="logout">
						<button className="button logout-btn" onClick={this.logout}>
							Log Out
						</button>
					</div>
				</div>
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
	}
}

export default connect(mapStateToProps)(Settings)
