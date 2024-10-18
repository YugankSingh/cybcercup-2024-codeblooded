import isEmailValid from "./isEmailValid"
import prettifyMongooseDate from "./prettifyMongooseDate"
import getFormBody from "./getFormBody"
import APIUrls from "./APIUrls"
import formatNumber from "./formatNumber"
import apiLoader from "./apiLoader"
import {
	getMediaFileType,
	extractInfoFromFFmpegOutput,
	getCompressedHeightWidth,
} from "./mediaHelpers"

const sleep = async time => {
	return new Promise(resolve => {
		setTimeout(resolve, time)
	})
}

const getTruncatedName = (name, maxLength = 15) => {
	if (name.length < maxLength) return name
	return name.substring(0, maxLength - 1) + "..."
}

export {
	isEmailValid,
	prettifyMongooseDate,
	getFormBody,
	APIUrls,
	formatNumber,
	apiLoader,
	getMediaFileType,
	extractInfoFromFFmpegOutput,
	getCompressedHeightWidth,
	sleep,
	getTruncatedName,
}
