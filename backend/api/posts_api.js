const Post = require("../models/post")
const UncompletePost = require("../models/uncompletePost")
const Comment = require("../models/comment")
var Readable = require("stream").Readable

module.exports.get15Before = async (req, res, next) => {
	try {
		let { time: startingTime } = req.params
		let posts = await this.returnPostsBefore(startingTime)
		return res.status(200).json({
			success: true,
			data: {
				posts,
			},
			message: "Here are your refreshing new posts.",
		})
	} catch (error) {
		next(error)
	}
}

module.exports.returnPostsBefore = async startingTime => {
	try {
		startingTime = new Date(startingTime)
		let posts = await Post.aggregate()
			.match({ createdAt: { $lte: startingTime } })
			.project({
				commentsCount: { $size: "$comments" },
				user: true,
				content: true,
				media: true,
				createdAt: true,
				likes: true,
			})
			.sort("-createdAt")
			.limit(15)

		posts = await Post.populate(posts, {
			path: "user",
			select: "-password -email -worshippers -gods",
		})
		posts = await Post.populate(posts, ["likes", "user -_id"])

		posts.forEach(post => {
			post.comments = []
		})
		return posts
	} catch (error) {
		throw error
	}
}

module.exports.destroy = async (req, res, next) => {
	try {
		let post = await Post.findById(req.params.id)

		if (!post) {
			return res.status(404).json({
				message: "Post not found",
				success: false,
			})
		}
		if (post.user != req.user.id)
			return res.status(401).json({
				message: "You cannot Delete this Post",
				success: false,
			})
		else {
			post.remove()

			await Comment.deleteMany({ post: post.id })

			return res.status(200).json({
				message: "Post and associated Comments Deleted",
				success: true,
			})
		}
	} catch (error) {
		next(error)
	}
}

module.exports.create = async (req, res, next) => {
	try {
		// please put files here
		const { content, isMediaPost } = req.body

		if (isMediaPost) {
			let post = await UncompletePost.create({
				content: content,
				user: req.user.id,
			})
			return res.status(200).json({
				data: {
					post: post,
				},
				success: true,
				isWaitingForMedia: true,
				message: "Post Created,\nWe'll upload media now,\nPlease Wait",
			})
		}
		let post = await Post.create({
			content: content,
			user: req.user.id,
		})

		post = await post.populate({
			path: "user",
			select: "name avatar emoji",
		})
		return res.status(200).json({
			data: {
				post: post,
			},
			success: true,
			isWaitingForMedia: false,
			message: "post Created!!",
		})
	} catch (error) {
		console.error("error :", error)
		return res.status(500).json({
			message: "Internal Server Error",
		})
	}
}

// todo: implement regular cleanup's for incomeplete posts whose media is not added
module.exports.addPostMedia = category => {
	return async (req, res, next) => {
		try {
			if (!req.file) {
				return res
					.status(404)
					.json({ success: false, message: "No File Uploaded" })
			}

			let key
			if (category == "video") key = req.file.s3.key
			else if (category == "image") key = req.file.s3.key
			else throw new Error("Invalid Media category")

			let mediaObject = {
				category: category,
				key: key,
				blurhash: req.file.s3.blurHash || null,
			}
			await req.post.media.push(mediaObject)
			if (req.body.isLast === "false") {
				await req.post.save()
				return res.status(200).json({ success: true })
			}
			let post = await Post.create({
				content: req.post.content,
				user: req.post.user,
				media: req.post.media,
			})
			post = await post.populate({
				path: "user",
				select: "name avatar emoji blurhash",
			})
			req.post.remove()
			return res.status(200).json({
				data: {
					post: post,
				},
				success: true,
				isWaitingForMedia: false,
				message: "Post Created!!",
			})
		} catch (error) {
			next(error)
		}
	}
}

let ffmpeg = require("fluent-ffmpeg")
const { resolveSoa } = require("dns/promises")
const { post } = require("../routes/posts")
let ffprobePath = require("ffprobe-static").path
ffmpeg.setFfprobePath(ffprobePath)

function bufferToStream(buffer) {
	var stream = new Readable()
	stream.push(buffer)
	stream.push(null)
	return stream
}
async function get_video_data(fileBuffer) {
	const stream = bufferToStream(fileBuffer)
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(stream, (err, meta) => {
			resolve(meta)
		})
	})
}
/*
	"-b:a",
	"60k",
	"-codec:a",
	"aac",
	`${uid}-compressed.mp4`,
	"-hide_banner"

*/

const maxWidth = 1080,
	maxHeight = 1080,
	maxFps = 24.2,
	maxVideoBitrate = 1020000,
	maxAudioBitrate = 70000,
	maxBitrate = 1090000,
	maxDuration = 40000,
	maxFileSize = 43200000
module.exports.validateVideo = async (req, res, next) => {
	try {
		const videoData = await get_video_data(req.file.buffer)

		if (!videoData.streams || !videoData.streams[0]) {
			return res.status(400).json({
				message: "Invalid Video, No Streams Found",
				success: false,
			})
		}

		const size = req.file.size * 8
		const { duration } = videoData.format,
			bitrate = size / duration

		// console.info(duration, maxDuration)
		// console.info(size, maxFileSize)
		// console.info(bitrate, maxBitrate)
		if (duration > maxDuration || size > maxFileSize || bitrate > maxBitrate) {
			return res.status(400).json({
				message: "Invalid Video, Too Long or Too Large",
				success: false,
			})
		}

		const {
			codec_type: vid_codec_type,
			codec_name: vid_codec_name,
			pix_fmt,
			duration: vid_duration,
			width,
			height,
			bit_rate: vid_bit_rate,
			nb_frames: frames,
		} = videoData.streams[0]
		const fps = frames / vid_duration

		// console.info(vid_codec_type)
		// console.info(vid_codec_name)
		// console.info(pix_fmt )
		// console.info(width,maxWidth  )
		// console.info(height,maxHeight  )
		// console.info(fps,maxFps  )
		// console.info(vid_bit_rate, maxVideoBitrate )
		// console.info(frames )
		// console.info(vid_duration )
		if (
			vid_codec_type !== "video" ||
			vid_codec_name !== "h264" ||
			pix_fmt !== "yuv420p" ||
			!width ||
			width > maxWidth ||
			!height ||
			height > maxHeight ||
			!fps ||
			fps > maxFps ||
			!vid_bit_rate ||
			vid_bit_rate > maxVideoBitrate ||
			height > width * 3 ||
			width > height * 3
		) {
			return res.status(400).json({
				message: "Invalid Video, Invalid Codec, Resolution, FPS or Ratio",
				success: false,
			})
		}

		if (videoData.streams[1]) {
			const {
				codec_type: aud_codec_type,
				bit_rate: aud_bit_rate,
				codec_name: aud_codec_name,
				duration: aud_duration,
			} = videoData.streams[1]
			if (
				aud_codec_type != "audio" ||
				aud_codec_name != "aac" ||
				aud_bit_rate > maxAudioBitrate ||
				aud_duration > maxDuration
			) {
				return res.status(400).json({
					message: "Invalid Video, the audio is invalid",
					success: false,
				})
			}
		}
		next()
	} catch (error) {
		next(error)
	}
}

module.exports.validateMedia = async (req, res, next) => {
	try {
		let post = await UncompletePost.findById(req.params.id)

		if (!post) {
			return res.status(404).json({
				message: "Post not found, or post media already added",
				success: false,
			})
		}
		if (post.user != req.user.id)
			return res.status(401).json({
				message: "You cannot Delete this Post",
				success: false,
			})
		req.post = post
		next()
	} catch (error) {
		next(error)
	}
}
