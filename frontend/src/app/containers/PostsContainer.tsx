// Handle fetching posts.
// Filter, sort, and paginate posts (if needed).
// Maintain state related to the posts.
// Pass the filtered posts to the Post ("dumb") component for rendering.

'use client'

import { useEffect, useState } from 'react'
// import axios from 'axios'

type Post = {
	id: number
	content: string
	privacy: 'PUBLIC' | 'PRIVATE' | 'ALMOST_PRIVATE'
	author: {
		id: number
		firstName: string
		lastName: string
	}
	createdAt: Date
	mediaUrl?: string
}

type PostsContainerProps = {
	userId?: string
	feed?: boolean
	isOwnProfile?: boolean
}

const dummyPosts: Post[] = [
	{
		id: 1,
		content: 'See on esimene postitus',
		privacy: 'PUBLIC',
		author: {
			id: 5,
			firstName: 'Liina-Maria',
			lastName: 'Bakhoff',
		},
		createdAt: new Date(),
		mediaUrl:
			'http://localhost:8080/uploads/avatars/1732523991549884000_Screenshot 2024-10-28 at 19.37.41.png',
	},
	{
		id: 2,
		content: 'See on teine postitus',
		privacy: 'PUBLIC',
		author: {
			id: 5,
			firstName: 'Liina-Maria',
			lastName: 'Bakhoff',
		},
		createdAt: new Date(),
	},
]

export default function PostsContainer({
	userId, // Optional userId for profile page
	feed = false, // Whether this is the main feed or not
	isOwnProfile = false, // Whether this is the logged-in user's profile
}: PostsContainerProps) {
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				setLoading(true)
				//const endpoint = feed ? '/api/posts/feed' : `api/${userId}/posts`
				//const response = axios.get(endpoint)
				//console.log('response', response)
				//setPosts(response.data.posts)

				// dummy data for front end testing:
				setPosts(dummyPosts)
			} catch (err) {
				setError('Failed to fetch posts')
				console.log(err)
			} finally {
				setLoading(false)
			}
		}
		fetchPosts()
	}, [userId, feed])
	if (loading) {
		return <div>Loading...</div>
	}
	if (error) {
		return <div>Error: {error}</div>
	}
	return (
		<div>
			{isOwnProfile && <h1 className='text-lg'>My posts</h1>}
			{posts.length && !feed && !isOwnProfile && (
				<h1 className='text-lg'>{`${posts[0].author.firstName}'s posts`}</h1>
			)}
			{posts.map((post) => post.content)}
		</div>
	)
}
