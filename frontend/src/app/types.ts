// Define the Post type
export type Post_type = {
	id: number
	content: string
	privacy: 'PUBLIC' | 'PRIVATE' | 'ALMOST_PRIVATE'
	author: {
		id: number
		firstName: string
		lastName: string
	}
	createdAt: Date
	mediaUrl?: string
}

// Define the state shape for Posts
export type PostsState_type = {
	posts: Post_type[]
	loading: boolean
	error: string | null
}

// Define the actions for PostsReducer
export type PostsAction_type =
	| { type: string; payload: Post_type[] }
	| { type: string; payload: boolean }
	| { type: string; payload: string | null }

export type PostsContainerProps_type = {
	userId?: string
	feed?: boolean
	isOwnProfile?: boolean
}
