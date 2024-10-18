import React from "react"
import { Chat } from "./"

function ChatPage(props) {
	return (
		<div id="chat-page">
			<Chat isPageMode={true} />
		</div>
	)
}

export default ChatPage
