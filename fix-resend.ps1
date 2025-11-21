$files = @(
    "app\api\quotes\share\[shareableLink]\decline\route.ts",
    "app\api\quotes\share\[shareableLink]\accept\route.ts",
    "lib\email\price-alert.ts",
    "app\api\agents\quotes\[id]\send\route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing: $file"
        $content = Get-Content $file -Raw
        $content = $content -replace 'const resend = new Resend\(process\.env\.RESEND_API_KEY\);', 'const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;'
        Set-Content $file -Value $content -NoNewline
        Write-Host "  ✓ Fixed"
    } else {
        Write-Host "  ✗ File not found: $file"
    }
}
