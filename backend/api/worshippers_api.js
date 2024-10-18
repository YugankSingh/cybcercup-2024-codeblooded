const User = require("../models/user")

module.exports.getAllGods = async (req, res) => {
	try {
		let user = await User.findById(req.user.id)
			.select("gods worshippers")
			.populate("gods", "name avatar")

		return res.status(200).json({
			message: "Here is your gods list",
			data: {
				gods: user.gods,
			},
			success: true,
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			message: "Internal Server Error",
		})
	}
}

module.exports.add = async (req, res) => {
	try {
		let godID = req.params.id,
			user = req.user
		if (godID == user.id) {
			return res.status(406).json({
				message: "yOU cAN'T  wORSHIP yOURSELF, tHAT'S nOT a gOOD iDEA",
			})
		}

		await User.findByIdAndUpdate(user.id, {
			$addToSet: { gods: godID },
		})
		await User.findByIdAndUpdate(godID, {
			$addToSet: { worshippers: user.id },
		})
		
		return res.status(200).json({
			message: "God worshipped successfully",
			success: true,
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			message: "Internal Server Error",
		})
	}
}

// DELETE /worship/id=abcdefghijklmno
module.exports.remove = async (req, res) => {
	try {
		let godID = req.params.id
		let user = req.user

		await User.findByIdAndUpdate(user.id, {
			$pull: { gods: godID },
		})
		await User.findByIdAndUpdate(godID, {
			$pull: { worshippers: user.id },
		})

		return res.status(200).json({
			message: "God un-worshipped Successfully",
			success: true,
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			message: "Internal Server Error",
		})
	}
}
