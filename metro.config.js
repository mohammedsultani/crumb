// Default Expo Metro config, extended so expo-sqlite works on web:
//  - bundle .wasm assets (wa-sqlite)
//  - serve COOP/COEP headers so SharedArrayBuffer is available
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// wa-sqlite ships a .wasm binary that Metro must treat as an asset.
config.resolver.assetExts.push('wasm');

// SharedArrayBuffer (used by the sqlite web worker) requires cross-origin isolation.
config.server = config.server || {};
const prevEnhance = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const withHeaders = (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return middleware(req, res, next);
  };
  return prevEnhance ? prevEnhance(withHeaders, server) : withHeaders;
};

module.exports = config;
