import { ACTIONS } from './actions/postActions'

// Define the Post type
export type Post_type = {
	id: number
	title: string
	content: string
	privacy: 'PUBLIC' | 'PRIVATE' | 'ALMOST_PRIVATE'
	author: {
		id: number
		firstName: string
		lastName: string
	}
	createdAt: Date
	mediaUrl?: string
	allowedUsers?: number[]
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
				allowedUsers?: { id: number; firstName: string; lastName: string }[]
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
	isOwnPost: boolean
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

type ProfileAccess = 'SELF' | 'PUBLIC' | 'FOLLOWING' | 'PRIVATE' | 'PRIVATE_PENDING'
export type UserDataProps_type = {
	userId: number
	accessType: ProfileAccess
}
