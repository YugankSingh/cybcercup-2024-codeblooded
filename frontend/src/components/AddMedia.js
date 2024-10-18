import React, { useState, useEffect, useRef } from "react"
import "../scss/AddMedia.scss"
import toast from "react-hot-toast"
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"
import {
	getMediaFileType,
	extractInfoFromFFmpegOutput,
	getCompressedHeightWidth,
	sleep,
} from "../utils"
import { setMedia as setMediaRedux } from "../actions/uploadMedia"
import { useSelector, useDispatch } from "react-redux"

const ffmpeg = createFFmpeg({
	corePath: "/ffmpeg-core.js",
})

let uid = 0
let ffmpegOutput = ""
let isFFmpegBusy = false
let isFFmpegLoading = false

function AddMedia() {
	const media = useSelector(store => store.media)
	const dispatch = useDispatch()
	const setMedia = updatedMediaFunct => {
		dispatch(setMediaRedux(updatedMediaFunct))
	}

	const [isLibReady, setIsLibReady] = useState(false)
	const cancelEverything = useRef(false)
	const toasts = useRef([])

	// this is to get the output for files so that, it can be used to determine the characteristic of the file.
	ffmpeg.setLogger(({ message, type }) => {
		console.dev(type, message)
		if (type !== "info")
			ffmpegOutput += message + "\n"
	})
	ffmpeg.setProgress(({ ratio, time }) => {
		let percentage = Math.floor(ratio * 100)
		const { text, toastID } = toasts.current[0]
		if (Number.isNaN(percentage)) percentage = 0
		toast.loading(`${text} ${percentage}%`, { id: toastID })
	})

	const load = async () => {
		if (ffmpeg.isLoaded()) {
			isFFmpegLoading = false
			setIsLibReady(true)
			return
		}
		isFFmpegLoading = true
		const toastID = toast.loading("loading magic dust...")
		await ffmpeg.load()
		if (!cancelEverything.current) setIsLibReady(true)
		isFFmpegLoading = false
		toast.dismiss(toastID)
	}

	const createToast = text => {
		const toastID = toast.loading(text)
		toasts.current.push({ text, toastID })
		return toastID
	}
	const removeToast = toastID => {
		toast.dismiss(toastID)
		toasts.current = toasts.current.filter(toast => toast.toastID !== toastID)
	}

	useEffect(() => {
		if (!isFFmpegLoading) load()
		return async () => {
			try {
				cancelEverything.current = true
				toasts.current.forEach(({ toastID }) => toast.dismiss(toastID))
				if (ffmpeg.isLoaded() && isFFmpegBusy) {
					ffmpeg.exit()
				}
			} catch (error) {
				if (error.name === "ExitStatus") return
				console.error(error)
				toast.error("Oops some unexpected erro, :(")
			} finally {
				isFFmpegBusy = false
			}
		}
	}, [])

	if (!isLibReady) {
		return (
			<div className="add-media-wrapper">
				<div className="loader">
					<h2>Loading...</h2>
					<strong>Compression magic dust is being loaded.</strong>
				</div>
			</div>
		)
	}

	/*mediaObject = {
		dataUrl,
		fileObject,
		id: ""
		
		type: "image" || "video",

		// these we'll get from ffmpegoutput
		height,
		width,
		?fps,
		?audioBitrate,
		?duration
	}
	*/
	const handleMediaChange = async e => {
		try {
			const newMediaFiles = [...e.target.files]
			let newMedia = []

			if (newMediaFiles.length + media.length > 10) {
				toast.error("Sorry, You can upload only upto 10 files.")
				return
			}

			// get details about the file
			for (let i = 0; i < newMediaFiles.length; i++) {
				if (cancelEverything.current) break
				let file = newMediaFiles[i]
				const toastID = createToast(`Processing ${file.name}`)
				let newMediaObj = await convertMediaFile(file)

				removeToast(toastID)
				if (cancelEverything.current) break
				if (newMediaObj.type === "video" && newMediaObj.duration > 40) {
					toast.error(
						`${file.name} is too long.\nUpload a file of less than 40 seconds.`
					)
					continue
				}
				if (cancelEverything.current) break
				setMedia(oldMedia => [...oldMedia, newMediaObj])
				newMedia.push(newMediaObj)
			}

			// compress files
			for (let i = 0; i < newMedia.length; i++) {
				if (cancelEverything.current) break
				let currMedia = newMedia[i]
				await compressMedia(currMedia)
			}
		} catch (error) {
			console.error(error)
		}
	}

	const convertMediaFile = async file => {
		let fileObject = {
			fileObject: file,
		}

		const type = getMediaFileType(file)
		if (!type) throw new Error("File type not supported")
		fileObject.type = type

		// get the data from ffmpeg
		while (isFFmpegBusy) {
			await sleep(50)
		}
		isFFmpegBusy = true
		ffmpeg.FS("writeFile", `${uid}`, await fetchFile(file))
		ffmpegOutput = ""
		await ffmpeg.run(
			"-i",
			`${uid}`,
			"-hide_banner",
			"-t",
			"1us",
			`${uid}-trash`
		)
		console.dev(ffmpegOutput)
		if (cancelEverything.current) return
		// ffmpeg.FS("unlink", `${uid}-trash`)
		isFFmpegBusy = false
		if (cancelEverything.current) return
		fileObject = {
			...fileObject,
			...extractInfoFromFFmpegOutput(type, ffmpegOutput),
			dataUrl: URL.createObjectURL(file),
			uid,
			isCompressed: false,
		}
		uid++

		return fileObject
	}

	const compressMedia = async currMedia => {
		let { uid, type, fileObject } = currMedia
		while (isFFmpegBusy) {
			await sleep(50)
		}

		const toastID = createToast(`compressing ${fileObject.name}...`)
		isFFmpegBusy = true

		let mimeType = "",
			compressedFileName = ""
		if (type === "video") {
			compressedFileName = await compressVideo(currMedia)
			mimeType = "video/mp4"
		} else if (type === "image") {
			compressedFileName = await compressImage(currMedia)
			mimeType = "image/jpeg"
		}
		const data = ffmpeg.FS("readFile", compressedFileName)
		const compressedFile = new File([data.buffer], compressedFileName, {
			type: mimeType,
		})
		ffmpeg.FS("unlink", compressedFileName)
		ffmpeg.FS("unlink", `${uid}`)

		removeToast(toastID)
		if (cancelEverything.current) return
		setMedia(media =>
			media.map(m => {
				if (m.uid === uid) {
					return {
						...m,
						isCompressed: true,
						compressedFile,
						dataUrl: URL.createObjectURL(compressedFile),
					}
				}
				return m
			})
		)
		isFFmpegBusy = false
	}

	// returns the name of the compressed file
	const compressImage = async media => {
		const maxDimensions = 1080
		const { height, width } = getCompressedHeightWidth(media, maxDimensions)
		const { uid } = media
		await ffmpeg.run(
			"-i",
			`${media.uid}`,
			"-hide_banner",
			"-filter:v",
			`scale=${width}:${height}`,
			`${uid}-compressed.jpg`
		)
		return `${uid}-compressed.jpg`
	}
	const compressVideo = async media => {
		const maxDimensions = 800,
			maxFPS = 24
		const { height, width } = getCompressedHeightWidth(media, maxDimensions)
		const fps = Math.min(maxFPS, media.fps)
		const { uid } = media
		// ffmpeg -i in.mp4 -filter:v scale=$width:$height -crf 25 -maxrate 1000k -bufsize 1500k -r 24 -codec:v libx264 -movflags +faststart -pix_fmt yuv420p -b:a 60k -codec:a aac out.mp4  -hide_banner
		// ffmpeg -i in.mp4 -filter:v scale=1080:1080 -crf 25 -maxrate 1000k -bufsize 1500k -r 24 -codec:v libx264 -movflags +faststart -pix_fmt yuv420p -b:a 60k -codec:a aac out.mp4  -hide_banner
		await ffmpeg.run(
			"-i",
			`${uid}`,
			"-filter:v",
			`scale=${width}:${height}`,
			"-crf",
			"25",
			"-maxrate",
			"1000k",
			"-bufsize",
			"1500k",
			"-r",
			`${fps}`,
			"-codec:v",
			"libx264",
			"-pix_fmt",
			"yuv420p",
			"-movflags",
			"+faststart",
			"-b:a",
			"60k",
			"-codec:a",
			"aac",
			`${uid}-compressed.mp4`,
			"-hide_banner"
		)
		return `${uid}-compressed.mp4`
	}

	const deleteMedia = uid => {	
		let mediaIndex = media.findIndex(m => m.uid === uid)
		if (mediaIndex === -1) {
			toast.error("Sorry, the media doesn't exist.")
			return;
		}
		if (media[mediaIndex].isCompressed) {
			setMedia(oldMedia => oldMedia.filter(m => m.uid !== uid))
			return;
		}
		toast.error("You can delete after compression is done.")
	}
	return (
		<div className="add-media-wrapper">
			<div className="add-media">
				<label htmlFor="media-input" id="media-input-label">
					Upload <img src="/upload-solid.svg" height={20} alt="⬆️" />
				</label>
				<input
					type="file"
					name="media"
					id="media-input"
					accept="image/*,video/*"
					onChange={e => handleMediaChange(e)}
					multiple
					value={""}
				/>
			</div>
			<div className="media-preview">
				{media.map((file, index) => {
					if (file.type === "image")
						return (
							<div className="media-preview-item">
								<img
									src={file.dataUrl}
									key={file.dataUrl}
									height="100px"
									alt="Uploaded"
									className={`${file.isCompressed ? "ready" : ""}`}
									compressed={`${file.isCompressed}`}
								/>{" "}
								<button onClick={() => deleteMedia(file.uid)}>x</button>
							</div>
						)
					else if (file.type === "video")
						return (
							<div className="media-preview-item">
								<video
									autoPlay={true}
									muted={true}
									loop={true}
									key={file.dataUrl}
									height="100px"
									className={`${file.isCompressed ? "ready" : ""}`}
									compressed={`${file.isCompressed}`}
								>
									<source src={file.dataUrl} />
									<p>Be Patient!</p>
								</video>
								<button onClick={() => deleteMedia(file.uid)}>x</button>
							</div>
						)
					return <></>
				})}
			</div>
		</div>
	)
}

export default AddMedia
