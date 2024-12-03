import React, { useState } from 'react'
import { ACTIONS } from '../utils/actions/postActions'
import { PostProps_type, Post_type } from '../utils/types'
import { dummyFollowers } from '../dummyData'
import Select from 'react-select'
import CommentsContainer from '../containers/CommentsContainer'

export default function Post({ post, dispatch, isOwnPost = false }: PostProps_type) {
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
		// setShowAllowedUsersSelection(false)
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
			{/* Header Section */}
			<div className='flex justify-between items-center mb-4'>
				<div className='flex items-center space-x-2'>
					{/* Author Details */}
					<div>
						<p className='text-sm font-semibold text-primary'>
							{post.author.firstName} {post.author.lastName}
						</p>
						<p className='text-xs text-gray-500'>
							{new Date(post.createdAt).toLocaleString()}
						</p>
					</div>
				</div>
				{isOwnPost && (
					<div className='post-actions flex flex-col items-end max-w-80'>
						{/* Privacy Setting Dropdown */}

						<Select
							defaultValue={options.find(
								(option) => option.value === post.privacy.toUpperCase(),
							)}
							isMulti={false}
							isClearable={false}
							isSearchable={false}
							name='privacy-setting'
							options={options}
							menuPosition='fixed'
							className='basic-select w-48'
							classNamePrefix='select'
							onChange={(e) => e && handlePostPrivacyChange(e.value)}
						/>

						{/* Allowed Users Selector */}
						{showAllowedUsersSelection && getParsedFollowers().length > 0 && (
							<>
								<div className='mt-2 mb-1'>Specify who can see the post</div>
								<Select
									defaultValue={getParsedFollowers().find((follower) =>
										allowedUsers.includes(Number(follower.value)),
									)}
									isMulti={true}
									isClearable={false}
									isSearchable={true}
									menuPlacement='auto'
									menuPosition='fixed'
									name='allowed-users'
									options={getParsedFollowers()}
									className='basic-multi-select'
									classNamePrefix='select'
									onChange={(newValues) =>
										newValues && handleChangeAllowedUsers(Array.from(newValues))
									}
									onBlur={() => handleSaveAllowedUsers()}
									placeholder='Select'
								/>
							</>
						)}
					</div>
				)}
			</div>

			{/* Post Content */}
			<div className='post-content mb-4'>
				<p className='text-sm text-gray-800'>{post.content}</p>
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

			{/* Comments Section */}
			<div className='comments-container mt-4'>
				<CommentsContainer comments={post.comments} />
			</div>
		</div>
	)
}
