const env = require("./environment")
const jwt = require("jsonwebtoken")
const UserSession = require("../models/userSession")
const crypto = require("crypto")

const ExtractSessionKey = req => {
	let session = null
	if (
		req &&
		req.signedCookies &&
		req.signedCookies.accessToken &&
		req.signedCookies.refreshToken
	) {
		session = req.signedCookies.sessionKey
	}
	return session
}

const authenticate = async (req, res, next) => {
	try {
		const sessionKey = ExtractSessionKey(req)
		if (sessionKey == null) return false
		const userSession = await UserSession.findOne({ sessionKey: sessionKey })
		if (!userSession || !userSession.user) return false
		if (isTokenExpired(userSession, 4 * 60 * 60 * 1000)) {
			return false
		}
		const clientAgent = req.headers["user-agent"] || "Unknown Client Agent"
		const ipAddress =
			req.headers["x-forwarded-for"] ||
			req.connection.remoteAddress ||
			"Unknown IP Address"
		const macAddress = "N/A"

		if (
			userSession.macAddress !== macAddress ||
			userSession.ipAddress !== ipAddress ||
			userSession.clientAgent !== clientAgent
		)
			return false

		req.user = { id: userSession.user }

		return true
	} catch (error) {
		next(error)
	}
}

module.exports.checkAuthentication = (message, statusCode, failureData) => {
	return async (req, res, next) => {
		try {
			const isAuthenticated = await authenticate(req, res, next)
			if (!isAuthenticated)
				return res.status(statusCode || 401).json({
					message: message || "Please Log in to access this",
					isLoggedIn: false,
					success: false,
					data: failureData || {},
				})
			// req.user = user
			next()
		} catch (error) {
			next(error)
		}
	}
}


module.exports.getSessionKey = async (user, req, res) => {
	try {
		const clientAgent = req.headers["user-agent"] || "Unknown Client Agent"
		const ipAddress =
			req.headers["x-forwarded-for"] ||
			req.connection.remoteAddress ||
			"Unknown IP Address"
		const macAddress = "N/A"

		const token = await UserSession.create({
			user: user._id,
			createdAt: Date.now(),
			lastUsedAt: Date.now(),
			sessionKey: crypto.randomBytes(512).toString("base64"),
			clientAgent,
			macAddress,
			ipAddress,
		})

		return token.sessionKey
	} catch (error) {
		console.error(error)
		res.status(500).send("Internal Server Error") // Send a response in case of error
	}
}

const isTokenExpired = (token, time) => {
	if (Date.now() - token.createdAt.getTime() > time) return true
	return false
}

module.exports.deleteUserSession = async (req, res) => {
	await UserSession.deleteMany({
		user: req.user.id,
	})
}

module.exports.verifySession = async (jwt, userId) => {
	try {
		if (!token) return false
		const refreshToken = await RefreshToken.findById(token.id)
		if (!refreshToken) return false
		// expires in 3 months
		if (isTokenExpired(token, 3 * 30 * 24 * 60 * 60 * 1000)) {
			await refreshToken.remove()
			return false
		}
		if (refreshToken.user != userId) {
			return false
		}
		return refreshToken
	} catch (error) {
		console.error(error)
		return false
	}
}

const login = async (req, res, userID) => {
	try {
		const newSessionKey = await this.getSessionKey({ _id: userID }, req, res)
		res.cookie("sessionKey", newSessionKey, {
			httpOnly: true,
			path: "/",
			maxAge: new Date().getTime() + 500000000,
			sameSite: "strict",
			signed: true,
			// turn this on for it to work in browser
			secure: true,
		})
	} catch (error) {
		throw error
	}
}

module.exports.login = login
module.exports.authenticate = authenticate
