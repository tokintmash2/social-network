'use client'

import { useEffect, useReducer } from 'react'
import Post from '../components/Post'
import CreatePost from '../components/CreatePost'
import {
	Post_type,
	PostsContainerProps_type,
	PostsAction_type,
	PostsState_type,
} from '../utils/types/types'
import { useLoggedInUser } from '../context/UserContext'
import { ACTIONS } from '../utils/actions/postActions'
import axios from 'axios'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

function reducer(state: PostsState_type, action: PostsAction_type): PostsState_type {
	switch (action.type) {
		case ACTIONS.SET_POSTS:
			console.log('ACTIONS.SET_POSTS payload', action.payload)
			if (Array.isArray(action.payload)) {
				return { ...state, posts: action.payload }
			} else if (
				action.payload &&
				typeof action.payload === 'object' &&
				'posts' in action.payload &&
				Array.isArray(action.payload.posts) &&
				!action.payload.posts.length
			) {
				return { ...state, posts: [] }
			}
			throw new Error('Invalid payload for SET_POSTS')

		case ACTIONS.CREATE_POST:
			if (Array.isArray(action.payload)) {
				return { ...state, posts: [...action.payload, ...state.posts] }
			} else if (
				action.payload &&
				typeof action.payload === 'object' &&
				'posts' in action.payload &&
				Array.isArray(action.payload.posts) &&
				!action.payload.posts.length
			) {
				return { ...state, posts: [] }
			}
			throw new Error('Invalid payload for CREATE_POST')

		case ACTIONS.SET_LOADING:
			if (typeof action.payload === 'boolean') {
				return { ...state, loading: action.payload }
			}
			throw new Error('Invalid payload for SET_LOADING')

		case ACTIONS.SET_ERROR:
			if (typeof action.payload === 'string' || action.payload === null) {
				return { ...state, error: action.payload }
			}
			throw new Error('Invalid payload for SET_ERROR')

		case ACTIONS.SET_POST_PRIVACY:
			console.log('ACTIONS.SET_POST_PRIVACY | action.payload', action.payload)
			if (
				action.payload &&
				typeof action.payload === 'object' &&
				'postId' in action.payload &&
				'privacy' in action.payload
			) {
				console.log('ACTIONS.SET_POST_PRIVACY | updating state')
				const { postId, privacy, allowedUsers } = action.payload
				return {
					...state,
					posts: state.posts.map((post) =>
						post.id === postId
							? { ...post, privacy, allowedUsers: allowedUsers ?? post.allowedUsers }
							: post,
					),
				}
			}
			throw new Error('Invalid payload for SET_POST_PRIVACY')
		case ACTIONS.ADD_COMMENT:
			if (
				action.payload &&
				typeof action.payload === 'object' &&
				'postId' in action.payload &&
				'comment' in action.payload &&
				typeof action.payload.comment === 'object' &&
				'id' in action.payload.comment &&
				'content' in action.payload.comment &&
				'mediaUrl' in action.payload.comment &&
				'author' in action.payload.comment &&
				typeof action.payload.comment.author === 'object' &&
				'id' in action.payload.comment.author &&
				typeof action.payload.comment.author.id === 'number' &&
				'firstName' in action.payload.comment.author &&
				typeof action.payload.comment.author.firstName === 'string' &&
				'lastName' in action.payload.comment.author &&
				typeof action.payload.comment.author.lastName === 'string'
			) {
				const { postId, comment } = action.payload
				const { content, mediaUrl, author } = comment
				const { firstName, lastName } = author

				const newComment: Post_type['comments'][0] = {
					id: comment.id,
					content,
					mediaUrl: mediaUrl ? (typeof mediaUrl === 'string' ? mediaUrl : null) : null,
					author: {
						id: author.id,
						firstName: firstName,
						lastName: lastName,
					},
					createdAt: new Date(),
				}
				return {
					...state,
					posts: state.posts.map((post) =>
						post.id === postId
							? { ...post, comments: [...(post.comments || []), newComment] }
							: post,
					),
				}
			}

			throw new Error('Invalid payload for ADD_COMMENT')
		default:
			return state
	}
}

export default function PostsContainer({
	userId,
	feed = false,
	group = false,
	groupId = undefined,
	isOwnProfile = false,
	followers = [],
}: PostsContainerProps_type) {
	const { loggedInUser } = useLoggedInUser()

	const [state, dispatch] = useReducer(reducer, { posts: [], loading: false, error: null })
	console.log('PostsContainer | isOwnProfile', isOwnProfile)
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				dispatch({ type: ACTIONS.SET_LOADING, payload: true })
				// Replace groupsPosts endpoint with api/groups/{group_id}/posts when ready
				const fetchUrl = group
					? `${backendUrl}/api/groups/${groupId}`
					: `${backendUrl}/api/posts?user_id=${userId}`
				const response = await axios.get(fetchUrl, {
					withCredentials: true,
				})
				console.log('fetchPosts response', response.data)

				const postsPayload = group ? response.data.group_posts : response.data
				dispatch({ type: ACTIONS.SET_POSTS, payload: postsPayload })
			} catch (err) {
				dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to fetch posts' })
				console.error(err)
			} finally {
				dispatch({ type: ACTIONS.SET_LOADING, payload: false })
			}
		}

		fetchPosts()
	}, [userId, group, groupId])

	if (state.loading) {
		return <div>Loading...</div>
	}
	if (state.error) {
		return <div>Error: {state.error}</div>
	}

	let headerText = ''
	if (feed) {
		headerText = 'Latest Posts'
	} else if (isOwnProfile) {
		headerText = 'My Posts'
	} else {
		headerText = 'Posts'
	}

	return (
		<div className='mb-4'>
			{(isOwnProfile || feed || group) && (
				<CreatePost
					followers={followers || []}
					dispatch={dispatch}
					group={group}
					groupId={groupId}
				/>
			)}

			{/* Header */}
			<h1 className='text-2xl font-bold text-[#B9D7EA] bg-clip-text mb-6'>{headerText}</h1>

			{/* Post Count */}
			{!feed && (
				<div className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>Total posts:</span> {state.posts.length}
				</div>
			)}

			{/* Posts List */}
			<div className='space-y-4 flex flex-col'>
				{state.posts.map((post: Post_type) => (
					<Post
						key={'post-' + post.id}
						post={post}
						group={group}
						dispatch={dispatch}
						followers={followers}
						isOwnPost={loggedInUser ? post.author.id === loggedInUser.id : false}
					/>
				))}
			</div>
		</div>
	)
}
