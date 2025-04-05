#!/bin/bash

# Get commit message from argument
COMMIT_MSG=$1

# Fallback to timestamp if no message provided
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="🛠️ Auto-push: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Git push routine
git add .
git commit -m "$COMMIT_MSG"
git push origin main

