'use client'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
// import { initializeWebSocket } from '@/app/utils/websocket'

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
				// const ws = initializeWebSocket()
				// ws.send(JSON.stringify({ type: 'auth', token: 'your-auth-token' }))
				// Set the logged-in user data in UserContext
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
		<div className='min-h-screen bg-base-200 flex items-center justify-center'>
			<div>
				<Toaster />
			</div>
			<div className='card rounded-md w-full max-w-128 my-4 bg-base-100 shadow-xl'>
				<div className='card-body'>
					<h2 className='card-title text-center mb-3'>Log in</h2>

					<form>
						{/* Email */}
						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>Email</span>
							</div>
							<input
								type='email'
								className='input input-bordered'
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
						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>Password</span>
							</div>
							<input
								type='password'
								className='input input-bordered'
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
						<div className='form-control mt-6'>
							<button
								type='submit'
								className='btn btn-outline btn-primary'
								disabled={buttonDisabled}
								onClick={onLogin}
							>
								{loading ? 'Logging in..' : 'Log in'}
							</button>
						</div>
					</form>

					{/* Link to Register */}
					<p className='text-center mt-4'>
						Don&apos;t have an account yet?{' '}
						<Link href='/register' className='text-primary'>
							Register
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
