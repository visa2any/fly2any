const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateOGImage() {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#1e40af');
  gradient.addColorStop(0.5, '#a21caf');
  gradient.addColorStop(1, '#713f12');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Add floating circles for decoration
  ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
  ctx.beginPath();
  ctx.arc(200, 150, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(232, 121, 249, 0.2)';
  ctx.beginPath();
  ctx.arc(1000, 200, 100, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
  ctx.beginPath();
  ctx.arc(150, 500, 60, 0, Math.PI * 2);
  ctx.fill();

  // Main logo circle
  const logoGradient = ctx.createLinearGradient(260, 160, 340, 160);
  logoGradient.addColorStop(0, '#facc15');
  logoGradient.addColorStop(1, '#f59e0b');
  
  ctx.fillStyle = logoGradient;
  ctx.beginPath();
  ctx.arc(300, 200, 40, 0, Math.PI * 2);
  ctx.fill();

  // Logo text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('F', 300, 210);

  // Main title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Fly2Any', 400, 200);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '24px Arial';
  ctx.fillText('Voos Brasil-EUA', 400, 240);

  // Subtitle
  ctx.fillStyle = 'rgba(219, 234, 254, 0.9)';
  ctx.font = '20px Arial';
  ctx.fillText('Especialistas em passagens aéreas para brasileiros', 400, 300);
  ctx.fillText('nos EUA há mais de 10 anos', 400, 330);

  // Features
  ctx.fillStyle = 'rgba(250, 204, 21, 1)';
  ctx.font = '18px Arial';
  ctx.fillText('✈️ Cotação gratuita em 2 horas', 400, 390);
  ctx.fillText('💰 Melhores preços garantidos', 400, 420);
  ctx.fillText('🇧🇷 Atendimento em português 24h', 400, 450);

  // Website
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '16px Arial';
  ctx.fillText('fly2any.com', 400, 520);

  // Simple airplane shape
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.moveTo(860, 355);
  ctx.lineTo(900, 365);
  ctx.lineTo(890, 375);
  ctx.lineTo(880, 370);
  ctx.lineTo(870, 385);
  ctx.lineTo(860, 380);
  ctx.lineTo(850, 370);
  ctx.closePath();
  ctx.fill();

  // Airplane highlight
  ctx.fillStyle = 'rgba(250, 204, 21, 1)';
  ctx.beginPath();
  ctx.arc(895, 370, 3, 0, Math.PI * 2);
  ctx.fill();

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../public/og-image.png'), buffer);
  console.log('OG image generated successfully!');
}

generateOGImage().catch(console.error);