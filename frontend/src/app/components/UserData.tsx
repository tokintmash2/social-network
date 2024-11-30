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
				isPublic: !prevUserData.isPublic,
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
		<div className='container mx-auto'>
			{userData ? (
				<>
					<div className='bg-base-100 p-6 mb-6 rounded-br-lg rounded-bl-lg'>
						<div className='profile-header flex flex-col items-center text-center mb-6'>
							<div className='avatar mb-4'>
								{userData.avatar && userData.avatar !== 'default_avatar.jpg' ? (
									<div className='w-32 h-32 rounded-full ring ring-gray-200 overflow-hidden'>
										<Image
											src={`${avatarUrl}${userData.avatar}`}
											alt='User avatar'
											width={128}
											height={128}
										/>
									</div>
								) : (
									<div className='avatar placeholder'>
										<div className='bg-neutral text-neutral-content w-24 rounded-full'>
											<span className='text-3xl uppercase'>
												{userData.firstName[0]}
												{userData.lastName[0]}
											</span>
										</div>
									</div>
								)}
							</div>
							<h2 className='text-2xl font-semibold text-gray-800'>
								{userData.firstName} {userData.lastName}
							</h2>
							{userData.username && (
								<p className='text-sm text-gray-600'>@{userData.username}</p>
							)}
							{accessType === 'SELF' && (
								<div className='form-control mt-4'>
									<label className='label cursor-pointer'>
										<span className='label-text text-sm mr-4'>
											Public profile
										</span>
										<input
											type='checkbox'
											className='toggle toggle-md toggle-accent'
											checked={userData?.isPublic || false}
											onChange={handleToggleProfilePrivacy}
										/>
									</label>
								</div>
							)}
						</div>

						{/* Profile Stats */}
						{accessType !== 'PRIVATE' && accessType !== 'PRIVATE_PENDING' && (
							<div className='profile-stats flex justify-center mb-4'>
								<p className='text-sm text-gray-600'>
									Following:{' '}
									<span className='font-semibold text-gray-800'>
										{followData.following}
									</span>{' '}
									| Followers:{' '}
									<span className='font-semibold text-gray-800'>
										{followData.followers}
									</span>
								</p>
							</div>
						)}

						{/* Follow Button */}
						{accessType !== 'SELF' && (
							<div className='flex justify-end mb-6'>
								<button className='btn btn-outline btn-sm' onClick={handleFollow}>
									{followButtonText}
								</button>
							</div>
						)}

						{/* Profile Info */}
						<div className='profile-info text-gray-700 mb-6'>
							{userData.dob && (
								<p className='text-sm'>
									<span className='font-semibold'>Date of birth:</span>{' '}
									{formatDate(userData.dob)}
								</p>
							)}
							{accessType !== 'PRIVATE' && accessType !== 'PRIVATE_PENDING' && (
								<>
									<p className='text-sm'>
										<span className='font-semibold'>Email:</span>{' '}
										{userData.email}
									</p>
									{userData.aboutMe && (
										<p className='text-sm'>
											<span className='font-semibold'>About me:</span>{' '}
											{userData.aboutMe}
										</p>
									)}
								</>
							)}
						</div>
					</div>

					{/* Posts Container */}

					<PostsContainer
						userId={userData.id}
						isOwnProfile={accessType === 'SELF'}
						feed={false}
					/>
				</>
			) : (
				<p className='text-center text-gray-500'>Loading...</p>
			)}
		</div>
	)
}
