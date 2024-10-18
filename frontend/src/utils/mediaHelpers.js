const getMediaFileType = file => {
	const fileType = file.type.toLowerCase()
	if (fileType === "image/gif" || fileType.includes("video/")) return "video"
	if (file.type.includes("image")) return "image"
	return false
}
const getLineContaining = (str, substring) => {
	let index = str.indexOf(substring)
	if (index === -1) return false
	let line = str.substring(index, str.indexOf("\n", index))
	return line
}

/* this returns
	{ 
		width,
		height,

		?duration,
		?fps,
		?audioBitrate,
	}
	*/
const extractInfoFromFFmpegOutput = (type, ffmpegOutput) => {
	// const info = ffmpegOutput.split("\n")
	let str = ffmpegOutput.toLowerCase()
	let info = {}

	str = str.substring(0, str.indexOf("output"))

	// dimensions
	console.dev(`%c${str}`, "color: #00bb00")
	let videoStr = getLineContaining(str, "video:")
	let dimensions = videoStr
		.match(/, \d{1,5}x\d{1,5}/)[0]
		.substr(2)
		.trimEnd()
		.split("x")
	info.width = Number(dimensions[0])
	info.height = Number(dimensions[1])
	console.dev(dimensions)

	if (type === "video") {
		// duration in seconds
		let durationIndex = str.indexOf("duration")
		let duration = str.substring(durationIndex + 10, durationIndex + 21)
		duration = duration.split(":")
		duration = duration.map(Number)
		duration = duration[0] * 3600 + duration[1] * 60 + duration[2] * 1
		info.duration = duration

		// fps
		let fps = videoStr.match(/, \d+\.?\d* fps,/)[0].slice(2, -5)
		info.fps = Number(fps)
		console.dev(fps)

		// audio bitrate
		let audioStr = getLineContaining(str, "audio")
		console.dev("audio str", audioStr, typeof audioStr, audioStr.match)
		if (!audioStr) info.audioBitrate = 0
		else {
			let audioBitrate = audioStr.match("/, d+ kb/s/")
			audioBitrate = audioBitrate ? audioBitrate[0].slice(2, -5) : 0
			info.audioBitrate = Number(audioBitrate)
		}
	}

	return info
}

const getCompressedHeightWidth = ({ height, width }, maxDimensions) => {
	let newHeight = height,
		newWidth = width
	if (width < maxDimensions && height < maxDimensions) return { height, width }

	if (height > width) {
		newHeight = maxDimensions
		newWidth = (width * maxDimensions) / height
		newWidth = Math.round(newWidth / 2) * 2
	} else {
		newWidth = maxDimensions
		newHeight = (height * maxDimensions) / width
		newHeight = Math.round(newHeight / 2) * 2
	}
	return { height: newHeight, width: newWidth }
}

export {
	getMediaFileType,
	extractInfoFromFFmpegOutput,
	getCompressedHeightWidth,
}
