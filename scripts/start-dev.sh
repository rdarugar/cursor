#!/bin/bash

# Kill any existing Node.js processes
pkill -f node

# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall dependencies
npm install

# Start the development server
npm run dev 