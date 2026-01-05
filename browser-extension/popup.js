document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fromInput = document.getElementById('fromInput');
    const toInput = document.getElementById('toInput');
    const departDate = document.getElementById('departDate');
    const returnDate = document.getElementById('returnDate');
    const primaryBtn = document.getElementById('primaryBtn');

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    departDate.valueAsDate = today;
    departDate.min = formatDate(today);
    
    if (returnDate) {
        returnDate.valueAsDate = tomorrow;
        returnDate.min = formatDate(tomorrow);
    }
    
    // Format date to YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Build Fly2Any URL with parameters
    function buildFly2AnyURL() {
        const baseURL = 'https://fly2any.com/search';
        const params = new URLSearchParams();
        
        // Add search parameters if provided
        if (fromInput.value.trim()) {
            params.append('from', fromInput.value.trim());
        }
        if (toInput.value.trim()) {
            params.append('to', toInput.value.trim());
        }
        if (departDate.value) {
            params.append('depart', departDate.value);
        }
        if (returnDate && returnDate.value) {
            params.append('return', returnDate.value);
        }
        
        // Add UTM parameters for extension tracking
        params.append('utm_source', 'browser_extension');
        params.append('utm_medium', 'organic');
        params.append('utm_campaign', 'fly2any_premium_extension');
        
        const queryString = params.toString();
        return queryString ? `${baseURL}?${queryString}` : baseURL;
    }

    // Open URL in new tab
    function openInNewTab(url) {
        chrome.tabs.create({ url: url, active: true });
    }

    // Primary CTA: Search with Fly2Any
    primaryBtn.addEventListener('click', function() {
        const url = buildFly2AnyURL();
        openInNewTab(url);
    });

    // Auto-focus the "From" input for better UX
    fromInput.focus();

    // Add input validation for dates
    if (returnDate) {
        departDate.addEventListener('change', function() {
            if (returnDate.value && returnDate.value < departDate.value) {
                returnDate.value = '';
            }
            // Update min date for return
            returnDate.min = departDate.value;
        });
    }
});
