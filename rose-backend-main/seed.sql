BEGIN;

-- ---------------------
-- جدول رستوران‌ها
-- ---------------------
INSERT INTO resturants (id, name) VALUES
  (1, 'رستوران سنتی'),
  (2, 'کافی شاپ')
ON CONFLICT (id) DO NOTHING;

-- ---------------------
-- جدول میزها
-- ---------------------
INSERT INTO tables (id, name, capacity, photo, "restaurantId") VALUES
  (1, 'میز شماره یک', 4, 'aaa', 1),
  (2, 'میز شماره ۲', 6, 'aaa', 1),
  (3, 'میز شماره ۳', 4, 'aaa', 2),
  (4, 'میز شماره ۴', 4, 'aaa', 2)
ON CONFLICT (id) DO NOTHING;

-- ---------------------
-- دسته‌بندی آیتم‌ها
-- ---------------------
INSERT INTO item_categories (id, name, icon, "restaurantId") VALUES
  (1, 'بر پایه قهوه', 'a', 2),
  (2, 'شیک',          'a', 2),
  (3, 'خوراک',        'a', 1),
  (4, 'چلو',          'a', 1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------
-- آیتم‌های منو (مثال ساخته‌شده)
-- ---------------------
INSERT INTO menu_items (id, image, title, fee, available, "categoryId") VALUES
  (1, 'img1.png', 'اسپرسو',       50000, true, 1),
  (2, 'img2.png', 'کاپوچینو',     60000, true, 1),
  (3, 'img3.png', 'شیک وانیل',    75000, true, 2),
  (4, 'img4.png', 'شیک شکلات',    80000, true, 2),
  (5, 'img5.png', 'کباب کوبیده', 120000, true, 3),
  (6, 'img6.png', 'جوجه کباب',   130000, true, 3),
  (7, 'img7.png', 'چلو گوشت',    150000, true, 4),
  (8, 'img8.png', 'چلو مرغ',     140000, true, 4)
ON CONFLICT (id) DO NOTHING;

COMMIT;
