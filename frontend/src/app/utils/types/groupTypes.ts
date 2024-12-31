import { ACTIONS } from '../actions/groupActions'

export type Group_type = {
	id: number
	name: string
	description: string
	createdAt: string
	creatorId: number
	members: { id: number; firstName: string; lastName: string; role: string }[]
	posts: {
		id: number
		title: string
		content: string
		media: string
		author: UserBasic_type
		createdAt: string
	}[]
}

export type UserBasic_type = {
	id: number
	firstName: string
	lastName: string
}

export type Event_type = {
	id: number
	title: string
	description: string
	date_time: string
	group_id: number
	author: UserBasic_type
	attendees: UserBasic_type[]
}

export type GroupState_type = {
	id: Group_type['id']
	name: Group_type['name']
	description: Group_type['description']
	createdAt: Group_type['createdAt']
	creatorId: Group_type['creatorId']
	members: Group_type['members']
	membershipRole: MembershipRole_type
	loading: boolean
	users: Group_type['members']
	showInviteModal: boolean
	events: Event_type[]
	posts: Group_type['posts']
}

export const GroupState_default: GroupState_type = {
	id: 0,
	name: '',
	description: '',
	createdAt: '',
	creatorId: 0,
	members: [],
	membershipRole: 'NOT_MEMBER',
	loading: true,
	users: [],
	showInviteModal: false,
	events: [],
	posts: [],
}

export type UserResponse_type = {
	ID: number
	FirstName: string
	LastName: string
}

export type MembershipRole_type = 'NOT_MEMBER' | 'PENDING' | 'MEMBER' | 'ADMIN'
export type GroupActions_type =
	| {
			type: typeof ACTIONS.SET_GROUP
			payload: Group_type
	  }
	| {
			type: typeof ACTIONS.SET_GROUP_MEMBERSHIP_ROLE
			payload: MembershipRole_type
	  }
	| {
			type: typeof ACTIONS.SET_LOADING
			payload: boolean
	  }
	| {
			type: typeof ACTIONS.SET_USERS
			payload: Group_type['members']
	  }
	| {
			type: typeof ACTIONS.TOGGLE_INVITE_MODAL
			payload: boolean
	  }
	| {
			type: typeof ACTIONS.SET_EVENTS
			payload: Event_type[]
	  }
	| {
			type: typeof ACTIONS.TOGGLE_EVENT_RSVP
			payload: { eventId: Event_type['id']; attendeeList: UserBasic_type[] }
	  }
