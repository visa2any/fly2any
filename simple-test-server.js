const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html');
  
  if (req.url === '/' || req.url === '/flights') {
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fly2Any - Flight Search</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            .flight-card {
                transition: all 0.3s ease;
                border: 1px solid #e5e7eb;
            }
            .flight-card:hover {
                transform: translateY(-4px);
                border-color: #3b82f6;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            .live-indicator {
                background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            .countdown-timer {
                background: #fef3c7;
                color: #92400e;
            }
            .deal-badge {
                background: linear-gradient(45deg, #10b981, #34d399);
                color: white;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold text-center mb-8 text-gray-900">Fly2Any - Find Your Perfect Flight</h1>
            
            <!-- Flight Search Form -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-12">
                <h2 class="text-2xl font-semibold mb-6">Search Flights</h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="From" class="border rounded-lg p-3 min-h-[72px] flex items-center">
                    <input type="text" placeholder="To" class="border rounded-lg p-3 min-h-[72px] flex items-center">
                    <input type="date" class="border rounded-lg p-3 min-h-[72px]">
                    <button class="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 transition">Search</button>
                </div>
            </div>

            <!-- Popular Flight Deals Section -->
            <section class="mb-12" data-testid="popular-deals">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-3xl font-bold text-gray-900">Popular Flight Deals</h2>
                    <div class="live-indicator px-3 py-1 rounded-full text-white text-sm font-semibold">
                        <i class="fas fa-circle mr-2"></i>LIVE DATA
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Flight Card 1 -->
                    <div class="flight-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" data-testid="flight-card">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-plane text-blue-600 text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-lg">São Paulo → Paris</h3>
                                    <p class="text-gray-500 text-sm">TAM Airlines</p>
                                </div>
                            </div>
                            <div class="deal-badge px-2 py-1 rounded text-xs font-bold">
                                40% OFF
                            </div>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Departure</span>
                                <span class="font-medium">Dec 15, 14:30</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Duration</span>
                                <span class="font-medium">11h 45m</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Price</span>
                                <span class="font-bold text-green-600 text-xl">$899</span>
                            </div>
                        </div>
                        
                        <div class="countdown-timer p-2 rounded text-center mb-4">
                            <i class="fas fa-clock mr-1"></i>
                            <span class="font-semibold">Offer expires in 2h 45m</span>
                        </div>
                        
                        <button class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium">
                            View Deal
                        </button>
                    </div>

                    <!-- Flight Card 2 -->
                    <div class="flight-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" data-testid="flight-card">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-globe-americas text-green-600 text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-lg">Rio → New York</h3>
                                    <p class="text-gray-500 text-sm">American Airlines</p>
                                </div>
                            </div>
                            <div class="deal-badge px-2 py-1 rounded text-xs font-bold">
                                35% OFF
                            </div>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Departure</span>
                                <span class="font-medium">Dec 18, 09:15</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Duration</span>
                                <span class="font-medium">9h 30m</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Price</span>
                                <span class="font-bold text-green-600 text-xl">$1,299</span>
                            </div>
                        </div>
                        
                        <div class="countdown-timer p-2 rounded text-center mb-4">
                            <i class="fas fa-clock mr-1"></i>
                            <span class="font-semibold">Offer expires in 5h 12m</span>
                        </div>
                        
                        <button class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium">
                            View Deal
                        </button>
                    </div>

                    <!-- Flight Card 3 -->
                    <div class="flight-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" data-testid="flight-card">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-mountain text-purple-600 text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-lg">São Paulo → Tokyo</h3>
                                    <p class="text-gray-500 text-sm">Japan Airlines</p>
                                </div>
                            </div>
                            <div class="deal-badge px-2 py-1 rounded text-xs font-bold">
                                50% OFF
                            </div>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Departure</span>
                                <span class="font-medium">Dec 20, 23:45</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Duration</span>
                                <span class="font-medium">24h 15m</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Price</span>
                                <span class="font-bold text-green-600 text-xl">$1,599</span>
                            </div>
                        </div>
                        
                        <div class="countdown-timer p-2 rounded text-center mb-4">
                            <i class="fas fa-clock mr-1"></i>
                            <span class="font-semibold">Offer expires in 1h 23m</span>
                        </div>
                        
                        <button class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium">
                            View Deal
                        </button>
                    </div>
                </div>
            </section>
        </div>
        
        <script>
            // Simulate countdown timers
            function updateCountdowns() {
                const timers = document.querySelectorAll('.countdown-timer span');
                timers.forEach(timer => {
                    // Simple countdown simulation
                    if (timer.textContent.includes('expires in')) {
                        // Keep the text as is for testing
                    }
                });
            }
            
            setInterval(updateCountdowns, 1000);
        </script>
    </body>
    </html>
  `);
  } else {
    res.statusCode = 404;
    res.end('Page not found');
  }
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Navigate to /flights to test the Popular Flight Deals');
});