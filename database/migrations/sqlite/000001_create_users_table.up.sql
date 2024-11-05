CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT UNIQUE,
			username TEXT UNIQUE,
			password TEXT,
			firstName TEXT,
			lastName TEXT,
			age INTEGER,
			gender TEXT
		);