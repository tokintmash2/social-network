import { Post_type } from './utils/types'
import { Notification } from './utils/types/notifications'

type Group = {
    id: number
    name: string
    description: string
    memberCount: number
}

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
    {
        id: 3,
        title: 'From Skeptic to Believer: My Experience with Loora AI',
        content: 'I recently started brushing up on my English skills for a big job interview with an international company. At first, I was super skeptical about practicing with an AI tool like Loora AI—talking to a machine felt a bit…awkward.<br><br>But once I got over the initial weirdness, I was pleasantly surprised! Loora was not just responsive—it felt like I was chatting with a real tutor who understood my mistakes and helped me improve without judgment. It even gave me confidence in speaking fluently and naturally.<br><br>If you are ever doubted AI learning tools, trust me: give them a shot. They might just surprise you! <br><br>#LanguageLearning #AItools #LooraAI #JobPrep #InterviewReady',
        privacy: 'PUBLIC',
        author: {
            id: 4,
            firstName: 'Peter',
            lastName: 'Parker',
        },
        createdAt: new Date('2024-01-15T10:30:00'),
        mediaUrl: null,
        allowedUsers: [],
        comments: [],
    },
    {
        id: 4,
        title: 'Conquering Public Speaking with AI Assistance',
        content: 'Public speaking has always been a huge challenge for me. The fear, the nerves—it\'s overwhelming. But then I discovered an AI-powered presentation coach, and wow, what a game-changer! <br><br>The AI gave me real-time feedback on tone, pacing, and even body language through my webcam. Practicing with it felt awkward at first, but soon, it became my secret weapon. <br><br>This tool didn\'t just improve my speaking—it boosted my confidence. Now, walking on stage feels empowering instead of terrifying. Highly recommend it to anyone struggling with presentations! <br><br>#PublicSpeaking #AItools #PresentationSkills #ConfidenceBoost',
        privacy: 'PUBLIC',
        author: {
            id: 3,
            firstName: 'Jane',
            lastName: 'Smith',
        },
        createdAt: new Date('2024-01-14T15:45:00'),
        mediaUrl: null,
        allowedUsers: [],
        comments: [],
    },
    {
        id: 5,
        title: 'Writing the Perfect Resume with ChatGPT',
        content: 'Creating a resume has always felt daunting. How do you make it stand out? Enter ChatGPT. <br><br>I was skeptical about using AI for something so personal, but I gave it a try. After feeding it my job details, it helped me craft a resume that felt polished and professional. It even suggested keywords tailored to the roles I was applying for! <br><br>Sometimes, we underestimate how much technology can simplify our lives. If you\'re stuck updating your resume, give AI a chance—it might just land you your dream job. <br><br>#CareerGrowth #ResumeTips #ChatGPT #AItools',
        privacy: 'PUBLIC',
        author: {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
        },
        createdAt: new Date('2024-01-13T09:20:00'),
        mediaUrl: null,
        allowedUsers: [],
        comments: [],
    },
    {
        id: 6,
        title: 'Fitness Goals with AI-Powered Trackers',
        content: 'Just completed my first month using an AI fitness tracker, and the results are incredible! The personalized workout suggestions and form corrections have made such a difference. Looking forward to reaching new fitness milestones! 💪 #FitnessJourney #AIFitness #HealthTech',
        privacy: 'PUBLIC',
        author: {
            id: 1,
            firstName: 'Alice',
            lastName: 'Johnson',
        },
        createdAt: new Date('2024-01-12T16:15:00'),
        mediaUrl: null,
        allowedUsers: [],
        comments: [],
    },
    {
        id: 7,
        title: 'AI Art Exhibition Success!',
        content: 'Just wrapped up my first AI art exhibition! The blend of human creativity and machine learning created some truly unique pieces. Amazing to see how technology can enhance artistic expression rather than replace it. #AIArt #DigitalArt #Exhibition',
        privacy: 'PUBLIC',
        author: {
            id: 4,
            firstName: 'Peter',
            lastName: 'Parker',
        },
        createdAt: new Date('2024-01-11T11:30:00'),
        mediaUrl: null,
        allowedUsers: [],
        comments: [],
    }
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

export const myGroups: Group[] = [
    { id: 1, name: "Tech Enthusiasts", memberCount: 150, description: "A group for tech lovers" },
    { id: 2, name: "Book Club", memberCount: 75, description: "Weekly book discussions" },
    { id: 3, name: "Fitness Goals", memberCount: 200, description: "Share your fitness journey" }
]

export const availableGroups: Group[] = [
    { id: 4, name: "Photography Club", memberCount: 300, description: "Share your best shots" },
    { id: 5, name: "Cooking Masters", memberCount: 250, description: "Recipe sharing and tips" },
    { id: 6, name: "Travel Stories", memberCount: 400, description: "Share your adventures" }
]
