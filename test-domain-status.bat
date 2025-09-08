@echo off
echo 🔍 Testing MailGun Domain Verification Status...
echo.
echo 📡 Checking mail.fly2any.com verification...
curl -X POST "http://localhost:3000/api/email-marketing/v2?action=check_domain_status" -H "Content-Type: application/json" -d "{}"
echo.
echo.
echo 🎯 Expected Result After DNS Propagation:
echo    "status": "verified"
echo    "message": "✅ Domain mail.fly2any.com is verified and ready for professional email sending."
echo.
echo 📝 If still "unverified", wait longer for DNS propagation (up to 24 hours)
pause