'use client'
import Header from '../components/Header'
import PostsContainer from '../containers/PostsContainer'
import Image from 'next/image'
import { useLoggedInUser } from '../context/UserContext'
import Link from 'next/link'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export default function HomePage() {
	const { loggedInUser } = useLoggedInUser()

	return (
		<div className='min-h-screen pt-16'>
			<Header />
			{loggedInUser && (
				<main className='flex min-h-screen'>
					<aside className='w-1/6 p-6 bg-base-100 border-r border-gray-200 min-h-screen fixed'>
						<div className='flex flex-col items-center'>
							<Link href='/profile' className='avatar mb-4'>
								{loggedInUser.avatar &&
								loggedInUser.avatar !== 'default_avatar.jpg' ? (
									<div className='w-16 h-16 rounded-full ring ring-gray-200 overflow-hidden'>
										<Image
											src={`${backendUrl}/uploads/${loggedInUser.avatar}`}
											alt='User avatar'
											width={128}
											height={128}
										/>
									</div>
								) : (
									<div className='avatar placeholder'>
										<div className='bg-neutral text-neutral-content w-16 rounded-full'>
											<span className='text-3xl uppercase'>
												{loggedInUser.firstName[0]}
												{loggedInUser.lastName[0]}
											</span>
										</div>
									</div>
								)}
							</Link>
							<h2 className='text-2xl font-semibold mb-2'>
								{loggedInUser.firstName} {loggedInUser.lastName}
							</h2>
							{loggedInUser.username && (
								<p className='text-sm text-gray-600 mb-4'>
									@{loggedInUser.username}
								</p>
							)}
						</div>
					</aside>
					<section className='w-2/3 p-6 ml-[16.666667%]'>
						<PostsContainer userId={loggedInUser.id} isOwnProfile={false} feed={true} />
					</section>
				</main>
			)}
		</div>
	)
}
