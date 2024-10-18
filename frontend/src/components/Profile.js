import React, { Component } from "react"
import { connect } from "react-redux"
import { Redirect } from "react-router"
import { addGod, removeGod } from "../actions/gods"
import { fetchUserProfile } from "../actions/profiles"
import { apiLoader, APIUrls } from "../utils"
import UserPhoto from "./UserPhoto"
import "../scss/UserProfile.scss"

class Profile extends Component {
	constructor(props) {
		super(props)
		let { id: profileUserID } = this.props.match.params
		let { id: userID } = this.props.user
		console.dev("Profile User ID", profileUserID, userID)
		if (profileUserID === userID) {
			this.render = () => {
				return <Redirect to="/settings" />
			}
			// this.componentDidMount = () => {
			// 	this.props.dispatch(clearProfileState())
			// }
		}

		this.state = {
			lastRequest: 0,
		}
	}
	componentDidMount = () => {
		let { id } = this.props.match.params
		// get the user data

		if (id) {
			this.props.dispatch(fetchUserProfile(id))
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const { id: prevID } = prevProps.match.params
		const { id: currID } = this.props.match.params
		if (prevID && currID && prevID !== currID)
			this.props.dispatch(fetchUserProfile(currID))
	}

	onRemoveGod = async () => {
		if (this.state.lastRequest + 1000 > Date.now()) return
		this.setState({ lastRequest: Date.now() })
		apiLoader(
			async () => {
				if (!this.isUserAGod()) return [false, "He is already not your God"]
				const { _id: userID } = this.props.profile.user
				const url = APIUrls.worship(userID)
				let res = await fetch(url, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					credentials: "include",
				})
				let data = await res.json()
				if (data.success) {
					this.props.dispatch(removeGod(userID))
					return [true]
				}
				return [false, data.message]
			},
			{
				success: `You are no longer worshipping ${this.props.profile.user.name}`,
				error: "Error in stopping worship",
				loading: "Stopping Worship...",
			}
		)
	}
	onAddGod = async () => {
		if (this.state.lastRequest + 1000 > Date.now()) return
		this.setState({ lastRequest: Date.now() })
		const { _id: userID } = this.props.profile.user
		const url = APIUrls.worship(userID)
		apiLoader(
			async () => {
				if (this.isUserAGod())
					return [
						false,
						`You are already worshipping ${this.props.profile.user.name}`,
					]
				let res = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					credentials: "include",
				})
				let data = await res.json()
				if (data.success) {
					const { user: god } = this.props.profile
					this.props.dispatch(addGod(god))
					return [true]
				}
				return [false, data.message]
			},
			{
				success: `You are now worshipping ${this.props.profile.user.name}`,
				error: "Error in worship",
				loading: "Starting Worship...",
			}
		)
	}
	isUserAGod = () => {
		const { _id: userID } = this.props.profile.user
		const { userGods } = this.props

		const godsUserIDs = userGods.map(god => god._id)
		console.table(godsUserIDs)
		if (godsUserIDs.indexOf(userID) === -1) return false
		return true
	}

	render() {
		const { user, inProgress, error } = this.props.profile
		if (inProgress) {
			return (
				<div className="profile">
					<h1>Loading....</h1>
				</div>
			)
		}
		if (error) {
			return (
				<div className="profile-wrapper">
					<div className="profile">
						<h1>
							{!inProgress && error && (
								<div className="alert error-dailog">{error}</div>
							)}
						</h1>
					</div>
				</div>
			)
		}

		const isUserAGod = this.isUserAGod()
		return (
			<div className="profile-wrapper">
				<div className="profile">
					<div className="img-container">
						<UserPhoto user={user} className="user-dp" />
					</div>
					<div className="field">
						<div className="field-label">Email</div>
						<div className="field-value">{user.email}</div>
					</div>

					<div className="field">
						<div className="field-label">Name</div>
						<div className="field-value">{user.name}</div>
					</div>

					<div className="btn-grp">
						{isUserAGod ? (
							<button className="button save-btn" onClick={this.onRemoveGod}>
								Stop Worshipping
							</button>
						) : (
							<button className="button save-btn" onClick={this.onAddGod}>
								Worship
							</button>
						)}
					</div>
				</div>
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		profile: state.profile,
		userGods: state.gods,
		user: state.auth.user,
	}
}

export default connect(mapStateToProps)(Profile)
