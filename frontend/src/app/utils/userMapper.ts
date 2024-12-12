import { User } from '@/app/utils/types/types'

interface UserApiResponse {
	ID: number
	Email: string
	FirstName: string
	LastName: string
	DOB: string
	Avatar?: string
	Username?: string
	AboutMe?: string
	IsPublic: boolean
}

// Define the function
export function mapUserApiResponseToUser(data: UserApiResponse): User {
	return {
		id: data.ID,
		email: data.Email,
		firstName: data.FirstName,
		lastName: data.LastName,
		dob: new Date(data.DOB), // Convert DOB to a JavaScript Date object
		avatar: data.Avatar || undefined,
		username: data.Username || undefined,
		aboutMe: data.AboutMe || undefined,
		isPublic: data.IsPublic,
	}
}
