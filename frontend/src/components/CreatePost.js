import React, { Component } from "react"
import { getFormBody, APIUrls } from "../utils"
import { addPost } from "../actions/posts"
import { setMedia } from "../actions/uploadMedia"
import { connect } from "react-redux"
import apiLoader from "../utils/apiLoader"
import { Modal, AddMedia } from "."
import "../scss/CreatePost.scss"
import toast from "react-hot-toast"
class CreatePost extends Component {
	constructor(props) {
		super(props)
		this.state = {
			content: "",
			isInProgress: false,
			lastRequest: 0,
			isAddMediaModalOpen: false,
			shouldMediaUploadCancel: false,
		}
	}
	handleChange = event => {
		this.setState({
			content: event.target.value,
			warning: null,
			lastRequest: 0,
		})
	}

	uploadMedia = (index, postID) => {
		const { media } = this.props
		const isLast = index === media.length - 1

		const file = media[index]
		let url,
			fileName = file.fileObject.name
		apiLoader(
			async () => {
				if (file.type === "image") url = APIUrls.uploadPostImage(postID)
				else if (file.type === "video") url = APIUrls.uploadPostVideo(postID)
				else return [false, "Invalid file type"]

				const body = getFormBody(
					{ file: file.compressedFile, isLast },
					"multipart"
				)
				let res = await fetch(url, {
					method: "POST",
					headers: {},
					body,
					credentials: "include",
				})
				let data = await res.json()
				if (data.success) {
					if (isLast) {
						this.completePostUpload(data.data.post)
						toast.success(`Uploaded ${fileName}`)
					} else this.uploadMedia(index + 1, postID)
					return [true, data.message]
				}
				return [false, data.message]
			},
			{
				success: `Uploaded ${fileName}`,
				error: `Failed to upload ${fileName}`,
				loading: `Uploading ${fileName}`,
			},
			this.progressFalse
		)
	}
	handleSubmit = async () => {
		if (this.state.lastRequest + 2000 > Date.now() || this.state.isInProgress)
			return
		const { content } = this.state
		const { media } = this.props
		apiLoader(
			async () => {
				if (!content) {
					return [false, "the post cannot be Empty :D"]
				}
				if (!this.props.isLoggedIn)
					return [false, "you must be logged in to post"]
				const url = APIUrls.createPost()
				media.forEach(file => {
					if (!file.isCompressed)
						return [false, "the files are compressing, :D"]
				})

				this.setState({ lastRequest: Date.now(), isInProgress: true })

				const isMediaPost = media && media.length && media.length > 0
				const body = JSON.stringify({ content, isMediaPost })

				let res = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body,
					credentials: "include",
				})
				let data = await res.json()
				if (data.success) {
					// do whatever to do at succes
					if (data.isWaitingForMedia) {
						// send the media for upload
						this.uploadMedia(0, data.data.post._id)
						return [true, data.message]
					}
					this.completePostUpload(data.data.post)
					return [true]
				}
				return [false, data.message]
			},
			{
				success: "Post Created Successfully",
				error: "Error Creating Post",
				loading: "Posting....",
			},
			this.progressFalse
		)
	}
	openAddMediaModal = () => {
		if (this.state.isInProgress) return
		this.setState({ isAddMediaModalOpen: true })
	}
	closeAddMediaModal = () => {
		console.dev("close modal")
		this.setState({ isAddMediaModalOpen: false })
	}
	cancelMediaUpload = () => {
		this.props.dispatch(setMedia(oldMedia => []))
		this.setState({
			isAddMediaModalOpen: false,
			shouldMediaUploadCancel: true,
		})
		console.dev("cancelling media upload")
	}
	progressFalse = () => {
		this.setState({ isInProgress: false })
	}
	completePostUpload = post => {
		this.props.dispatch(setMedia(oldMedia => []))
		this.props.dispatch(addPost(post))
		this.setState({ content: "", isInProgress: false })
	}
	componentDidUpdate = () => {
		if (this.state.shouldMediaUploadCancel) {
			this.setState({ shouldMediaUploadCancel: false })
		}
	}
	start
	render() {
		const { media } = this.props
		const { shouldMediaUploadCancel } = this.state
		return (
			<>
				{!shouldMediaUploadCancel && (
					<div
						className={`${this.state.isAddMediaModalOpen ? "" : "invisible"}`}
					>
						<Modal
							handleClose={this.closeAddMediaModal}
							handleCancel={this.cancelMediaUpload}
							handleProceed={this.closeAddMediaModal}
							heading="Add Media"
							text="Lessss Go!!, Let's post some dope images and videos"
							CustomElement={AddMedia}
						/>
					</div>
				)}
				<div className="create-post">
					<textarea
						className="add-post"
						value={this.state.content}
						onChange={this.handleChange}
						required
					></textarea>
					<div className="create-post-actions">
						<div className="media-preview-secondary">
							{media.map(file => {
								if (file.type === "image")
									return (
										<img
											alt="post"
											src={file.dataUrl}
											key={file.dataUrl}
											height="40px"
											compressed={`${file.isCompressed}`}
										/>
									)
								if (file.type === "video")
									return (
										<video
											autoPlay={true}
											muted={true}
											loop={true}
											key={file.dataUrl}
											height="40px"
											compressed={`${file.isCompressed}`}
										>
											<source src={file.dataUrl} />
											<p>Be Patient!</p>
										</video>
									)
								else return <></>
							})}
						</div>
						<div className="post-buttons">
							<button onClick={this.openAddMediaModal} id="add-media-button">
								<img src="/camera-icon.svg" alt="" />
							</button>
							<button
								id="add-post-button"
								onClick={this.handleSubmit}
								type="submit"
							>
								Add Posts
							</button>
						</div>
					</div>
				</div>
			</>
		)
	}
}

function mapStateToProps(state) {
	return {
		isLoggedIn: state.auth.isLoggedIn,
		auth: state.auth,
		media: state.media,
	}
}
export default connect(mapStateToProps)(CreatePost)
