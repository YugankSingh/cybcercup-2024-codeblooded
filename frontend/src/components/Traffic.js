import * as React from "react"
import "./Traffic.scss"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

const Traffic = () => {
	const isLoggedIn = useSelector(state => state.auth.isLoggedIn)
	return (
<>
<div class="diamond-intersection">
        
        <div class="traffic-light-wrapper top">
            <div class="traffic-light">
                <div class="light red"></div>
                <div class="light grey"></div>
                <div class="light grey"></div>
            </div>
			<div class="video-container">
				<video width="320" height="240"  mute autoPlay loop>
					<source src="/video/video1.mp4" type="video/mp4"/>
				</video>
			</div>
        </div>
        
        <div class="traffic-light-wrapper right">
            <div class="traffic-light">
                <div class="light grey"></div>
                <div class="light yellow"></div>
                <div class="light grey"></div>
            </div>

			<div class="video-container">
				<video width="320" height="240"  mute autoPlay loop>
					<source src="/video/video2.mp4" type="video/mp4"/>
				</video>
			</div>
        </div>

		<div class="traffic-light-wrapper left">
            <div class="traffic-light">
                <div class="light grey"></div>
                <div class="light grey"></div>
                <div class="light green"></div>
            </div>

			<div class="video-container">
				<video width="320" height="240"  mute autoPlay loop>
					<source src="/video/video3.mp4" type="video/mp4"/>
				</video>
			</div>
        </div>
        
        <div class="traffic-light-wrapper bottom">
            <div class="traffic-light">
                <div class="light red"></div>
                <div class="light grey"></div>
                <div class="light grey"></div>
            </div>

			<div class="video-container">
				<video width="320" height="240"  mute autoPlay loop >
					<source src="/video/video4.mp4" type="video/mp4"/>
				</video>
			</div>
        </div>
        
        
    </div>


</>	)
}

export default Traffic
