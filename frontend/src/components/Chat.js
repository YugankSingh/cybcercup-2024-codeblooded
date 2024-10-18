import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import io from "socket.io-client"
import "../scss/chats.scss"
import { CHAT_SOCKET_URL } from "../constants"
import toast from "react-hot-toast"

function Chat(props) {
	const [typedMessage, setTypedMessage] = useState("")
	const [messages, setMessages] = useState([])
	const { isPageMode } = props
	const [isHidden, setIsHidden] = useState(!isPageMode)
	const [socket, setSocket] = useState()
	const isLoggedIn = useSelector(store => store.auth.isLoggedIn)
	const { email: userEmail } = useSelector(store => store.auth.user)

	const [isChatReady, setIsChatReady] = useState(false)

	const setupConnection = () => {
		if (!userEmail) {
			toast.error("login to access chat")
			return
		}
		socket.on("connect", () => {
			setIsChatReady(true)
			socket.emit("join_room", {
				user_email: userEmail,
				chatroom: "hoomanns",
			})

			socket.on("user_joined", data => {})
		})
		socket.on("receive_message", data => {
			let message = {
				content: data.message,
				self: data.user_email === userEmail,
			}
			setMessages(messages => {
				return [...messages, message]
			})
		})
	}

	useEffect(() => {
		if (isLoggedIn !== null && !isChatReady) {
			setSocket(io.connect(CHAT_SOCKET_URL))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userEmail])
	useEffect(() => {
		if (socket) setupConnection()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket])

	useEffect(() => {
		// go to the bottom of message
		var element = document.querySelector(".chat-messages")
		element.scrollTop = element.scrollHeight - element.clientHeight
	})

	const handleSubmit = e => {
		if (!typedMessage) {
			toast.error("Enter chat message")
			return
		}

		if (!userEmail) {
			toast.error("Login to have this kid of fun")
			return
		}
		socket.emit("send_message", {
			message: typedMessage,
			user_email: userEmail,
			chatroom: "hoomanns",
		})
		setTypedMessage("")
	}
	const toggleChat = () => {
		if (isPageMode) return
		setIsHidden(isHidden => !isHidden)
	}
	return (
		<div className={`chat-container ${isHidden && "hidden"}`}>
			<div className="chat-header" onClick={toggleChat}>
				{isHidden ? "Chat" : "Divini le Chát"}
				<img
					alt={isHidden ? "Maximize" : "Minimize"}
					src={
						isHidden
							? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuY29tL3N2Z2pzIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeD0iMCIgeT0iMCIgdmlld0JveD0iMCAwIDQ0OCA0NDgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiIGNsYXNzPSIiPjxnPjxwYXRoIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZD0ibTQwOCAxODRoLTEzNmMtNC40MTc5NjkgMC04LTMuNTgyMDMxLTgtOHYtMTM2YzAtMjIuMDg5ODQ0LTE3LjkxMDE1Ni00MC00MC00MHMtNDAgMTcuOTEwMTU2LTQwIDQwdjEzNmMwIDQuNDE3OTY5LTMuNTgyMDMxIDgtOCA4aC0xMzZjLTIyLjA4OTg0NCAwLTQwIDE3LjkxMDE1Ni00MCA0MHMxNy45MTAxNTYgNDAgNDAgNDBoMTM2YzQuNDE3OTY5IDAgOCAzLjU4MjAzMSA4IDh2MTM2YzAgMjIuMDg5ODQ0IDE3LjkxMDE1NiA0MCA0MCA0MHM0MC0xNy45MTAxNTYgNDAtNDB2LTEzNmMwLTQuNDE3OTY5IDMuNTgyMDMxLTggOC04aDEzNmMyMi4wODk4NDQgMCA0MC0xNy45MTAxNTYgNDAtNDBzLTE3LjkxMDE1Ni00MC00MC00MHptMCAwIiBmaWxsPSIjZTBkOWU0IiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBzdHlsZT0iIiBjbGFzcz0iIj48L3BhdGg+PC9nPjwvc3ZnPg=="
							: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuY29tL3N2Z2pzIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeD0iMCIgeT0iMCIgdmlld0JveD0iMCAwIDEyNCAxMjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPgo8ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgoJPHBhdGggZD0iTTExMiw1MEgxMkM1LjQsNTAsMCw1NS40LDAsNjJjMCw2LjYsNS40LDEyLDEyLDEyaDEwMGM2LjYsMCwxMi01LjQsMTItMTJDMTI0LDU1LjQsMTE4LjYsNTAsMTEyLDUweiIgZmlsbD0iI2UwZDllNCIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgc3R5bGU9IiI+PC9wYXRoPgo8L2c+CjxnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwvZz4KPGcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9nPgo8ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8L2c+CjxnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwvZz4KPGcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9nPgo8ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8L2c+CjxnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwvZz4KPGcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9nPgo8ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8L2c+CjxnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwvZz4KPGcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9nPgo8ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8L2c+CjxnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwvZz4KPGcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9nPgo8ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8L2c+CjwvZz48L3N2Zz4="
					}
					height={17}
				/>
			</div>
			<div className="chat-messages">
				{messages.map((message, index) => (
					<div
						key={index}
						className={`chat-bubble ${
							message.self ? "self-chat" : "other-chat"
						} `}
					>
						{message.content}
					</div>
				))}
			</div>

			<div className="chat-footer">
				<input
					type="text"
					value={typedMessage}
					onChange={e => setTypedMessage(e.target.value)}
				/>
				<button
					onClick={handleSubmit}
					className={`${isChatReady ? "chat-ready" : "chat-not-ready"}`}
				>
					Submit
				</button>
			</div>
		</div>
	)
}
export default Chat
