// App configuration.
//
// USDA FoodData Central API key.
// Get a free key in ~30 seconds at https://fdc.nal.usda.gov/api-key-signup.html
// DEMO_KEY works out of the box but is heavily rate-limited (fine for a first run).
// For a real build, set EXPO_PUBLIC_USDA_API_KEY in an .env file or app config.
export const USDA_API_KEY =
  process.env.EXPO_PUBLIC_USDA_API_KEY ?? 'DEMO_KEY';

export const APP_NAME = 'Crumb';
