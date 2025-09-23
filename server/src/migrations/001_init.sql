-- 001_init.sql
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  max_devices INT NOT NULL DEFAULT 1,
  description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  subscription_id INT NULL,
  subscription_start DATETIME NULL,
  subscription_end DATETIME NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS artists (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  country VARCHAR(100),
  start_year INT,
  follower_count INT NOT NULL DEFAULT 0,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS albums (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  artist_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  release_date DATE NULL,
  cover_url VARCHAR(255),
  total_playlength_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS songs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  primary_artist_id BIGINT NOT NULL,
  album_id BIGINT NULL,
  track_number INT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  duration_text VARCHAR(16),
  explicit BOOLEAN NOT NULL DEFAULT FALSE,
  audio_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (primary_artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- M:N: songs ↔ artists
CREATE TABLE IF NOT EXISTS song_artists (
  song_id BIGINT NOT NULL,
  artist_id BIGINT NOT NULL,
  role VARCHAR(100) DEFAULT 'featured',
  PRIMARY KEY (song_id, artist_id),
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- follows: user follows artist
CREATE TABLE IF NOT EXISTS follows (
  user_id BIGINT NOT NULL,
  artist_id BIGINT NOT NULL,
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, artist_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- playlists
CREATE TABLE IF NOT EXISTS playlists (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id BIGINT NOT NULL,
  song_id BIGINT NOT NULL,
  position INT DEFAULT 0,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (playlist_id, song_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- Indexes
-- DROP INDEX idx_artists_name ON artists;
-- CREATE INDEX idx_artists_name ON artists(name);

-- DROP INDEX idx_albums_artist ON albums;
-- CREATE INDEX idx_albums_artist ON albums(artist_id);

-- DROP INDEX idx_songs_album ON songs;
-- CREATE INDEX idx_songs_album ON songs(album_id);


SET FOREIGN_KEY_CHECKS = 1;

-- Seed subscriptions
INSERT INTO subscriptions (name, price, max_devices, description)
VALUES
  ('free', 0.00, 1, 'Free tier with ads and limited features')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO subscriptions (name, price, max_devices, description)
VALUES
  ('premium', 4.99, 5, 'Premium tier: ad-free, higher quality streaming')
ON DUPLICATE KEY UPDATE name = name;

-- Triggers for follower_count
DROP TRIGGER IF EXISTS trg_follows_after_insert;
CREATE TRIGGER trg_follows_after_insert
AFTER INSERT ON follows
FOR EACH ROW
  UPDATE artists
  SET follower_count = follower_count + 1
  WHERE id = NEW.artist_id;

DROP TRIGGER IF EXISTS trg_follows_after_delete;
CREATE TRIGGER trg_follows_after_delete
AFTER DELETE ON follows
FOR EACH ROW
  UPDATE artists
  SET follower_count = GREATEST(follower_count - 1, 0)
  WHERE id = OLD.artist_id;
