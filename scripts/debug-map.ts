
async function testNominatim() {
    const query = "72305-503";
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    
    console.log(`Querying: ${url}`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Fly2Any-Debug-Script/1.0'
            }
        });
        const data = await res.json();
        console.log("Results found:", data.length);
        data.forEach((item: any, i: number) => {
            console.log(`[${i}] ${item.display_name} (Lat: ${item.lat}, Lon: ${item.lon})`);
        });
    } catch (e) {
        console.error("Error:", e);
    }
}

testNominatim();
