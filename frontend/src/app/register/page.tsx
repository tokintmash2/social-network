'use client'

import Link from 'next/link'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import DatePicker, { registerLocale } from 'react-datepicker'
import { enGB } from 'date-fns/locale/en-GB'
import 'react-datepicker/dist/react-datepicker.css'

export default function RegisterPage() {
	const router = useRouter()

	type User = {
		email: string
		password: string
		firstName: string
		lastName: string
		dob: Date | null // Date or null for dob
		avatar?: File // Optional
		username?: string // Optional
		about?: string // Optional
	}

	const [user, setUser] = React.useState<User>({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		dob: null,
		username: '',
		// avatar, nickname, and about are optional, so we can omit them here
	})

	const [buttonDisabled, setButtonDisabled] = React.useState(false)

	useEffect(() => {
		if (
			user.email.trim().length > 0 &&
			user.password.trim().length > 0 &&
			user.firstName.trim().length > 0 &&
			user.lastName.trim().length > 0 &&
			user.dob !== null
		) {
			setButtonDisabled(false)
		} else {
			setButtonDisabled(true)
		}
	}, [user])

	const [loading, setLoading] = React.useState(false)

	const onRegister = async () => {
		try {
			setLoading(true)
			const response = await axios.post('http://localhost:3000/register', user)
			console.log('signup response', response.data)
			router.push('/login')
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
		} finally {
			setLoading(false)
		}
	}

	registerLocale('en-GB', enGB)

	const [startDate, setStartDate] = React.useState<Date | null>(null) // Start as null
	return (
		<div className='min-h-screen bg-base-200 flex items-center justify-center'>
			<div>
				<Toaster />
			</div>
			<div className='card rounded-md w-full max-w-128 my-4 bg-base-100 shadow-xl'>
				<div className='card-body'>
					<h2 className='card-title text-center mb-3'>Create an Account</h2>

					<form>
						{/* Firstname */}
						<label className='form-control w-full mb-2'>
							<div className='label pb-1'>
								<span className='label-text'>First name</span>
								<span className='label-text-alt opacity-75'>Required</span>
							</div>
							<input
								type='text'
								className='input input-sm input-bordered'
								value={user.firstName}
								onChange={(e) =>
									setUser({
										...user,
										firstName: e.target.value,
									})
								}
							/>
						</label>

						{/* Lastname */}
						<label className='form-control w-full mb-2'>
							<div className='label pb-1'>
								<span className='label-text'>Last name</span>
								<span className='label-text-alt opacity-75'>Required</span>
							</div>
							<input
								type='text'
								className='input input-sm input-bordered'
								value={user.lastName}
								onChange={(e) =>
									setUser({
										...user,
										lastName: e.target.value,
									})
								}
							/>
						</label>

						{/* Email */}
						<label className='form-control w-full mb-2 mb-2'>
							<div className='label pb-1'>
								<span className='label-text'>Email</span>
								<span className='label-text-alt opacity-75'>Required</span>
							</div>
							<input
								type='email'
								className='input input-sm input-bordered'
								value={user.email}
								onChange={(e) =>
									setUser({
										...user,
										email: e.target.value,
									})
								}
							/>
						</label>

						{/* Date of birth */}
						<label className='form-control w-full mb-2'>
							<div className='label pb-1'>
								<span className='label-text'>Date of birth</span>
								<span className='label-text-alt opacity-75'>Required</span>
							</div>
							<DatePicker
								dateFormat='dd/MM/yyyy'
								selected={startDate}
								className='input input-sm input-bordered w-full'
								locale='en-GB'
								onChange={(date) => {
									if (date) {
										setStartDate(date)
									}
								}}
							/>
						</label>

						{/* Avatar */}
						<label className='form-control w-full mb-2'>
							<div className='label pb-1'>
								<span className='label-text'>Avatar/Image</span>
							</div>

							<input
								type='file'
								className='file-input file-input-sm file-input-bordered'
								accept='image/png, image/jpeg'
								onChange={(e) => {
									const file = e.target.files?.[0]
									if (file) {
										if (file.size > 2 * 1024 * 1024) {
											// max size of 2MB
											toast.error('File size should be less than 2MB')
											return
										}
										if (!['image/png', 'image/jpeg'].includes(file.type)) {
											toast.error('Only PNG and JPEG files are allowed')
											return
										}
									}

									setUser({
										...user,
										avatar: file,
									})
								}}
							/>
						</label>

						{/* Nickname */}
						<label className='form-control w-full mb-2'>
							<div className='label pb-1'>
								<span className='label-text'>Nickname</span>
							</div>
							<input
								type='text'
								className='input input-sm input-bordered'
								value={user.username}
								onChange={(e) =>
									setUser({
										...user,
										username: e.target.value,
									})
								}
							/>
						</label>

						{/* About me */}
						<label className='form-control w-full mb-2'>
							<div className='label pb-1'>
								<span className='label-text'>About me</span>
							</div>
							<textarea
								className='textarea textarea-bordered h-24'
								value={user.about}
								spellCheck={false}
								onChange={(e) =>
									setUser({
										...user,
										about: e.target.value,
									})
								}
							></textarea>
						</label>

						{/* Password */}
						<label className='form-control w-full mb-2'>
							<div className='label pb-1'>
								<span className='label-text'>Password</span>
								<span className='label-text-alt opacity-75'>Required</span>
							</div>
							<input
								type='password'
								className='input input-sm input-bordered'
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
								onClick={onRegister}
							>
								{loading ? 'Registering..' : 'Register'}
							</button>
						</div>
					</form>

					{/* Link to Login */}
					<p className='text-center mt-4'>
						Already have an account?{' '}
						<Link href='/login' className='text-primary'>
							Log in
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
