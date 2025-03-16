-- GRC Application Database Schema

-- Users and Authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  organization_id INTEGER,
  refresh_token TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50),
  cmmc_target_level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CMMC Domains and Controls Structure
CREATE TABLE domains (
  id SERIAL PRIMARY KEY,
  domain_id VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE controls (
  id SERIAL PRIMARY KEY,
  control_id VARCHAR(20) UNIQUE NOT NULL,
  domain_id VARCHAR(10) REFERENCES domains(domain_id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cmmc_level VARCHAR(50) NOT NULL,
  assessment_objective TEXT,
  discussion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asset Management
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Policies and Procedures
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  description TEXT,
  content TEXT,
  status VARCHAR(50) NOT NULL,
  approved_by INTEGER REFERENCES users(id),
  version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment and Compliance
CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  target_level VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  start_date DATE,
  end_date DATE,
  assessor_id INTEGER REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessment_controls (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER REFERENCES assessments(id),
  control_id VARCHAR(20) REFERENCES controls(control_id),
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  evidence_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Management
CREATE TABLE evidence (
  id SERIAL PRIMARY KEY,
  assessment_control_id INTEGER REFERENCES assessment_controls(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  evidence_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(255),
  content TEXT,
  submitted_by INTEGER REFERENCES users(id),
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Risk Management
CREATE TABLE risks (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  impact INTEGER NOT NULL,
  likelihood INTEGER NOT NULL,
  related_control VARCHAR(20) REFERENCES controls(control_id),
  status VARCHAR(50) NOT NULL,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_mitigations (
  id SERIAL PRIMARY KEY,
  risk_id INTEGER REFERENCES risks(id),
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  due_date DATE,
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit and Accountability
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_controls_domain ON controls(domain_id);
CREATE INDEX idx_controls_level ON controls(cmmc_level);
CREATE INDEX idx_assets_org ON assets(organization_id);
CREATE INDEX idx_assessments_org ON assessments(organization_id);
CREATE INDEX idx_assessment_controls_assessment ON assessment_controls(assessment_id);
CREATE INDEX idx_evidence_assessment_control ON evidence(assessment_control_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp); 