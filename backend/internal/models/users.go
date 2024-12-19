package models

import (
	"database/sql"
	"social-network/structs"
)

type UserModel struct {
	DB *sql.DB
}

func (u *UserModel) GetUserList(id int) ([]structs.User, error) {

	query := `
	SELECT
		U.id,
		U.first_name,
		U.last_name,
		U.username
	FROM
		users U
		JOIN followers F ON U.id = F.followed_id 
	WHERE
		F.follower_id = ?
	UNION
	SELECT
		U.id,
		U.first_name,
		U.last_name,
		U.username
	FROM
		users U
		JOIN followers F ON U.id = F.follower_id 
	WHERE
		F.followed_id = ?
	`
	rows, err := u.DB.Query(query, id, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []structs.User

	for rows.Next() {
		var user structs.User
		err = rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&user.Username,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
