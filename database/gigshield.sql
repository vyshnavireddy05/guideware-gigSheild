CREATE DATABASE IF NOT EXISTS gigshield;
USE gigshield;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100),
  password_hash VARCHAR(255),
  aadhaar_number VARCHAR(20),
  upi_id VARCHAR(100),
  platform ENUM('ZOMATO','SWIGGY') NOT NULL,
  city VARCHAR(50) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  avg_weekly_income DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  risk_score DECIMAL(3,2) DEFAULT 0.50,
  risk_level ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  role ENUM('WORKER','ADMIN') DEFAULT 'WORKER',
  status ENUM('ACTIVE','SUSPENDED','PENDING') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE policies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  weekly_premium DECIMAL(10,2) NOT NULL,
  max_coverage_amount DECIMAL(10,2) NOT NULL,
  coverage_hours INT DEFAULT 60,
  status ENUM('ACTIVE','EXPIRED','CANCELLED') DEFAULT 'ACTIVE',
  payment_status ENUM('PAID','PENDING','FAILED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE disruptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  disruption_type ENUM('HEAVY_RAIN','EXTREME_HEAT','HIGH_AQI',
                       'CURFEW','FLOOD','PLATFORM_OUTAGE') NOT NULL,
  city VARCHAR(50) NOT NULL,
  zone VARCHAR(100),
  severity ENUM('LOW','MEDIUM','HIGH','EXTREME') NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NULL,
  api_source VARCHAR(100),
  raw_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE claims (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  policy_id BIGINT NOT NULL,
  disruption_id BIGINT NOT NULL,
  disruption_hours DECIMAL(4,2),
  claimed_amount DECIMAL(10,2),
  approved_amount DECIMAL(10,2),
  fraud_score DECIMAL(3,2),
  status ENUM('AUTO_INITIATED','FRAUD_CHECK',
              'APPROVED','REJECTED','PAID') DEFAULT 'AUTO_INITIATED',
  rejection_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  FOREIGN KEY (disruption_id) REFERENCES disruptions(id)
);

CREATE TABLE payouts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  claim_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  upi_id VARCHAR(100),
  transaction_id VARCHAR(100),
  status ENUM('INITIATED','SUCCESS','FAILED') DEFAULT 'INITIATED',
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (claim_id) REFERENCES claims(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
