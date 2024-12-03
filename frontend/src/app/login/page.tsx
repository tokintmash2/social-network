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

	const [buttonDisabled, setButtonDisabled] = React.useState(false)

	useEffect(() => {
		if (user.email.trim().length > 0 && user.password.trim().length > 0) {
			setButtonDisabled(false)
		} else {
			setButtonDisabled(true)
		}
	}, [user])

	const [loading, setLoading] = React.useState(false)

	const onLogin = async (e: React.FormEvent) => {
		e.preventDefault() // Prevent form submission
		try {
			setLoading(true)
			const response = await axios.post('http://localhost:8080/login', user, {
				withCredentials: true,
			})

			if (response.data.success) {
				router.push('/profile')
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
						<h1 className="card-title self-center text-4xl bg-gradient-to-l from-[#687984] to-[#B9D7EA] text-transparent bg-clip-text">
							SPHERE
						</h1>


						<form className='flex flex-col items-center justify-center'>
							{/* Email */}
							<label className='form-control w-2/3'>
								
								<input
									type='email'
									className='input bg-white shadow-inner shadow-gray-400 rounded-2xl'
									value={user.email}
									onChange={(e) =>
										setUser({
											...user,
											email: e.target.value,
										})
									}
								/>
							</label>

							{/* Password */}
							<label className='form-control w-2/3 mt-6'>
								<input
									type='password'
									className='input bg-white shadow-inner shadow-gray-400 rounded-2xl'
									value={user.password}
									onChange={(e) =>
										setUser({
											...user,
											password: e.target.value,
										})
									}
								/>
							</label>

							{/* Submit Button */}
							<div className='form-control mt-6 w-2/3 item-center'>
								<button
									type='submit'
									className='btn btn-primary bg-[#B9D7EA] border-0 shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-2xl text-[#687984] font-light hover:bg-[#A3B8C5] hover:text-[#FFFFFF]'

									onClick={onLogin}
								>
									{loading ? 'Logging in..' : 'Log in'}
								</button>
							</div>
						</form>

						{/* Link to Register */}
						<p className='text-center mt-4'>
							Don&apos;t have an account yet?{' '}
							<Link href='/register' className='text-primary text-[#B9D7EA] '>
								Register
							</Link>
						</p>
					</div>
				</div>
			</div>

			{/* Right side - Background */}
			<div className='w-3/5 bg-cover bg-center'  style={{ backgroundImage: 'url(https://res.cloudinary.com/dtdneratd/image/upload/v1733229108/augustine-wong-T0BYurbDK_M-unsplash-min_obmpdc.jpg)' }}></div>
		</div>
	)
}
