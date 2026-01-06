document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fromInput = document.getElementById('fromInput');
    const toInput = document.getElementById('toInput');
    const departDate = document.getElementById('departDate');
    const returnDate = document.getElementById('returnDate');
    const primaryBtn = document.getElementById('primaryBtn');
    const secondaryBtn = document.getElementById('secondaryBtn');

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
        params.append('utm_campaign', 'fly2any_extension');
        
        const queryString = params.toString();
        return queryString ? `${baseURL}?${queryString}` : baseURL;
    }

    // Open URL in new tab - cross-browser compatible
    function openInNewTab(url) {
        if (typeof browser !== 'undefined' && browser.tabs) {
            browser.tabs.create({ url: url, active: true });
        } else if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: url, active: true });
        }
    }

    // Primary CTA: Find Flights with Fly2Any
    primaryBtn.addEventListener('click', function() {
        const url = buildFly2AnyURL();
        openInNewTab(url);
    });

    // Secondary CTA: Explore deals & routes
    secondaryBtn.addEventListener('click', function() {
        const url = 'https://fly2any.com?utm_source=browser_extension&utm_medium=organic&utm_campaign=fly2any_extension';
        openInNewTab(url);
    });

    // Show smart engagement message based on form state
    function updateTrustMessage() {
        const trustMessage = document.getElementById('trustMessage');
        if (!fromInput.value.trim() && !toInput.value.trim()) {
            trustMessage.textContent = 'Trusted by travelers worldwide to explore global flight routes.';
        } else if (fromInput.value.trim() && !toInput.value.trim()) {
            trustMessage.textContent = 'Enter a destination to find the best flight options.';
        } else if (!fromInput.value.trim() && toInput.value.trim()) {
            trustMessage.textContent = 'Enter your origin to discover flight routes.';
        } else {
            trustMessage.textContent = 'Ready to explore flight options with Fly2Any.';
        }
    }

    // Update trust message on input changes
    fromInput.addEventListener('input', updateTrustMessage);
    toInput.addEventListener('input', updateTrustMessage);
    departDate.addEventListener('change', updateTrustMessage);
    if (returnDate) {
        returnDate.addEventListener('change', updateTrustMessage);
    }

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
