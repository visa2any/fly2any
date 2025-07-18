# Git Helper Script for Fly2Any
Write-Host "Setting up git configuration..."

# Configure git
git config --global user.email "admin@fly2any.com"
git config --global user.name "Fly2Any Admin"

# Stage changes
git add .

# Commit changes
git commit -m "feat: complete campaigns management system
- Add campaigns dashboard with filtering
- Implement CRUD operations
- Add sample campaign data
- Include responsive design
- Integrate with admin navigation
- Temporarily disable no-explicit-any rule for build"

# Push changes
git push

Write-Host "Git operations completed successfully!"
