import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { PostsList, GodsList, ResponsiveRemovalHOC } from "."

class Home extends Component {
	render() {
		const { posts, godsList, auth } = this.props
		return (
			<div className="home">
				{auth.isLoggedIn && (
					<></>
					// <GodsList gods={godsList} />
				)}
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		posts: state.posts,
		auth: state.auth,
		godsList: state.gods,
	}
}

Home.propTypes = {
	posts: PropTypes.array.isRequired,
}

export default connect(mapStateToProps)(Home)
