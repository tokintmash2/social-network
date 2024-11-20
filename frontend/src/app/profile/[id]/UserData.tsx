'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'

export default function UserData({ userId }: { userId: string }) {
	const [userData, setUserData] = useState<{
		email: string
		firstName: string
		lastName: string
		dob: Date
		avatar?: File // Optional
		username?: string // Optional
		about?: string // Optional
	} | null>(null)

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await axios.get(`http://localhost:8080/users/${userId}`)
				console.log('response', response.data)
				setUserData(response.data)
			} catch (error) {
				console.error('Error fetching user data:', error)
			}
		}

		fetchUserData()
	}, [userId])
	return (
		<div>
			{userData ? (
				<div>
					<h2>User Data</h2>
					{userData.avatar && (
						<Image
							src={URL.createObjectURL(userData.avatar)}
							alt='User avatar'
							width={100}
							height={100}
						/>
					)}
					<p>
						Name: {userData.firstName} {userData.lastName}
					</p>
					{userData.username && <p>Username: {userData.username}</p>}
					<p>Email: {userData.email}</p>
					<p>Date of Birth: {userData.dob.toString()}</p>
					{userData.about && <p>About: {userData.about}</p>}
				</div>
			) : (
				<p>Loading...</p>
			)}
		</div>
	)
}
