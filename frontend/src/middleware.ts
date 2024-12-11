import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname
	const isPublicPath = path === '/login' || path === '/register'
	const token = request.cookies.get('session')?.value || ''
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

	if (token && !isPublicPath) {
		try {
			const response = await fetch(`${backendUrl}/api/verify-session`, {
				headers: {
					Cookie: `session=${token}`,
				},
			})
			if (!response.ok) {
				// indicating an invalid session
				request.cookies.delete('session')
				return NextResponse.redirect(new URL('/login', request.nextUrl))
			}
		} catch (error) {
			console.log(error)
			return NextResponse.redirect(new URL('/login', request.nextUrl))
		}
	}

	if (isPublicPath && token) {
		return NextResponse.redirect(new URL('/', request.nextUrl))
	}

	if (!isPublicPath && !token) {
		return NextResponse.redirect(new URL('/login', request.nextUrl))
	}
}

export const config = {
	matcher: ['/login', '/register', '/profile/:path*', '/groups/:path*', '/'],
}
