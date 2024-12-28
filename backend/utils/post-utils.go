package utils

import (
	"social-network/database"
	"social-network/structs"
)

// func FetchAllowedUsers(postID int) ([]int, error) {
// 	rows, err := database.DB.Query(`
//         SELECT u.id
//         FROM post_access pa
//         JOIN users u ON pa.follower_id = u.id
//         WHERE pa.post_id = ?
//     `, postID)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

//		var allowedUsers []int
//		for rows.Next() {
//			var user int
//			if err := rows.Scan(&user); err != nil {
//				return nil, err
//			}
//			allowedUsers = append(allowedUsers, user)
//		}
//		return allowedUsers, nil
//	}
func FetchAllowedUsers(postID int) ([]int, error) {
	rows, err := database.DB.Query(`
        SELECT u.id
        FROM post_access pa
        JOIN users u ON pa.follower_id = u.id
        WHERE pa.post_id = ?
    `, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var allowedUsers []int
	for rows.Next() {
		var user int
		if err := rows.Scan(&user); err != nil {
			return nil, err
		}
		allowedUsers = append(allowedUsers, user)
	}
	return allowedUsers, nil
}

func SetPostAccess(postID int, userID int, privacy string, allowedUsers []int) error {
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if len(allowedUsers) > 0 {
		// Insert specified allowed users
		for _, userID := range allowedUsers {
			_, err = tx.Exec(`
                    INSERT INTO post_access (post_id, follower_id)
                    VALUES (?, ?)`, postID, userID)
			if err != nil {
				return err
			}
		}
	}

	// if privacy == "private" {
	//     // Fetch all followers
	//     rows, err := tx.Query(`
	//         SELECT follower_id
	//         FROM followers
	//         WHERE followed_id = ?`, userID)
	//     if err != nil {
	//         return err
	//     }
	//     defer rows.Close()

	//     // Insert each follower into post_access
	//     for rows.Next() {
	//         var followerID int
	//         if err := rows.Scan(&followerID); err != nil {
	//             return err
	//         }
	//         _, err = tx.Exec(`
	//             INSERT INTO post_access (post_id, follower_id)
	//             VALUES (?, ?)`, postID, followerID)
	//         if err != nil {
	//             return err
	//         }
	//     }
	// } else if len(allowedUsers) > 0 {
	//     // Insert specified allowed users
	//     for _, userID := range allowedUsers {
	//         _, err = tx.Exec(`
	//             INSERT INTO post_access (post_id, follower_id)
	//             VALUES (?, ?)`, postID, userID)
	//         if err != nil {
	//             return err
	//         }
	//     }
	// }

	return tx.Commit()
}

func UpdatePost(postID int, newPost structs.PostResponse) error {
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
}
