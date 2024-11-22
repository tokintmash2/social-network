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

export type User = {
	id: string
	email: string
	firstName: string
	lastName: string
	dob: Date
	avatar?: string
	username?: string
	aboutMe?: string
	isPublic: boolean
}

// Define the function
export function mapUserApiResponseToUser(data: UserApiResponse): User {
	return {
		id: data.ID.toString(),
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
