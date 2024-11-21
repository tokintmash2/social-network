'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'

type ProfileAccess = 'SELF' | 'PUBLIC' | 'FOLLOWING' | 'PRIVATE'
type UserDataProps = {
	userId: string
	accessType: ProfileAccess
}

export default function UserData({ userId, accessType }: UserDataProps) {
	const [userData, setUserData] = useState<{
		email: string
		firstName: string
		lastName: string
		dob: Date
		isPublicProfile: boolean
		avatar?: File // Optional
		username?: string // Optional
		about?: string // Optional
	} | null>(null)

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await axios.get(`http://localhost:8080/users/${userId}`, {
					withCredentials: true,
				})
				console.log('response', response.data)
				setUserData({
					email: response.data.profile.Email,
					firstName: response.data.profile.FirstName,
					lastName: response.data.profile.LastName,
					dob: response.data.profile.DOB,
					avatar: response.data.profile.Avatar,
					username: response.data.profile.Username,
					about: response.data.profile.About,
					isPublicProfile: response.data.profile.IsPublic,
				})
			} catch (error) {
				console.error('Error fetching user data:', error)
			}
		}
		fetchUserData()
	}, [userId])

	const handleToggleProfilePrivacy = async () => {
		setUserData((prevUserData) => {
			if (prevUserData === null) return null

			// Optimistically update UI
			return {
				...prevUserData,
				isPublicProfile: !prevUserData.isPublicProfile,
			}
		})

		try {
			const response = await axios.get('http://localhost:8080/toggle-privacy', {
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
			})
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
										checked={userData?.isPublicProfile || false}
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
									<Image
										src='https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
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

					{accessType !== 'PRIVATE' && userData.about && <p>{userData.about}</p>}
				</>
			) : (
				<p>Loading...</p>
			)}
		</div>
	)
}
