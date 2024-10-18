const { validationResult } = require('express-validator');
module.exports = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		let msg = errors.array().map((error) => error.msg);
		msg = msg.join("\n")
			return res.status(400).json({
					success: false,
					message: msg
			});
	}
	next();
}