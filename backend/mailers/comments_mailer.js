const { transporter, renderTemplate } = require('../config/nodemailer')
const env = require('../config/environment')


module.exports.newComment = (comment)=> {

	let renderedHTML = renderTemplate({comment: comment}, 'newComment.ejs')
	transporter.sendMail({
		from: env.smtp.auth.user,
		to: comment.user.email,
		subject: "New Comment Published",
		html: renderedHTML,

	}, (err, info) => {
		if(err){console.error('error in sending mail', err); return;}
		return
	})
}