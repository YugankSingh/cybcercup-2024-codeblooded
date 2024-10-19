const { transporter, renderTemplate } = require("../util/nodemailer")
const env = require("../util/environment")

module.exports = otp => {
	let renderedHTML = renderTemplate({ otp }, "signupOTP.ejs")
	transporter.sendMail(
		{
			from: env.smtpFromUser,
			to: otp.email,
			subject: "OTP is here, here is your Sign Up OTP",
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
