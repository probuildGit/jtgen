#!/bin/bash

# Setup Web Environment Script
# This script ensures the web environment uses the correct files

echo "🌐 Setting up WEB environment..."

# Copy web-specific index file
cp src/index.web.js src/index.js

# Copy web-specific CSS
cp src/index.web.css src/index.css

# Copy web-specific environment detection
cp src/utils/environmentDetection.web.js src/utils/environmentDetection.js

echo "✅ Web environment setup complete!"
echo "   - Using src/index.web.js"
echo "   - Using src/index.web.css"
echo "   - Using src/utils/environmentDetection.web.js"
