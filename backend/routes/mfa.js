const express = require("express")
const router = express.Router()
const authenticate = require("../util/session").checkAuthentication
const validator = require("../util/validator-mw")
const { body, query } = require("express-validator")


// Route to verify the user's OTP
router.post("/verify", async (req, res) => {
	const { username, token } = req.body

	try {
		// Find the user in the database
		const user = await User.findOne({ username })
		if (!user || !user.mfaSecret) {
			return res.status(404).json({ error: "User not found or MFA not set up" })
		}

		// Verify the token with the user's secret
		const isValid = speakeasy.totp.verify({
			secret: user.mfaSecret,
			encoding: "base32",
			token,
		})

		if (isValid) {
			res.json({ verified: true })
		} else {
			res.status(400).json({ error: "Invalid token" })
		}
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Server error" })
	}
})

module.exports = router
