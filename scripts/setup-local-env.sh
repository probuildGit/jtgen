#!/bin/bash

# Setup Local Environment Script
# This script ensures the local environment uses the correct files

echo "🏠 Setting up LOCAL environment..."

# Copy local-specific index file
cp src/index.local.js src/index.js

# Copy local-specific CSS
cp src/index.local.css src/index.css

# Copy local-specific environment detection
cp src/utils/environmentDetection.local.js src/utils/environmentDetection.js

echo "✅ Local environment setup complete!"
echo "   - Using src/index.local.js"
echo "   - Using src/index.local.css" 
echo "   - Using src/utils/environmentDetection.local.js"
