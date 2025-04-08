
#!/bin/bash

# First sync with remote repository
echo "Syncing with remote repository..."
bash ./.git-sync.sh

# Then push changes to GitHub
echo "Pushing changes to GitHub..."
bash ./push.sh "Update block editor and fix reordering issues"

echo "Git operations completed successfully!"
