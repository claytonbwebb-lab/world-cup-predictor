#!/bin/bash
# Build script for Capacitor iOS/Android
# Preserves original source for Vercel deployment

set -e

PROJECT_DIR="/home/ubuntu/world-cup-predictor"
TMP_DIR="/tmp/capacitor-build"

echo "=== Capacitor Build Script ==="

# Step 1: Back up original source
echo "Backing up original source..."
cp -r "$PROJECT_DIR/src/app/leagues/[id]/page.tsx" "$TMP_DIR/leagues-id-page.tsx.bak" 2>/dev/null || true

# Step 2: Create a static stub for the dynamic league page
mkdir -p "$PROJECT_DIR/src/app/leagues/[id]"
cat > "$PROJECT_DIR/src/app/leagues/[id]/page.tsx" << 'STUB'
export const dynamicParams = true;
export const generateStaticParams = () => [];
export default function LeaguePage() {
  return null; // Loaded client-side
}
STUB

# Step 3: Also handle blog [slug] - it has generateStaticParams but might conflict
# (blog already has proper generateStaticParams so should be fine)

# Step 4: Build with capacitor config
echo "Building with capacitor config..."
cd "$PROJECT_DIR"
cp "$PROJECT_DIR/next.config.capacitor.js" "$PROJECT_DIR/next.config.js"

# Remove API routes temporarily
mv "$PROJECT_DIR/src/app/api" "$PROJECT_DIR/src/app/api.skip" 2>/dev/null || true

rm -rf "$PROJECT_DIR/.next"
node_modules/.bin/next build 2>&1 | tail -5

# Step 5: Restore original source
echo "Restoring original source..."
mv "$PROJECT_DIR/src/app/api.skip" "$PROJECT_DIR/src/app/api" 2>/dev/null || true
mv "$TMP_DIR/leagues-id-page.tsx.bak" "$PROJECT_DIR/src/app/leagues/[id]/page.tsx" 2>/dev/null || true
cp "$PROJECT_DIR/next.config.js.bak" "$PROJECT_DIR/next.config.js" 2>/dev/null || true

echo "=== Build complete ==="
ls -la "$PROJECT_DIR/out/" 2>/dev/null | head -5 || echo "No out/ directory found"
