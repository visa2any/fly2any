@echo off
echo 🚀 INSTALLING ALL MISSING DEPENDENCIES
echo =====================================

echo 📦 BATCH 1: UI & Icons...
call npm install lucide-react @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip class-variance-authority react-day-picker @headlessui/react clsx tailwind-merge

echo 📦 BATCH 2: Database & API...
call npm install @vercel/postgres zod @prisma/client uuid

echo 📦 BATCH 3: Auth & Email...
call npm install resend nodemailer stripe bcryptjs

echo 📦 BATCH 4: Animation & Date...
call npm install framer-motion date-fns

echo 📦 BATCH 5: Communication...
call npm install @whiskeysockets/baileys @hapi/boom pino qrcode-terminal qrcode ws

echo 📦 BATCH 6: State & Utils...
call npm install zustand @aws-sdk/client-ses jspdf openai

echo 📦 BATCH 7: Development...
call npm install @playwright/test --save-dev

echo ✅ ALL DEPENDENCIES INSTALLED!
echo 🚀 Now fixing TypeScript issues...
pause