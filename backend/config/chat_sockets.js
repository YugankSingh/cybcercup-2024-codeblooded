const env = require("./environment")
module.exports.chatSockets = function (chatServer) {
	const io = require("socket.io")(chatServer, {
		cors: {
			origin: env.frontend_url,
		},
	})

	io.on("connection", socket => {
		// socket.on('disconnect')

		socket.on("join_room", data => {
			socket.join(data.chatroom)
			io.in(data.chatroom).emit("user_joined", data)
		})

		socket.on("send_message", data => {
			io.in(data.chatroom).emit("receive_message", data)
		})
	})
}
