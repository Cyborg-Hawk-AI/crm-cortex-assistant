#!/bin/bash

# ==================================================
# Script: push.sh
# Author: Yazan Barakat
# Description:
#   This script automates the process of adding,
#   committing, and pushing changes to a specified
#   branch in a Git repository.
#
# Usage Examples:
#   1) ./push.sh "Fixed block ordering" QA
#      - Commits with the message "Fixed block ordering"
#        and pushes to the 'QA' branch.

#   1) ./push.sh "production-bug-fix" main
#      - Commits with the message "production-bug-fix"
#        and pushes to the 'main' branch. THIS WILL BE 
#        THE PRODUCTION BRANCH.
#
#   2) ./push.sh "Minor text updates"
#      - Commits with the message "Minor text updates"
#        and pushes to the default 'dev' branch.
#
#   3) ./push.sh
#      - Uses a timestamp as the commit message and
#        pushes to the default 'dev' branch.
# ==================================================

# Get commit message from the first argument
COMMIT_MSG=$1

# Get branch name from the second argument
BRANCH_NAME=$2

# Fallback to timestamp if no commit message is provided
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="🛠️ Auto-push: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Default to 'dev' branch if not provided
if [ -z "$BRANCH_NAME" ]; then
  BRANCH_NAME="dev"
fi

# Git push routine
git add .
git commit -m "$COMMIT_MSG"
git push origin "$BRANCH_NAME"
