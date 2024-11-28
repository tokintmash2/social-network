import React, { useState } from 'react'
import { ACTIONS } from '../utils/actions/postActions'
import { PostProps_type, Post_type } from '../utils/types'
import { dummyFollowers } from '../dummyData'
import Select from 'react-select'

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
		setFollowers(dummyFollowers) // Set raw followers data
		setShowAllowedUsersSelection(true) // Show the selector
	}

	const handlePostPrivacyChange = (e: string) => {
		const newPrivacy = e as Post_type['privacy']

		dispatch({
			type: ACTIONS.SET_POST_PRIVACY,
			payload: { postId: post.id, privacy: newPrivacy },
		})
		if (newPrivacy === 'ALMOST_PRIVATE') {
			if (!followers) {
				fetchFollowers() // Fetch followers if not already fetched
			} else {
				setShowAllowedUsersSelection(true) // Show selector if followers are already fetched
			}
		} else {
			setShowAllowedUsersSelection(false)
		}
	}

	const handleSaveAllowedUsers = () => {
		setShowAllowedUsersSelection(false)
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
		<div className='post'>
			<div className='flex justify-end'>
				{isOwnPost && (
					<div className='post-actions'>
						{!showAllowedUsersSelection && (
							<Select
								defaultValue={options.find(
									(option) => option.value === post.privacy
								)}
								isMulti={false}
								isClearable={false}
								isSearchable={false}
								name='privacy-setting'
								options={options}
								className='basic-select'
								classNamePrefix='select'
								onChange={(e) => e && handlePostPrivacyChange(e.value)}
							/>
						)}
						{showAllowedUsersSelection && getParsedFollowers().length > 0 && (
							<Select
								defaultValue={getParsedFollowers().find((follower) =>
									allowedUsers.includes(Number(follower.value))
								)}
								isMulti={true}
								isClearable={false}
								isSearchable={true}
								name='allowed-users'
								options={getParsedFollowers()}
								className='basic-multi-select'
								classNamePrefix='select'
								onChange={(newValues) =>
									newValues && handleChangeAllowedUsers(Array.from(newValues))
								}
								onBlur={() => handleSaveAllowedUsers()}
							/>
						)}
					</div>
				)}
			</div>
			<div className='post-title'>{post.title}</div>
			<div className='post-content'>
				{post.content} {post.mediaUrl && <img src={post.mediaUrl} alt='' />}
			</div>
		</div>
	)
}
