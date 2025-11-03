# Amazon SES DNS Records for fly2any.com

**Generated:** 2025-11-02
**AWS Region:** us-east-2
**Domain:** fly2any.com
**MAIL FROM Domain:** mail.fly2any.com
**DNS Provider:** Vercel DNS (ns1.vercel-dns.com, ns2.vercel-dns.com)

---

## 🚀 STEP-BY-STEP: Add DNS Records in Vercel Dashboard

Your domain is managed by **Vercel DNS**, which makes this easy! Follow these exact steps:

### Step 1: Access Vercel DNS Settings

1. Go to https://vercel.com/dashboard
2. Click on **"Domains"** in the left sidebar
3. Click on **fly2any.com**
4. Scroll down to **"DNS Records"** section

### Step 2: Add Each Record

You'll add 6 records total. For each record below:

**📍 RECORD 1 - DKIM #1:**
- Click **"Add"** button
- **Type:** CNAME
- **Name:** `qjb35hyhvgx4t5spntffzn2kn2whvmke._domainkey`
- **Value:** `qjb35hyhvgx4t5spntffzn2kn2whvmke.dkim.amazonses.com`
- Click **"Save"**

**📍 RECORD 2 - DKIM #2:**
- Click **"Add"** button
- **Type:** CNAME
- **Name:** `yuofeqhpwv2ncsov5ct5236crb4uxohr._domainkey`
- **Value:** `yuofeqhpwv2ncsov5ct5236crb4uxohr.dkim.amazonses.com`
- Click **"Save"**

**📍 RECORD 3 - DKIM #3:**
- Click **"Add"** button
- **Type:** CNAME
- **Name:** `z453bwloo5m3i2z5gjqowyu3akkmutm6._domainkey`
- **Value:** `z453bwloo5m3i2z5gjqowyu3akkmutm6.dkim.amazonses.com`
- Click **"Save"**

**📍 RECORD 4 - MX (Mail Exchange):**
- Click **"Add"** button
- **Type:** MX
- **Name:** `mail`
- **Value:** `feedback-smtp.us-east-2.amazonses.com`
- **Priority:** `10`
- Click **"Save"**

**📍 RECORD 5 - SPF (TXT):**
- Click **"Add"** button
- **Type:** TXT
- **Name:** `mail`
- **Value:** `v=spf1 include:amazonses.com ~all` (NO quotes needed in Vercel)
- Click **"Save"**

**📍 RECORD 6 - DMARC (TXT):**
- Click **"Add"** button
- **Type:** TXT
- **Name:** `_dmarc`
- **Value:** `v=DMARC1; p=none;` (NO quotes needed in Vercel)
- Click **"Save"**

### Step 3: Verify Records Were Added

After adding all 6 records, you should see them listed in your DNS Records section:
- 3 CNAME records (\_domainkey)
- 1 MX record (mail)
- 2 TXT records (mail + \_dmarc)

### ⏱️ Wait for Propagation

- **Vercel DNS:** Usually propagates in 5-15 minutes
- **AWS Verification:** Will auto-detect once propagated (up to 72 hours, usually 30 mins)

---

## ✅ DNS Records to Add (6 Total)

### 1. DKIM Records (3 CNAME Records)

These authenticate your emails and prevent spoofing.

```
Record 1:
Type: CNAME
Name: qjb35hyhvgx4t5spntffzn2kn2whvmke._domainkey.fly2any.com
Value: qjb35hyhvgx4t5spntffzn2kn2whvmke.dkim.amazonses.com
TTL: 1800 (or Auto)

Record 2:
Type: CNAME
Name: yuofeqhpwv2ncsov5ct5236crb4uxohr._domainkey.fly2any.com
Value: yuofeqhpwv2ncsov5ct5236crb4uxohr.dkim.amazonses.com
TTL: 1800 (or Auto)

Record 3:
Type: CNAME
Name: z453bwloo5m3i2z5gjqowyu3akkmutm6._domainkey.fly2any.com
Value: z453bwloo5m3i2z5gjqowyu3akkmutm6.dkim.amazonses.com
TTL: 1800 (or Auto)
```

### 2. MAIL FROM Records (MX + TXT)

These configure your custom sending domain.

```
Record 4 (MX):
Type: MX
Name: mail.fly2any.com
Value: 10 feedback-smtp.us-east-2.amazonses.com
Priority: 10
TTL: 1800 (or Auto)

Record 5 (SPF):
Type: TXT
Name: mail.fly2any.com
Value: "v=spf1 include:amazonses.com ~all"
TTL: 1800 (or Auto)
```

### 3. DMARC Record (TXT)

This tells email servers how to handle authentication failures.

```
Record 6:
Type: TXT
Name: _dmarc.fly2any.com
Value: "v=DMARC1; p=none;"
TTL: 1800 (or Auto)
```

---

## 📝 Notes for Different DNS Providers

### If using Namecheap:
- Use `@` instead of full domain name for root records
- CNAME Name: Just use the full subdomain as shown
- Remove quotes from TXT values if the interface adds them automatically

### If using Cloudflare:
- Disable proxy (orange cloud) for all SES records
- Use full subdomain names as shown
- TTL: Select "Auto" or 1800 seconds

### If using GoDaddy:
- Use `@` for root domain
- Use full subdomain for CNAME records
- Include quotes in TXT values

### If using AWS Route 53:
- Use full FQDN (Fully Qualified Domain Names)
- Don't add trailing dot if not already present
- Select "Simple Routing"

---

## ⏱️ Verification Timeline

1. **Add records:** 10-15 minutes
2. **DNS propagation:** 5 minutes - 72 hours (usually 30 mins)
3. **AWS verification:** Automatic once DNS propagates
4. **Check status:** AWS SES Console → Verified Identities → fly2any.com

---

## 🔍 Verify DNS Records Are Live

Use these tools to check if records are propagated:

1. **MX Toolbox:** https://mxtoolbox.com/SuperTool.aspx
   - Enter: `qjb35hyhvgx4t5spntffzn2kn2whvmke._domainkey.fly2any.com`
   - Should show CNAME pointing to amazonaws.com

2. **Google Admin Toolbox:** https://toolbox.googleapps.com/apps/dig/
   - Query: Your DKIM/SPF/DMARC records
   - Type: CNAME or TXT

3. **Command Line:**
   ```bash
   nslookup -type=CNAME qjb35hyhvgx4t5spntffzn2kn2whvmke._domainkey.fly2any.com
   nslookup -type=TXT _dmarc.fly2any.com
   nslookup -type=MX mail.fly2any.com
   ```

---

## ⚠️ Common Issues

### Issue: AWS still shows "Pending verification"
**Solution:** Wait longer (up to 72 hours), check DNS records are correct

### Issue: DKIM records not found
**Solution:** Make sure you didn't include quotes in CNAME values

### Issue: DMARC conflicts
**Solution:** If you already have a DMARC record, update it instead of adding new

### Issue: MX record conflicts
**Solution:** This MX is for mail.fly2any.com subdomain, not root domain. Won't conflict with existing email.

---

## 📧 After Verification

Once domain shows "Verified" in AWS SES:

1. ✅ Test sending email in sandbox mode
2. ✅ Apply for production access
3. ✅ Update .env: `FROM_EMAIL=bookings@fly2any.com`
4. ✅ Deploy to production

---

## 🚀 Next Steps

1. Add these 6 DNS records to your domain registrar
2. Wait 30-60 minutes for propagation
3. Check AWS SES Console for verification status
4. Once verified, apply for production access
5. Get approved within 24-48 hours
6. Start sending emails! 🎉
