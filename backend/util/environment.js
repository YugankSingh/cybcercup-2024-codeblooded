const fs = require("fs")
const rotatingFS = require("rotating-file-stream")
const path = require("path")

let environment =
	process.env.NODE_ENV == "production" ? "production" : "development"
// let environment = 'development'

const logDirectory = path.join("__dirname", "../logs")
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
const logStream = rotatingFS.createStream("access.log", {
	interval: "1d", // rotate daily
	path: logDirectory,
})

function getEnvironement(environment) {
	if (environment == "production")
		return {
			name: "production",
			app_port: process.env.port || 8080,
			frontend_url: "https://hoomanns.yugank.dev",
			db: process.env.MONGO_DB_URI,
			smtp: {
				host: "smtp.gmail.com",
				service: "gmail",
				port: 587,
				secure: false,
				auth: {
					user: process.env.HOOMANNS_EMAIL_AUTH_USERNAME,
					pass: process.env.HOOMANNS_EMAIL_PASSWORD,
				},
			},
			smtpFromUser: process.env.HOOMANNS_EMAIL_USERNAME,
			hashKeyPassword: process.env.PASSWORD_HASH_KEY,

			aws_access_key_id: process.env.HOOMANNS_AWS_ACCESS_KEY_ID,
			aws_secret_access_key: process.env.HOOMANNS_AWS_SECRET_ACCESS_KEY,
			aws_region: "ap-south-1",
			aws_s3_bucket_name: "hoomanns-production",

			access_token_secret: process.env.HOOMANNS_ACCESS_TOKEN_SECRET,
			refresh_token_secret: process.env.HOOMANNS_REFRESH_TOKEN_SECRET,
			morgan: {
				mode: "combined",
				options: {
					stream: logStream,
				},
			},
		}
	else
		return {
			name: "development",
			app_port: 8000,
			frontend_url: "http://localhost:3000",
			db: "mongodb://127.0.0.1:27017/hoomanns-dev",

			// enter your credentials here
			smtp: {
				host: "smtp.gmail.com",
				service: "gmail",
				port: 587,
				secure: false,
				auth: {
					user: process.env.HOOMANNS_EMAIL_AUTH_USERNAME,
					pass: process.env.HOOMANNS_EMAIL_PASSWORD,
				},
			},
			smtpFromUser: process.env.HOOMANNS_EMAIL_USERNAME,

			hashKeyPassword: process.env.PASSWORD_HASH_KEY,

			access_token_secret: "secret1whiteone",
			refresh_token_secret: "secret2blackone",

			morgan: {
				mode: ":method :url :status :response-time ms - :res[content-length]",
				options: {
					stream: logStream,
				},
			},

			// You need to change these keys
			aws_access_key_id: process.env.HOOMANNS_AWS_ACCESS_KEY_ID,
			aws_secret_access_key: process.env.HOOMANNS_AWS_SECRET_ACCESS_KEY,
			aws_region: "ap-south-1",
			aws_s3_bucket_name: "hoomanns-development",
		}
}

module.exports = {
	...getEnvironement(environment),
	google_client_id:
		"307692190670-aa04tvrnajlcc1b8favb6rd0rd885jsp.apps.googleusercontent.com",
}
