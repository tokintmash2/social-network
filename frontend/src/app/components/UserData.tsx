'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useLoggedInUser } from '../context/UserContext'
import { mapUserApiResponseToUser, User } from '../utils/userMapper'

type ProfileAccess = 'SELF' | 'PUBLIC' | 'FOLLOWING' | 'PRIVATE'
type UserDataProps = {
	userId: string
	accessType: ProfileAccess
}

export default function UserData({ userId, accessType }: UserDataProps) {
	const [userData, setUserData] = useState<User | null>(null)

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
	return (
		<div>
			{userData ? (
				<>
					{accessType !== 'SELF' && (
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

					{userData.avatar ? (
						<>
							<div className='avatar online'>
								<div className='w-24 rounded-full'>
									{/* TODO: use userData.avatar and fetch online status. For now, hardcode */}
									<Image
										src='/avatar.svg'
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

					{accessType !== 'PRIVATE' && <p>Email: {userData.email}</p>}

					{accessType !== 'PRIVATE' && userData.aboutMe && <p>{userData.aboutMe}</p>}
				</>
			) : (
				<p>Loading...</p>
			)}
		</div>
	)
}
