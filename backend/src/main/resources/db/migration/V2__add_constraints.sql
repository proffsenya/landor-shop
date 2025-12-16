-- Таблица связей product_breeds
CREATE TABLE IF NOT EXISTS product_breeds (
    product_id BIGINT NOT NULL,
    breed_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, breed_id),
    CONSTRAINT fk_product_breeds_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_breeds_breed
    FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE CASCADE
    );

-- Таблица связей product_categories
CREATE TABLE IF NOT EXISTS product_categories (
    product_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_product_categories_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_categories_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

-- Таблица связей product_countries
CREATE TABLE IF NOT EXISTS product_countries (
    product_id BIGINT NOT NULL,
    country_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, country_id),
    CONSTRAINT fk_product_countries_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_countries_country
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
    );

-- Таблица связей product_typeoffood
CREATE TABLE IF NOT EXISTS product_typeoffood (
    product_id BIGINT NOT NULL,
    typeoffood_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, typeoffood_id),
    CONSTRAINT fk_product_typeoffood_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_typeoffood_type
    FOREIGN KEY (typeoffood_id) REFERENCES typeoffood(id) ON DELETE CASCADE
    );

-- Таблица связей product_flavors
CREATE TABLE IF NOT EXISTS product_flavors (
    product_id BIGINT NOT NULL,
    flavor_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, flavor_id),
    CONSTRAINT fk_product_flavors_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_flavors_flavor
    FOREIGN KEY (flavor_id) REFERENCES flavors(id) ON DELETE CASCADE
    );

-- Таблица связей variant_colors
CREATE TABLE IF NOT EXISTS variant_colors (
    variant_id BIGINT NOT NULL,
    color_id BIGINT NOT NULL,
    PRIMARY KEY (variant_id, color_id),
    CONSTRAINT fk_variant_colors_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    CONSTRAINT fk_variant_colors_color
    FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE CASCADE
    );

-- Таблица связей variant_scents
CREATE TABLE IF NOT EXISTS variant_scents (
    variant_id BIGINT NOT NULL,
    scent_id BIGINT NOT NULL,
    PRIMARY KEY (variant_id, scent_id),
    CONSTRAINT fk_variant_scents_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    CONSTRAINT fk_variant_scents_scent
    FOREIGN KEY (scent_id) REFERENCES scents(id) ON DELETE CASCADE
    );