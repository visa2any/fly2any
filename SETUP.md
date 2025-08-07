# 🚀 Fly2Any Complete Booking System Setup

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)
- Email service account (SendGrid, Mailgun, or SMTP)
- SMS service account (Twilio or AWS SNS) - optional
- Amadeus API credentials

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
npm install prisma @prisma/client
npm install jspdf qrcode canvas
npm install @sendgrid/mail mailgun.js nodemailer
npm install twilio aws-sdk
```

### 2. Environment Setup

Copy the environment template and configure:

```bash
cp env.example .env.local
```

Fill in your credentials in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fly2any_db"

# Stripe (Required)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email Service (Choose one)
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# OR Mailgun
MAILGUN_API_KEY="key-..."
MAILGUN_DOMAIN="mg.yourdomain.com"

# OR SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# SMS Service (Optional)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# OR AWS SNS
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"

# Amadeus API
AMADEUS_CLIENT_ID="..."
AMADEUS_CLIENT_SECRET="..."
AMADEUS_BASE_URL="https://api.amadeus.com"

# Application
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Alerts (Optional)
CRITICAL_ERROR_EMAIL="alerts@yourdomain.com"
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma db push

# Optional: Seed data
npx prisma db seed
```

### 4. Build and Start

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🎯 Features Implemented

### ✅ Complete Booking Flow
- **Flight search and selection**
- **Multi-step booking form with validation**
- **Real-time availability checking**
- **Payment processing with Stripe**
- **Booking confirmation and management**

### ✅ PDF Ticket Generation
- **Professional e-ticket design**
- **QR codes for verification**
- **Airline branding and flight details**
- **Automatic email attachment**

### ✅ Database Integration
- **PostgreSQL with Prisma ORM**
- **Complete booking storage**
- **User management**
- **Email/SMS logging**
- **Error tracking**

### ✅ Multi-Provider Email System
- **SendGrid integration**
- **Mailgun integration** 
- **SMTP fallback**
- **Professional email templates**
- **Automatic retries**

### ✅ SMS Notifications
- **Twilio integration**
- **AWS SNS integration**
- **Booking confirmations**
- **Flight updates**
- **Template system**

### ✅ Real-time Validation
- **Passenger data validation**
- **Payment fraud detection**
- **Duplicate booking prevention**
- **Business rules enforcement**
- **Confidence scoring**

### ✅ Comprehensive Error Logging
- **Structured error tracking**
- **Critical error alerts**
- **Performance monitoring**
- **Slack/email notifications**
- **Error classification**

### ✅ US Market Optimization
- **USD currency handling**
- **US credit card validation**
- **US phone number formats**
- **US airport data**
- **Timezone handling**

## 🔐 Security Features

- **Payment data encryption**
- **PCI DSS compliance**
- **Fraud detection**
- **Rate limiting**
- **Input sanitization**
- **SQL injection prevention**

## 📊 Monitoring & Analytics

- **Real-time error tracking**
- **Performance metrics**
- **Booking analytics**
- **Payment monitoring**
- **User behavior tracking**

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t fly2any .

# Run container
docker run -p 3000:3000 --env-file .env.local fly2any
```

### Traditional Hosting

```bash
# Build for production
npm run build

# Start with PM2
pm2 start npm --name "fly2any" -- start
```

## 📧 Email Templates

Professional email templates included:
- **Booking confirmation with flight details**
- **Cancellation confirmation with refund info**
- **Flight updates and notifications**
- **Critical error alerts**

## 📱 SMS Templates

SMS notification templates:
- **Booking confirmations**
- **Check-in reminders**
- **Flight delays/updates**
- **Cancellation confirmations**

## 🔧 API Endpoints

### Flight Booking
- `POST /api/flights/search` - Search flights
- `POST /api/flights/create-order` - Create booking
- `POST /api/flights/payment/create-intent` - Payment setup
- `POST /api/flights/payment/confirm` - Finalize booking

### Booking Management
- `GET /api/flights/booking/manage` - Get booking details
- `PUT /api/flights/booking/manage` - Update booking
- `POST /api/flights/booking/cancel` - Cancel booking

### Validation
- Real-time validation during booking flow
- Fraud detection and prevention
- Business rules enforcement

## ⚡ Performance Optimizations

- **Connection pooling**
- **Query optimization**
- **Caching strategies**
- **Image optimization**
- **Code splitting**
- **Lazy loading**

## 🧪 Testing

```bash
# Run tests
npm test

# Test email service
npm run test:email

# Test SMS service  
npm run test:sms

# Test payment flow
npm run test:payments
```

## 📚 Documentation

- **API documentation** in `/docs/api`
- **Database schema** in `/docs/database`
- **Email templates** in `/src/lib/email/templates`
- **SMS templates** in `/src/lib/sms`

## 🆘 Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Emails not sending**
   - Check email provider credentials
   - Verify sender domain setup
   - Check spam folders

3. **SMS not working**
   - Verify phone number format
   - Check Twilio/AWS credentials
   - Ensure sufficient credits

4. **Payment errors**
   - Verify Stripe keys
   - Check webhook configuration
   - Review test card numbers

## 🔄 Updates and Maintenance

- **Regular dependency updates**
- **Security patches**
- **Performance monitoring**
- **Database backups**
- **Log rotation**

## 📞 Support

For technical support:
- Email: tech@yourdomain.com
- Slack: #fly2any-support
- Documentation: `/docs`

---

**🎉 Congratulations! Your complete booking system is ready for production use.**