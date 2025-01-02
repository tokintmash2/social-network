'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useLoggedInUser } from '../context/UserContext'
import { mapUserApiResponseToUser } from '../utils/userMapper'
import { User, UserDataProps_type } from '../utils/types/types'
import { formatDate } from '../utils/dateUtils'
import PostsContainer from '../containers/PostsContainer'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
const avatarUrl = `${backendUrl}/uploads/`
export default function UserData({ userId, isOwnProfile }: UserDataProps_type) {
	const [userData, setUserData] = useState<User | null>(null)
	const [followData, setFollowData] = useState<{
		following: { id: number; firstName: string; lastName: string; status: string }[]
		followers: { id: number; firstName: string; lastName: string; status: string }[]
	}>({
		following: [],
		followers: [],
	})
	const [myFollowStatus, setMyFollowStatus] = useState<
		'following' | 'not following' | 'pending' | undefined
	>(undefined)

	useEffect(() => {
		console.log('userData:', userData)
		console.log(
			'avatar condition:',
			userData?.avatar && userData.avatar !== 'default_avatar.jpg',
		)
	}, [userData])

	const { loggedInUser } = useLoggedInUser()

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				console.log('fetching user data for user', userId)
				const response = await axios.get(`${backendUrl}/api/users/${userId}`, {
					withCredentials: true,
				})
				console.log('response', response.data)
				setUserData(mapUserApiResponseToUser(response.data.profile))
			} catch (error) {
				console.error('Error fetching user data:', error)
			}
		}
		if (!isOwnProfile) {
			fetchUserData()
		}
	}, [userId, isOwnProfile])
	useEffect(() => {
		if (isOwnProfile && loggedInUser) {
			console.log('isOwnProfile | loggedInUser', loggedInUser)
			setUserData(loggedInUser)
		} else if (isOwnProfile) {
			console.log('isOwnProfile | loggedInUser null')
		}
	}, [isOwnProfile, loggedInUser])

	useEffect(() => {
		const fetchFollowers = async () => {
			try {
				const response = await axios.get(`${backendUrl}/api/users/${userId}/followers`, {
					withCredentials: true,
				})
				console.log('fetchFollowers response', response)
				if (response.data.success) {
					setFollowData({
						following: response.data.following,
						followers: response.data.followers,
					})
				}
			} catch (error) {
				console.log(error)
			}
		}
		if (userId) {
			fetchFollowers()
		}
	}, [userId])

	const handleToggleProfilePrivacy = async () => {
		setUserData((prevUserData) => {
			if (prevUserData === null) return null
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
	const accessType = 'PUBLIC'

	const getFollowButtonText = () => {
		if (myFollowStatus === 'following') {
			return 'Unfollow'
		} else if (myFollowStatus === 'pending') {
			return 'Cancel request to follow'
		} else {
			return 'Follow'
		}
	}

	const handleChangeFollowButtonClick = async () => {
		if (loggedInUser) {
			switch (myFollowStatus) {
				case 'following':
				case 'pending':
					// Unfollow or cancel follow request logic
					try {
						const response = await axios.delete(
							`${backendUrl}/api/users/${userId}/followers/${loggedInUser.id}`,
							{
								withCredentials: true,
							},
						)
						console.log('handleChangeFollowButtonClick response', response)
						if (response.data.success) {
							setMyFollowStatus('not following')
							setFollowData((prevFollowData) => ({
								...prevFollowData,
								followers: prevFollowData.followers.filter(
									(follower) => follower.id !== loggedInUser.id,
								),
							}))
						}
					} catch (error) {
						console.log(`Error unfollowing user ${userId}`, error)
					}
					break

				case 'not following':
					// Join followers logic
					try {
						const response = await axios.post(
							`${backendUrl}/api/users/${userId}/followers/${loggedInUser.id}`,
							null,
							{ withCredentials: true },
						)
						console.log(response)
						if (response.data.success) {
							console.log('handleChangeFollowButtonClick response', response)
							if (response.data.success) {
								setMyFollowStatus('following')
								setFollowData((prevFollowData) => ({
									...prevFollowData,
									followers: [
										...prevFollowData.followers,
										{
											id: loggedInUser.id,
											firstName: loggedInUser.firstName,
											lastName: loggedInUser.lastName,
											status: 'accepted',
										},
									],
								}))
							}
						}
					} catch (error) {
						console.log(`Error following user ${userId}`, error)
					}
					break
			}
		}
	}
	useEffect(() => {
		if (followData && loggedInUser) {
			if (followData.followers.length > 0) {
				const myFollowData = followData.followers.filter(
					(follower) => follower.id === loggedInUser.id,
				)
				console.log(`My (user id ${loggedInUser.id}) follow data`, myFollowData)
				if (myFollowData.length > 0) {
					if (myFollowData[0].status === 'accepted') {
						setMyFollowStatus('following')
					} else {
						setMyFollowStatus('pending')
					}
				} else {
					setMyFollowStatus('not following')
				}
			}
		} else {
			setMyFollowStatus('not following')
		}
	}, [followData, loggedInUser])

	return (
		<div>
			{userData ? (
				<>
					<div className='container mx-auto px-8'>
						{/* Gradient Background */}
						<div className='relative h-[350px] rounded-b-lg overflow-hidden'>
							<div className='w-full h-full bg-gradient-to-r from-[#687984] to-[#B9D7EA]' />
							{/* Profile Picture and Name Container */}
							<div className='absolute top-8 left-8 flex items-center'>
								{/* Profile Picture */}
								<div>
									{userData.avatar && userData.avatar !== 'default_avatar.jpg' ? (
										<div className='w-32 h-32 rounded-full ring-4 ring-white overflow-hidden'>
											<Image
												src={`${avatarUrl}${userData.avatar}`}
												alt='User avatar'
												width={128}
												height={128}
												className='object-cover'
											/>
										</div>
									) : (
										<div className='avatar placeholder'>
											<div className='bg-neutral text-neutral-content w-32 h-32 rounded-full ring-4 ring-white'>
												<span className='text-4xl uppercase'>
													{userData.firstName[0]}
													{userData.lastName[0]}
												</span>
											</div>
										</div>
									)}
								</div>
								{/* Name and Username */}
								<div className='ml-6'>
									<h2 className='text-3xl font-bold text-white'>
										{userData.firstName} {userData.lastName}
									</h2>
									{userData.username && (
										<p className='text-gray-200'>@{userData.username}</p>
									)}
								</div>
							</div>
							{/* Follow Stats */}
							{accessType == 'PUBLIC' ? (
								<div className='absolute bottom-8 left-8 flex gap-6 text-white'>
									<div>
										<span className='font-semibold'>
											{followData.following.length}
										</span>
										<span className='ml-2'>Following</span>
									</div>
									<div>
										<span className='font-semibold'>
											{followData.followers.length > 0
												? followData.followers.filter(
														(follower) =>
															follower.status === 'accepted',
													).length
												: 0}
										</span>
										<span className='ml-2'>Followers</span>
									</div>
								</div>
							) : (
								''
							)}
						</div>
						{/* Profile Info Card */}
						<div className='w-full bg-white rounded-lg shadow-sm p-6 mt-8'>
							{/* Privacy Toggle */}
							{isOwnProfile && (
								<div className='form-control mb-4'>
									<div className='flex items-center justify-end'>
										<span className='text-sm text-gray-600 mr-4'>
											Public profile
										</span>
										<input
											type='checkbox'
											className='toggle toggle-md toggle-accent'
											checked={userData?.isPublic || false}
											onChange={handleToggleProfilePrivacy}
										/>
									</div>
								</div>
							)}
							{/* Follow Button */}
							{!isOwnProfile && followData && (
								<div className='mb-4'>
									<button
										className='btn btn-outline btn-sm'
										onClick={handleChangeFollowButtonClick}
									>
										{getFollowButtonText()}
									</button>
								</div>
							)}
							{/* User Info */}
							<div className='profile-info text-gray-700'>
								{userData.dob && (
									<p className='text-sm mb-2'>
										<span className='font-semibold'>Date of birth:</span>{' '}
										{formatDate(userData.dob)}
									</p>
								)}
								{accessType == 'PUBLIC' ? (
									<>
										<p className='text-sm mb-2'>
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
								) : (
									''
								)}
							</div>
						</div>
						{/* Posts Container */}
						<div className='mt-8'>
							<PostsContainer
								userId={userData.id}
								isOwnProfile={isOwnProfile}
								feed={false}
								followers={followData.followers}
							/>
						</div>
					</div>
				</>
			) : (
				<p className='text-center text-gray-500'>Loading...</p>
			)}
		</div>
	)
}
