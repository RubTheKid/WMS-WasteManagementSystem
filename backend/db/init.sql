-- WMS Database Initialization Script (Cleaned Version)

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_orders table (simplified)
CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create materials table (simplified)
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    service_order_id INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    product VARCHAR(100) NOT NULL,
    internal_notes TEXT,
    ai_classification TEXT,
    is_hazardous BOOLEAN DEFAULT FALSE,
    classification_code VARCHAR(50),
    risk_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_appointment_date ON service_orders(appointment_date);
CREATE INDEX IF NOT EXISTS idx_materials_service_order_id ON materials(service_order_id);
CREATE INDEX IF NOT EXISTS idx_materials_product ON materials(product);
CREATE INDEX IF NOT EXISTS idx_materials_is_hazardous ON materials(is_hazardous);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, role, password_hash) 
VALUES ('admin@wms.com', 'System Administrator', 'ADMIN', '$2a$10$C8AFya8yn1uDOuo9yL5ojesyekxD1VL/98MzDeQQS9wHcvY4xQAg.')
ON CONFLICT (email) DO NOTHING;

-- Insert default employee user (password: employee123)
INSERT INTO users (email, name, role, password_hash) 
VALUES ('employee@wms.com', 'System Employee', 'EMPLOYEE', '$2a$10$z4i3rtJjN1HA.CQbGnMRHuB.Ltkz7AWDy.W8C6dISlvP1ExoLijJW')
ON CONFLICT (email) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
