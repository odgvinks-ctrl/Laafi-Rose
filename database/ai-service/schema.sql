-- Base laafi_ai · généré depuis ai-service/app/models

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE ai_logs (
	id SERIAL NOT NULL, 
	session_id VARCHAR(36), 
	message_id INTEGER, 
	event VARCHAR(30) NOT NULL, 
	provider VARCHAR(30), 
	model VARCHAR(80), 
	latency_ms INTEGER, 
	top_score FLOAT, 
	detail TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE INDEX ix_ai_logs_session_id ON ai_logs (session_id);

CREATE TABLE chat_sessions (
	id VARCHAR(36) NOT NULL, 
	user_id INTEGER, 
	language VARCHAR(5), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	last_activity_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE INDEX ix_chat_sessions_user_id ON chat_sessions (user_id);

CREATE TABLE documents (
	id SERIAL NOT NULL, 
	slug VARCHAR(120) NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	category VARCHAR(30) NOT NULL, 
	summary TEXT, 
	content TEXT NOT NULL, 
	language VARCHAR(5), 
	reading_minutes INTEGER, 
	audio_urls TEXT, 
	status VARCHAR(20), 
	reviewed_by VARCHAR(120), 
	reviewed_at TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE INDEX ix_documents_status ON documents (status);

CREATE UNIQUE INDEX ix_documents_slug ON documents (slug);

CREATE TABLE chat_messages (
	id SERIAL NOT NULL, 
	session_id VARCHAR(36) NOT NULL, 
	role VARCHAR(10) NOT NULL, 
	content TEXT NOT NULL, 
	sources JSON, 
	document_slugs JSON, 
	is_urgent BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(session_id) REFERENCES chat_sessions (id)
);

CREATE INDEX ix_chat_messages_session_id ON chat_messages (session_id);

CREATE TABLE embeddings (
	id SERIAL NOT NULL, 
	document_id INTEGER NOT NULL, 
	chunk_index INTEGER NOT NULL, 
	content TEXT NOT NULL, 
	vector VECTOR(384) NOT NULL, 
	model VARCHAR(80) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(document_id) REFERENCES documents (id)
);

CREATE INDEX ix_embeddings_document_id ON embeddings (document_id);

CREATE TABLE sources (
	id SERIAL NOT NULL, 
	document_id INTEGER NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	organisation VARCHAR(120), 
	url VARCHAR(500), 
	year INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(document_id) REFERENCES documents (id)
);

CREATE INDEX ix_sources_document_id ON sources (document_id);
