const express = require("express")

const router = express.Router()
const usersApi = require("../api/users_api")
const validator = require("../config/validator-mw")
const { param } = require("express-validator")

router.get(
	"/user/:searchText",
	param("searchText")
		.isLength({ min: 1 })
		.withMessage("Please Enter Something to Search"),
	validator,
	usersApi.search
)

module.exports = router
