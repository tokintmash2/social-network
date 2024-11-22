import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import ClientLayout from './ClientLayout'

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
})
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
})

export const metadata: Metadata = {
	title: 'Social network',
	description: 'kood/jõhvi project for JS course',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' className='bg-base-200'>
			<body className={`${geistSans.variable} ${geistMono.variable} bg-base-200 antialiased`}>
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	)
}
