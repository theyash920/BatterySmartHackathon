import { useState, useEffect, useMemo } from 'react';
import MapView from './components/MapView';
import KPIStats from './components/KPIStats';
import ControlPanel from './components/ControlPanel';
import ChartPanel from './components/ChartPanel';
import ScenarioPanel from './components/ScenarioPanel';
import VirtualStationPanel from './components/VirtualStationPanel';
import StationAnalyticsPanel from './components/StationAnalyticsPanel';
import ReplenishmentPanel from './components/ReplenishmentPanel';
import RecommendationPanel from './components/RecommendationPanel';
import PricingPage from './components/PricingPage';
import { runSimulation, getStations, getRealtimeStats, analyzePinnedLocation } from './services/api';
import {
    generateVirtualStationPosition,
    calculateVirtualStationImpact,
    generateVirtualStationInsight,
    calculateOwnershipModel
} from './utils/virtualStationSimulation';

export default function App() {
    const [data, setData] = useState(null);
    const [stations, setStations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [extraChargers, setExtraChargers] = useState(0);
    const [extraBatteries, setExtraBatteries] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Virtual Station State
    const [virtualStation, setVirtualStation] = useState(null);
    const [isVirtualStationActive, setIsVirtualStationActive] = useState(false);
    const [virtualStationImpact, setVirtualStationImpact] = useState(null);
    const [ownershipModel, setOwnershipModel] = useState(null);

    // Pin Location State
    const [isPinMode, setIsPinMode] = useState(false);
    const [pinnedLocation, setPinnedLocation] = useState(null);
    const [locationAnalysis, setLocationAnalysis] = useState(null);
    const [recommendedLocation, setRecommendedLocation] = useState(null);

    // Navigation State
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'analytics', 'replenishment', 'recommendations'
    const [showPricing, setShowPricing] = useState(false);

    // Realtime Stats from ChargingEvents
    const [realtimeStats, setRealtimeStats] = useState(null);

    // Load stations and realtime stats on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [stationsRes, realtimeRes] = await Promise.all([
                    getStations(),
                    getRealtimeStats()
                ]);
                setStations(stationsRes.data);
                setRealtimeStats(realtimeRes.data);
            } catch (err) {
                setError('Failed to load data: ' + err.message);
            }
        };
        loadData();
    }, []);

    // Get selected station data
    const selectedStationData = useMemo(() => {
        if (!selected) return null;

        // First try to find from timeline data (which may have simulation data)
        if (data?.baseline?.timeline) {
            const timelineStations = data.baseline.timeline.filter(t => t.hour === 12);
            const fromTimeline = timelineStations.find(s => s.station_id === selected);
            if (fromTimeline) return fromTimeline;
        }

        // Then try from stations with initial stock
        const stationWithStock = stations.find(s => s.station_id === selected);
        if (stationWithStock) {
            return {
                ...stationWithStock,
                available_batteries: stationWithStock.initial_stock
            };
        }

        return null;
    }, [selected, stations, data]);

    const handleSimulate = async (tweaksOverride = null) => {
        setLoading(true);
        setError(null);

        // Clear virtual station when running new simulation
        setIsVirtualStationActive(false);
        setVirtualStation(null);
        setVirtualStationImpact(null);

        try {
            // Use manual tweaks if no override provided
            let tweaks = tweaksOverride;
            if (!tweaks) {
                tweaks = selected ? [
                    {
                        station_id: selected,
                        extra_chargers: extraChargers,
                        extra_batteries: extraBatteries
                    }
                ] : [];
            }

            const res = await runSimulation(tweaks);
            setData(res.data);

            // If it was a scenario run with multiple tweaks, clear manual selection
            if (tweaksOverride && tweaksOverride.length > 0) {
                // Determine if we should focus on a specific station from the scenario
                // Just use the first one mentioned in the scenario for visualization
                if (tweaksOverride[0].station_id) {
                    setSelected(tweaksOverride[0].station_id);
                }
            }
        } catch (err) {
            setError('Simulation failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleScenarioSelect = (scenarioData) => {
        if (scenarioData.tweaks) {
            handleSimulate(scenarioData.tweaks);
        }
    };

    // Handle Add Virtual Station
    const handleAddVirtualStation = () => {
        if (!selectedStationData) return;

        // Generate virtual station position
        const newVirtualStation = generateVirtualStationPosition(selectedStationData);
        if (!newVirtualStation) return;

        setVirtualStation(newVirtualStation);
        setIsVirtualStationActive(true);

        // Calculate KPI impact - use station-level KPIs if a station is selected
        // This ensures consistent comparison in the display
        const stationKpis = selected
            ? getStationKpis(data?.scenario?.timeline, selected) || getStationKpis(data?.baseline?.timeline, selected)
            : null;
        const currentKpis = stationKpis || data?.scenario?.kpis || data?.baseline?.kpis;

        if (currentKpis) {
            const impact = calculateVirtualStationImpact(currentKpis, selectedStationData, newVirtualStation);
            setVirtualStationImpact(impact);
        }

        // Calculate POPO/COCO ownership model recommendation
        const ownership = calculateOwnershipModel(newVirtualStation, stations);
        setOwnershipModel(ownership);
    };

    // Handle Remove Virtual Station
    const handleRemoveVirtualStation = () => {
        setVirtualStation(null);
        setIsVirtualStationActive(false);
        setVirtualStationImpact(null);
        setOwnershipModel(null);
    };

    // Generate AI insight for virtual station
    const virtualStationInsight = useMemo(() => {
        if (!isVirtualStationActive || !virtualStationImpact || !virtualStation) {
            return null;
        }
        return generateVirtualStationInsight(virtualStationImpact, virtualStation, ownershipModel);
    }, [isVirtualStationActive, virtualStationImpact, virtualStation, ownershipModel]);

    // Toggle Pin Mode
    const handleTogglePinMode = () => {
        setIsPinMode(!isPinMode);
        if (isPinMode) {
            // Exiting pin mode - clear analysis
            setPinnedLocation(null);
            setLocationAnalysis(null);
            setRecommendedLocation(null);
        }
    };

    // Handle Map Click for Pin Location
    const handleMapClick = async (lat, lon) => {
        if (!isPinMode) return;

        setPinnedLocation({ lat, lon });
        setLocationAnalysis(null);
        setRecommendedLocation(null);

        try {
            const response = await analyzePinnedLocation(lat, lon);
            setLocationAnalysis(response.data);

            // Set recommended location if available
            if (response.data?.recommendation?.optimal_location) {
                setRecommendedLocation({
                    lat: response.data.recommendation.optimal_location.lat,
                    lon: response.data.recommendation.optimal_location.lon
                });
            }
        } catch (error) {
            console.error('Location analysis failed:', error);
            setLocationAnalysis({ status: 'error', message: error.message });
        }
    };

    // Clear Pin Analysis
    const handleClearPinAnalysis = () => {
        setPinnedLocation(null);
        setLocationAnalysis(null);
        setRecommendedLocation(null);
        setIsPinMode(false);
    };


    // Get map stations from data or initial stations list
    const getMapStations = () => {
        if (data?.baseline?.timeline) {
            // Filter to hour 12 for map display
            return data.baseline.timeline.filter(t => t.hour === 12);
        }
        // Before simulation, use stations with initial stock as available_batteries
        return stations.map(s => ({
            ...s,
            available_batteries: s.initial_stock
        }));
    };

    // Determine which recommendation to show
    const getRecommendationContent = () => {
        if (isVirtualStationActive && virtualStationInsight) {
            return {
                type: 'virtual',
                content: virtualStationInsight
            };
        }
        if (data?.recommendation) {
            return {
                type: 'simulation',
                content: data.recommendation
            };
        }
        return null;
    };

    const recommendation = getRecommendationContent();

    // Helper: Calculate aggregated KPIs for a single station from timeline
    const getStationKpis = (timeline, stationId) => {
        if (!timeline || !stationId) return null;
        const items = timeline.filter(t => t.station_id === stationId);
        if (items.length === 0) return null;

        // Count iterations (assuming data includes multiple iterations)
        const iterations = new Set(items.map(i => i.iteration)).size || 1;

        // Sum across all hours and iterations
        const totalSwapsSum = items.reduce((sum, curr) => sum + (curr.swaps_completed || 0), 0);
        const totalLostSum = items.reduce((sum, curr) => sum + (curr.lost_swaps || 0), 0);
        const totalAvailSum = items.reduce((sum, curr) => sum + (curr.available_batteries || 0), 0);

        // Calculate daily averages (divide by iterations)
        const dailySwaps = totalSwapsSum / iterations;
        const dailyLost = totalLostSum / iterations;

        // Availability is average per hour (divide by total hours recorded across all iterations)
        const avgAvailability = totalAvailSum / items.length;

        const successRate = dailySwaps > 0 ? (dailySwaps / (dailySwaps + dailyLost)) * 100 : (dailyLost === 0 ? 100 : 0);

        // Calculate avg wait time based on loss rate (same formula as backend)
        const totalAttempts = dailySwaps + dailyLost;
        const lossRate = totalAttempts > 0 ? dailyLost / totalAttempts : 0;
        const avgWaitTimeMins = 5 + (lossRate * 25); // 5-30 min range

        return {
            total_swaps: dailySwaps,
            total_lost_swaps: dailyLost,
            success_rate: successRate,
            avg_battery_availability: avgAvailability,
            avg_wait_time_mins: Math.round(avgWaitTimeMins * 10) / 10
        };
    };

    // Determine relevant stats to display (Global vs Station)
    const displayedKpis = useMemo(() => {
        if (!selected) {
            return {
                baseline: data?.baseline?.kpis,
                scenario: data?.scenario?.kpis,
                labelPrefix: 'Total'
            };
        }

        const stationBaseline = getStationKpis(data?.baseline?.timeline, selected);
        const stationScenario = getStationKpis(data?.scenario?.timeline, selected);

        // If no station data found (e.g. before simulation), fallback to global or empty
        if (!stationBaseline && !stationScenario) {
            return {
                baseline: data?.baseline?.kpis,
                scenario: data?.scenario?.kpis,
                labelPrefix: 'Total'
            };
        }

        return {
            baseline: stationBaseline || getStationKpis(data?.baseline?.timeline, selected), // Fallback if simple tweak
            scenario: stationScenario || stationBaseline, // Shows no change if scenario not ready
            labelPrefix: 'Station'
        };
    }, [selected, data]);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '🗺️' },
        { id: 'analytics', label: 'Analytics', icon: '🔍' },
        { id: 'replenishment', label: 'Stock Policy', icon: '📦' },
        { id: 'recommendations', label: 'Recommendations', icon: '💡' },
    ];

    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 mesh-gradient">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-10 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="relative z-10 max-w-[1800px] mx-auto">
                {/* Premium Header */}
                <header className="mb-8 animate-slide-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            {/* Animated Logo */}
                            <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/30 neon-glow">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-1">
                                    <span className="gradient-text text-glow">DIGITAL TWIN</span>
                                    <span className="text-white">: BSS OPS</span>
                                </h1>
                                <p className="text-cyan-200/80 text-sm md:text-base font-medium flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Operational Decision Support System (PS-5)
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            {/* Current Time */}
                            <div className="glass-card px-4 py-2 flex items-center gap-2 frosted-glass">
                                <span className="text-white/60 text-xs">🕐</span>
                                <span className="text-sm font-mono text-cyan-300">
                                    {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowPricing(true)}
                                className="glass-card px-4 py-2 text-sm font-semibold text-cyan-300 hover:text-white hover:bg-white/10 transition btn-ripple"
                            >
                                💎 Pricing
                            </button>
                            <div className="glass-card px-4 py-2 flex items-center gap-2 ping-dot frosted-glass">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-white">Live System</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs - Enhanced */}

                </header>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 p-5 glass-card border-red-400/50 bg-red-500/10 backdrop-blur-xl animate-slide-in">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h4 className="font-bold text-red-300 mb-1">System Error</h4>
                                <p className="text-red-200">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Recommendation / Virtual Station Insight (Dashboard only) */}
                {activeTab === 'dashboard' && recommendation && (
                    <div className={`mb-6 p-5 glass-card backdrop-blur-xl animate-slide-in ${recommendation.type === 'virtual'
                        ? 'border-yellow-400/50 bg-yellow-500/10'
                        : 'border-blue-400/50 bg-blue-500/10 pulse-glow'
                        }`}>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{recommendation.type === 'virtual' ? '🏗️' : '💡'}</span>
                            <div className="flex-1">
                                <h4 className={`font-bold mb-2 ${recommendation.type === 'virtual' ? 'text-yellow-300' : 'text-blue-300'
                                    }`}>
                                    {recommendation.type === 'virtual' ? 'Virtual Station Analysis' : 'AI Recommendation'}
                                </h4>
                                <div className={`font-medium whitespace-pre-line ${recommendation.type === 'virtual' ? 'text-yellow-100' : 'text-blue-100'
                                    }`}>
                                    {recommendation.content}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <KPIStats
                                baseline={displayedKpis.baseline}
                                scenario={displayedKpis.scenario}
                                virtualStationImpact={virtualStationImpact}
                                isVirtualStationActive={isVirtualStationActive}
                                labelPrefix={displayedKpis.labelPrefix}
                                realtimeStats={realtimeStats}
                            />
                            <MapView
                                stations={getMapStations()}
                                selectedId={selected}
                                onSelect={setSelected}
                                virtualStation={virtualStation}
                                isVirtualStationActive={isVirtualStationActive}
                                isPinMode={isPinMode}
                                pinnedLocation={pinnedLocation}
                                recommendedLocation={recommendedLocation}
                                onMapClick={handleMapClick}
                            />
                            <div className="animate-slide-in">
                                <ChartPanel
                                    baselineData={data?.baseline?.timeline || []}
                                    scenarioData={data?.scenario?.timeline || []}
                                    selectedStation={selected}
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            {/* Virtual Station Panel - Above Decision Controls */}
                            <VirtualStationPanel
                                selectedStation={selectedStationData || selected}
                                isVirtualStationActive={isVirtualStationActive}
                                onAddVirtualStation={handleAddVirtualStation}
                                onRemoveVirtualStation={handleRemoveVirtualStation}
                                loading={loading}
                                ownershipModel={ownershipModel}
                                isPinMode={isPinMode}
                                onTogglePinMode={handleTogglePinMode}
                                locationAnalysis={locationAnalysis}
                                onClearPinAnalysis={handleClearPinAnalysis}
                            />
                            <ControlPanel
                                selectedStation={selected}
                                onRun={() => handleSimulate(null)}
                                extraChargers={extraChargers}
                                setExtraChargers={setExtraChargers}
                                extraBatteries={extraBatteries}
                                setExtraBatteries={setExtraBatteries}
                                loading={loading}
                            />
                            {/* <ScenarioPanel
                                onSelectScenario={handleScenarioSelect}
                                loading={loading}
                            /> */}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <KPIStats
                                baseline={displayedKpis.baseline}
                                scenario={displayedKpis.scenario}
                                virtualStationImpact={virtualStationImpact}
                                isVirtualStationActive={isVirtualStationActive}
                                labelPrefix={displayedKpis.labelPrefix}
                                realtimeStats={realtimeStats}
                            />
                            <MapView
                                stations={getMapStations()}
                                selectedId={selected}
                                onSelect={setSelected}
                                virtualStation={virtualStation}
                                isVirtualStationActive={isVirtualStationActive}
                            />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <StationAnalyticsPanel
                                selectedStation={selected}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'replenishment' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <KPIStats
                                baseline={data?.baseline?.kpis}
                                scenario={data?.scenario?.kpis}
                                virtualStationImpact={virtualStationImpact}
                                isVirtualStationActive={isVirtualStationActive}
                            />
                            <MapView
                                stations={getMapStations()}
                                selectedId={selected}
                                onSelect={setSelected}
                                virtualStation={virtualStation}
                                isVirtualStationActive={isVirtualStationActive}
                            />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <ReplenishmentPanel
                                selectedStation={selected}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'recommendations' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <KPIStats
                                baseline={data?.baseline?.kpis}
                                scenario={data?.scenario?.kpis}
                                virtualStationImpact={virtualStationImpact}
                                isVirtualStationActive={isVirtualStationActive}
                            />
                            <MapView
                                stations={getMapStations()}
                                selectedId={selected}
                                onSelect={setSelected}
                                virtualStation={virtualStation}
                                isVirtualStationActive={isVirtualStationActive}
                            />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <RecommendationPanel
                                selectedStation={selected}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Pricing Modal */}
            {showPricing && (
                <PricingPage onClose={() => setShowPricing(false)} />
            )}
        </div>
    );
}