const env = require("./environment")
const jwt = require("jsonwebtoken")
const RefreshToken = require("../models/refreshToken")

const ExtractJWT = req => {
	let token = null
	if (
		req &&
		req.signedCookies &&
		req.signedCookies.accessToken &&
		req.signedCookies.refreshToken
	) {
		token = {
			accessTokenEnc: req.signedCookies.accessToken,
			refreshTokenEnc: req.signedCookies.refreshToken,
		}
	}
	return token
}

const authenticate = async (req, res, next) => {
	try {
		const tokens = ExtractJWT(req)
		if (tokens == null) return false
		const { accessTokenEnc, refreshTokenEnc } = tokens
		const accessToken = await verifyToken(
			accessTokenEnc,
			env.access_token_secret
		)
		if (!accessToken) return false
		if (isTokenExpired(accessToken, 15 * 60 * 1000)) {
			const refreshToken = await this.verifyRefreshToken(
				refreshTokenEnc,
				accessToken.id
			)
			if (!refreshToken) {
				return false
			}
			await login(res, accessToken.id)
			await refreshToken.remove()
		}
		req.user = { id: accessToken.id }
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

module.exports.getAccessToken = user => {
	const accessToken = jwt.sign(
		{ id: user._id, expiresIn: "15m" },
		env.access_token_secret,
		{
			algorithm: "ES256",
		}
	)
	return accessToken
}
module.exports.getRefreshToken = async user => {
	try {
		const token = await RefreshToken.create({ user: user._id })
		return jwt.sign({ id: token._id }, env.refresh_token_secret, {
			algorithm: "ES256",
		})
	} catch (error) {
		console.error(error)
	}
}
module.exports.deleteRefreshToken = async (req, res) => {
	try {
		if (!req.signedCookies || !req.signedCookies.refreshToken) return
		const token = await verifyToken(
			req.signedCookies.refreshToken,
			env.refresh_token_secret
		)
		if (!token) return
		const refreshToken = await RefreshToken.findById(token.id)
		if (!refreshToken) return
		await refreshToken.remove()
		return
	} catch (error) {
		throw error
	}
}

const verifyToken = (token, secret) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secret, {algorithms: "ES256"},(err, decoded) => {
			if (err) return resolve(false)
			console.log(decoded)
			return resolve(decoded)
		})
	})
}
const isTokenExpired = (token, time) => {
	if (Date.now() - token.iat * 1000 > time) return true
	return false
}

module.exports.verifyRefreshToken = async (jwt, userId) => {
	try {
		const token = await verifyToken(jwt, env.refresh_token_secret)
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
const login = async (res, userID) => {
	try {
		const newRefreshToken = await this.getSessionToken({ _id: userID })
		res.cookie("sessionKey", newRefreshToken, {
			httpOnly: true,
			// sameSite: "lax",
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
