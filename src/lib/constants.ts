export const MARYLAND_CITIES = [
  'Annapolis',
  'Baltimore',
  'Bethesda',
  'Columbia',
  'Frederick',
  'Gaithersburg',
  'Germantown',
  'Glen Burnie',
  'Hagerstown',
  'Laurel',
  'Montgomery Village',
  'Rockville',
  'Silver Spring',
  'Towson',
  'Waldorf',
  'Wheaton-Glenmont',
] as const;

export const BREWERY_FEATURES = [
  'Food',
  'Live Music',
  'Outdoor Seating',
  'Pet Friendly',
  'Tours',
  'Events',
  'Merchandise',
  'Parking',
  'Wheelchair Accessible',
  'WiFi',
] as const;

export const BREWERY_HOURS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'city-asc', label: 'City (A-Z)' },
  { value: 'city-desc', label: 'City (Z-A)' },
  { value: 'established-desc', label: 'Newest First' },
  { value: 'established-asc', label: 'Oldest First' },
] as const;
