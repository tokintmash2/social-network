import { ACTIONS } from '../actions/postActions'

// Define the Post type
export type Post_type = {
	id: number
	title: string
	content: string
	privacy: 'PUBLIC' | 'PRIVATE' | 'ALMOST_PRIVATE'
	author: UserBasic_type
	createdAt: Date
	mediaUrl?: string | null
	allowedUsers?: number[]
	comments: {
		id: number
		author: UserBasic_type
		content: string
		mediaUrl?: string | null
		createdAt: Date
	}[]
}

// Define the state shape for Posts
export type PostsState_type = {
	posts: Post_type[]
	loading: boolean
	error: string | null
}

// Define the actions for PostsReducer
export type PostsAction_type =
	| {
			type: typeof ACTIONS.SET_POSTS
			payload: Post_type[]
	  }
	| {
			type: typeof ACTIONS.SET_LOADING
			payload: boolean
	  }
	| {
			type: typeof ACTIONS.SET_ERROR
			payload: string | null
	  }
	| {
			type: typeof ACTIONS.SET_POST_PRIVACY
			payload: {
				postId: number
				privacy: 'PUBLIC' | 'PRIVATE' | 'ALMOST_PRIVATE'
				allowedUsers?: number[]
			}
	  }
	| {
			type: typeof ACTIONS.ADD_COMMENT
			payload: {
				postId: number
				comment: {
					id: number
					content: string
					mediaUrl: string | null
					createdAt: Date
					author: UserBasic_type
				}
			}
	  }

// Define the props's type for PostsContainer
export type PostsContainerProps_type = {
	userId?: number
	feed?: boolean
	isOwnProfile?: boolean
}

// Define the props's type for Post component
export type PostProps_type = {
	post: Post_type
	dispatch: (action: PostsAction_type) => void
	followers?: Follower_type[]
	allowedUsers?: Post_type['allowedUsers']
	isOwnPost: boolean
}

export type CommentsContainerProps_type = {
	postId: number
	comments: Post_type['comments']
	dispatch: (action: PostsAction_type) => void
}

export type CommentProps_type = {
	comment: Post_type['comments'][0]
}

export type User = {
	id: number
	email: string
	firstName: string
	lastName: string
	dob: Date
	avatar?: string
	username?: string
	aboutMe?: string
	isPublic: boolean
}

export type UserBasic_type = {
	id: number
	firstName: string
	lastName: string
}

// type ProfileAccess = 'SELF' | 'PUBLIC' | 'FOLLOWING' | 'PRIVATE' | 'PRIVATE_PENDING'
export type UserDataProps_type = {
	userId: number
	isOwnProfile: boolean
}

export type Follower_type = {
	id: number
	firstName: string
	lastName: string
}

export type Message = {
	chat_id: number
	sender_id: number
	sender_name: string
	receiver_id: number
	receiver_name: string
	sent_at: string
	message: string
}

export type Group = {
	id: number
	name: string
	creator_id?: number
	description?: string
	created_at?: Date
}

export type GroupMessage = {
	message_id: number
	group_id: number
	user_id: number
	sent_at: string
	message: string
}