import React, { useState } from 'react'
import { ACTIONS } from '../utils/actions/postActions'
import { PostProps_type, Post_type } from '../utils/types/types'
import { dummyFollowers } from '../dummyData'
import Select from 'react-select'
import CommentsContainer from '../containers/CommentsContainer'
import DOMPurify from 'dompurify'

export default function Post({ post, dispatch, isOwnPost = false }: PostProps_type) {
	const sanitizedContent = DOMPurify.sanitize(post.content)
	const [allowedUsers, setAllowedUsers] = useState<number[]>(post.allowedUsers || [])
	const [showAllowedUsersSelection, setShowAllowedUsersSelection] = useState(false)
	const [followers, setFollowers] = useState<
		{ id: number; firstName: string; lastName: string }[] | null
	>(null)

	const options = [
		{ value: 'PUBLIC', label: 'Public' },
		{ value: 'PRIVATE', label: 'Private' },
		{ value: 'ALMOST_PRIVATE', label: 'Almost private' },
	]

	const getParsedFollowers = () =>
		followers
			? followers.map((follower) => ({
					value: follower.id.toString(),
					label: `${follower.firstName} ${follower.lastName}`,
				}))
			: []

	const fetchFollowers = () => {
		setFollowers(dummyFollowers)
		setShowAllowedUsersSelection(true)
	}

	const handlePostPrivacyChange = (e: string) => {
		const newPrivacy = e as Post_type['privacy']

		dispatch({
			type: ACTIONS.SET_POST_PRIVACY,
			payload: { postId: post.id, privacy: newPrivacy },
		})

		if (newPrivacy === 'ALMOST_PRIVATE') {
			if (!followers) {
				fetchFollowers()
			} else {
				setShowAllowedUsersSelection(true)
			}
		} else {
			setShowAllowedUsersSelection(false)
		}
	}

	const handleSaveAllowedUsers = () => {
		dispatch({
			type: ACTIONS.SET_POST_PRIVACY,
			payload: { postId: post.id, privacy: post.privacy, allowedUsers },
		})
	}

	const handleChangeAllowedUsers = (newValues: { value: string; label: string }[]) => {
		const newAllowedUsers = newValues.map((value) => Number(value.value))
		setAllowedUsers(newAllowedUsers)
	}

	return (
		<div className='post card rounded-lg shadow-sm bg-base-100 p-4 mb-4'>
			<div className='flex justify-between items-start mb-4'>
				<h2 className='font-bold'>{post.title}</h2>
				<div className='text-right'>
					<p className='text-sm font-semibold text-primary'>
						{post.author.firstName} {post.author.lastName}
					</p>
					<p className='text-xs text-gray-500'>
						{new Date(post.createdAt).toLocaleString()}
					</p>
				</div>
			</div>

			<div className='post-content mb-4'>
				<p
					className='text-sm text-gray-800'
					dangerouslySetInnerHTML={{ __html: sanitizedContent }}
				/>

				{post.mediaUrl && (
					<div className='mt-4'>
						<img
							src={post.mediaUrl}
							alt='Attached media'
							className='rounded-lg border border-gray-200 max-w-full'
						/>
					</div>
				)}
			</div>

			<div className='comments-container mt-4'>
				<CommentsContainer postId={post.id} comments={post.comments} dispatch={dispatch} />
			</div>
		</div>
	)
}
