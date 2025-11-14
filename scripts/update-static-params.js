const fs = require('fs');
const path = require('path');

// Dynamic route pages that need generateStaticParams()
const pages = [
  'app/packages/[id]/page.tsx',
  'app/hotels/[id]/page.tsx',
  'app/blog/[slug]/page.tsx',
  'app/tripmatch/trips/[id]/page.tsx',
  'app/payments/confirm/[paymentId]/page.tsx',
  'app/blog/category/[category]/page.tsx',
  'app/admin/bookings/[id]/page.tsx',
  'app/account/bookings/[id]/page.tsx',
];

const pageTemplate = `import ClientPage from './ClientPage';

// Required for static export (mobile builds)
// Generate a placeholder path for static export
// Real data will be fetched client-side via API
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <ClientPage />;
}
`;

const blogSlugTemplate = `import ClientPage from './ClientPage';

// Required for static export (mobile builds)
// Generate a placeholder path for static export
// Real data will be fetched client-side via API
export async function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export default function Page() {
  return <ClientPage />;
}
`;

const categoryTemplate = `import ClientPage from './ClientPage';

// Required for static export (mobile builds)
// Generate a placeholder path for static export
// Real data will be fetched client-side via API
export async function generateStaticParams() {
  return [{ category: 'placeholder' }];
}

export default function Page() {
  return <ClientPage />;
}
`;

const paymentTemplate = `import ClientPage from './ClientPage';

// Required for static export (mobile builds)
// Generate a placeholder path for static export
// Real data will be fetched client-side via API
export async function generateStaticParams() {
  return [{ paymentId: 'placeholder' }];
}

export default function Page() {
  return <ClientPage />;
}
`;

console.log('📝 Updating generateStaticParams() to return placeholder paths...\n');

pages.forEach(page => {
  const fullPath = path.join(process.cwd(), page);

  let template;
  if (page.includes('[slug]')) {
    template = blogSlugTemplate;
  } else if (page.includes('[category]')) {
    template = categoryTemplate;
  } else if (page.includes('[paymentId]')) {
    template = paymentTemplate;
  } else {
    template = pageTemplate;
  }

  try {
    fs.writeFileSync(fullPath, template, 'utf8');
    console.log(`✓ Updated ${page}`);
  } catch (err) {
    console.error(`✗ Failed to update ${page}:`, err.message);
  }
});

console.log('\n✅ All page.tsx files updated with placeholder paths!');
