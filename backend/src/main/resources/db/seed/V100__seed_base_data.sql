INSERT INTO brands (name, slug) VALUES
    ('LANDOR', 'landor'),
    ('LANDY', 'landy'),
    ('FRESH PET PROFBALANCE', 'fresh-pet-profbalance'),
    ('ЧИСТЫЕ ПУШИСТЫЕ', 'chistye-pushistye');


INSERT INTO categories (name, description, slug, is_active, parent_id) VALUES
    ('Кошка', 'Товары для кошек', 'cat', TRUE, NULL),
    ('Собака', 'Товары для собак', 'dog', TRUE, NULL),
    ('Котенок', 'Товары для котенков', 'minicat', TRUE, NULL),
    ('Щенок', 'Товары для щенков', 'minidog', TRUE, NULL);


WITH cat_category AS (SELECT id FROM categories WHERE slug = 'cat')
INSERT INTO breeds (name, category_id, slug) VALUES
  ('для стерилизованных', (SELECT id FROM cat_category), 'for-sterilized'),
  ('для здоровья кожи и шерсти', (SELECT id FROM cat_category), 'for-skin-and-coat-health'),
  ('для чувствительного пищеварения', (SELECT id FROM cat_category), 'for-sensitive-digestion'),
  ('для привередливых', (SELECT id FROM cat_category), 'for-picky'),
  ('для домашних (indoor)', (SELECT id FROM cat_category), 'for-indoor');


WITH kitten_category AS (SELECT id FROM categories WHERE slug = 'minicat')
INSERT INTO breeds (name, category_id, slug) VALUES
  ('для котят', (SELECT id FROM kitten_category), 'for-kittens');


WITH dog_category AS (SELECT id FROM categories WHERE slug = 'dog')
INSERT INTO breeds (name, category_id, slug) VALUES
  ('для мелких пород', (SELECT id FROM dog_category), 'for-small-breeds'),
  ('для средних пород', (SELECT id FROM dog_category), 'for-medium-breeds'),
  ('для крупных пород', (SELECT id FROM dog_category), 'for-large-breeds');


WITH puppy_category AS (SELECT id FROM categories WHERE slug = 'minidog')
INSERT INTO breeds (name, category_id, slug) VALUES
  ('для мелких пород', (SELECT id FROM puppy_category), 'for-small-breeds'),
  ('для средних пород', (SELECT id FROM puppy_category), 'for-medium-breeds'),
  ('для крупных пород', (SELECT id FROM puppy_category), 'for-large-breeds');


INSERT INTO countries (name, slug) VALUES
   ('Испания', 'spain'),
   ('Германия', 'germany'),
   ('Россия', 'russia'),
   ('Беларусь', 'belarus'),
   ('Китай', 'china');


INSERT INTO typeoffood (name, slug) VALUES
    ('Сухой', 'dry'),
    ('Влажный', 'wet');


INSERT INTO scents (name, slug) VALUES
    ('Классический', 'classic'),
    ('Ванильный', 'vanilla'),
    ('Банановый', 'banana'),
    ('Кокосовый', 'coconut'),
    ('Зеленый чай', 'green-tea'),
    ('Аромат розы', 'rose'),
    ('Яблоко', 'apple'),
    ('Лимон', 'lemon'),
    ('Без аромата', 'no-flavor'),
    ('Молоко', 'milk');


INSERT INTO product_types (name, slug) VALUES
   ('Корм', 'feed'),
   ('Наполнитель', 'filler');


INSERT INTO flavors (name, canonical_name) VALUES
   ('Кролик', 'rabbit'),
   ('Курица', 'chicken'),
   ('Куропатка', 'partridge'),
   ('Лосось', 'salmon'),
   ('Перепелка', 'quail'),
   ('Рыба', 'fish'),
   ('Телятина', 'veal'),
   ('Утка', 'duck'),
   ('Ягнёнок', 'lamb'),
   ('Говядина', 'beef'),
   ('Гусь', 'goose');


INSERT INTO colors (name, slug) VALUES
    ('Белый', 'white'),
    ('Черный', 'black'),
    ('Коричневый', 'brown'),
    ('Бежевый', 'beige'),
    ('Серый', 'gray'),
    ('Синий', 'blue'),
    ('Зеленый', 'green');

