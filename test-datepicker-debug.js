// DatePicker Debug Test
// Run this in browser console to debug DatePicker issues

console.log('🔍 DatePicker Debug Test Starting...');

// Check if React and ReactDOM are available
console.log('✅ React available:', typeof React !== 'undefined');
console.log('✅ ReactDOM available:', typeof ReactDOM !== 'undefined');

// Check if createPortal is available
console.log('✅ createPortal available:', typeof ReactDOM?.createPortal !== 'undefined');

// Check if document.body exists
console.log('✅ document.body exists:', !!document.body);

// Check for any existing DatePicker elements
const existingDatePickers = document.querySelectorAll('[class*="DatePicker"], [class*="calendar"], [class*="dropdown"]');
console.log('📅 Existing DatePicker elements found:', existingDatePickers.length);
existingDatePickers.forEach((el, index) => {
  console.log(`  ${index + 1}:`, el.className, el.style.display);
});

// Check for any portals in document.body
const portals = document.body.children;
console.log('🌀 Direct children of document.body:', portals.length);
for (let i = 0; i < portals.length; i++) {
  const portal = portals[i];
  if (portal.className && (portal.className.includes('fixed') || portal.className.includes('calendar'))) {
    console.log(`  Portal ${i}:`, portal.className, 'visible:', portal.style.display !== 'none');
  }
}

// Check for any click handlers on DatePicker buttons
const datePickerButtons = document.querySelectorAll('div[class*="cursor-pointer"], button[class*="calendar"]');
console.log('🖱️ DatePicker clickable elements:', datePickerButtons.length);

// Check z-index issues
const highZIndexElements = document.querySelectorAll('[style*="z-index"], [class*="z-"]');
console.log('📚 High z-index elements:', highZIndexElements.length);
highZIndexElements.forEach((el, index) => {
  const zIndex = window.getComputedStyle(el).zIndex;
  if (parseInt(zIndex) > 9000) {
    console.log(`  High z-index ${index}:`, zIndex, el.className);
  }
});

// Test createPortal functionality
try {
  const testDiv = document.createElement('div');
  testDiv.innerHTML = '<div style="position: fixed; top: 50px; left: 50px; background: red; color: white; padding: 10px; z-index: 99999;">TEST PORTAL - Should be visible for 3 seconds</div>';
  document.body.appendChild(testDiv);
  
  console.log('✅ Portal test element added successfully');
  
  setTimeout(() => {
    document.body.removeChild(testDiv);
    console.log('✅ Portal test element removed');
  }, 3000);
} catch (error) {
  console.error('❌ Portal test failed:', error);
}

// Check CSS issues
const styles = window.getComputedStyle(document.body);
console.log('🎨 body overflow:', styles.overflow);
console.log('🎨 body position:', styles.position);

console.log('🔍 DatePicker Debug Test Complete!');