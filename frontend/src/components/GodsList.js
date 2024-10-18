import React from "react"
import { Link } from "react-router-dom"
import "../scss/godsList.scss"
import { UserPhoto } from "./"
import { useSelector } from "react-redux"

const GodsList = props => {
	// let { gods } = props
	const gods = useSelector(state => state.gods) || []

	// gods = gods || []
	return (
		<div className="gods-list-wrapper">
			<div className="gods-list-button">
				<Link to="/godslist" className="round-button">
					<img src="/gods-list.svg" alt="Gods List" />
				</Link>
			</div>
			<div className="gods-list">
				<div className="header">Gods</div>

				{gods.length === 0 && <div className="no-gods">No Gods</div>}

				{gods.map(god => (
					<div key={god._id}>
						<Link className="gods-item" to={`/users/${god._id}`}>
							<div className="gods-img">
								<UserPhoto user={god} />
								{/* <img
									src={
										god.avatar
											? `${SERVER_URL}${god.avatar}`
											: "https://image.flaticon.com/icons/svg/2154/2154651.svg"
									}
									alt="User Avatar"
								/> */}
							</div>
							<div className="gods-name">{god.name}</div>
						</Link>
					</div>
				))}
			</div>
		</div>
	)
}

export default GodsList
