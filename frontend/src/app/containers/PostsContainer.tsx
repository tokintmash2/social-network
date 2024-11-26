'use client'

import { useEffect, useReducer } from 'react'
import Post from '../components/Post'
import { Post_type, PostsContainerProps_type, PostsAction_type, PostsState_type } from '../types'

export const ACTIONS = {
	SET_POSTS: 'SET_POSTS',
	SET_LOADING: 'SET_LOADING',
	SET_ERROR: 'SET_ERROR',
}

const initialState: PostsState_type = {
	posts: [],
	loading: false,
	error: null,
}

function reducer(state: PostsState_type, action: PostsAction_type): PostsState_type {
	switch (action.type) {
		case ACTIONS.SET_POSTS:
			return { ...state, posts: action.payload as Post_type[] }
		case ACTIONS.SET_LOADING:
			return { ...state, loading: action.payload as boolean }
		case ACTIONS.SET_ERROR:
			return { ...state, error: action.payload as string | null }
		default:
			return state
	}
}
const dummyPosts: Post_type[] = [
	{
		id: 1,
		content: 'See on esimene postitus',
		privacy: 'PUBLIC',
		author: {
			id: 5,
			firstName: 'Liina-Maria',
			lastName: 'Bakhoff',
		},
		createdAt: new Date(),
		mediaUrl:
			'http://localhost:8080/uploads/avatars/1732523991549884000_Screenshot 2024-10-28 at 19.37.41.png',
	},
	{
		id: 2,
		content: 'See on teine postitus',
		privacy: 'PUBLIC',
		author: {
			id: 5,
			firstName: 'Liina-Maria',
			lastName: 'Bakhoff',
		},
		createdAt: new Date(),
	},
]

export default function PostsContainer({
	userId,
	feed = false,
	isOwnProfile = false,
}: PostsContainerProps_type) {
	const [state, dispatch] = useReducer(reducer, initialState)

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				dispatch({ type: ACTIONS.SET_LOADING, payload: true })
				// Simulating an API call with dummy data
				dispatch({ type: ACTIONS.SET_POSTS, payload: dummyPosts })
			} catch (err) {
				dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to fetch posts' })
				console.error(err)
			} finally {
				dispatch({ type: ACTIONS.SET_LOADING, payload: false })
			}
		}
		fetchPosts()
	}, [userId, feed])

	if (state.loading) {
		return <div>Loading...</div>
	}
	if (state.error) {
		return <div>Error: {state.error}</div>
	}

	return (
		<div>
			{isOwnProfile && <h1 className='text-lg'>My posts</h1>}
			{state.posts.length && !feed && !isOwnProfile && (
				<h1 className='text-lg'>{`${state.posts[0].author.firstName}'s posts`}</h1>
			)}
			<div>Amount of posts: {state.posts.length}</div>
			{state.posts.map(
				(post: Post_type) => (
					console.log('post', post),
					(<Post key={post.id} post={post} dispatch={dispatch} />)
				)
			)}
		</div>
	)
}
