import { ACTIONS } from '../actions/groupListActions'

export type GroupsState_type = {
	groups: Group_type[]
}

export type Group_type = {
	id: number
	name: string
	description: string
	createdAt: string
	creatorId: number
}

export type GroupsActions_type =
	| {
			type: typeof ACTIONS.SET_GROUPS
			payload: Group_type[]
	  }
	| { type: typeof ACTIONS.CREATE_GROUP; payload: Group_type }
