// Check MailerSend domains
const checkDomains = async () => {
  const apiKey = 'mlsn.ec479149fa82385db9f243869ff65ead519498c3e2de85810e24c77f61c6fa75';
  
  try {
    console.log('🔍 Checking MailerSend domains...\n');
    
    // Get list of domains
    const response = await fetch('https://api.mailersend.com/v1/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch domains:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('📧 Available domains in your account:\n');
    
    if (data.data && data.data.length > 0) {
      data.data.forEach((domain, index) => {
        console.log(`${index + 1}. Domain: ${domain.name}`);
        console.log(`   Status: ${domain.domain_settings?.is_verified ? '✅ Verified' : '❌ Not Verified'}`);
        console.log(`   Created: ${domain.created_at}`);
        console.log(`   ID: ${domain.id}`);
        console.log('');
      });
      
      // Find first verified domain
      const verifiedDomain = data.data.find(d => d.domain_settings?.is_verified);
      if (verifiedDomain) {
        console.log(`\n✅ You can use: noreply@${verifiedDomain.name}`);
        console.log(`\n📝 Update your .env.local file:`);
        console.log(`MAILERSEND_FROM_EMAIL=noreply@${verifiedDomain.name}`);
      } else {
        console.log('\n⚠️ No verified domains found. You need to verify a domain first.');
        console.log('\nTo add a domain:');
        console.log('1. Go to https://app.mailersend.com/domains');
        console.log('2. Click "Add domain"');
        console.log('3. Enter your domain (or use sandbox for testing)');
        console.log('4. Follow the DNS verification steps');
      }
    } else {
      console.log('❌ No domains found in your account.');
      console.log('\nYou need to add a domain first:');
      console.log('1. Go to https://app.mailersend.com/domains');
      console.log('2. Click "Add domain"');
      console.log('3. You can use a sandbox domain for testing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the check
checkDomains();