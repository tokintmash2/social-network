'use client'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
	const router = useRouter()

	type User = {
		email: string
		password: string
		username?: string
	}

	const [user, setUser] = React.useState<User>({
		email: '',
		password: '',
	})

	const [buttonDisabled, setButtonDisabled] = React.useState(true)

	useEffect(() => {
		if (user.email.trim().length > 0 && user.password.trim().length > 0) {
			setButtonDisabled(false)
		} else {
			setButtonDisabled(true)
		}
	}, [user])

	const [loading, setLoading] = React.useState(false)

	const onLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setLoading(true)
			const response = await axios.post('http://localhost:8080/login', user, {
				withCredentials: true,
			})

			if (response.data.success) {
				router.push('/')
			} else {
				toast.error(response.data.message)
			}
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-base-200 flex'>
			<div className='w-2/5 flex items-center justify-center'>
				<div>
					<Toaster />
				</div>

				<div className='card rounded-md w-full max-w-128 my-4 '>
					<div className='card-body center'>
						<h1 className='card-title self-center text-4xl bg-gradient-to-l from-[#687984] to-[#B9D7EA] text-transparent bg-clip-text'>
							SPHERE
						</h1>

						<form className='flex flex-col items-center justify-center'>
							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>
									Email
								</span>
								<input
									type='email'
									className='input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl text-[#687984] text-sm font-light hover:bg-[#F5F5F5] transition-colors'
									value={user.email}
									autoFocus
									onChange={(e) =>
										setUser({
											...user,
											email: e.target.value,
										})
									}
								/>
							</label>

							<label className='form-control w-2/3 mt-6'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>
									Password
								</span>
								<input
									type='password'
									className='input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl text-[#687984] text-sm font-light hover:bg-[#F5F5F5] transition-colors'
									value={user.password}
									onChange={(e) =>
										setUser({
											...user,
											password: e.target.value,
										})
									}
								/>
							</label>

							<div className='form-control mt-6 w-2/3 item-center'>
								<button
									type='submit'
									className='btn h-9 btn-primary bg-[#B9D7EA] border-0 shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-2xl text-[#687984] font-light hover:bg-[#A3B8C5] hover:text-[#FFFFFF]'
									disabled={buttonDisabled}
									onClick={onLogin}
								>
									{loading ? 'Logging in..' : 'Log in'}
								</button>
							</div>
						</form>

						<p className='text-center mt-4'>
							Don&apos;t have an account yet?{' '}
							<Link href='/register' className='text-primary text-[#8DABC2] '>
								Register
							</Link>
						</p>
					</div>
				</div>
			</div>

			<div
				className='w-3/5 bg-cover bg-center'
				style={{
					backgroundImage:
						'url(https://res.cloudinary.com/dtdneratd/image/upload/v1733229108/augustine-wong-T0BYurbDK_M-unsplash-min_obmpdc.jpg)',
				}}
			></div>
		</div>
	)
}
