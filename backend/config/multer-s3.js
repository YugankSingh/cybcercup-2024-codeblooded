let aws = require("aws-sdk")
let multer = require("multer")
let multerS3 = require("multer-s3-transform")
let sharp = require("sharp")
let crypto = require("crypto")
const env = require("./environment")
const { encode } = require("blurhash")

aws.config.update({
	secretAccessKey: env.aws_secret_access_key,
	accessKeyId: env.aws_access_key_id,
	region: env.aws_region,
})
const s3 = new aws.S3()

let getRandomKey = () => {
	return crypto.randomBytes(16).toString("hex")
}

const uploadMemoryVideo = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 43200000 / 8,
		files: 1,
	},
})
const uploadMemoryImage = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 1000000,
		files: 1,
	},
})
const uploadMemoryProfilePhoto = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 11000000,
		files: 1,
	},
})
const getBlurHash = imageBuffer =>
	new Promise((resolve, reject) => {
		sharp(imageBuffer)
			.raw()
			.ensureAlpha()
			.resize(32, 32, { fit: "inside" })
			.toBuffer((err, buffer, { width, height }) => {
				if (err) return reject(err)
				resolve(encode(new Uint8ClampedArray(buffer), width, height, 4, 4))
			})
	})
const uploadProfilePhotoS3 = async (req, res, next) => {
	try {
		if (!req.file)
			return next();
		const uploadedImage = await s3
			.upload({
				Bucket: env.aws_s3_bucket_name,
				Key: getRandomKey(),
				Body: await sharp(req.file.buffer)
					.resize(600, 600, {
						fit: sharp.fit.cover,
						withoutEnlargement: true,
					})
					.jpeg({ quality: 70, progressive: true })
					.toBuffer(),
			})
			.promise()
		uploadedImage.blurHash = await getBlurHash(req.file.buffer)
		req.file.s3 = uploadedImage
		next()
	} catch (error) {
		next(error)
	}
}
const uploadImageS3 = async (req, res, next) => {
	try {
		const uploadedImage = await s3
			.upload({
				Bucket: env.aws_s3_bucket_name,
				Key: getRandomKey(),
				Body: await sharp(req.file.buffer)
					.resize(1080, 1080, {
						fit: sharp.fit.inside,
						withoutEnlargement: true,
					})
					.jpeg({ quality: 70, progressive: true })
					.toBuffer(),
			})
			.promise()
		uploadedImage.blurHash = await getBlurHash(req.file.buffer)
		req.file.s3 = uploadedImage
		next()
	} catch (error) {
		next(error)
	}
}
const uploadVideoS3 = async (req, res, next) => {
	try {
		const uploadedVideo = await s3
			.upload({
				Bucket: env.aws_s3_bucket_name,
				Key: getRandomKey(),
				Body: req.file.buffer,
			})
			.promise()
		req.file.s3 = uploadedVideo
		next()
	} catch (error) {
		next(error)
	}
}

module.exports.uploadVideoS3 = uploadVideoS3
module.exports.uploadImageS3 = uploadImageS3
module.exports.uploadMemoryVideo = uploadMemoryVideo
module.exports.uploadMemoryImage = uploadMemoryImage
module.exports.uploadMemoryProfilePhoto = uploadMemoryProfilePhoto
module.exports.uploadProfilePhotoS3 = uploadProfilePhotoS3
module.exports.delete = fileKey => {
	let params = {
		Bucket: env.aws_s3_bucket_name,
		Key: fileKey,
	}

	s3.deleteObject(params, (err, data) => {
		if (err) console.error(err, err.stack)
	})
}
