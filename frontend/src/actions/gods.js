import {
	ADD_GOD,
	REMOVE_GOD,
	ADD_GODS_LIST,
	REMOVE_GODS_LIST,
} from "./actionTypes"

export function addGodsList(godsList) {
	console.table("list is ", godsList)
	return {
		type: ADD_GODS_LIST,
		gods: godsList,
	}
}

export function removeGodsList() {
	return {
		type: REMOVE_GODS_LIST,
	}
}

export function addGod(god) {
	return {
		type: ADD_GOD,
		god,
	}
}

export function removeGod(godID) {
	return {
		type: REMOVE_GOD,
		godID,
	}
}
