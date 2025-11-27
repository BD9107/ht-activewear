// Shared product constants for order form and catalog management

export const PRODUCT_CATEGORIES = [
  'Jersey',
  'Hoodie',
  'Polo',
  'Shorts',
  'Pants',
  'Tracksuit',
  'Accessories'
];

export const PRODUCT_COLORS = [
  'Red',
  'Blue',
  'Black',
  'White',
  'Gray',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Pink',
  'Navy',
  'Maroon'
];

export const COLOR_OPTIONS = PRODUCT_COLORS.map(color => ({
  value: color,
  label: color
}));
