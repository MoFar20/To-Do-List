# Script to push project to new private GitHub repo WITH NO HISTORY
# This creates a fresh initial commit with no previous history

# ============ CONFIGURATION ============
$NEW_ACCOUNT = "MoFar20"  
$NEW_REPO = "To-Do-List"
$YOUR_NAME = "Mohamed Elsayed" 
$YOUR_EMAIL = "mohamedelsayedfarouk371@gmail.com"

# ============ SCRIPT ============
Write-Host "⚠️  WARNING: This will erase all git history and create a fresh start!" -ForegroundColor Red
Write-Host "Press Ctrl+C to cancel, or any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`nStarting fresh push (no history)..." -ForegroundColor Cyan

# Step 1: Delete .git folder to remove all history
Write-Host "`n1. Removing old git history..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Remove-Item -Path ".git" -Recurse -Force
    Write-Host "   Old history removed ✓" -ForegroundColor Green
}

# Step 2: Initialize fresh git repo
Write-Host "`n2. Initializing fresh git repository..." -ForegroundColor Yellow
git init
Write-Host "   Fresh repo initialized ✓" -ForegroundColor Green

# Step 3: Configure git user
Write-Host "`n3. Configuring git user..." -ForegroundColor Yellow
git config user.name "$YOUR_NAME"
git config user.email "$YOUR_EMAIL"
Write-Host "   Git user configured ✓" -ForegroundColor Green

# Step 4: Add all files
Write-Host "`n4. Adding all files..." -ForegroundColor Yellow
git add .
Write-Host "   Files staged ✓" -ForegroundColor Green

# Step 5: Create initial commit
Write-Host "`n5. Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit - Task Manager with Email Backend"
Write-Host "   Initial commit created ✓" -ForegroundColor Green

# Step 6: Rename branch to main
Write-Host "`n6. Renaming branch to main..." -ForegroundColor Yellow
git branch -M main
Write-Host "   Branch renamed to main ✓" -ForegroundColor Green

# Step 7: Add remote
Write-Host "`n7. Adding remote..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/$NEW_ACCOUNT/$NEW_REPO.git"
git remote add origin $remoteUrl
Write-Host "   Remote set to: $remoteUrl ✓" -ForegroundColor Green

# Step 8: Force push to replace remote history
Write-Host "`n8. Force pushing to new repo (replacing any existing history)..." -ForegroundColor Yellow
git push -u -f origin main

Write-Host "`n✅ Done! Your project is now at:" -ForegroundColor Green
Write-Host "https://github.com/$NEW_ACCOUNT/$NEW_REPO" -ForegroundColor Cyan
Write-Host "`nYour repo now has only 1 commit with no previous history!" -ForegroundColor Green
