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

export const PRODUCT_SIZES = [
  'XS',
  'SM',
  'MD',
  'LG',
  'XL',
  '2XL',
  '3XL',
  '4XL'
];

export const COLOR_OPTIONS = PRODUCT_COLORS.map(color => ({
  value: color,
  label: color
}));

export const SIZE_OPTIONS = PRODUCT_SIZES.map(size => ({
  value: size,
  label: size
}));
