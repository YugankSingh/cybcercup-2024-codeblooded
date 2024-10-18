import {
	SET_MEDIA_LIST
} from "./actionTypes"


export function setMedia(updatedMediaFunct) {
	return {
		type: SET_MEDIA_LIST,
		updatedMediaFunct
	}
}
