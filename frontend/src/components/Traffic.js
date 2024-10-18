import * as React from "react"
import { useState, useEffect } from "react"
import "./Traffic.scss"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

const Traffic = () => {
	const isLoggedIn = useSelector(state => state.auth.isLoggedIn)

	const [isYellow, setIsYellow] = useState(false)
	const [runningSide, setRunningSide] = useState("left")

	const forceRun = side => {
		if (isYellow)
			return toast.error("You can't change the light when it is yellow.")
		if (!side || !["top", "left", "right", "bottom"].includes(side))
			return toast.error("Invalid traffic side.")

		setIsYellow(true)

		setTimeout(() => {
			document.querySelector(".top video").pause()
			document.querySelector(".left video").pause()
			document.querySelector(".right video").pause()
			document.querySelector(".bottom video").pause()
			document.querySelector(`.${side} video`).play()

			setIsYellow(false)
			setRunningSide(side)
		}, 3000)
	}

	useEffect(() => {}, [])

	return (
		<>
			<div class="diamond-intersection">
				{["top", "left", "right", "bottom"].map(trafficSide => {
					return (
						<div
							class={`traffic-light-wrapper ${trafficSide}`}
							onClick={() => forceRun(trafficSide)}
						>
							<div class="traffic-light">
								<div
									class={`light ${
										runningSide === trafficSide ? "grey" : "red"
									}`}
								></div>
								<div
									class={`light ${
										runningSide === trafficSide && isYellow ? "yellow" : "grey"
									}`}
								></div>

								<div
									class={`light ${
										runningSide === trafficSide && !isYellow ? "green" : "grey"
									}`}
								></div>
							</div>
							<div class="video-container">
								<video
									width="320"
									mute
									loop
									autoPlay={runningSide === trafficSide ? true : false}
								>
									<source src="/video/video1.mp4" type="video/mp4" />
								</video>
							</div>
						</div>
					)
				})}
			</div>
		</>
	)
}

export default Traffic
