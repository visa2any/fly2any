
import * as cheerio from 'cheerio';

const HOST_URL = "https://www.airbnb.com.br/hosting/listings/editor/1186339775146522108/view-your-space";
const PUBLIC_URL = "https://www.airbnb.com.br/rooms/1186339775146522108";

async function testUrl(url: string) {
    console.log(`\nTesting: ${url}`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        console.log(`Status: ${res.status}`);
        console.log(`Final URL: ${res.url}`); // Check for redirects
        
        if (!res.ok) return;

        const html = await res.text();
        const $ = cheerio.load(html);
        const title = $('title').text();
        console.log(`Page Title: ${title}`);
        
        const jsonLd = $('script[type="application/ld+json"]').length;
        console.log(`JSON-LD scripts found: ${jsonLd}`);
        
        if (title.includes("Login") || title.includes("Entrar") || res.url.includes("login")) {
            console.log("⚠️  DETECTED LOGIN/AUTH WALL");
        } else {
            console.log("✅ Page seems accessible");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

async function main() {
    console.log("=== DEBUGGING AIRBNB IMPORT ===");
    await testUrl(HOST_URL);
    console.log("\n--------------------------------");
    await testUrl(PUBLIC_URL);
}

main();
