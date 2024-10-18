const express = require("express")

const router = express.Router()
const worshippersApi = require("../api/worshippers_api")
const authenticate = require("../config/jwt-authentication").checkAuthentication
const validator = require("../config/validator-mw")
const { body, param } = require("express-validator")

router.get(
	"/get-all-gods",
	authenticate(),
	worshippersApi.getAllGods
)

// worship the person
router.post(
	"/:id",
	param("id").isHexadecimal().withMessage("Comment Id must be Heaxdecimal"),
	param("id")
		.isLength({ min: 24, max: 24 })
		.withMessage("Comment ID must be 24 characters long"),
	validator,
	authenticate("You should be logged in to worship someone"),
	worshippersApi.add
)

// worship the person
router.delete(
	"/:id",
	param("id").isHexadecimal().withMessage("Comment Id must be Heaxdecimal"),
	param("id")
		.isLength({ min: 24, max: 24 })
		.withMessage("Comment ID must be 24 characters long"),
	validator,
	authenticate("Please Log in to remove your god"),
	worshippersApi.remove
)

module.exports = router
