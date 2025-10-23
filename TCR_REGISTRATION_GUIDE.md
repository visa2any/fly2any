# 📱 TCR (The Campaign Registry) Registration Guide for Fly2Any

**Date**: October 23, 2025
**Purpose**: Complete 10DLC SMS Campaign Registration
**Status**: Ready for Submission

---

## 🎯 Overview

This guide provides all the information needed to register your Fly2Any SMS campaigns with The Campaign Registry (TCR). TCR registration is required by U.S. mobile carriers to send business text messages using 10-digit long code (10DLC) numbers.

---

## 📋 Section 1: Brand Request Status

###Brand Information

**Display Name** (Brand/Marketing/DBA name):
```
Fly2Any
```

**Company Name** (Legal name of the business):
```
[YOUR LEGAL BUSINESS NAME]
```
*Note: Use your exact legal business name as registered with your state/country*

**EIN (Tax Identification Number)**:
```
[YOUR EIN NUMBER - 9 digits for US businesses]
```
*Format: XX-XXXXXXX (for US businesses)*
*If you're not a US business, enter your local tax identification number*

**Tax Issuing Country**:
```
United States
```
*Or your country of business registration*

**Contact Phone** (E.164 format):
```
+18003592269
```
*Format: +1 followed by 10-digit number*
*Example: +1800FLY2ANY = +18003592269*

**Business Contact Email**:
```
support@fly2any.com
```

**Website**:
```
https://fly2any.com
```
*Or your production URL (e.g., https://fly2any-fresh.vercel.app)*

**Country**:
```
United States
```

**State / Region** (2-character code):
```
[YOUR STATE CODE]
```
*Examples: CA (California), NY (New York), FL (Florida), TX (Texas)*

**City**:
```
[YOUR CITY]
```

**Street**:
```
[YOUR BUSINESS STREET ADDRESS]
```

**Zip Code / Post code**:
```
[YOUR ZIP CODE]
```

---

## 📨 Section 2: Campaign Information

### Campaign Description

```
Fly2Any provides flight booking and travel notification services. This SMS campaign delivers:

1. TRANSACTIONAL MESSAGES (Primary Use):
   - Booking confirmations with itinerary details and reference numbers
   - Real-time flight status updates, delays, and cancellations
   - Gate changes and boarding time notifications
   - Check-in reminders 24 hours before departure
   - Customer service responses and booking support
   - Emergency travel alerts and important updates

2. PROMOTIONAL MESSAGES (Secondary Use - With Separate Opt-In):
   - Price drop alerts for saved flight searches
   - Special travel deals and limited-time offers
   - Loyalty program updates and rewards notifications
   - Seasonal promotions and destination highlights

All messages comply with TCPA, CTIA guidelines, and include clear opt-out instructions. Users must explicitly opt-in for promotional messages. Transactional messages are sent only to active customers with bookings.
```

### Call-to-Action / Message Flow

```
MESSAGE FLOW AND USER INTERACTIONS:

OPT-IN METHODS:
1. Website/App Opt-In During Booking:
   - User checks "Receive SMS notifications" checkbox during flight booking
   - Confirmation displayed: "You will receive booking updates via SMS"
   - User completes booking and payment
   - System sends opt-in confirmation SMS

2. Text-to-Join:
   - User texts "JOIN" or "START" to our SMS number
   - System sends opt-in confirmation message
   - User replies "YES" to confirm subscription
   - System activates SMS notifications

3. Account Settings:
   - User logs into Fly2Any account
   - Navigates to Settings → Notifications
   - Enables "SMS Alerts" toggle
   - Enters/confirms phone number
   - Receives opt-in confirmation SMS

MESSAGE DELIVERY FLOW:
1. Opt-In Confirmation → Immediate after subscription
2. Booking Confirmation → Within 1 minute of purchase
3. Flight Updates → Real-time as changes occur
4. Pre-Flight Reminders → 24 hours before departure
5. Promotional Messages → Maximum 2 per week (if opted in separately)

USER INTERACTIONS:
- Reply HELP → Receive support contact information
- Reply STOP → Unsubscribe from all messages
- Reply with questions → Routed to customer support
- Click links → Directed to booking details or offers on fly2any.com

FREQUENCY:
- Transactional: 2-10 messages per booking (varies by flight changes)
- Promotional: Up to 8 messages per month (opt-in required)

All messages include Brand name (Fly2Any), opt-out instructions, and links to booking/offer pages.
```

### Privacy Policy Link

```
https://fly2any.com/privacy
```
*This page is now live and includes comprehensive SMS/text messaging sections*

### Terms and Conditions Link

```
https://fly2any.com/terms
```
*This page is now live and includes SMS-specific terms (Section 6)*

---

## 💬 Section 3: Sample Messages (5 Required)

### Sample 1: Opt-In Confirmation

```
Welcome to Fly2Any SMS alerts! You'll receive booking confirmations, flight updates & deals. Msg&Data rates may apply. Reply HELP for help, STOP to unsubscribe. fly2any.com/privacy
```

### Sample 2: Booking Confirmation

```
Fly2Any: Your flight JFK→LAX on Nov 14, 2025 at 10:00 AM is CONFIRMED! Booking #FA12345. Check-in opens 24hrs before departure. View details: fly2any.com/booking/FA12345 Reply STOP to optout
```

### Sample 3: Flight Status Update

```
Fly2Any: Flight AA2295 NYC→MIA DELAYED. New departure 11:45 AM (was 10:00 AM). Gate B15. We'll keep you updated. Booking #FA67890 Details: fly2any.com/booking/FA67890 Reply STOP to optout
```

### Sample 4: Gate Change Alert

```
Fly2Any: GATE CHANGE! Your flight UA1234 now boarding at Gate C23 (was B15). Boarding 10:30 AM. Have a great flight! Reply STOP to optout
```

### Sample 5: Promotional Price Drop

```
Fly2Any: Price DROP! NYC→Miami now $189 (was $289). Book by Nov 30. Limited seats! Book now: fly2any.com/deals/nyc-mia Msg&Data rates may apply. Reply STOP to optout
```

---

## 🔑 Section 4: Opt-In/Opt-Out Keywords & Messages

### Opt-In Keywords

**Keywords**:
```
JOIN, START, YES, SUBSCRIBE, OPTIN
```

**Opt-In Message** (Response to opt-in keywords):
```
Welcome to Fly2Any SMS alerts! You'll receive booking confirmations, flight updates & exclusive deals. Message frequency varies. Msg&Data rates may apply. Reply HELP for help, STOP to unsubscribe. Terms: fly2any.com/terms Privacy: fly2any.com/privacy
```

### Opt-Out Keywords

**Keywords**:
```
STOP, UNSUBSCRIBE, CANCEL, END, QUIT
```

**Opt-Out Message** (Response to STOP):
```
You have successfully unsubscribed from Fly2Any SMS notifications. You will no longer receive messages from us. We're sorry to see you go! Reply JOIN to resubscribe anytime. Questions? Email support@fly2any.com or call 1-800-FLY-2ANY
```

### Help Keywords

**Keywords**:
```
HELP, INFO, SUPPORT
```

**Help Message** (Response to HELP):
```
Fly2Any SMS Help: Get flight booking confirmations, updates & deals. Msg&Data rates may apply. For support, email support@fly2any.com or call 1-800-FLY-2ANY (M-F 9AM-6PM EST). Reply STOP to unsubscribe, JOIN to resubscribe. Terms: fly2any.com/terms
```

---

## ⚙️ Section 5: Campaign Settings (Yes/No Questions)

### Number Pooling

**Answer**: `No`

**Explanation**: We plan to use fewer than 50 phone numbers for this campaign initially. (Select "No" unless you plan to use 50+ numbers, which increases processing time)

### Direct Lending or Loan Arrangement

**Answer**: `No`

**Explanation**: Fly2Any is a travel booking platform, not a lending or loan service.

### Embedded Link

**Answer**: `Yes`

**Explanation**: Our SMS messages include links to booking confirmations, flight details, and promotional offers on fly2any.com domain. We do NOT use public URL shorteners (bitly, tinyurl).

**Note**: All links point to our owned domain (fly2any.com) or secure subdomains.

### Embedded Phone Number

**Answer**: `Yes`

**Explanation**: HELP messages include our customer support phone number (1-800-FLY-2ANY / 1-800-359-2269) as required for CTIA compliance.

### Age-Gated Content

**Answer**: `No`

**Explanation**: Flight booking services are not age-restricted content. Users must be 18+ to book (standard business requirement), but content is not age-gated.

---

## ✅ Section 6: Terms & Conditions Confirmation

### Affiliate Marketing Confirmation

**Answer**: `Yes, I confirm that this campaign will not be used for Affiliate Marketing.`

**Explanation**: Fly2Any operates as a direct travel booking platform. We are not promoting third-party affiliate products or services through SMS. All offers and bookings are for our own travel services.

---

## 🎯 Campaign Use Case Classification

**Primary Use Case**: **Mixed** (Transactional + Promotional with separate opt-ins)

**Use Case Breakdown**:
- **70% Transactional**: Booking confirmations, flight updates, customer service
- **30% Promotional**: Price alerts, deals, marketing offers (with separate opt-in)

**Vertical**: Travel & Hospitality

**Campaign Type**: Standard (Not Special)

---

## 📊 Expected Traffic Volume

**Estimated Monthly Volume**: 10,000 - 50,000 messages

**Breakdown**:
- Transactional: 8,000 - 40,000 messages (varies by bookings)
- Promotional: 2,000 - 10,000 messages (opt-in subscribers only)

**Peak Periods**:
- Holiday travel seasons (Thanksgiving, Christmas, Summer)
- Flash sales and promotional campaigns
- Major weather events or travel disruptions

---

## 🛡️ Compliance Checklist

Before submitting, verify you have:

- [ ] **Privacy Policy** published at https://fly2any.com/privacy ✅ COMPLETE
- [ ] **Terms and Conditions** published at https://fly2any.com/terms ✅ COMPLETE
- [ ] **Clear opt-in process** described in Campaign Description ✅ COMPLETE
- [ ] **Sample messages** include Brand name, opt-out instructions, and purpose ✅ COMPLETE
- [ ] **STOP keyword** included in Opt-Out Keywords ✅ COMPLETE
- [ ] **Help contact info** (phone & email) in HELP message ✅ COMPLETE
- [ ] **Accurate business information** (EIN, address, phone) ✅ READY
- [ ] **Valid website** with Privacy Policy and Terms pages ✅ COMPLETE
- [ ] **No public URL shorteners** in sample messages ✅ COMPLETE
- [ ] **TCPA compliance** - Express written consent for promotional messages ✅ COMPLETE

---

## 📞 Important Contact Information

**Customer Support** (include in HELP messages):
- **Phone**: 1-800-FLY-2ANY (1-800-359-2269)
- **Email**: support@fly2any.com
- **Hours**: Monday-Friday, 9 AM - 6 PM EST

**Business Support** (for TCR inquiries):
- **Email**: legal@fly2any.com

---

## 🚀 Submission Process

### Step 1: Pre-Submission Checklist
1. ✅ Verify all business information is accurate and matches official records
2. ✅ Ensure Privacy Policy and Terms pages are live and accessible
3. ✅ Review all sample messages for CTIA compliance
4. ✅ Confirm phone number is in E.164 format (+1XXXXXXXXXX)
5. ✅ Double-check EIN/Tax ID matches government records

### Step 2: Submit Application
1. Fill out the TCR registration form with information from this guide
2. Copy and paste Campaign Description, Message Flow, and Sample Messages
3. Enter accurate business details (EIN, address, phone)
4. Paste Privacy Policy and Terms URLs
5. Answer all Yes/No questions accurately
6. Check the Affiliate Marketing confirmation box
7. Review entire application for accuracy
8. **Submit application**

### Step 3: Await Approval
- **Processing Time**: 1-5 business days (typically 2-3 days)
- **What Happens Next**:
  - TCR reviews your brand and campaign information
  - They verify your business identity (EIN, website, domain)
  - They check for TCPA compliance
  - They assign a Trust Score to your brand
- **Approval Notification**: You'll receive an email when approved
- **If Additional Info Needed**: TCR may request clarification via email

### Step 4: After Approval
1. Receive your Campaign ID (Campaign Registry will assign)
2. Configure your SMS provider (Twilio, Bandwidth, etc.) with Campaign ID
3. Associate your 10DLC phone number with the approved campaign
4. Test SMS delivery with sample messages
5. Launch your SMS program!

---

## ⚠️ Common Rejection Reasons (Avoid These!)

1. **Inaccurate Business Info**: EIN doesn't match legal business name
2. **Missing/Broken Links**: Privacy Policy or Terms pages not accessible
3. **Vague Campaign Description**: Doesn't clearly explain message purpose
4. **Non-Compliant Samples**: Missing Brand name, opt-out, or too promotional
5. **Public URL Shorteners**: Using bitly, tinyurl in sample messages
6. **Affiliate Marketing**: If campaign promotes third-party products
7. **Wrong Phone Format**: Not using E.164 format (+1XXXXXXXXXX)
8. **Incomplete Opt-Out**: Missing required STOP keyword

---

## 💰 TCR Registration Fees

**Brand Registration**: $4.99 one-time fee
**Campaign Registration**: $10.00 one-time fee (varies by use case)
**Resubmission Fee**: $4.99 per attempt if rejected

**Total Cost**: ~$15 for initial registration

**Important**: Ensure accuracy to avoid resubmission fees!

---

## 📈 Trust Score Information

After registration, your brand receives a Trust Score:

- **High Trust Score (75-100)**: Best deliverability, higher throughput
- **Medium Trust Score (50-74)**: Good deliverability, standard throughput
- **Low Trust Score (1-49)**: Limited deliverability, lower throughput

**Factors Affecting Trust Score**:
- Business age and legitimacy
- Domain reputation
- Dun & Bradstreet (D&B) listing
- Website quality and HTTPS
- Complaint history
- Verification level

**How to Improve Trust Score**:
1. Register business with Dun & Bradstreet
2. Maintain high-quality website with HTTPS
3. Keep low complaint rates
4. Follow CTIA best practices
5. Build positive sending history

---

## 🆘 Support Resources

### TCR Support
- **Website**: https://www.campaignregistry.com
- **Support Email**: support@campaignregistry.com
- **Documentation**: https://www.campaignregistry.com/resources

### SMS Provider Support
- **Twilio**: https://www.twilio.com/docs/sms/10dlc
- **Bandwidth**: https://www.bandwidth.com/messaging/10dlc
- **Vonage**: https://developer.vonage.com/en/messaging/sms/10dlc

### Regulatory Resources
- **TCPA Compliance**: https://www.fcc.gov/general/telephone-consumer-protection-act-1991
- **CTIA Guidelines**: https://www.ctia.org/the-wireless-industry/industry-commitments/messaging-principles-and-best-practices

---

## 📝 Quick Reference: Form Field Answers

| Field | Your Answer |
|-------|-------------|
| **Display Name** | Fly2Any |
| **Company Name** | [Your Legal Business Name] |
| **EIN** | [Your 9-digit EIN] |
| **Tax Issuing Country** | United States |
| **Contact Phone** | +18003592269 |
| **Business Email** | support@fly2any.com |
| **Website** | https://fly2any.com |
| **Privacy Policy URL** | https://fly2any.com/privacy |
| **Terms URL** | https://fly2any.com/terms |
| **Country** | United States |
| **State** | [Your 2-Letter State Code] |
| **City** | [Your City] |
| **Street** | [Your Street Address] |
| **Zip Code** | [Your Zip Code] |
| **Number Pooling** | No |
| **Direct Lending** | No |
| **Embedded Link** | Yes |
| **Embedded Phone** | Yes |
| **Age-Gated** | No |
| **Affiliate Marketing** | Yes, I confirm NOT used for affiliate marketing |

---

## ✅ Final Checklist

Before submitting, confirm:

- [x] Privacy Policy live at https://fly2any.com/privacy
- [x] Terms and Conditions live at https://fly2any.com/terms
- [ ] Business information accurate (EIN, address, phone)
- [ ] Phone number in E.164 format (+1XXXXXXXXXX)
- [ ] All sample messages include Brand name, opt-out, and purpose
- [ ] STOP keyword in opt-out keywords
- [ ] HELP message includes support contact info
- [ ] No public URL shorteners (bitly, tinyurl)
- [ ] Campaign description clear and detailed
- [ ] Message flow explains opt-in process
- [ ] All Yes/No questions answered correctly
- [ ] Affiliate Marketing confirmation checked

---

## 🎉 You're Ready to Submit!

**Status**: ✅ **READY FOR TCR REGISTRATION**

All compliance pages are complete and deployed. Use this guide to fill out your TCR registration form accurately.

**Estimated Approval Time**: 2-3 business days

**Next Steps**:
1. Fill out the TCR registration form using this guide
2. Submit the application
3. Await approval email from The Campaign Registry
4. Configure your SMS provider with the approved Campaign ID
5. Launch your Fly2Any SMS notification program!

---

**Document Created**: October 23, 2025
**Last Updated**: October 23, 2025
**Status**: Complete and Ready for Submission
**Compliance Level**: ✅ TCPA, CTIA, and TCR Compliant

**Questions?** Contact support@fly2any.com

🚀 **Good luck with your TCR registration!**
