import React from "react"
import prettifyMongooseDate from "../utils/prettifyMongooseDate"
import { Link } from "react-router-dom"
import { CommentsList, CreateComment, Like, UserPhoto, Modal } from "."
import { apiLoader, getTruncatedName } from "../utils"
import APIUrls from "../utils/APIUrls"
import { removePost } from "../actions/posts"
import { connect } from "react-redux"
import { getCdnUrl } from "../constants"
import { Blurhash } from "react-blurhash"
class Post extends React.Component {
	constructor() {
		super()
		this.state = {
			lastDeleteRequest: 0,
			isDeletionConfirmationModalOpen: false,
			mediaIndex: 0,
			shouldShowFullText: false,
			shouldShowComments: false,
		}
	}
	toggleCommentsView = () => {
		this.setState({ shouldShowComments: !this.state.shouldShowComments })
	}
	toggleShowFullText = () => {
		this.setState({ shouldShowFullText: !this.state.shouldShowFullText })
	}
	openConfirmationModal = () => {
		this.setState({ isDeletionConfirmationModalOpen: true })
	}
	closeModal = () => {
		this.setState({ isDeletionConfirmationModalOpen: false })
	}
	deletePost = async () => {
		if (this.state.lastDeleteRequest + 1500 > Date.now()) return
		this.setState({
			lastDeleteRequest: Date.now(),
			isDeletionConfirmationModalOpen: false,
		})
		this.callDeletePostAPI()
	}
	callDeletePostAPI = async () => {
		apiLoader(
			async () => {
				const { post } = this.props
				const url = APIUrls.deletePost(post._id)
				let res = await fetch(url, {
					method: "DELETE",
					credentials: "include",
				})
				let data = await res.json()
				if (data.success) {
					this.props.dispatch(removePost(post._id))
					return [true]
				}
				return [false, data.message]
			},
			{
				success: "Post Deleted",
				error: "whopsies, error in deleting post",
				loading: "deleting post...",
			}
		)
	}
	render() {
		const { post, user } = this.props
		const { isDeletionConfirmationModalOpen, shouldShowFullText } = this.state
		const m = post.media[this.state.mediaIndex]
		return (
			<div className="post-wrapper" key={post._id}>
				{isDeletionConfirmationModalOpen && (
					<Modal
						heading="Really!!, You want to delete this."
						handleClose={this.closeModal}
						handleProceed={this.deletePost}
						handleCancel={this.closeModal}
						text={
							"Are You Really sure you that you want this post to be destroye.d\nThe Consequences will follow,\nI am advicing you like an elder brother, Think well before taking any decision."
						}
					/>
				)}
				<div className="post-header">
					<div className="post-header-left">
						<Link to={`/users/${post.user._id}`} className="post-avatar-link">
							<UserPhoto user={post.user} className="post-avatar" />
						</Link>
					</div>
					<div className="post-header-right">
						<div className="post-header-username">
							<div className="emoji-avatar">
								<p>{post.user.emoji}</p>
							</div>
							<Link to={`/users/${post.user._id}`}>
								<span className="">{getTruncatedName(post.user.name, 25)}</span>
							</Link>
						</div>
						<small className="post-time">
							&nbsp;&nbsp;{prettifyMongooseDate(post.createdAt)}
						</small>
					</div>
				</div>
				<h1 className="post-content">
					<p className="post-text">
						{shouldShowFullText ? post.content : post.content.slice(0, 100)}
						{post.content.length > 100 &&
							(shouldShowFullText ? (
								<button
									onClick={this.toggleShowFullText}
									className="content-toggle-button"
								>
									&nbsp;&nbsp;&nbsp;&nbsp;...less
								</button>
							) : (
								<button
									onClick={this.toggleShowFullText}
									className="content-toggle-button"
								>
									&nbsp;&nbsp;...more
								</button>
							))}
					</p>
					{post.media && post.media.length > 0 && (
						<div className="post-media">
							{m && m.category === "image" && m.blurhash && (
								<Blurhash
									hash={m.blurhash}
									className="blurhash"
									width="100%"
									height="100%"
								/>
							)}
							{m && m.category === "image" && (
								<img
									src={getCdnUrl(m.key)}
									alt={`${post.user.name}'s ${m.category} `}
									crossOrigin="true"
									key={m.key}
									// className={i !== this.state.mediaIndex ? "invisible" : ""}
									loading="lazy"
								/>
							)}
							{m && m.category === "video" && (
								<video
									autoPlay={true}
									muted={true}
									loop={true}
									key={m.key}
									alt={`${post.user.name}'s ${m.category} `}
									crossOrigin="true"
								>
									<source src={getCdnUrl(m.key)} crossOrigin="true" />
									<p>Be Patient!</p>
								</video>
							)}
							{this.state.mediaIndex !== 0 && (
								<button
									className="post-media-prev post-media-nav"
									onClick={() => {
										if (this.state.mediaIndex === 0) return
										this.setState({ mediaIndex: this.state.mediaIndex - 1 })
									}}
								>
									⬅️
								</button>
							)}
							{this.state.mediaIndex !== post.media.length - 1 && (
								<button
									className="post-media-next post-media-nav"
									onClick={() => {
										if (this.state.mediaIndex === post.media.length - 1) return
										this.setState({ mediaIndex: this.state.mediaIndex + 1 })
									}}
								>
									➡️
								</button>
							)}
						</div>
					)}
				</h1>
				<div className="post-actions">
					<Like parent={post} parentType="Post" />
					<div onClick={this.toggleCommentsView}>
						<img src="/comments-icon.png" alt="comments" />
						<span>{post.commentsCount}</span>
					</div>
					{user.id === post.user._id && (
						<div onClick={this.openConfirmationModal}>
							<img src="/delete-icon.png" alt="delete" />
						</div>
					)}
				</div>
				<div>
					<CreateComment postID={post._id} />
					<CommentsList
						post={post}
						shouldShowComments={this.state.shouldShowComments}
					/>
				</div>
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		user: state.auth.user,
	}
}

export default connect(mapStateToProps)(Post)
