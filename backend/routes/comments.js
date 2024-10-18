const express = require("express")

const router = express.Router()
const commentsApi = require("../api/comments_api")
const authenticate = require("../config/jwt-authentication").checkAuthentication
const validator = require("../config/validator-mw")
const { body, param, query } = require("express-validator")

router.get(
	"/get-before",
	query("postID").isHexadecimal().withMessage("Post Id must be Heaxdecimal"),
	query("postID")
		.isLength({ min: 24, max: 24 })
		.withMessage("Post ID must be 24 characters long"),
	query("beforeTime").isISO8601().withMessage("Please provide correct time"),
	query("number").isNumeric().withMessage("Invalid number of comments"),
	validator,
	commentsApi.fetchCommentsBefore
)

router.delete(
	"/destroy/:id",
	param("id").isHexadecimal().withMessage("Comment Id must be Heaxdecimal"),
	param("id")
		.isLength({ min: 24, max: 24 })
		.withMessage("Comment ID must be 24 characters long"),
	validator,
	authenticate(),
	commentsApi.destroy
)
router.post(
	"/create",
	body("post").isHexadecimal().withMessage("Post Id must be Heaxdecimal"),
	body("post")
		.isLength({ min: 24, max: 24 })
		.withMessage("Post ID must be 24 characters long"),
	body("content")
		.isLength({ min: 1, max: 500 })
		.withMessage("Comment must be between 1 and 500 characters long"),
	validator,
	authenticate(),
	commentsApi.create
)

module.exports = router
