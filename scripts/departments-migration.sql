-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  parent_department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);

-- Add department_id column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department_id') THEN
    ALTER TABLE users ADD COLUMN department_id INTEGER REFERENCES departments(id);
  END IF;
END $$; 