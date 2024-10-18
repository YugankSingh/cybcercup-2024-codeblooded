import toast from "react-hot-toast"

// pass the messages for laoading, success and error,
// if you pass nothing than default messages will be used
// if you pass false then it will not be called.
// the function should return [true] if no error or it should return [false, "error message"]
const apiLoader = async (funct, msg = {}, onError) => {
	let shouldShowLoad = msg.loading !== false
	let shouldShowSuccess = msg.success !== false
	let shouldShowError = msg.error !== false

	msg = msg || {}
	msg.loading = msg.loading || "Loading..."
	msg.success = msg.success || "Hooray, Successs!"
	msg.error = msg.error || "Oops, something went wrong!"
	if (typeof funct !== "function")
		throw new Error(" Please pass a function as the first argument")
	if (onError && typeof onError !== "function") {
		throw new Error(" Please pass a function as the third argument")
	}

	let toastID
	if (shouldShowLoad) toastID = toast.loading(msg.loading)

	try {
		let [isSuccessful, message] = await funct()

		if (shouldShowLoad) toast.dismiss(toastID)

		if (isSuccessful) {
			if (shouldShowSuccess) toast.success(message || msg.success)
			return
		}
		if (shouldShowError) {
			toast.error(message || msg.error)
			if (onError) onError()
		}
	} catch (error) {
		if (onError) onError()
		if (shouldShowLoad) toast.dismiss(toastID)
		console.error(error)
		toast.error(msg.error)
	}
}

export default apiLoader
