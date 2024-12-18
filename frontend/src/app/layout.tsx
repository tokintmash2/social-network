import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import ClientLayout from './ClientLayout'
import { WebSocketProvider } from './components/WsContext'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' className='bg-base-200'>
			<body className={`${geistSans.variable} ${geistMono.variable} bg-base-200 antialiased`}>
				<WebSocketProvider>
					<ClientLayout>{children}</ClientLayout>
				</WebSocketProvider>
			</body>
		</html>
	)
}
