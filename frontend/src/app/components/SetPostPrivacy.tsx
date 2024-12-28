import React, { useState, useRef } from 'react'
import { PostsAction_type } from '../utils/types/types'
import Select from 'react-select'
import { ACTIONS } from '../utils/actions/postActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

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
	setNewPostPrivacy,
	setNewPostAllowedUsers,
}: {
	postId?: number
	initialPrivacy?: PrivacyOption_type['value']
	initialAllowedUsers?: number[]
	followers: { id: number; firstName: string; lastName: string }[]
	dispatch: (action: PostsAction_type) => void
	setNewPostPrivacy?: (privacy: PrivacyOption_type['value']) => void
	setNewPostAllowedUsers?: (allowedUsers: number[]) => void
}) {
	const [allowedUsers, setAllowedUsers] = useState<number[]>(initialAllowedUsers || [])
	const [showAllowedUsersSelection, setShowAllowedUsersSelection] = useState<boolean>(false)
	const [privacy, setPrivacy] = useState<PrivacyOption_type['value']>(initialPrivacy || 'PUBLIC')

	const [tempPrivacy, setTempPrivacy] = useState<PrivacyOption_type['value']>(privacy || 'PUBLIC')
	const [tempAllowedUsers, setTempAllowedUsers] = useState<number[]>(allowedUsers || [])
	const changePrivacyRef = useRef<HTMLDialogElement | null>(null)

	const handlePostPrivacyChange = (newPrivacy: PrivacyOption_type['value']) => {
		setTempPrivacy(newPrivacy)
		setShowAllowedUsersSelection(newPrivacy === 'ALMOST_PRIVATE')
	}

	const handleSaveAllowedUsers = async () => {
		console.log('tempPrivacy: ' + tempPrivacy + ' | tempAllowedUsers: ' + tempAllowedUsers)

		setPrivacy(tempPrivacy)
		setAllowedUsers(tempAllowedUsers)
		if (postId) {
			console.log(postId, ' sending settings via dispatch')
			/* 
			resume when patch endpoint is ready
			try {
				const response = await axios.(`${backendUrl}/api/posts/${postId}`, {
					
				})
			} catch(error){
				console.log(error)
			} */
			dispatch({
				type: ACTIONS.SET_POST_PRIVACY,
				payload: { postId, privacy: tempPrivacy, allowedUsers: tempAllowedUsers },
			})
		} else {
			console.log('no id: setNewPostPrivacy, setNewPostAllowedUsers')
			setNewPostPrivacy?.(privacy)
			setNewPostAllowedUsers?.(allowedUsers)
		}
		changePrivacyRef.current?.close()
		setShowAllowedUsersSelection(false)
	}

	const handleChangeAllowedUsers = (newValues: AllowedUserOption_type[]) => {
		const newAllowedUsers = newValues.map((value) => Number(value.value))
		setTempAllowedUsers(newAllowedUsers)
	}

	const getParsedFollowers = () =>
		followers
			? followers.map((follower) => ({
					value: follower.id.toString(),
					label: `${follower.firstName} ${follower.lastName}`,
				}))
			: []

	return (
		<div>
			<div className='flex items-center'>
				Privacy: {privacy}
				<button
					className='btn btn-sm ml-3'
					onClick={() => changePrivacyRef.current?.showModal()}
				>
					<FontAwesomeIcon icon={faGear} />
				</button>
			</div>

			<dialog id='change-post-privacy-modal' ref={changePrivacyRef} className='modal'>
				<div className='modal-box max-w-4xl'>
					<h3 className='font-bold text-lg'>Change post Privacy</h3>
					<form
						className='flex flex-col w-full pt-4'
						style={{ height: 'calc(100vh - 15rem)' }}
					>
						<div
							className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'
							onClick={() => changePrivacyRef.current?.close()}
						>
							✕
						</div>
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
							className='basic-select'
							classNamePrefix='select'
							onChange={(e) => e && handlePostPrivacyChange(e.value)}
						/>
						{/* Allowed Users Selector */}
						{showAllowedUsersSelection && getParsedFollowers().length > 0 && (
							<>
								<div className='mt-4 mb-1'>Specify who can see the post</div>
								<Select
									defaultValue={getParsedFollowers().find((follower) =>
										allowedUsers.includes(Number(follower.value)),
									)}
									isMulti={true}
									isClearable={false}
									isSearchable={true}
									menuPlacement='auto'
									name='allowed-users'
									options={getParsedFollowers()}
									className='basic-multi-select'
									classNamePrefix='select'
									onChange={(newValues) =>
										newValues && handleChangeAllowedUsers(Array.from(newValues))
									}
									placeholder='Select'
								/>
							</>
						)}
					</form>

					<div className='modal-action'>
						<button className='btn' onClick={() => handleSaveAllowedUsers()}>
							SUBMIT
						</button>
					</div>
				</div>
			</dialog>
		</div>
	)
}
export default SetPostPrivacy
