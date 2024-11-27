'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useLoggedInUser } from '../context/UserContext'
import { mapUserApiResponseToUser } from '../utils/userMapper'
import { User, UserDataProps_type } from '../utils/types'
import { formatDate } from '../utils/dateUtils'
import PostsContainer from '../containers/PostsContainer'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
const avatarUrl = `${backendUrl}/avatars/`

export default function UserData({ userId, accessType }: UserDataProps_type) {
	const [userData, setUserData] = useState<User | null>(null)
	const [followData, setFollowData] = useState<{ following: number; followers: number }>({
		following: 0,
		followers: 0,
	})

	const { loggedInUser } = useLoggedInUser()

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await axios.get(`http://localhost:8080/users/${userId}`, {
					withCredentials: true,
				})
				console.log('response', response.data)
				setUserData(mapUserApiResponseToUser(response.data.profile))
			} catch (error) {
				console.error('Error fetching user data:', error)
			}
		}
		if (accessType !== 'SELF') {
			fetchUserData()
		}
	}, [userId, accessType])

	useEffect(() => {
		if (accessType === 'SELF' && loggedInUser) {
			console.log("accessType == 'SELF' | loggedInUser", loggedInUser)
			setUserData(loggedInUser)
		} else if (accessType === 'SELF') {
			console.log("accessType == 'SELF' | loggedInUser null")
		}
	}, [accessType, loggedInUser])

	const handleToggleProfilePrivacy = async () => {
		setUserData((prevUserData) => {
			if (prevUserData === null) return null

			// Optimistically update UI
			return {
				...prevUserData,
				isPublicProfile: !prevUserData.isPublic,
			}
		})

		try {
			const response = await axios.get('http://localhost:8080/toggle-privacy', {
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
			})
			console.log('response', response.data)
		} catch (error) {
			console.error('Error toggling privacy:', error)
		}
	}

	let followButtonText = ''
	if (accessType === 'PRIVATE' || accessType === 'PUBLIC') {
		followButtonText = 'Follow'
	} else if (accessType === 'PRIVATE_PENDING') {
		followButtonText = 'Follow request pending'
	} else {
		followButtonText = 'Unfollow'
	}

	const handleFollow = () => {
		// TODO.
		console.log('handle follow')
	}

	return (
		<div>
			{userData ? (
				<>
					{accessType === 'SELF' && (
						<div className='flex flex-row justify-end'>
							<div className='form-control'>
								<label className='label cursor-pointer'>
									<span className='label-text mr-4'>Public profile</span>
									<input
										type='checkbox'
										className='toggle toggle-md toggle-accent'
										checked={userData?.isPublic || false}
										onChange={handleToggleProfilePrivacy}
									/>
								</label>
							</div>
						</div>
					)}

					{accessType !== 'PRIVATE' && accessType !== 'PRIVATE_PENDING' && (
						<div className='flex justify-center'>
							Following {followData.following} | Followers {followData.followers}
						</div>
					)}
					{accessType !== 'SELF' && (
						<div className='flex justify-end'>
							<button className='btn btn-outline' onClick={handleFollow}>
								{followButtonText}
							</button>
						</div>
					)}

					{userData.avatar && userData.avatar !== 'default_avatar.jpg' ? (
						<>
							<div className='avatar online'>
								<div className='w-24 rounded-full ring ring-gray-100 ring-offset-2'>
									{/* TODO: use userData.avatar and fetch online status. For now, hardcode */}
									<Image
										src={avatarUrl + userData.avatar}
										alt='User avatar'
										width={96}
										height={96}
									/>
								</div>
							</div>
						</>
					) : (
						<>
							<div className='avatar placeholder online'>
								{' '}
								{/* TODO: fetch online status. For now, hardcode */}
								<div className='bg-neutral text-neutral-content w-24 rounded-full'>
									<span className='text-3xl'>
										{userData.firstName[0]}
										{userData.lastName[0]}
									</span>
								</div>
							</div>
						</>
					)}
					<p>
						Name: {userData.firstName} {userData.lastName}
					</p>
					{userData.username && <p>Username: {userData.username}</p>}
					{userData.dob && <p>Date of birth: {formatDate(userData.dob)}</p>}

					{accessType !== 'PRIVATE' && accessType !== 'PRIVATE_PENDING' && (
						<p>Email: {userData.email}</p>
					)}

					{accessType !== 'PRIVATE' &&
						accessType !== 'PRIVATE_PENDING' &&
						userData.aboutMe && <p>About me: {userData.aboutMe}</p>}

					<div className='divider'></div>
					<PostsContainer
						userId={userData.id}
						isOwnProfile={accessType === 'SELF'}
						feed={false}
					/>
				</>
			) : (
				<p>Loading...</p>
			)}
		</div>
	)
}
