module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo includes the expo-router transform.
    presets: ['babel-preset-expo'],
  };
};
