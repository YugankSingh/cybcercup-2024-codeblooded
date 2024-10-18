const express = require("express")

const router = express.Router()
const usersApi = require("../api/users_api")
const {
	checkAuthentication,
	authenticate,
} = require("../config/jwt-authentication")
const {
	uploadProfilePhotoS3,
	uploadMemoryProfilePhoto,
} = require("../config/multer-s3")

const validator = require("../config/validator-mw")
const { body, param } = require("express-validator")

// todo: validate that if the user is not logged in then only do it.
// log in
router.post(
	"/login",
	body("email").isEmail().withMessage("Please enter a valid email"),
	body("password").not().isEmpty().withMessage("Please enter a password"),
	validator,
	usersApi.createSession
)
router.post(
	"/google-login",
	body("token")
		.not()
		.isEmpty()
		.withMessage("Oops, the google token is missing"),
	validator,
	usersApi.googleLogin
)

// log-out
router.post("/logout", checkAuthentication(), usersApi.destroySession)

// load the user data when user opens the app
router.get(
	"/startup",
	async (req, res, next) => {
		req.isAuthenticated = await authenticate(req, res, next)
		next()
	},
	usersApi.startSession
)

// get user with certain user ID
router.get(
	"/:userId",
	param("userId").isHexadecimal().withMessage("UserId must be Heaxdecimal"),
	param("userId")
		.isLength({ min: 24, max: 24 })
		.withMessage("UserId must be 24 characters long"),
	validator,
	checkAuthentication(),
	usersApi.get
)
// create a user with the given data

const createUserChecks = [
	body("email").isEmail().withMessage("Please enter a valid email"),
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
	body("name").not().isEmpty().withMessage("Please enter a Name."),
	body("name")
		.isLength({ min: 1, max: 50 })
		.withMessage("Username can be maximum 50 characters"),
	body("otp")
		.isLength({ min: 6, max: 6 })
		.withMessage("OTP must be six characters"),
]
router.post("/", ...createUserChecks, validator, usersApi.create)
router.get(
	"/get-signup-otp/:email",
	param("email").isEmail().withMessage("Please enter a valid email"),
	validator,
	usersApi.getOTP
)

// update the current user
router.patch(
	"/update",
	checkAuthentication(),
	uploadMemoryProfilePhoto.single("profile_photo"),
	uploadProfilePhotoS3,
	usersApi.update
)

module.exports = router
