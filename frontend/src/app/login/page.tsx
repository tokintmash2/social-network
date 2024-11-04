'use client'
import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/navigation'
import { axios } from 'axios'

export default function RegisterPage() {
	const [user, setUser] = React.useState({
		email: '',
		password: '',
	})

	const onLogin = async () => {}
	return (
		<div className='min-h-screen bg-base-200 flex items-center justify-center'>
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
								onClick={onLogin}
							>
								Log in
							</button>
						</div>
					</form>

					{/* Link to Register */}
					<p className='text-center mt-4'>
						Don't have an account yet?{' '}
						<Link href='/register' className='text-primary'>
							Register
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
