/**
 * Generate Placeholder Avatar URLs
 *
 * This utility generates professional placeholder avatars using UI Avatars API
 * until real photos are available.
 *
 * UI Avatars API: https://ui-avatars.com/
 */

export interface PlaceholderAvatarOptions {
  name: string;
  size?: number;
  background?: string;
  color?: string;
  bold?: boolean;
  rounded?: boolean;
}

/**
 * Generate a professional placeholder avatar URL
 */
export function generatePlaceholderAvatar({
  name,
  size = 128,
  background = '3B82F6', // Primary blue
  color = 'FFFFFF', // White text
  bold = true,
  rounded = true,
}: PlaceholderAvatarOptions): string {
  const params = new URLSearchParams({
    name: name,
    size: size.toString(),
    background: background.replace('#', ''),
    color: color.replace('#', ''),
    bold: bold ? 'true' : 'false',
    rounded: rounded ? 'true' : 'false',
    format: 'png',
    length: '2', // Show 2 initials
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * Consultant-specific avatar configurations
 * These colors are chosen to represent their role professionally
 */
export const CONSULTANT_AVATAR_CONFIGS: Record<
  string,
  Omit<PlaceholderAvatarOptions, 'name' | 'size'>
> = {
  // Sarah Chen - Flight Operations (Blue - Aviation)
  'sarah-flight': {
    background: '2563EB', // Blue 600
    color: 'FFFFFF',
  },

  // Marcus Rodriguez - Hotel (Purple - Hospitality)
  'marcus-hotel': {
    background: '7C3AED', // Purple 600
    color: 'FFFFFF',
  },

  // Dr. Emily Watson - Legal (Dark Blue - Authority)
  'emily-legal': {
    background: '1E40AF', // Blue 800
    color: 'FFFFFF',
  },

  // David Park - Payment (Green - Finance)
  'david-payment': {
    background: '059669', // Emerald 600
    color: 'FFFFFF',
  },

  // Lisa Thompson - Customer Service (Pink - Friendly)
  'lisa-service': {
    background: 'EC4899', // Pink 600
    color: 'FFFFFF',
  },

  // Robert Martinez - Insurance (Teal - Trust)
  'robert-insurance': {
    background: '0D9488', // Teal 600
    color: 'FFFFFF',
  },

  // Sophia Nguyen - Visa (Indigo - Official)
  'sophia-visa': {
    background: '4F46E5', // Indigo 600
    color: 'FFFFFF',
  },

  // James Anderson - Car Rental (Orange - Active)
  'james-car': {
    background: 'EA580C', // Orange 600
    color: 'FFFFFF',
  },

  // Amanda Foster - Loyalty (Gold - Rewards)
  'amanda-loyalty': {
    background: 'D97706', // Amber 600
    color: 'FFFFFF',
  },

  // Captain Mike - Crisis (Red - Emergency)
  'captain-mike': {
    background: 'DC2626', // Red 600
    color: 'FFFFFF',
  },

  // Alex Kumar - Tech (Cyan - Technology)
  'alex-tech': {
    background: '0891B2', // Cyan 600
    color: 'FFFFFF',
  },

  // Nina Davis - Special Services (Lime - Accessibility)
  'nina-special': {
    background: '65A30D', // Lime 600
    color: 'FFFFFF',
  },
};

/**
 * Get placeholder avatar URL for a consultant
 */
export function getConsultantPlaceholderAvatar(
  consultantId: string,
  name: string,
  size: number = 128
): string {
  const config = CONSULTANT_AVATAR_CONFIGS[consultantId] || {
    background: '3B82F6',
    color: 'FFFFFF',
  };

  return generatePlaceholderAvatar({
    name,
    size,
    ...config,
  });
}

/**
 * Download all placeholder avatars (for development)
 * Run this to pre-generate all consultant avatars
 */
export async function downloadAllConsultantAvatars() {
  const consultants = [
    { id: 'sarah-flight', name: 'Sarah Chen' },
    { id: 'marcus-hotel', name: 'Marcus Rodriguez' },
    { id: 'emily-legal', name: 'Emily Watson' },
    { id: 'david-payment', name: 'David Park' },
    { id: 'lisa-service', name: 'Lisa Thompson' },
    { id: 'robert-insurance', name: 'Robert Martinez' },
    { id: 'sophia-visa', name: 'Sophia Nguyen' },
    { id: 'james-car', name: 'James Anderson' },
    { id: 'amanda-loyalty', name: 'Amanda Foster' },
    { id: 'captain-mike', name: 'Mike Johnson' },
    { id: 'alex-tech', name: 'Alex Kumar' },
    { id: 'nina-special', name: 'Nina Davis' },
  ];

  console.log('📸 Generating placeholder avatars...\n');

  for (const consultant of consultants) {
    const url = getConsultantPlaceholderAvatar(consultant.id, consultant.name, 256);
    console.log(`${consultant.name} (${consultant.id}):`);
    console.log(`  ${url}`);
    console.log(`  Save as: public/consultants/${consultant.id}.png\n`);
  }

  console.log('✅ Copy these URLs into your browser to download the images.');
  console.log('💡 Save them in: public/consultants/ folder');
}
