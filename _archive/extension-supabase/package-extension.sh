#!/bin/bash

# FlowPulse Extension Packaging Script
# Creates a production-ready ZIP file for Chrome Web Store

set -e

echo "🔨 Building FlowPulse Extension..."

# Build the extension
npm run build

# Generate icons
echo "🎨 Generating icons..."
node generate-icons.cjs

# Create ZIP file
echo "📦 Creating extension package..."
cd dist
zip -r ../flowpulse-extension.zip . -x "*.map" "*.DS_Store"
cd ..

echo "✅ Extension packaged successfully!"
echo "📍 Location: $(pwd)/flowpulse-extension.zip"
echo ""
echo "Next steps:"
echo "1. Go to https://chrome.google.com/webstore/devconsole"
echo "2. Click 'New Item'"
echo "3. Upload flowpulse-extension.zip"
echo "4. Fill in the required metadata"
echo "5. Submit for review"
