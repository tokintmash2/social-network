'use client'

import Header from '../components/Header'
import Image from 'next/image'
import { useLoggedInUser } from '../context/UserContext'
import Link from 'next/link'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export default function HomePage() {
    const { loggedInUser } = useLoggedInUser()

    return (
        <>
            <Header />
            <div className="flex min-h-screen">
                <div className="w-1/6 p-6 bg-base-100 border-r border-gray-200 shadow-sm">
                    {loggedInUser && (
                        <div className="flex flex-col items-center">

                            <div className="avatar mb-4">
                                <Link href={`/profile`}>
                                    {loggedInUser.avatar && loggedInUser.avatar !== 'default_avatar.jpg' ? (
                                        <div className="w-16 h-16 rounded-full ring ring-gray-200 overflow-hidden">
                                            <Image
                                                src={`${backendUrl}/uploads/${loggedInUser.avatar}`}
                                                alt="User avatar"
                                                width={128}
                                                height={128}
                                            />
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content w-16 rounded-full">
                                                <span className="text-3xl uppercase">
                                                    {loggedInUser.firstName[0]}
                                                    {loggedInUser.lastName[0]}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                {loggedInUser.firstName} {loggedInUser.lastName}
                            </h2>
                            {loggedInUser.username && (
                                <p className="text-sm text-gray-600 mb-4">@{loggedInUser.username}</p>
                            )}
                            <div className="flex gap-8 text-center">
                                <div>
                                    <p className="font-semibold">Following</p>
                                    <p className="text-gray-600">0</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Followers</p>
                                    <p className="text-gray-600">0</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-2/3 p-6">
                    {/* Content for the right side */}
                </div>
            </div>
        </>
    )
}
