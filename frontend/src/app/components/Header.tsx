import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NotificationSystem from './NotificationSystem'
import { useLoggedInUser } from '../context/UserContext'
import Image from 'next/image'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

const Header = () => {
	const router = useRouter()
	const { loggedInUser, setLoggedInUser } = useLoggedInUser()

	const handleLogout = async () => {
		try {
			await fetch('http://localhost:8080/logout', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			setLoggedInUser(null)
			router.push('/login')
		} catch (error) {
			console.log('Logout failed:', error)
		}
	}

	return (
		<div className='navbar bg-base-100 shadow-sm border-b border-gray-200 fixed top-0 w-full z-50'>
			<div className='flex-1'>
				<Link href='/' className='btn btn-ghost'>
					<h1 className='bg-gradient-to-l from-[#687984] to-[#B9D7EA] text-transparent bg-clip-text text-2xl'>
						SPHERE
					</h1>
				</Link>
			</div>

			<div className='flex-none gap-2'>
				<div tabIndex={0} role='button' className='btn btn-ghost btn-circle'>
					<Link href='/groups' className='indicator'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-5 w-5'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
							/>
						</svg>
					</Link>
				</div>

				<div className='btn btn-ghost btn-circle'>
					<NotificationSystem />
				</div>

				<div className='dropdown dropdown-end'>
					<div tabIndex={0} role='button' className='btn btn-ghost btn-circle avatar'>
						<div className='w-10 rounded-full'>
							{loggedInUser?.avatar &&
							loggedInUser.avatar !== 'default_avatar.jpg' ? (
								<Image
									src={`${backendUrl}/uploads/${loggedInUser.avatar}`}
									alt='User avatar'
									width={40}
									height={40}
								/>
							) : (
								<div className='avatar placeholder'>
									<div className='bg-neutral text-neutral-content w-10 rounded-full'>
										<span className='text-xl uppercase'>
											{loggedInUser?.firstName?.[0]}
											{loggedInUser?.lastName?.[0]}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
					<ul
						tabIndex={0}
						className='menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52'
					>
						<li>
							<Link href='/profile'>Profile</Link>
						</li>
						<li>
							<button onClick={handleLogout}>Log out</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	)
}

export default Header
