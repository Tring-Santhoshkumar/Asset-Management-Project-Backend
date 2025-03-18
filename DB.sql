select * from users
select * from assets
select * from notifications

CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	name VARCHAR(30) NOT NULL,
	email VARCHAR(100) NOT NULL,
	password TEXT NOT NULL,
	role VARCHAR(10) CHECK (role IN ('admin', 'user')),
    profile_pic TEXT DEFAULT NULL,
	dob DATE,
	gender VARCHAR(10),
	blood_group VARCHAR(50),
	marital_status VARCHAR(10),
	phone VARCHAR(10),
	address TEXT,
	designation VARCHAR(50),
	department VARCHAR(50),
	city VARCHAR(50),
  	state VARCHAR(50), 
  	pin_code VARCHAR(10),
  	country VARCHAR(50),
	status VARCHAR(10) CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
	reset_password BOOLEAN DEFAULT TRUE
)


CREATE TABLE assets(
	id serial PRIMARY KEY,
	serial_no VARCHAR(20),
	type VARCHAR(50),
	name VARCHAR(100),
	version VARCHAR(100),
	specifications TEXT,
	condition VARCHAR(50) CHECK (condition IN ('New', 'Good', 'Damaged', 'Needs Repair')) DEFAULT 'New',
	assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_status VARCHAR(20) CHECK (assigned_status IN ('Assigned', 'Available')) DEFAULT 'Available',
	assigned_date TIMESTAMP,
    return_date TIMESTAMP,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
)



INSERT INTO assets (type,serial_no, name, version, specifications, condition, assigned_to, assigned_status, assigned_date, return_date,created_at,updated_at)
VALUES 
('Laptop','TRL101', 'Samsung Galaxy Book', '2023', '16GB RAM, 512GB SSD, Intel i7', 'New', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Laptop','TRL102', 'MacBook Pro', '2023', '16GB RAM, 1TB SSD, Apple', 'Good', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Laptop','TRL103', 'Samsung Galaxy Book', '2022', '14" FHD, 16GB RAM, 512GB SSD', 'Good', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Laptop','TRL104', 'MacBook Pro', '2023', '16GB RAM, 500GB SSD, Apple', 'New', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Laptop','TRL105', 'Lenovo Ideapad Slim 3', '2023', 'AMD Ryzen 9, 32GB RAM, 1TB SSD', 'Good', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Phone','TRL106', 'iPhone 14 Pro', '2023', '128GB, Deep Purple', 'New', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Phone','TRL107', 'Samsung Galaxy S23', '2023', '256GB, Phantom Black', 'Good', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Phone','TRL108', 'Google Pixel 7 Pro', '2023', '128GB, Stormy Black', 'New', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Tablet','TRL109', 'Samsung Galaxy Tab S8', '2022', '256GB, 12.4" Display, S-Pen', 'Good', NULL, 'Available', NULL, NULL,NOW(),NOW()),
('Tablet','TRL110', 'iPad Pro', '2023', 'M2 Chip, 256GB', 'New', NULL, 'Available', NULL, NULL,NOW(),NOW());




CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
