const crypto = require("crypto")
const secretKey =
	"4ea87432a667acf6ed115cfaf261e58f0f4e56da5f9cc653922fe927227f0c51"

function generateSalt(length = 16) {
	return crypto.randomBytes(length).toString("hex") // Generate a random salt
}

function hmacHashWithSalt(text, key, salt) {
	const hmac = crypto.createHmac("sha256", key)
	hmac.update(text + salt)
	return hmac.digest("hex")
}

module.exports.hashPassword = async password => {
	const salt = generateSalt()
	const hashedPassword = hmacHashWithSalt(password, secretKey, salt)
	return { salt, hashedPassword }
}

module.exports.checkPassword = async (passwordHash, password, salt) => {
	const hashedText = hmacHashWithSalt(password, secretKey, salt)
	return hashedText === passwordHash
}
