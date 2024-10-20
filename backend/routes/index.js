const express = require("express")
const { request } = require("http")
const router = express.Router()
console.error("router loadaed")

router.use("/users", require("./users"))
router.use("/reset-password", require("./resetPassword"))
router.use("/mfa", require("./mfa"))

// default responses
router.get("*", function (req, res) {
	res.status(404).json({
		message: "Sorry, This route doesn't exist, 😞",
		success: false,
	})
})
router.post("*", function (req, res) {
	res.status(404).json({
		message: "Sorry, This route doesn't exist, 😞",
		success: false,
	})
})
router.patch("*", function (req, res) {
	res.status(404).json({
		message: "Sorry, This route doesn't exist, 😞",
		success: false,
	})
})
router.delete("*", function (req, res) {
	res.status(404).json({
		message: "Sorry, This route doesn't exist, 😞",
		success: false,
	})
})

module.exports = router
