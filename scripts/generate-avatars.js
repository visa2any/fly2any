/**
 * Generate Placeholder Avatars Script
 *
 * This script downloads placeholder avatars for all consultants
 * Run: node scripts/generate-avatars.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const consultants = [
  { id: 'sarah-flight', name: 'Sarah Chen', bg: '2563EB' },
  { id: 'marcus-hotel', name: 'Marcus Rodriguez', bg: '7C3AED' },
  { id: 'emily-legal', name: 'Emily Watson', bg: '1E40AF' },
  { id: 'david-payment', name: 'David Park', bg: '059669' },
  { id: 'lisa-service', name: 'Lisa Thompson', bg: 'EC4899' },
  { id: 'robert-insurance', name: 'Robert Martinez', bg: '0D9488' },
  { id: 'sophia-visa', name: 'Sophia Nguyen', bg: '4F46E5' },
  { id: 'james-car', name: 'James Anderson', bg: 'EA580C' },
  { id: 'amanda-loyalty', name: 'Amanda Foster', bg: 'D97706' },
  { id: 'captain-mike', name: 'Mike Johnson', bg: 'DC2626' },
  { id: 'alex-tech', name: 'Alex Kumar', bg: '0891B2' },
  { id: 'nina-special', name: 'Nina Davis', bg: '65A30D' },
];

const outputDir = path.join(__dirname, '../public/consultants');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadAvatar(consultant) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      name: consultant.name,
      size: '256',
      background: consultant.bg,
      color: 'FFFFFF',
      bold: 'true',
      rounded: 'true',
      format: 'png',
      length: '2',
    });

    const url = `https://ui-avatars.com/api/?${params.toString()}`;
    const filepath = path.join(outputDir, `${consultant.id}.png`);

    console.log(`📸 Downloading ${consultant.name}...`);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${consultant.name}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ Saved: ${consultant.id}.png`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function generateAllAvatars() {
  console.log('🚀 Starting avatar generation...\n');

  for (const consultant of consultants) {
    try {
      await downloadAvatar(consultant);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error downloading ${consultant.name}:`, error.message);
    }
  }

  console.log('\n✨ Avatar generation complete!');
  console.log(`📁 Avatars saved to: ${outputDir}`);
}

generateAllAvatars().catch(console.error);
