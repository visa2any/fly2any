
const fetch = require('node-fetch');

async function debug() {
    const vData = {
      "logradouro": "Quadra CSG 3",
      "bairro": "Taguatinga Sul",
      "localidade": "Brasília",
      "uf": "DF"
    };
    
    // Testing variations to see if we can get closer than just "Taguatinga Sul"
    const queries = [
        `CSG 3, Taguatinga Sul, Brasília - DF, Brazil`, // Remove "Quadra"
        `Quadra CSG 3, Brasília - DF, Brazil`, // Remove Bairro
        `CSG 3, Brasília - DF, Brazil`,
        `Taguatinga Sul, Brasília, Brazil`, // Simpler
    ];

    for (const [i, q] of queries.entries()) {
        console.log(`\n--- Query "${q}" ---`);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`;
        const nRes = await fetch(url, { headers: { 'User-Agent': 'Fly2Any-Debug-Script' } });
        const nData = await nRes.json();
        console.log(`Results: ${nData.length}`);
        if(nData.length > 0) console.log("Top:", nData[0].display_name);
    }
}

debug();
