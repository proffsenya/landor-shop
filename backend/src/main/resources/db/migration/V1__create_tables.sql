-- Создание таблицы banners
CREATE TABLE IF NOT EXISTS banners (
    id BIGSERIAL PRIMARY KEY,
    image_data BYTEA NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255),
    size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isactive BOOLEAN
    );

-- Создание таблицы brands
CREATE TABLE IF NOT EXISTS brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100)
    );

-- Создание таблицы categories
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(255),
    slug VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    parent_id BIGINT,
    CONSTRAINT fk_parent_category
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

-- Создание таблица breeds
CREATE TABLE IF NOT EXISTS breeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT,
    slug VARCHAR(100),
    CONSTRAINT fk_breed_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_staff BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    middle_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Создание таблицы cart
CREATE TABLE IF NOT EXISTS cart (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- Создание таблицы product_types
CREATE TABLE IF NOT EXISTS product_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100)
    );

-- Создание таблицы products
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(2000),
    slug VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    brand_id BIGINT,
    product_type_id BIGINT,
    guaranteed_indicators VARCHAR(500),
    feeding_note VARCHAR(1000),
    CONSTRAINT fk_product_brand
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    CONSTRAINT fk_product_type
    FOREIGN KEY (product_type_id) REFERENCES product_types(id)
    );

-- Создание таблицы product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    sku VARCHAR(120),
    price DECIMAL(10,2),
    old_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    weight DECIMAL(10,3),
    barcode VARCHAR(100),
    display_name VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_variant_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

-- Создание таблицы product_images
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    product_variant_id BIGINT,
    data BYTEA NOT NULL,
    is_main BOOLEAN DEFAULT false,
    alt_text VARCHAR(255),
    file_name VARCHAR(255),
    content_type VARCHAR(100),
    size BIGINT,
    CONSTRAINT fk_image_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_image_variant
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
    );

-- Создание таблицы colors
CREATE TABLE IF NOT EXISTS colors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100)
    );

-- Создание таблицы scents
CREATE TABLE IF NOT EXISTS scents (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100)
    );

-- Создание таблицы countries
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100)
    );

-- Создание таблицы typeoffood
CREATE TABLE IF NOT EXISTS typeoffood (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100)
    );

-- Создание таблицы flavors
CREATE TABLE IF NOT EXISTS flavors (
     id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    canonical_name VARCHAR(200)
    );

-- Создание таблицы cart_items
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_variant_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_added DECIMAL(10,2) NOT NULL,
    display_name_at_added VARCHAR(500),
    image_url_at_added VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_item_cart
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_variant
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
    );

-- Создание таблицы orders
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    customer_notes VARCHAR(255),
    customer_snapshot JSONB,
    payment_method VARCHAR(250),
    delivery_method VARCHAR(250),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- Создание таблицы order_items
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_variant_id BIGINT,
    product_name VARCHAR(250) NOT NULL,
    product_sku VARCHAR(250) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    weight DECIMAL(10,2),
    sku VARCHAR(250),
    CONSTRAINT fk_order_item_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_variant
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT
    );

-- Создание таблицы payment_transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    transaction_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    payment_status VARCHAR(255) NOT NULL,
    payment_gateway_response VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

-- Создание таблицы favorites
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_variant_id BIGINT NOT NULL,
    CONSTRAINT fk_favorite_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_variant
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
    );

-- Создание таблицы feedback_form
CREATE TABLE IF NOT EXISTS feedback_form (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    city VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Создание таблицы nursery_form
CREATE TABLE IF NOT EXISTS nursery_form (
    id SERIAL PRIMARY KEY,
    organization_name VARCHAR(255),
    full_name VARCHAR(255),
    city VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    registration_file BYTEA,
    file_name VARCHAR(255),
    file_content_type VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );