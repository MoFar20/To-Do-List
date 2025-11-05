# Script to push project to new private GitHub repo

# ============ CONFIGURATION ============
$NEW_ACCOUNT = "MoFar20"  
$NEW_REPO = "To-Do-List"
$YOUR_NAME = "Mohamed Elsayed" 
$YOUR_EMAIL = "mohamedelsayedfarouk371@gmail.com"  

# ============ SCRIPT ============
Write-Host "Starting push to new private repo..." -ForegroundColor Cyan

# Configure git user for this repo
Write-Host "`n1. Configuring git user..." -ForegroundColor Yellow
git config user.name "$YOUR_NAME"
git config user.email "$YOUR_EMAIL"

# Remove old remote (if exists)
Write-Host "`n2. Removing old remote..." -ForegroundColor Yellow
git remote remove origin 2>$null

# Add new remote
Write-Host "`n3. Adding new remote..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/$NEW_ACCOUNT/$NEW_REPO.git"
git remote add origin $remoteUrl
Write-Host "Remote set to: $remoteUrl" -ForegroundColor Green

# Check current branch
$currentBranch = git branch --show-current
Write-Host "`n4. Current branch: $currentBranch" -ForegroundColor Green

# Push to new repo
Write-Host "`n5. Pushing to new repo..." -ForegroundColor Yellow
git push -u origin $currentBranch

Write-Host "`n✅ Done! Your project is now at:" -ForegroundColor Green
Write-Host "https://github.com/$NEW_ACCOUNT/$NEW_REPO" -ForegroundColor Cyan
