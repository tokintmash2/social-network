import { ACTIONS } from '../actions/postActions'

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
	mediaUrl?: string | null
	allowedUsers?: number[]
	comments: {
		id: number
		author: {
			id: number
			firstName: string
			lastName: string
		}
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
					author: {
						id: number
						firstName: string
						lastName: string
					}
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

type ProfileAccess = 'SELF' | 'PUBLIC' | 'FOLLOWING' | 'PRIVATE' | 'PRIVATE_PENDING'
export type UserDataProps_type = {
	userId: number
	isOwnProfile: boolean
}

export type Follower_type = {
	id: number
	firstName: string
	lastName: string
}
