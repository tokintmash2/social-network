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
		dob: Date | null
		avatar?: File
		username?: string
		about?: string
	}

	const [user, setUser] = React.useState<User>({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		dob: null,
		username: '',
	})

	const [buttonDisabled, setButtonDisabled] = React.useState(false)
	const [loading, setLoading] = React.useState(false)
	const [startDate, setStartDate] = React.useState<Date | null>(null)

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

	const onRegister = async () => {
		try {
			setLoading(true)
			const formData = new FormData()

			formData.append('email', user.email)
			formData.append('password', user.password)
			formData.append('firstName', user.firstName)
			formData.append('lastName', user.lastName)
			formData.append('dob', user.dob?.toISOString().split('T')[0] || '')
			formData.append('username', user.username || '')
			formData.append('about', user.about || '')

			if (user.avatar) {
				formData.append('avatar', user.avatar)
			}

			const response = await axios.post('http://localhost:8080/register', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			if (response.data.success) {
				router.push('/login')
			}
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
		} finally {
			setLoading(false)
		}
	}

	registerLocale('en-GB', enGB)

	return (
		<div className='min-h-screen bg-base-200 flex'>
			<div className='w-2/5 flex items-center justify-center'>
				<div>
					<Toaster />
				</div>

				<div className='card rounded-md w-full max-w-128 py-2'>
					<div className='card-body'>
						<form className='flex flex-col items-center justify-center space-y-2 w-full'>
							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>First Name</span>
								<input
									type='text'
									className='input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl w-full text-[#687984] text-sm font-light'
									value={user.firstName}
									onChange={(e) => setUser({ ...user, firstName: e.target.value })}
								/>
							</label>

							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>Last Name</span>
								<input
									type='text'
									className='input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl w-full text-[#687984] text-sm font-light'
									value={user.lastName}
									onChange={(e) => setUser({ ...user, lastName: e.target.value })}
								/>
							</label>

							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>Email</span>
								<input
									type='email'
									className='input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl w-full text-[#687984] text-sm font-light'
									value={user.email}
									onChange={(e) => setUser({ ...user, email: e.target.value })}
								/>
							</label>

							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>Date of Birth</span>
								<DatePicker
									dateFormat='dd/MM/yyyy'
									selected={startDate}
									className='input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl w-full text-[#687984] text-sm font-light'
									locale='en-GB'
									onChange={(date: Date | null) => {
										if (date) {
											setStartDate(date)
											setUser({ ...user, dob: date })
										}
									}}
								/>
							</label>

							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>Avatar/Image</span>
								<input
									type='file'
									className='file-input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl w-full text-[#687984] text-sm font-light file-input-bordered [&::file-selector-button]:bg-[#B9D7EA] [&::file-selector-button]:text-[#687984] [&::file-selector-button]:border-0 [&::file-selector-button]:font-light [&::file-selector-button]:shadow-[0_4px_4px_rgba(0,0,0,0.25)] [&::file-selector-button]:hover:bg-[#A3B8C5] [&::file-selector-button]:hover:text-[#FFFFFF]'
									accept='image/png, image/jpeg'
									onChange={(e) => {
										const file = e.target.files?.[0]
										if (file) {
											if (file.size > 2 * 1024 * 1024) {
												toast.error('File size should be less than 2MB')
												return
											}
											if (!['image/png', 'image/jpeg'].includes(file.type)) {
												toast.error('Only PNG and JPEG files are allowed')
												return
											}
											setUser({ ...user, avatar: file })
										}
									}}
								/>
							</label>

							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>Nickname</span>
								<input
									type='text'
									className='input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl w-full text-[#687984] text-sm font-light'
									value={user.username}
									onChange={(e) => setUser({ ...user, username: e.target.value })}
								/>
							</label>

							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>About Me</span>
								<textarea
									className='textarea h-16 bg-white shadow-inner shadow-gray-400 rounded-2xl w-full text-[#687984] text-sm font-light'
									value={user.about}
									onChange={(e) => setUser({ ...user, about: e.target.value })}
								/>
							</label>

							<label className='form-control w-2/3'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>Password</span>
								<input
									type='password'
									className='input h-9 bg-white shadow-inner shadow-gray-400 rounded-2xl w-full text-[#687984] text-sm font-light'
									value={user.password}
									onChange={(e) => setUser({ ...user, password: e.target.value })}
								/>
							</label>

							<div className='form-control mt-2 w-2/3'>
								<button
									type='button'
									className='btn h-9 btn-primary bg-[#B9D7EA] border-0 shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-2xl text-[#687984] font-light hover:bg-[#A3B8C5] hover:text-[#FFFFFF]'
									disabled={buttonDisabled}
									onClick={onRegister}
								>
									{loading ? 'Registering...' : 'Register'}
								</button>
							</div>
						</form>

						<p className='text-center mt-2 text-sm'>
							Already have an account?{' '}
							<Link href='/login' className='text-primary text-[#8DABC2]'>
								Login
							</Link>
						</p>
					</div>
				</div>
			</div>

			<div className='w-3/5 bg-cover bg-center' style={{ backgroundImage: 'url(https://res.cloudinary.com/dtdneratd/image/upload/v1733229108/augustine-wong-T0BYurbDK_M-unsplash-min_obmpdc.jpg)' }}></div>
		</div>
	)
}
