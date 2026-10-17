CREATE TABLE
    users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        display_name VARCHAR(50),
        password_hash VARCHAR(255) NOT NULL,
        auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
        google_sub VARCHAR(255) UNIQUE
    );

CREATE TABLE
    categories (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL,
        CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT uk_categories_user_name UNIQUE (user_id, name)
    );

CREATE TABLE
    budgets (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        category_id BIGINT NOT NULL,
        month VARCHAR(7) NOT NULL,
        limit_amount DECIMAL(19, 2) NOT NULL,
        CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_budgets_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
        CONSTRAINT uk_budgets_user_category_month UNIQUE (user_id, category_id, month)
    );

CREATE TABLE
    transactions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        category_id BIGINT NOT NULL,
        amount DECIMAL(19, 2) NOT NULL,
        type VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        note TEXT,
        CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
    );

CREATE INDEX idx_transactions_user_category_date ON transactions (user_id, category_id, date);

CREATE INDEX idx_budgets_user_month ON budgets (user_id, month);