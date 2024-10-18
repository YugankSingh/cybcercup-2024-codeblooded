import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { addSearchResults } from "../actions/search"
import { APIUrls, apiLoader } from "../utils"
import { UserPhoto } from "./"
import "../scss/Search.scss"

function Search(props) {
	const [content, setContent] = useState("")
	const [apiCallTimout, setApiCallTimout] = useState(null)
	const dispatch = useDispatch()
	const searchResults = useSelector(state => state.search)

	useEffect(() => {
		clearTimeout(apiCallTimout)
		if (!content) return
		let apiCallTimoutLocal = setTimeout(async () => {
			const searchResult = await callSearchAPI()
			dispatch(addSearchResults(searchResult))
		}, 200)
		setApiCallTimout(apiCallTimoutLocal)
		// eslint-disable-next-line
	}, [content])

	const handleChange = async event => {
		setContent(event.target.value)
	}

	const callSearchAPI = async () => {
		let results = []
		await apiLoader(
			async () => {
				const url = APIUrls.fetchSearchResults(content)
				let res = await fetch(url, {
					method: "GET",
					credentials: "include",
				})
				let data = await res.json()
				if (data.success) {
					results = data.data.result
					return [true]
				}
				return [false, data.message]
			},
			{
				success: false,
				error: "error in fetching search results",
				loading: ".",
			}
		)
		return results
	}
	return (
		<div className="search-container">
			<span className="search-icon">🔍</span>
			<input placeholder="Search" onChange={handleChange} value={content} />

			{searchResults.length > 0 && content && (
				<div className="search-results">
					<ul>
						{searchResults.map(user => (
							<Link
								to={`/users/${user._id}`}
								key={user._id + "" + Math.random()}
							>
								<li className="search-results-row">
									<UserPhoto user={user} />
									<span className="user-name-search">{user.name}</span>
								</li>
							</Link>
						))}

						{searchResults.map(user => (
							<Link
								to={`/users/${user._id}`}
								key={user._id + "" + Math.random()}
							>
								<li className="search-results-row">
									<UserPhoto user={user} />
									<span className="user-name-search">{user.name}</span>
								</li>
							</Link>
						))}

						{searchResults.map(user => (
							<Link
								to={`/users/${user._id}`}
								key={user._id + "" + Math.random()}
							>
								<li className="search-results-row">
									<UserPhoto user={user} />
									<span className="user-name-search">{user.name}</span>
								</li>
							</Link>
						))}

						{searchResults.map(user => (
							<Link
								to={`/users/${user._id}`}
								key={user._id + "" + Math.random()}
							>
								<li className="search-results-row">
									<UserPhoto user={user} />
									<span className="user-name-search">{user.name}</span>
								</li>
							</Link>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default Search
