import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const ChartPanel = ({ baselineData, scenarioData, selectedStation }) => {
    // Process data for charts - aggregate by hour
    const processDataByHour = (data) => {
        const hourlyMap = {};
        data.forEach(item => {
            const hour = item.hour;
            if (!hourlyMap[hour]) {
                hourlyMap[hour] = {
                    hour,
                    swaps_completed: 0,
                    lost_swaps: 0,
                    available_batteries: 0,
                    count: 0
                };
            }
            // If station selected, only include that station
            if (!selectedStation || item.station_id === selectedStation) {
                hourlyMap[hour].swaps_completed += item.swaps_completed;
                hourlyMap[hour].lost_swaps += item.lost_swaps;
                hourlyMap[hour].available_batteries += item.available_batteries;
                hourlyMap[hour].count += 1;
            }
        });

        return Object.values(hourlyMap)
            .map(h => ({
                hour: `${h.hour}:00`,
                swaps_completed: h.count ? Math.round(h.swaps_completed) : 0,
                lost_swaps: h.count ? Math.round(h.lost_swaps) : 0,
                available_batteries: h.count ? Math.round(h.available_batteries / h.count) : 0
            }))
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    };

    const baselineProcessed = processDataByHour(baselineData);
    const scenarioProcessed = processDataByHour(scenarioData);

    // Combine baseline and scenario for comparison chart
    const comparisonData = baselineProcessed.map((b, i) => ({
        hour: b.hour,
        baseline_swaps: b.swaps_completed,
        scenario_swaps: scenarioProcessed[i]?.swaps_completed || 0,
        baseline_lost: b.lost_swaps,
        scenario_lost: scenarioProcessed[i]?.lost_swaps || 0,
        baseline_batteries: b.available_batteries,
        scenario_batteries: scenarioProcessed[i]?.available_batteries || 0
    }));

    // Calculate summary stats
    const totalBaselineSwaps = baselineProcessed.reduce((sum, h) => sum + h.swaps_completed, 0);
    const totalScenarioSwaps = scenarioProcessed.reduce((sum, h) => sum + h.swaps_completed, 0);
    const swapsImprovement = totalScenarioSwaps - totalBaselineSwaps;

    if (!baselineData.length) {
        return (
            <div className="glass-card p-6 animate-slide-in hover-lift">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <span className="text-xl">📈</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Simulation Charts</h2>
                        <p className="text-xs text-gray-400">Visualize performance metrics</p>
                    </div>
                </div>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <span className="text-6xl mb-4 block opacity-30">📊</span>
                        <p className="text-gray-400">Run a simulation to see hourly demand and inventory charts</p>
                        <p className="text-xs text-gray-500 mt-2">Charts will appear here after running a scenario</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 space-y-6 animate-slide-in">
            {/* Header with stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <span className="text-xl">📈</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Swap Performance {selectedStation ? `(${selectedStation.slice(0, 20)}...)` : '(All Stations)'}
                        </h2>
                        <p className="text-xs text-gray-400">Hourly comparison view</p>
                    </div>
                </div>
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1
                        ${swapsImprovement >= 0
                            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                        <span>{swapsImprovement >= 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(swapsImprovement)} swaps</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                    <span>Baseline (solid)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-50 border border-dashed"></div>
                    <span>Scenario (dashed)</span>
                </div>
            </div>

            {/* Swaps Chart */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={comparisonData}>
                        <defs>
                            <linearGradient id="swapGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                            <linearGradient id="lostGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            stroke="rgba(255,255,255,0.1)"
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            stroke="rgba(255,255,255,0.1)"
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '8px' }}
                        />
                        <Legend
                            wrapperStyle={{ color: '#fff', paddingTop: '20px' }}
                            iconType="line"
                        />
                        <Line
                            type="monotone"
                            dataKey="baseline_swaps"
                            stroke="url(#swapGradient)"
                            strokeWidth={3}
                            name="Baseline Swaps"
                            dot={false}
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="scenario_swaps"
                            stroke="#10b981"
                            strokeWidth={3}
                            strokeDasharray="8 4"
                            name="Scenario Swaps"
                            dot={false}
                            activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="baseline_lost"
                            stroke="url(#lostGradient)"
                            strokeWidth={2}
                            name="Baseline Lost"
                            dot={false}
                            activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="scenario_lost"
                            stroke="#f87171"
                            strokeWidth={2}
                            strokeDasharray="8 4"
                            name="Scenario Lost"
                            dot={false}
                            activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Battery Availability Chart */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-lg">🔋</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">Battery Availability</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={comparisonData}>
                        <defs>
                            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            stroke="rgba(255,255,255,0.1)"
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            stroke="rgba(255,255,255,0.1)"
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ color: '#fff', paddingTop: '16px' }} />
                        <Area
                            type="monotone"
                            dataKey="baseline_batteries"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#colorBaseline)"
                            name="Baseline Batteries"
                        />
                        <Area
                            type="monotone"
                            dataKey="scenario_batteries"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill="url(#colorScenario)"
                            name="Scenario Batteries"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartPanel;
