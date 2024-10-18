const express = require("express")
const router = express.Router()
const authenticate = require("../util/session").checkAuthentication
const validator = require("../util/validator-mw")
const { body, query } = require("express-validator")

router.get("/setup", async (req, res) => {
	console.log("hello")
	return

	const { username } = req.body

	try {
		// Find or create user in the database
		let user = await User.findOne({ username })
		if (!user) {
			user = new User({ username })
			await user.save()
		}

		// Generate a secret for the user
		const secret = speakeasy.generateSecret({
			name: `YourAppName (${username})`,
		})

		// Update the user's MFA secret in the database
		user.mfaSecret = secret.base32
		await user.save()

		// Generate a QR code for the secret
		qrcode.toDataURL(secret.otpauth_url, (err, dataURL) => {
			if (err) {
				return res.status(500).json({ error: "Failed to generate QR code" })
			}
			res.json({ qrCode: dataURL, secret: secret.base32 })
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Server error" })
	}
})

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
