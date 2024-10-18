const express = require("express")
const router = express.Router()
const authenticate = require("../config/jwt-authentication").checkAuthentication
const validator = require("../config/validator-mw")
const { body, query } = require("express-validator")
const likesApi = require("../api/likes_api")

// likes/toggle/?id=abcdef&type=Post

router.post(
	"/toggle",
	query("id").isHexadecimal().withMessage("Comment Id must be Heaxdecimal"),
	query("id")
		.isLength({ min: 24, max: 24 })
		.withMessage("Comment ID must be 24 characters long"),
		query("type").isIn(["Post", "Comment"]).withMessage('Type must be either "Post" or "Comment" .'),
	validator,
	authenticate("Please Login to like anything"),
	likesApi.toggleLike
)


module.exports = router
