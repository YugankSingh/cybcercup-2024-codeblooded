const express = require("express")
const router = express.Router()
const postsApi = require("../api/posts_api")
const authenticate = require("../config/jwt-authentication").checkAuthentication
const validator = require("../config/validator-mw")
const { body, param } = require("express-validator")
const {
	uploadImageS3,
	uploadMemoryVideo,
	uploadVideoS3,
	uploadMemoryImage,
} = require("../config/multer-s3")

router.get(
	"/get-before/:time",
	param("time").isISO8601().withMessage("Please provide correct time"),
	postsApi.get15Before
)
router.delete(
	"/destroy/:id",
	param("id").isHexadecimal().withMessage("Post Id must be Heaxdecimal"),
	param("id")
		.isLength({ min: 24, max: 24 })
		.withMessage("Post ID must be 24 characters long"),
	validator,
	authenticate(),
	postsApi.destroy
)
router.post(
	"/create",
	authenticate("You must be logged in to create a post"),
	body("content")
		.isLength({ min: 1, max: 1000 })
		.withMessage("Post must be between 1 and 500 characters long"),
	body("isMediaPost")
		.isBoolean()
		.withMessage("Missing Information about post!"),
	validator,
	postsApi.create
)

router.post(
	"/upload-post-image/:id",
	authenticate(),
	postsApi.validateMedia,
	uploadMemoryImage.single("file"),
	uploadImageS3,
	postsApi.addPostMedia("image")
)

router.post(
	"/upload-post-video/:id",
	authenticate(),
	postsApi.validateMedia,
	uploadMemoryVideo.single("file"),
	postsApi.validateVideo,
	uploadVideoS3,
	postsApi.addPostMedia("video")
)

router.post("*", function (req, res) {
	res.status(404).json({
		message: "Sorry, ",
		success: false,
		host: req.originalUrl,
	})
})

module.exports = router
