#!/bin/bash
# Two-step build for machines with limited memory
# Step 1: Build without city pages
# Step 2: Copy and transform city pages

cd "$(dirname "$0")/.."

echo "=== Step 1: Building without city pages ==="

# Temporarily disable city pages in vite.config.js
sed -i 's/\.\.\.getCityPages(),/\/\/ ...getCityPages(),/' vite.config.js

npm run lint:fix && BASE_PATH=./ NODE_ENV=production npx vite build

# Restore city pages in vite.config.js
sed -i 's/\/\/ \.\.\.getCityPages(),/...getCityPages(),/' vite.config.js

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo ""
echo "=== Step 2: Copying city pages ==="

# Find CSS filename
CSS_FILE=$(ls public_html/assets/css/main-*.css 2>/dev/null | head -1 | xargs basename)
if [ -z "$CSS_FILE" ]; then
    CSS_FILE="main.css"
fi
echo "Using CSS: $CSS_FILE"

# Copy and transform city pages
SERVICES="turnkey-repair plastering airless-painting floor-screed"
COUNT=0

for SERVICE in $SERVICES; do
    mkdir -p "public_html/pages/$SERVICE"
    for FILE in src/pages/$SERVICE/*.html; do
        [ -f "$FILE" ] || continue
        FILENAME=$(basename "$FILE")
        
        # Read, transform, write
        # Source already has <base href="/"> — all relative paths resolve from /
        # Only CSS needs transformation (filename changed from main.scss to main-hash.css)
        # 3-level rule MUST come before 2-level to avoid substring match
        sed -e "s|../../../styles/main.scss|/assets/css/$CSS_FILE|g" \
            -e "s|../../styles/main.scss|/assets/css/$CSS_FILE|g" \
            -e "s|../styles/main.scss|/assets/css/$CSS_FILE|g" \
            -e 's|src="../../scripts/|src="/scripts/|g' \
            -e 's|src="../scripts/|src="/scripts/|g' \
            -e 's|src="../../assets/|src="/assets/|g' \
            -e 's|src="../assets/|src="/assets/|g' \
            "$FILE" > "public_html/pages/$SERVICE/$FILENAME"
        
        COUNT=$((COUNT + 1))
    done
done

echo "Copied $COUNT city pages"
echo ""
echo "=== Build complete! ==="
find public_html -name "*.html" | wc -l
echo "HTML files total"
