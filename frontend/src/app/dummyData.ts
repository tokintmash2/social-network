import { Post_type } from './utils/types'
import { Notification } from './utils/types/notifications'

export const formatTimestamp = (date: Date): string => {
	return date.toLocaleString('en-US', {
	  year: 'numeric',
	  month: 'short',
	  day: 'numeric',
	  hour: '2-digit',
	  minute: '2-digit'
	});
  };

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
		comments: [
			{
				id: 1,
				author: {
					id: 2,
					firstName: 'Jane',
					lastName: 'Smith',
				},
				content: 'See on esimese kommentaari sisu',
				mediaUrl: null,
				createdAt: new Date(),
			},
			{
				id: 2,
				author: {
					id: 2,
					firstName: 'Jane',
					lastName: 'Smith',
				},
				content: 'See on teise kommentaari sisu',
				mediaUrl: null,
				createdAt: new Date(),
			},
		],
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
		comments: [],
	},
]

export const dummyNotifications: Notification[] = [
	{
	  id: 1,
	  message: "John Doe sent you a friend request",
	  timestamp: formatTimestamp(new Date()),
	  type: "friend_request",
	  linkTo: "/profile/john",
	  read: false,
	  requestType: "friend",
	  status: "pending"
	},
	{
	  id: 2,
	  message: "You've been invited to join 'Coding Club' group",
	  timestamp: formatTimestamp(new Date(Date.now() - 3600000)),
	  type: "group_request",
	  linkTo: "/groups/coding-club",
	  read: false,
	  requestType: "group",
	  status: "pending"
	},
	{
	  id: 3,
	  message: "New event: 'Summer Hackathon 2024' - Are you joining?",
	  timestamp: formatTimestamp(new Date(Date.now() - 7200000)),
	  type: "event_request",
	  linkTo: "/events/123",
	  read: false,
	  requestType: "event",
	  status: "pending"
	},
	{
	  id: 4,
	  message: "Alice commented on your post: 'Great idea!'",
	  timestamp: formatTimestamp(new Date(Date.now() - 86400000)),
	  type: "comment",
	  linkTo: "/posts/123",
	  read: true
	}
  ];
  