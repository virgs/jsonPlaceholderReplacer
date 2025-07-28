#!/bin/bash

# Comprehensive Jest cache cleanup and test runner
echo "🧹 Cleaning all Jest and transform caches..."

# Remove all possible Jest cache locations
rm -rf /tmp/jest_rt* || true
rm -rf /tmp/jest-transform-cache* || true
rm -rf /tmp/v8-compile-cache* || true
rm -rf ~/.cache/jest || true
rm -rf node_modules/.cache || true
rm -rf .nyc_output || true

# Clear npm cache too
npm cache clean --force || true

echo "✅ Cache cleanup complete"

# Set environment variables to disable all caching
export JEST_CACHE_DISABLE=true
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🧪 Running Jest tests..."

# Run Jest with maximum cache prevention
exec npx jest \
  --no-cache \
  --no-watchman \
  --runInBand \
  --forceExit \
  --clearCache \
  --detectOpenHandles \
  --verbose \
  "$@"
