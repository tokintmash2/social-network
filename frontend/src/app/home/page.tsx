'use client'

import Header from '../components/Header'
import Image from 'next/image'
import { useLoggedInUser } from '../context/UserContext'
import { dummyPosts } from '../dummyData'
import Link from 'next/link'
import Post from '../components/Post'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faImage } from '@fortawesome/free-solid-svg-icons'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export default function HomePage() {
    const { loggedInUser } = useLoggedInUser()

    return (
        <div className="min-h-screen pt-16">
            <Header />
            <main className="flex min-h-screen">
                <aside className="w-1/6 p-6 bg-base-100 border-r border-gray-200 min-h-screen fixed">
                    {loggedInUser && (
                        <div className="flex flex-col items-center">
                            <Link href="/profile" className="avatar mb-4">
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
                            <h2 className="text-2xl font-semibold mb-2">
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
                </aside>
                <section className="w-2/3 p-6 ml-[16.666667%]">
                    
                    
                    <div className="card bg-base-100 shadow-sm p-4 mb-6">
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                {loggedInUser?.avatar && loggedInUser.avatar !== 'default_avatar.jpg' ? (
                                    <div className="w-10 h-10 rounded-full ring ring-gray-200 overflow-hidden">
                                        <Image
                                            src={`${backendUrl}/uploads/${loggedInUser.avatar}`}
                                            alt="User avatar"
                                            width={40}
                                            height={40}
                                        />
                                    </div>
                                ) : (
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content w-10 rounded-full">
                                            <span className="text-xl uppercase">
                                                {loggedInUser?.firstName?.[0]}
                                                {loggedInUser?.lastName?.[0]}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <input 
                                    type="text" 
                                    placeholder="What's on your mind?" 
                                    className="input input-bordered w-full"
                                />
                                <button
                                    type='button'
                                    className='btn btn-circle btn-outline absolute h-8 w-8 min-h-8 bottom-3.5 right-11'
                                >
                                    <FontAwesomeIcon className='text-base/6' icon={faImage} />
                                </button>
                                <button
                                    className='btn btn-circle btn-outline absolute h-8 w-8 min-h-8 bottom-3.5 right-2'
                                >
                                    <FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[#B9D7EA] text-transparent bg-clip-text mb-6">Latest Posts</h1>
                    <div className="space-y-4">
                        {dummyPosts.map((post) => (
                            <Post 
                                key={post.id} 
                                post={post} 
                                isOwnPost={false}
                                dispatch={() => {}}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
