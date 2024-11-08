CREATE TABLE online_status (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			online_status BOOLEAN DEFAULT FALSE,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)