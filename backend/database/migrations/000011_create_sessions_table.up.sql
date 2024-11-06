CREATE TABLE sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			session_uuid TEXT,
			expiry TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)