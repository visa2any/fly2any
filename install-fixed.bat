@echo off
echo 🚀 INSTALLING CORRECTED DEPENDENCIES
echo =====================================

echo 📦 Step 1: Installing core UI packages...
call npm install lucide-react@0.400.0 clsx@2.1.1 tailwind-merge@2.5.4 class-variance-authority@0.7.1

echo 📦 Step 2: Installing Radix UI packages...
call npm install @radix-ui/react-avatar@1.1.1 @radix-ui/react-checkbox@1.1.2 @radix-ui/react-dialog@1.1.2 @radix-ui/react-dropdown-menu@2.1.2 @radix-ui/react-label@2.1.0 @radix-ui/react-popover@1.1.2 @radix-ui/react-select@2.1.2 @radix-ui/react-slot@1.1.0 @radix-ui/react-switch@1.1.1 @radix-ui/react-tabs@1.1.1 @radix-ui/react-tooltip@1.1.3

echo 📦 Step 3: Installing database packages...
call npm install @vercel/postgres@0.10.0 zod@3.24.1 @prisma/client@5.19.1 uuid@10.0.0

echo 📦 Step 4: Installing auth and email...
call npm install resend@3.5.0 nodemailer@6.9.14 stripe@16.12.0 bcryptjs@2.4.3

echo 📦 Step 5: Installing animation and date...
call npm install framer-motion@11.9.0 date-fns@2.30.0 react-day-picker@8.10.1 @headlessui/react@2.2.0

echo 📦 Step 6: Installing dev dependencies...
call npm install --save-dev @types/bcryptjs@2.4.3 @types/nodemailer@6.4.15 @types/qrcode@1.5.4 @types/uuid@9.0.8 @types/ws@8.5.10 prisma@5.19.1

echo 📦 Step 7: Installing remaining packages...
call npm install zustand@4.5.5 @aws-sdk/client-ses@3.658.1 jspdf@2.5.2 openai@4.62.1 qrcode@1.5.4 ws@8.18.0

echo ✅ ALL DEPENDENCIES INSTALLED!
echo 🚀 Now run: npm run dev
pause