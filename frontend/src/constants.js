export const CDN_URL =
	process.env.NODE_ENV === "development"
		? `https://hoomanns-development.s3.ap-south-1.amazonaws.com/`
		: `https://d1ofktulubdkdx.cloudfront.net/`

export const CHAT_SOCKET_URL =
	process.env.NODE_ENV === "development"
		? `http://localhost:8000`
		: `https://api.hoomanns.yugank.dev`

export const SERVER_URL =
	process.env.NODE_ENV === "development"
		? `http://localhost:8000`
		: `https://api.hoomanns.yugank.dev`

export const getCdnUrl = key => `${CDN_URL}${key}`

export const REACT_APP_GOOGLE_CLIENT_ID =
	"307692190670-aa04tvrnajlcc1b8favb6rd0rd885jsp.apps.googleusercontent.com"

export const UserPhotoURL = key => {
	if (key.startsWith("https://avatars.dicebear.com/api")) return key
	return `${CDN_URL}${key}`
}
