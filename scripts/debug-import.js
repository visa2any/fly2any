const cheerio = require('cheerio');

async function testImport(url) {
    console.log(`Testing import for: ${url}`);
    
    try {
        const res = await fetch(url, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        
        const html = await res.text();
        const $ = cheerio.load(html);
        
        let jsonLdData = {};
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const content = $(el).html() || '{}';
                const data = JSON.parse(content);
                console.log("Found JSON-LD Type:", data['@type']);
                
                if (['Hotel', 'LodgingBusiness', 'Resort', 'BedAndBreakfast', 'VacationRental', 'RealEstateListing', 'Product'].includes(data['@type'])) {
                    jsonLdData = { ...jsonLdData, ...data };
                }
                if (Array.isArray(data)) {
                     data.forEach(item => {
                        if (item['@type'] && ['Hotel', 'LodgingBusiness', 'VR'].some(t => item['@type'].includes(t))) {
                            jsonLdData = { ...jsonLdData, ...item };
                        }
                     });
                }
            } catch (e) { console.error("Parse Error"); }
        });
        
        console.log("--- Extracted JSON-LD ---");
        console.log(JSON.stringify(jsonLdData, null, 2));
        
        const extractedImages = [];
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) extractedImages.push(ogImage);
        
        $('img').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && src.startsWith('http') && !src.includes('profile') && !src.includes('icon') && !src.includes('logo')) {
                if (!extractedImages.includes(src)) extractedImages.push(src);
            }
        });
        
        console.log("--- Extracted Images (Top 5) ---");
        console.log(extractedImages.slice(0, 5));
        
    } catch (e) {
        console.error(e);
    }
}

const targetUrl = process.argv[2] || 'https://www.booking.com/hotel/us/the-plaza-new-york.html'; 
testImport(targetUrl);
