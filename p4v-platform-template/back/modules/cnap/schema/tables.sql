-- Створення таблиці платних послуг
CREATE TABLE IF NOT EXISTS admin.cnap_services (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    edrpou VARCHAR(8) NOT NULL,
    iban VARCHAR(29) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    create_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Створення таблиці рахунків
CREATE TABLE IF NOT EXISTS admin.cnap_accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(10) NOT NULL CHECK (LENGTH(account_number) <= 10),
    service_id INTEGER NOT NULL REFERENCES admin.cnap_services(id),
    administrator VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME NOT NULL DEFAULT CURRENT_TIME,
    payer VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    create_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Створення індексів для пошуку
CREATE INDEX IF NOT EXISTS idx_cnap_services_search 
ON admin.cnap_services(identifier, name) 
WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_cnap_accounts_search 
ON admin.cnap_accounts(account_number, payer) 
WHERE enabled = true;

-- Тригер для оновлення update_date при зміні запису в таблиці послуг
CREATE OR REPLACE FUNCTION admin.update_cnap_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cnap_services_timestamp
    BEFORE UPDATE ON admin.cnap_services
    FOR EACH ROW
    EXECUTE FUNCTION admin.update_cnap_services_timestamp();

-- Тригер для оновлення update_date при зміні запису в таблиці рахунків
CREATE OR REPLACE FUNCTION admin.update_cnap_accounts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cnap_accounts_timestamp
    BEFORE UPDATE ON admin.cnap_accounts
    FOR EACH ROW
    EXECUTE FUNCTION admin.update_cnap_accounts_timestamp();
