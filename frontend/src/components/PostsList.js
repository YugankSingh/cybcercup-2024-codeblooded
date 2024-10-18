import React from "react"
import { CreatePost } from "."
import Post from "./Post"
import "../scss/Post.scss"
import LazyLoad from "react-lazy-load"
import { useSelector, useDispatch } from "react-redux"
import { fetchMorePosts } from "../actions/posts"

function PostsList() {
	const posts = useSelector(state => state.posts)
	const dispatch = useDispatch()
	const onPostVisible = index => {
		if ((index + 5) % 15 === 0) {
			dispatch(fetchMorePosts(posts))
		}
	}
	return (
		<div className="posts-list">
			<CreatePost />
			{posts.map((post, index) => (
				<LazyLoad
					offset={200}
					onContentVisible={() => onPostVisible(index)}
					key={post._id}
				>
					<Post post={post} key={post._id} />
				</LazyLoad>
			))}
		</div>
	)
}
export default PostsList
