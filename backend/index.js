if (process.env.NODE_ENV !== "production") require("dotenv").config()
const express = require("express")
const app = express()
const env = require("./config/environment")
// require('./config/view-helper')(app)
const port = env.app_port
const logger = require("morgan")
const db = require("./config/mongoose")
const cookieParser = require("cookie-parser")
const path = require("path")
const fs = require("fs")
const http = require("http")
const cors = require("cors")

//used for session cookies
const session = require("express-session")
const { checkAuthentication } = require("./config/jwt-authentication")

const MongoStore = require("connect-mongo")(session)

console.info(env.frontend_url)

app.use(
	cors({
		credentials: true,
		maxAge: "360050",
		origin: env.frontend_url,
		// origin: '*',
	})
)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// todo: change this secret
app.use(cookieParser("secret"))

app.use("/uploads", express.static("./uploads"))

app.use(logger(env.morgan.mode, env.morgan.options))

//use express router
app.use("/", require("./routes"))
app.use((err, req, res, next) => {
	if (err.code === "LIMIT_FILE_SIZE" && err.field === "profile_photo")
		return res.status(400).json({
			message: "File size should be less than 10MB",
		})

	if (err.code === "LIMIT_FILE_SIZE")
		return res.status(400).json({
			message: "File size limit exceeded",
		})
	console.error(err.stack)
	return res.status(500).json({
		message: "Internal Server Error",
	})
})

app.post("/mfa/setup", checkAuthentication(), (req, res) => {
	const { username } = req.body

	// Generate a secret for the user
	const secret = speakeasy.generateSecret({
		name: `Traffic Manager (${username})`,
	})

	// Store the secret key against the user (in a real app, save it in the database)
	users[username] = { secret: secret.base32 }

	// Generate a QR code for the secret
	qrcode.toDataURL(secret.otpauth_url, (err, dataURL) => {
		if (err) {
			return res.status(500).json({ error: "Failed to generate QR code" })
		}

		res.json({ qrCode: dataURL, secret: secret.base32 })
	})
})

// Route to verify the user's OTP
app.post("/mfa/verify", checkAuthentication(), (req, res) => {
	const { username, token } = req.body

	const user = users[username]
	if (!user) {
		return res.status(404).json({ error: "User not found" })
	}

	// Verify the token with the user's secret
	const isValid = speakeasy.totp.verify({
		secret: user.secret,
		encoding: "base32",
		token: token,
	})

	if (isValid) {
		res.json({ verified: true })
	} else {
		res.status(400).json({ error: "Invalid token" })
	}
})

const Server = http.createServer(app)
const chatSockets = require("./config/chat_sockets").chatSockets(Server)

Server.listen(env.app_port, err => {
	if (err) {
		console.error("error in connecting to the port : ", port)
		return
	}
	console.info("successfully connected to the port : ", port)

	console.info("find me on http://localhost:" + port)
})
