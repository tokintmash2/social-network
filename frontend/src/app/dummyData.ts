import {
	Post_type,
	PostsContainerProps_type,
	PostsAction_type,
	PostsState_type,
} from './utils/types'

export const dummyFollowers: { id: number; firstName: string; lastName: string }[] = [
	{ id: 1, firstName: 'John', lastName: 'Doe' },
	{ id: 2, firstName: 'Jane', lastName: 'Smith' },
	{ id: 3, firstName: 'Alice', lastName: 'Johnson' },
]

export const dummyPosts: Post_type[] = [
	{
		id: 1,
		title: 'See on esimese postituse pealkiri',
		content: 'See on esimese postituse sisu',
		privacy: 'PUBLIC',
		author: {
			id: 4,
			firstName: 'Liina-Maria',
			lastName: 'Bakhoff',
		},
		createdAt: new Date(),
		mediaUrl: 'http://localhost:8080/uploads/IMG_0659.heic',
		allowedUsers: [1, 4, 5],
	},
	{
		id: 2,
		title: 'See on esimese postituse pealkiri',
		content: 'See on esimese postituse sisu',
		privacy: 'PUBLIC',
		author: {
			id: 4,
			firstName: 'Liina-Maria',
			lastName: 'Bakhoff',
		},
		createdAt: new Date(),
		mediaUrl: 'http://localhost:8080/avatars/default_avatar.png',
		allowedUsers: [2, 3],
	},
]
