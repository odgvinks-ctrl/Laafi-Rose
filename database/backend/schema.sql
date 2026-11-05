-- Base laafi_backend · généré depuis backend/app/models

CREATE TABLE health_centers (
	id SERIAL NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	type VARCHAR(80), 
	city VARCHAR(80), 
	district VARCHAR(80), 
	address TEXT, 
	phone VARCHAR(20), 
	latitude FLOAT, 
	longitude FLOAT, 
	opening_hours TEXT, 
	accepts_appointments BOOLEAN, 
	verified BOOLEAN, 
	verified_at TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE INDEX ix_health_centers_city ON health_centers (city);

CREATE TABLE roles (
	id SERIAL NOT NULL, 
	code VARCHAR(30) NOT NULL, 
	label VARCHAR(80) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (code)
);

CREATE TABLE services (
	id SERIAL NOT NULL, 
	health_center_id INTEGER NOT NULL, 
	name VARCHAR(120) NOT NULL, 
	category VARCHAR(40) NOT NULL, 
	description TEXT, 
	is_free BOOLEAN, 
	available BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(health_center_id) REFERENCES health_centers (id)
);

CREATE TABLE users (
	id SERIAL NOT NULL, 
	phone VARCHAR(20) NOT NULL, 
	email VARCHAR(120), 
	password_hash TEXT NOT NULL, 
	role_id INTEGER NOT NULL, 
	health_center_id INTEGER, 
	is_active BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	last_login_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (email), 
	FOREIGN KEY(role_id) REFERENCES roles (id), 
	FOREIGN KEY(health_center_id) REFERENCES health_centers (id)
);

CREATE UNIQUE INDEX ix_users_phone ON users (phone);

CREATE TABLE appointments (
	id SERIAL NOT NULL, 
	reference VARCHAR(20) NOT NULL, 
	user_id INTEGER, 
	health_center_id INTEGER NOT NULL, 
	service_id INTEGER, 
	desired_at TIMESTAMP WITHOUT TIME ZONE, 
	confirmed_at TIMESTAMP WITHOUT TIME ZONE, 
	name VARCHAR(100) NOT NULL, 
	phone VARCHAR(20) NOT NULL, 
	contact_method VARCHAR(10), 
	language VARCHAR(5), 
	status VARCHAR(20), 
	staff_note TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(health_center_id) REFERENCES health_centers (id), 
	FOREIGN KEY(service_id) REFERENCES services (id)
);

CREATE UNIQUE INDEX ix_appointments_reference ON appointments (reference);

CREATE TABLE notifications (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	type VARCHAR(40) NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	body TEXT, 
	channel VARCHAR(10), 
	link VARCHAR(255), 
	read_at TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE INDEX ix_notifications_user_id ON notifications (user_id);

CREATE TABLE profiles (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	first_name VARCHAR(60) NOT NULL, 
	last_name VARCHAR(60), 
	gender VARCHAR(10), 
	birth_year INTEGER, 
	city VARCHAR(80), 
	language VARCHAR(5), 
	text_size VARCHAR(15), 
	avatar_url VARCHAR(255), 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
