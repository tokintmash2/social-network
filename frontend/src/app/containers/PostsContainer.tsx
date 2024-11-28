'use client'

import { useEffect, useReducer } from 'react'
import Post from '../components/Post'
import {
	Post_type,
	PostsContainerProps_type,
	PostsAction_type,
	PostsState_type,
} from '../utils/types'
import { useLoggedInUser } from '../context/UserContext'
import { dummyPosts } from '../dummyData'
import { ACTIONS } from '../utils/actions/postActions'

function reducer(state: PostsState_type, action: PostsAction_type): PostsState_type {
	switch (action.type) {
		case ACTIONS.SET_POSTS:
			return { ...state, posts: action.payload as Post_type[] }
		case ACTIONS.SET_LOADING:
			return { ...state, loading: action.payload as boolean }
		case ACTIONS.SET_ERROR:
			return { ...state, error: action.payload as string | null }
		case ACTIONS.SET_POST_PRIVACY:
			return {
				...state,
				posts: state.posts.map((post) => {
					if (post.id === (action.payload as any).postId) {
						return {
							...post,
							privacy: (action.payload as any).privacy,
							allowedUsers: (action.payload as any).allowedUsers || post.allowedUsers,
						}
					}
					return post
				}),
			}
		default:
			return state
	}
}

export default function PostsContainer({
	userId,
	feed = false,
	isOwnProfile = false,
}: PostsContainerProps_type) {
	const [state, dispatch] = useReducer(reducer, { posts: [], loading: false, error: null })

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

	const { loggedInUser } = useLoggedInUser()

	return (
		<div className='mb-4'>
			{/* Header */}
			{isOwnProfile ? (
				<h1 className='text-2xl font-bold text-primary mb-4'>My Posts</h1>
			) : (
				state.posts.length > 0 &&
				!feed && (
					<h1 className='text-2xl font-bold text-secondary mb-4'>
						{`${state.posts[0].author.firstName}'s Posts`}
					</h1>
				)
			)}

			{/* Post Count */}
			<div className='text-sm text-gray-500 mb-4'>
				<span className='font-semibold'>Total posts:</span> {state.posts.length}
			</div>

			{/* Posts List */}
			<div className='space-y-4 flex flex-col'>
				{state.posts.map((post: Post_type) => (
					<Post
						key={post.id}
						post={post}
						dispatch={dispatch}
						isOwnPost={post.author.id === loggedInUser?.id}
					/>
				))}
			</div>
		</div>
	)
}
