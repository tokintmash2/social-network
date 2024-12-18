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
const avatarUrl = `${backendUrl}/avatars/`

export default function UserData({ userId, accessType }: UserDataProps_type) {
    const [userData, setUserData] = useState<User | null>(null)
    const [followData] = useState<{ following: number; followers: number }>({
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
        console.log('handle follow')
    }

    return (
        <div>
            {userData ? (
                <>
                    <div className="container mx-auto px-8">
                        {/* Gradient Background */}
                        <div className="relative h-[350px] rounded-b-lg overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-r from-[#687984] to-[#B9D7EA]" />
                            
                            {/* Profile Picture and Name Container */}
                            <div className="absolute top-8 left-8 flex items-center">
                                {/* Profile Picture */}
                                <div>
                                    {userData.avatar && userData.avatar !== 'default_avatar.jpg' ? (
                                        <div className="w-32 h-32 rounded-full ring-4 ring-white overflow-hidden">
                                            <Image
                                                src={`${avatarUrl}${userData.avatar}`}
                                                alt="User avatar"
                                                width={128}
                                                height={128}
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content w-32 h-32 rounded-full ring-4 ring-white">
                                                <span className="text-4xl uppercase">
                                                    {userData.firstName[0]}
                                                    {userData.lastName[0]}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Name and Username */}
                                <div className="ml-6">
                                    <h2 className="text-3xl font-bold text-white">
                                        {userData.firstName} {userData.lastName}
                                    </h2>
                                    {userData.username && (
                                        <p className="text-gray-200">@{userData.username}</p>
                                    )}
                                </div>
                            </div>

                            {/* Follow Stats */}
                            {accessType !== 'PRIVATE' && accessType !== 'PRIVATE_PENDING' && (
                                <div className="absolute bottom-8 left-8 flex gap-6 text-white">
                                    <div>
                                        <span className="font-semibold">{followData.following}</span>
                                        <span className="ml-2">Following</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">{followData.followers}</span>
                                        <span className="ml-2">Followers</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Info Card */}
                        <div className="w-1/2 bg-white rounded-lg shadow-sm p-6 mt-8">
                            {/* Privacy Toggle */}
                            {accessType === 'SELF' && (
                                <div className="form-control mb-4">
                                    <div className="flex items-center justify-end">
                                        <span className="text-sm text-gray-600 mr-4">Public profile</span>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-md toggle-accent"
                                            checked={userData?.isPublic || false}
                                            onChange={handleToggleProfilePrivacy}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Follow Button */}
                            {accessType !== 'SELF' && (
                                <div className="mb-4">
                                    <button className="btn btn-outline btn-sm" onClick={handleFollow}>
                                        {followButtonText}
                                    </button>
                                </div>
                            )}

                            {/* User Info */}
                            <div className="profile-info text-gray-700">
                                {userData.dob && (
                                    <p className="text-sm mb-2">
                                        <span className="font-semibold">Date of birth:</span>{' '}
                                        {formatDate(userData.dob)}
                                    </p>
                                )}
                                {accessType !== 'PRIVATE' && accessType !== 'PRIVATE_PENDING' && (
                                    <>
                                        <p className="text-sm mb-2">
                                            <span className="font-semibold">Email:</span>{' '}
                                            {userData.email}
                                        </p>
                                        {userData.aboutMe && (
                                            <p className="text-sm">
                                                <span className="font-semibold">About me:</span>{' '}
                                                {userData.aboutMe}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Posts Container */}
                        <div className="w-1/2 mt-8">
                            <PostsContainer
                                userId={userData.id}
                                isOwnProfile={accessType === 'SELF'}
                                feed={false}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-500">Loading...</p>
            )}
        </div>
    )
}

