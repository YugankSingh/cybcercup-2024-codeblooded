export default function getFormBody(params, type) {
	if (type === "multipart") {
		let formBody = new FormData()
		for (let property in params) {
			const value = params[property]
			if (Array.isArray(value))
				for (let val of value) {
					formBody.append(property, val)
				}
			else formBody.append(property, value)
		}
		return formBody
	}

	let formBody = []
	for (let property in params) {
		let encodedKey = encodeURIComponent(property)
		let encodedProperty = encodeURIComponent(params[property])
		formBody.push(encodedKey + "=" + encodedProperty)
	}
	return formBody.join("&")
}
