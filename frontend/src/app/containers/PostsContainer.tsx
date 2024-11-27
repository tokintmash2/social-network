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
		<div>
			{isOwnProfile && <h1 className='text-lg'>My posts</h1>}
			{state.posts.length && !feed && !isOwnProfile && (
				<h1 className='text-lg'>{`${state.posts[0].author.firstName}'s posts`}</h1>
			)}
			<div>Amount of posts: {state.posts.length}</div>
			{state.posts.map((post: Post_type) => (
				<Post
					key={post.id}
					post={post}
					dispatch={dispatch}
					isOwnPost={post.author.id === loggedInUser?.id}
				/>
			))}
		</div>
	)
}
