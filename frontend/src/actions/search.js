import {
	ADD_SEARCH_RESULTS
} from "./actionTypes"


export function addSearchResults(result) {
	return {
		type: ADD_SEARCH_RESULTS,
		result
	}
}
