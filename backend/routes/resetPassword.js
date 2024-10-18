const express = require("express")

const router = express.Router()
const resetPasswordApi = require("../api/reset_password_api")
const { checkAuthentication, authenticate } = require("../util/session")
const upload = require("../util/multer-s3").upload

const validator = require("../util/validator-mw")
const { body, param } = require("express-validator")

// todo: validate that if the user is not logged in then only do it.
// log in
router.get(
	"/send-email/:email",
	param("email").isEmail().withMessage("Please enter a valid email"),
	validator,
	resetPasswordApi.sendMail
)

// todo: complete this
router.post(
	"/reset",
	body("token").not().isEmpty().withMessage("Oops, the token is missing"),

	body("user_id")
		.isLength({ min: 24, max: 24 })
		.withMessage("Post ID must be 24 characters long"),
	body("password")
		.not()
		.isEmpty()
		.withMessage("Please enter a password.")
		.isLength(7)
		.withMessage("Password must be at least 7 characters long."),

	body("confirm_password")
		.not()
		.isEmpty()
		.withMessage("Please enter Confirm Password."),

	validator,
	resetPasswordApi.reset
)

module.exports = router
