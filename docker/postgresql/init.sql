-- PostgreSQL initialization script
-- This script runs automatically when the PostgreSQL container starts

-- Create extensions (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE blog TO bloguser;
