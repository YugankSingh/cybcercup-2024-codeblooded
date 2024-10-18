import { combineReducers } from "redux"
import posts from "./posts"
import auth from "./auth"
import profile from "./profile"
import gods from "./gods"
import search from "./search"
import media from "./uploadedMedia"

export default combineReducers({
	posts,
	auth,
	profile,
	gods,
	search,
	media,
})
