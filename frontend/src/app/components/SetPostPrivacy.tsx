import React, { useState } from 'react'
import { PostsAction_type } from '../utils/types'
import Select from 'react-select'
import { ACTIONS } from '../utils/actions/postActions'

type PrivacyOption_type = { value: 'PUBLIC' | 'PRIVATE' | 'ALMOST_PRIVATE'; label: string }
type AllowedUserOption_type = { value: string; label: string }

const privacyOptions: PrivacyOption_type[] = [
	{ value: 'PUBLIC', label: 'Public' },
	{ value: 'PRIVATE', label: 'Private' },
	{ value: 'ALMOST_PRIVATE', label: 'Almost private' },
]

function SetPostPrivacy({
	postId,
	initialPrivacy = 'PUBLIC',
	initialAllowedUsers = [],
	followers = [],
	dispatch,
}: {
	postId?: number
	initialPrivacy?: PrivacyOption_type['value']
	initialAllowedUsers: number[]
	followers: { id: number; firstName: string; lastName: string }[]
	dispatch: (action: PostsAction_type) => void
}) {
	const [allowedUsers, setAllowedUsers] = useState<number[]>(initialAllowedUsers || [])
	const [showAllowedUsersSelection, setShowAllowedUsersSelection] = useState<boolean>(false)
	const [privacy, setPrivacy] = useState<PrivacyOption_type['value']>(initialPrivacy || 'PUBLIC')

	const handlePostPrivacyChange = (newPrivacy: PrivacyOption_type['value']) => {
		setPrivacy(newPrivacy)
		setShowAllowedUsersSelection(newPrivacy === 'ALMOST_PRIVATE')
	}
	const handleSaveAllowedUsers = () => {
		// setShowAllowedUsersSelection(false)
		if (postId) {
			dispatch({
				type: ACTIONS.SET_POST_PRIVACY,
				payload: { postId, privacy, allowedUsers },
			})
		} else {
			// send data to db
		}
	}

	const handleChangeAllowedUsers = (newValues: AllowedUserOption_type[]) => {
		const newAllowedUsers = newValues.map((value) => Number(value.value))
		setAllowedUsers(newAllowedUsers)
	}

	const getParsedFollowers = () =>
		followers
			? followers.map((follower) => ({
					value: follower.id.toString(),
					label: `${follower.firstName} ${follower.lastName}`,
				}))
			: []

	return (
		<div className='post-actions flex flex-col items-end max-w-80'>
			{/* Privacy Setting Dropdown */}

			<Select
				defaultValue={privacyOptions.find(
					(option) => option.value === privacy.toUpperCase(),
				)}
				isMulti={false}
				isClearable={false}
				isSearchable={false}
				name='privacy-setting'
				options={privacyOptions}
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
	)
}
export default SetPostPrivacy
