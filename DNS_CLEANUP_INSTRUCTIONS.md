# DNS Cleanup Instructions for fly2any.com

**Date:** 2025-11-02
**Action:** Remove OLD Mailgun DNS records from Vercel Dashboard

---

## 🚨 Why This Matters

You currently have **DUPLICATE DNS records** for email:
- ✅ AWS SES records (NEW - what we want)
- ⚠️ Mailgun records (OLD - not used anymore)

Having duplicate MX and SPF records causes:
- Email delivery confusion
- SPF validation failures
- Looks unprofessional to AWS reviewers
- May impact SES approval

---

## 📋 Step-by-Step: Remove Old Mailgun Records

### Go to Vercel DNS Management:
**https://vercel.com/visa2anys-projects/fly2any-fresh/settings/domains**

1. Click on **fly2any.com**
2. Scroll to **"DNS Records"** section
3. Find and DELETE these OLD Mailgun records:

### ❌ REMOVE Record 1: MX (Mailgun)
```
Type: MX
Name: mail
Value: mxa.mailgun.org
Priority: 10
```
Click the **trash icon** to delete

### ❌ REMOVE Record 2: MX (Mailgun)
```
Type: MX
Name: mail
Value: mxb.mailgun.org
Priority: 10
```
Click the **trash icon** to delete

### ❌ REMOVE Record 3: TXT/SPF (Mailgun)
```
Type: TXT
Name: mail
Value: v=spf1 include:mailgun.org ~all
```
Click the **trash icon** to delete

---

## ✅ Keep These Records (AWS SES)

**DO NOT DELETE** these records - they're correct:

### ✅ KEEP: 3 DKIM CNAME Records
```
qjb35hyhvgx4t5spntffzn2kn2whvmke._domainkey → amazonses.com
yuofeqhpwv2ncsov5ct5236crb4uxohr._domainkey → amazonses.com
z453bwloo5m3i2z5gjqowyu3akkmutm6._domainkey → amazonses.com
```

### ✅ KEEP: MX Record (AWS SES)
```
Type: MX
Name: mail
Value: feedback-smtp.us-east-2.amazonses.com
Priority: 10
```

### ✅ KEEP: TXT/SPF Record (AWS SES)
```
Type: TXT
Name: mail
Value: v=spf1 include:amazonses.com ~all
```

### ✅ KEEP: DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

---

## 🔍 Verify After Cleanup

After removing the 3 Mailgun records, you should have exactly **6 email-related DNS records** for AWS SES:
- 3 CNAME (DKIM)
- 1 MX (mail)
- 1 TXT (mail - SPF)
- 1 TXT (_dmarc)

Run this command to verify cleanup:
```bash
nslookup -type=MX mail.fly2any.com
```

Should show ONLY:
```
mail.fly2any.com	MX preference = 10, mail exchanger = feedback-smtp.us-east-2.amazonses.com
```

---

## ⏱️ Timeline

1. **Remove Mailgun records:** 5 minutes
2. **DNS propagation:** 5-30 minutes
3. **AWS auto-verification:** 5-60 minutes after cleanup
4. **Production access request:** Submit after verification

---

## 📧 Email Service Status

| Service | Status | Action |
|---------|--------|--------|
| **AWS SES** | ✅ Active (Primary) | DNS configured |
| **Mailgun** | ❌ Removed | Delete DNS records |
| **Gmail SMTP** | ❌ Removed | Deleted from .env |
| **MailerSend** | ❌ Removed | Deleted from .env |
| **Resend** | ⚠️ Backup only | Not actively used |

---

## 🚀 After Cleanup Complete

Once you've removed the 3 Mailgun DNS records, we'll:
1. ✅ Re-verify all DNS records are clean
2. ✅ Check AWS SES console for "Verified" status
3. ✅ Write comprehensive production access request
4. ✅ Submit to AWS Trust & Safety team
5. ✅ Get approval within 24-48 hours

Type "cleanup done" when you've removed the Mailgun records!
