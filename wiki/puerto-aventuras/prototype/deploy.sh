#!/bin/bash

# Puerto Aventuras Super-App - Deploy Script
# Usage: ./deploy.sh

echo "🚀 Puerto Aventuras Super-App - Deploy Preview"
echo "=============================================="
echo ""

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found in current directory"
    exit 1
fi

echo "✅ Found index.html ($(wc -c < index.html) bytes)"
echo ""

echo "📋 Deploy Options:"
echo ""
echo "1️⃣  Local Server (for demo)"
echo "   python3 -m http.server 8000"
echo "   → http://localhost:8000"
echo ""
echo "2️⃣  Netlify Drop (instant public URL)"
echo "   → https://app.netlify.com/drop"
echo "   → Drag & drop this folder"
echo ""
echo "3️⃣  Tiiny Host (free hosting, no signup)"
echo "   → https://tiiny.host"
echo "   → Upload index.html"
echo "   → Get instant URL"
echo ""
echo "4️⃣  Vercel (production)"
echo "   npm install -g vercel"
echo "   vercel login"
echo "   vercel --prod"
echo ""
echo "5️⃣  GitHub Pages"
echo "   → Create repo → Upload file → Enable Pages"
echo ""

# Start local server if requested
if [ "$1" == "--local" ]; then
    echo "🌐 Starting local server on http://localhost:8000"
    echo "   Press Ctrl+C to stop"
    echo ""
    python3 -m http.server 8000
fi

# Show file info
echo "📊 Prototype Info:"
echo "   Screens: 10"
echo "   Size: $(du -h index.html | cut -f1)"
echo "   Features: Yachts, Real Estate, Deals, Security, My Day"
echo ""

echo "✨ Ready to deploy!"
