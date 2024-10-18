const mongoose = require("mongoose")
const env = require("./environment")

mongoose.connect(env.db, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on("error", console.error.bind(console, "Error connecting to MongoDB"))
db.once("open", () => {
	console.info("connected to the db")
})

module.exports = db
