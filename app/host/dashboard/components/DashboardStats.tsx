  import { prisma } from '@/lib/prisma';
  import { Home, BarChart3, Eye, DollarSign, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
  
  export async function DashboardStats({ userId }: { userId: string }) {
      try {
          const propertiesCount = await prisma.property.count({
              where: { hostId: userId }
          });
          
          // Mock Data for "Smart Host" Features (until enough real data exists)
          const activeBookings = 0; // Replace with real count
          const totalRevenue = 0;   // Replace with real sum
          const views = 1240;       // Mock
          const occupancyRate = 12; // %
          const marketAvgOccupancy = 45; // %
          
          const stats = [
              { label: 'Total Listings', value: propertiesCount, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
              { label: 'Active Bookings', value: activeBookings, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-emerald-600' },
              { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500 to-amber-600' },
              { label: 'Views (30d)', value: views.toLocaleString(), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
          ];

          // Smart Opportunities Logic
          const opportunities = [];
          if (occupancyRate < marketAvgOccupancy) {
              opportunities.push({
                  id: 'price-drop',
                  title: 'Increase Occupancy',
                  description: 'Your occupancy is 33% lower than the market average. Consider lowering your weekday price by 10%.',
                  action: 'Adjust Price',
                  icon: TrendingUp,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50'
              });
          }
          if (propertiesCount > 0 && propertiesCount < 3) {
             opportunities.push({
                 id: 'add-property',
                 title: 'Expand Portfolio',
                 description: 'Hosts with 3+ properties earn 2.5x more revenue on average.',
                 action: 'List Property',
                 icon: Sparkles,
                 color: 'text-indigo-600',
                 bg: 'bg-indigo-50'
             });
          }
      
          return (
              <div className="space-y-8 mb-12">
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     {stats.map((stat, i) => (
                        <div key={i} className="relative overflow-hidden p-6 rounded-3xl bg-white border border-neutral-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                           <div className={`absolute top-0 right-0 p-20 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -mr-10 -mt-10 blur-2xl`}></div>
                           <div className="flex items-center justify-between mb-4 relative z-10">
                              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                 <stat.icon className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">LAST 30 DAYS</span>
                           </div>
                           <div className="relative z-10">
                                <div className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</div>
                                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Smart Host Insights Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Opportunities */}
                      <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-32 bg-primary-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
                          <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                      <Sparkles className="w-5 h-5 text-yellow-400" />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-lg">Smart Opportunities</h3>
                                      <p className="text-white/50 text-sm">AI-driven insights to boost your performance</p>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  {opportunities.map(opp => (
                                      <div key={opp.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
                                          <div className={`p-3 rounded-xl ${opp.bg} ${opp.color} h-fit`}>
                                              <opp.icon className="w-5 h-5" />
                                          </div>
                                          <div className="flex-1">
                                              <div className="flex justify-between items-start mb-1">
                                                  <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors">{opp.title}</h4>
                                                  <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-lg text-white/80">{opp.action}</span>
                                              </div>
                                              <p className="text-sm text-white/60 leading-relaxed">{opp.description}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Competitor Radar (Simplified) */}
                      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm flex flex-col">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="font-bold text-gray-900">Competitor Radar</h3>
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg">+12% vs Avg</span>
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-center gap-6">
                                {/* Price Comparison */}
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-2">
                                        <span className="text-gray-500">Your Avg. Price</span>
                                        <span className="text-gray-900 font-bold">$145</span>
                                    </div>
                                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-600 w-[65%] rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-2">
                                        <span className="text-gray-500">Market Avg.</span>
                                        <span className="text-gray-900 font-bold">$122</span>
                                    </div>
                                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-neutral-300 w-[50%] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="p-4 bg-neutral-50 rounded-2xl mt-4">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        <span className="font-bold text-gray-900">Insight:</span> You are priced slightly above the market average for this season. Ensure your amenities justify the premium.
                                    </p>
                                </div>
                          </div>
                      </div>
                  </div>
              </div>
          );
      } catch (e) {
          console.error("DashboardStats Error:", e);
          return (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-8">
                  Failed to load stats.
              </div>
          );
      }
  }
