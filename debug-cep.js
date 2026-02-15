
const fetch = require('node-fetch');

async function debug() {
    const cep = "72035-503";
    console.log(`Analyzing CEP: ${cep}`);

    // 1. Check ViaCEP
    const cleanCep = cep.replace(/\D/g, '');
    console.log(`Clean CEP: ${cleanCep}`);
    
    const viaCepUrl = `https://viacep.com.br/ws/${cleanCep}/json/`;
    console.log(`Fetching ViaCEP: ${viaCepUrl}`);
    
    try {
        const vRes = await fetch(viaCepUrl);
        const vData = await vRes.json();
        
        if (vData.erro) {
            console.error("ViaCEP returned error: true");
            return;
        }
        
        console.log("ViaCEP Data:", JSON.stringify(vData, null, 2));
        
        // 2. Simulate Nominatim Queries
        const queries = [
            // Attempt 1: Full
            `${vData.logradouro}, ${vData.bairro}, ${vData.localidade} - ${vData.uf}, Brazil`,
            // Attempt 2: Bairro + City
            `${vData.bairro}, ${vData.localidade} - ${vData.uf}, Brazil`,
            // Attempt 3: Street + City
            `${vData.logradouro}, ${vData.localidade} - ${vData.uf}, Brazil`,
            // Attempt 4: City only
            `${vData.localidade} - ${vData.uf}, Brazil`
        ];

        for (const [i, q] of queries.entries()) {
            console.log(`\n--- Attempt ${i+1}: "${q}" ---`);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`;
            const nRes = await fetch(url, { headers: { 'User-Agent': 'Fly2Any-Debug-Script' } });
            const nData = await nRes.json();
            console.log(`Results found: ${nData.length}`);
            if (nData.length > 0) {
                console.log("Top Result:", nData[0].display_name);
                console.log("Lat/Lon:", nData[0].lat, nData[0].lon);
            }
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

debug();
