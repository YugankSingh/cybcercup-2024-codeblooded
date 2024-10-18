const { transporter, renderTemplate } = require("../util/nodemailer")
const env = require("../util/environment")

module.exports = token => {
	let renderedHTML = renderTemplate(
		{ token: token, frontend_url: env.frontend_url },
		"forgotPassword.ejs"
	)
	transporter.sendMail(
		{
			from: env.smtpFromUser,
			to: token.user.email,
			subject: "Forgot Password?? We are here to HELP :) ",
			html: renderedHTML,
		},
		(err, info) => {
			if (err) {
				console.error("error in sending mail", err)
				return
			}
			return
		}
	)
}
