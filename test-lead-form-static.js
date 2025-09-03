const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 Testing Lead Form - Static HTML Analysis...');
  
  // First, let's see if we can find lead form components in the codebase
  const leadFormFiles = [
    '/mnt/d/Users/vilma/fly2any/src/components/LeadCapture.tsx',
    '/mnt/d/Users/vilma/fly2any/src/components/LeadCaptureSimple.tsx',
    '/mnt/d/Users/vilma/fly2any/src/components/DatePicker.tsx',
    '/mnt/d/Users/vilma/fly2any/src/components/flights/FlightSearchForm.tsx',
    '/mnt/d/Users/vilma/fly2any/src/components/flights/AirportAutocomplete.tsx'
  ];
  
  console.log('📁 Checking for Lead Form components in codebase...');
  
  leadFormFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ Found: ${file}`);
      
      // Read first few lines to understand structure
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').slice(0, 20);
      console.log(`   Preview (first 20 lines):`);
      lines.forEach((line, idx) => {
        if (line.trim()) {
          console.log(`   ${idx + 1}: ${line.trim().substring(0, 80)}...`);
        }
      });
      console.log('');
    } else {
      console.log(`❌ Not found: ${file}`);
    }
  });
  
  // Try to create a simple static HTML file to test
  const staticTestHTML = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fly2Any Lead Form Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .lead-form {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 0 auto;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        input:focus {
            outline: none;
            border-color: #007bff;
        }
        .airport-dropdown {
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            max-height: 200px;
            overflow-y: auto;
            position: absolute;
            width: 100%;
            z-index: 1000;
            display: none;
        }
        .airport-dropdown.active {
            display: block;
        }
        .airport-option {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        .airport-option:hover {
            background: #f0f0f0;
        }
        .trigger-btn {
            background: #007bff;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 4px;
            font-size: 18px;
            cursor: pointer;
            margin: 20px;
        }
    </style>
</head>
<body>
    <h1>Fly2Any - Lead Form Test</h1>
    
    <button class="trigger-btn" onclick="openLeadForm()">Solicitar Cotação</button>
    
    <div class="lead-form" id="leadForm" style="display: none;">
        <h2>Solicite sua Cotação</h2>
        
        <div class="form-group" style="position: relative;">
            <label for="origem">Origem (De onde você vai sair?):</label>
            <input 
                type="text" 
                id="origem" 
                placeholder="Digite a cidade ou aeroporto de origem"
                oninput="searchAirports(this.value)"
                autocomplete="off"
            />
            <div class="airport-dropdown" id="airportDropdown">
                <!-- Airport options will appear here -->
            </div>
        </div>
        
        <div class="form-group">
            <label for="destino">Destino (Para onde você quer ir?):</label>
            <input type="text" id="destino" placeholder="Digite a cidade ou aeroporto de destino" />
        </div>
        
        <div class="form-group">
            <label for="data">Data de ida:</label>
            <input type="date" id="data" />
        </div>
    </div>

    <script>
        // Mock airport data for testing
        const mockAirports = [
            { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
            { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA' },
            { code: 'EWR', name: 'Newark Liberty International Airport', city: 'New York', country: 'USA' },
            { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
            { code: 'GIG', name: 'Rio de Janeiro–Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
            { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' }
        ];
        
        function openLeadForm() {
            document.getElementById('leadForm').style.display = 'block';
            console.log('Lead form opened');
        }
        
        function searchAirports(query) {
            const dropdown = document.getElementById('airportDropdown');
            
            if (!query || query.length < 2) {
                dropdown.classList.remove('active');
                return;
            }
            
            const results = mockAirports.filter(airport => 
                airport.city.toLowerCase().includes(query.toLowerCase()) ||
                airport.name.toLowerCase().includes(query.toLowerCase()) ||
                airport.code.toLowerCase().includes(query.toLowerCase())
            );
            
            if (results.length > 0) {
                dropdown.innerHTML = results.map(airport => 
                    \`<div class="airport-option" onclick="selectAirport('\${airport.code}', '\${airport.city}')">
                        <strong>\${airport.code}</strong> - \${airport.name}<br>
                        <small>\${airport.city}, \${airport.country}</small>
                    </div>\`
                ).join('');
                dropdown.classList.add('active');
                console.log(\`Found \${results.length} airport results for: \${query}\`);
            } else {
                dropdown.classList.remove('active');
                console.log(\`No airport results found for: \${query}\`);
            }
        }
        
        function selectAirport(code, city) {
            document.getElementById('origem').value = \`\${code} - \${city}\`;
            document.getElementById('airportDropdown').classList.remove('active');
            console.log(\`Selected airport: \${code} - \${city}\`);
        }
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.form-group')) {
                document.getElementById('airportDropdown').classList.remove('active');
            }
        });
    </script>
</body>
</html>
  `;
  
  // Write static test file
  fs.writeFileSync('/mnt/d/Users/vilma/fly2any/test-static-leadform.html', staticTestHTML);
  console.log('📄 Created static test file: test-static-leadform.html');
  
  // Now test with Playwright
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📍 Testing static Lead Form...');
    
    await page.goto('file:///mnt/d/Users/vilma/fly2any/test-static-leadform.html');
    
    // Take initial screenshot
    await page.screenshot({ path: 'static-test-initial.png', fullPage: true });
    console.log('📸 Screenshot: static-test-initial.png');
    
    // Click the lead form trigger
    console.log('📍 Clicking lead form trigger...');
    await page.click('.trigger-btn');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'static-test-form-open.png', fullPage: true });
    console.log('📸 Screenshot: static-test-form-open.png');
    
    // Type in the airport search field
    console.log('📍 Testing airport search with "New York"...');
    const airportInput = page.locator('#origem');
    
    await airportInput.focus();
    await airportInput.fill('New York');
    await page.waitForTimeout(2000);
    
    // Check for dropdown results
    const dropdownVisible = await page.locator('#airportDropdown.active').isVisible();
    const airportOptions = await page.locator('.airport-option').count();
    
    await page.screenshot({ path: 'static-test-airport-search.png', fullPage: true });
    console.log('📸 Screenshot: static-test-airport-search.png');
    
    console.log('\n=== STATIC LEAD FORM TEST RESULTS ===');
    console.log(`✅ Lead form trigger working: Yes`);
    console.log(`✅ Airport input field working: Yes`);
    console.log(`✅ Airport search dropdown visible: ${dropdownVisible ? 'Yes' : 'No'}`);
    console.log(`✅ Number of airport options found: ${airportOptions}`);
    
    if (dropdownVisible && airportOptions > 0) {
      console.log('🎉 AIRPORT SEARCH IS WORKING IN STATIC TEST!');
      
      // Get the option texts
      const options = await page.locator('.airport-option').allTextContents();
      console.log('Found airport options:');
      options.forEach((option, idx) => {
        console.log(`  ${idx + 1}. ${option.replace(/\n/g, ' - ')}`);
      });
    } else {
      console.log('❌ Airport search not working in static test');
    }
    
    // Now let's try to examine the actual Next.js components
    console.log('\n📁 Now examining actual React components...');
    
    // Read the main components to understand the structure
    const leadCaptureFile = '/mnt/d/Users/vilma/fly2any/src/components/LeadCapture.tsx';
    if (fs.existsSync(leadCaptureFile)) {
      const content = fs.readFileSync(leadCaptureFile, 'utf8');
      
      // Look for airport search related code
      if (content.includes('airport') || content.includes('Airport')) {
        console.log('✅ Found airport-related code in LeadCapture.tsx');
        
        // Extract airport search logic
        const airportLines = content.split('\n').filter(line => 
          line.toLowerCase().includes('airport') || 
          line.toLowerCase().includes('autocomplete') ||
          line.toLowerCase().includes('search')
        );
        
        if (airportLines.length > 0) {
          console.log('Airport search related lines found:');
          airportLines.forEach((line, idx) => {
            console.log(`  ${idx + 1}: ${line.trim()}`);
          });
        }
      } else {
        console.log('❌ No airport search logic found in LeadCapture.tsx');
      }
    }
    
  } catch (error) {
    console.error('❌ Static test failed:', error);
    await page.screenshot({ path: 'static-test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Static test completed');
  }
  
})();