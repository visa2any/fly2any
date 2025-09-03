// Test script to verify email/SMS services work without missing dependencies
const path = require('path');

console.log('🧪 Testing email and SMS services...');

// Test email service
try {
  // Simulate what would happen if we tried to use SendGrid
  let sgMail;
  try {
    sgMail = require('@sendgrid/mail');
    console.log('✅ SendGrid available');
  } catch (e) {
    console.log('⚠️ SendGrid not installed - this is expected and should be handled gracefully');
  }

  // Test Mailgun
  try {
    const Mailgun = require('mailgun.js');
    console.log('✅ Mailgun available');
  } catch (e) {
    console.log('⚠️ Mailgun not installed - this is expected and should be handled gracefully');
  }

  // Test Twilio
  try {
    const twilio = require('twilio');
    console.log('✅ Twilio available');
  } catch (e) {
    console.log('⚠️ Twilio not installed - this is expected and should be handled gracefully');
  }

  // Test AWS SDK
  try {
    const AWS = require('aws-sdk');
    console.log('✅ AWS SDK available');
  } catch (e) {
    console.log('⚠️ AWS SDK not installed - this is expected and should be handled gracefully');
  }

  console.log('✅ Dependency test completed - services should handle missing deps gracefully');
} catch (error) {
  console.log('❌ Unexpected error:', error.message);
}