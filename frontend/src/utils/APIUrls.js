import { SERVER_URL } from "../constants"
const API_ROOT = `${SERVER_URL}`

const APIUrls = {
	login: () => `${API_ROOT}/users/login/`,
	googleLogin: () => `${API_ROOT}/users/google-login`,
	logout: () => `${API_ROOT}/users/logout/`,

	resetPasswordMail: email => `${API_ROOT}/reset-password/send-email/${email}`,
	resetPassword: () => `${API_ROOT}/reset-password/reset`,

	// GET request
	getOTP: signupEmail =>
		`${API_ROOT}/users/get-signup-mfa-otp-and-mfa/${signupEmail}`,
	// POST to create a new user
	user: () => `${API_ROOT}/users/`,
	// PATCH to update the data
	userUpdate: () => `${API_ROOT}/users/update`,
	userData: userID => `${API_ROOT}/users/${userID}`,
	startup: () => `${API_ROOT}/users/startup`,

	fetchPosts: time => `${API_ROOT}/posts/get-before/${time}`,
	fetchComments: (postID, beforeTime, number) =>
		`${API_ROOT}/comments/get-before?postID=${postID}&beforeTime=${beforeTime}&number=${number}`,
	// Posts API
	// POST to create post
	// DELETE to remove post

	deletePost: postID => `${API_ROOT}/posts/destroy/${postID}`,
	createPost: () => `${API_ROOT}/posts/create/`,
	uploadPostImage: postID => `${API_ROOT}/posts/upload-post-image/${postID}`,
	uploadPostVideo: postID => `${API_ROOT}/posts/upload-post-video/${postID}`,
	deleteComment: postID => `${API_ROOT}/comments/destroy/${postID}`,
	createComment: () => `${API_ROOT}/comments/create/`,
	like: (id, parentType) =>
		`${API_ROOT}/likes/toggle/?id=${id}&type=${parentType}`,
	fetchSearchResults: searchText => `${API_ROOT}/search/user/${searchText}`,

	// Worshippers APIs
	// POST to add worshipper
	// DELETE to remove worshipper
	worship: userID => `${API_ROOT}/worship/${userID}`,
	listGodsAndWorshippers: () => `${API_ROOT}/worship/get-all`,
}
export default APIUrls
