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
