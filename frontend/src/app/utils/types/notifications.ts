export interface Notification {
	id: number
	message: string
	timestamp: string
	type:
		| 'follow'
		| 'follow_request'
		| 'follow_notice'
		| 'group'
		| 'group_request'
		| 'group_member_added'
		| 'comment'
		| 'event_request'
	linkTo: string
	read: boolean
	extra?: string
	requestType?: 'friend' | 'group' | 'event'
	status?: 'pending' | 'accepted' | 'declined'
}
