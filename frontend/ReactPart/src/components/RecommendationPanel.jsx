import { useState, useEffect } from 'react';
import { getStationRecommendations, getCityRecommendations } from '../services/api';

export default function RecommendationPanel({ selectedStation }) {
    const [stationRecs, setStationRecs] = useState(null);
    const [cityRecs, setCityRecs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('station'); // 'station' or 'city'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (viewMode === 'city') {
                    const res = await getCityRecommendations();
                    setCityRecs(res.data);
                } else if (selectedStation) {
                    const res = await getStationRecommendations(selectedStation);
                    setStationRecs(res.data);
                }
            } catch (err) {
                setError('Failed to load recommendations: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedStation, viewMode]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-500/20 border-red-400/30';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
            case 'low': return 'text-green-400 bg-green-500/20 border-green-400/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'add_chargers': return '🔌';
            case 'increase_battery_stock': return '🔋';
            case 'reduce_queue': return '⏱️';
            case 'optimize_peak_operations': return '📈';
            case 'maintain_current': return '✅';
            case 'optimize_resources': return '♻️';
            case 'add_station': return '🏗️';
            case 'consider_merge': return '🔄';
            case 'add_chargers_network_wide': return '⚡';
            default: return '💡';
        }
    };

    const renderStationRecommendations = () => {
        if (!stationRecs) {
            return (
                <div className="text-center py-8 opacity-50">
                    <span className="text-4xl mb-3 block">💡</span>
                    <p className="text-gray-400 text-sm">
                        Select a station to view smart recommendations
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Health Summary */}
                <div className={`rounded-xl p-4 border animate-slide-in ${stationRecs.health_status === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
                    stationRecs.health_status === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        stationRecs.health_status === 'concerning' ? 'bg-orange-500/10 border-orange-500/30' :
                            'bg-red-500/10 border-red-500/30'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Health Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${stationRecs.health_status === 'healthy' ? 'bg-green-400' :
                                    stationRecs.health_status === 'moderate' ? 'bg-yellow-400' :
                                        stationRecs.health_status === 'concerning' ? 'bg-orange-400' :
                                            'bg-red-400'
                                    } animate-pulse`}></div>
                                <p className={`font-bold text-lg capitalize ${stationRecs.health_status === 'healthy' ? 'text-green-400' :
                                    stationRecs.health_status === 'moderate' ? 'text-yellow-400' :
                                        stationRecs.health_status === 'concerning' ? 'text-orange-400' :
                                            'text-red-400'
                                    }`}>
                                    {stationRecs.health_status}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Health Score</p>
                            <p className="text-white font-black text-3xl animate-count">{stationRecs.health_score}</p>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl mt-1">💡</span>
                        <p className="text-cyan-100 text-sm leading-relaxed">
                            {stationRecs.summary}
                        </p>
                    </div>
                </div>

                {/* Recommendations List */}
                <div className="space-y-3">
                    <h4 className="text-cyan-300 font-bold text-sm uppercase tracking-wider ml-1">Action items</h4>
                    {stationRecs.recommendations?.map((rec, idx) => (
                        <div
                            key={idx}
                            className={`rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] animate-card-enter ${getPriorityColor(rec.priority)}`}
                            style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-2xl">{getActionIcon(rec.action)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h5 className="text-white font-bold text-sm tracking-wide">{rec.title}</h5>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${rec.priority === 'high' ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
                                                rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
                                                    'bg-green-500/20 text-green-200 border border-green-500/30'
                                            }`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-white/80 text-xs mb-3 leading-relaxed">{rec.description}</p>

                                    {/* Parameters Grid */}
                                    {rec.parameters && (
                                        <div className="bg-black/20 rounded-lg p-2.5 mb-3 border border-white/5">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                {Object.entries(rec.parameters).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center">
                                                        <span className="text-white/50">{key.replace(/_/g, ' ')}:</span>
                                                        <span className="text-white font-medium">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer: Impact & Cost */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10">
                                        {/* Expected Impact Tags */}
                                        {rec.expected_impact && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {Object.entries(rec.expected_impact).map(([key, value]) => (
                                                    <span
                                                        key={key}
                                                        className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1"
                                                    >
                                                        <span>↗</span> {key.replace(/_/g, ' ')}: <span className="font-bold">{value}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Cost Info */}
                                        {rec.cost_indication && typeof rec.cost_indication === 'object' && (
                                            <div className="flex items-center gap-3 text-[10px] ml-auto">
                                                <div className="text-right">
                                                    <span className="text-white/40 block">Investment</span>
                                                    <span className="text-cyan-300 font-bold">
                                                        {rec.cost_indication.total_cost_formatted}
                                                    </span>
                                                </div>
                                                <div className="h-6 w-px bg-white/10"></div>
                                                <div className="text-right">
                                                    <span className="text-white/40 block">Payback</span>
                                                    <span className={`font-bold ${rec.cost_indication.roi_rating === 'good' ? 'text-emerald-400' :
                                                        rec.cost_indication.roi_rating === 'moderate' ? 'text-amber-400' :
                                                            'text-orange-400'
                                                        }`}>
                                                        ~{rec.cost_indication.estimated_payback_days} days
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCityRecommendations = () => {
        if (!cityRecs) return null;

        return (
            <div className="space-y-4">
                {/* Network Summary */}
                <div className="grid grid-cols-2 gap-3 animate-slide-in">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Network Score</p>
                        <p className="text-cyan-400 font-black text-3xl animate-count">
                            {cityRecs.network_health_score?.toFixed(0) || 0}
                        </p>
                    </div>
                    <div className={`rounded-xl p-4 border transition-all duration-300 ${cityRecs.critical_stations > 0
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-green-500/10 border-green-500/30'
                        }`}>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Critical Stations</p>
                        <p className={`font-black text-3xl ${cityRecs.critical_stations > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'
                            }`}>
                            {cityRecs.critical_stations || 0}
                        </p>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl mt-1">🏙️</span>
                        <p className="text-cyan-100 text-sm leading-relaxed">
                            {cityRecs.summary}
                        </p>
                    </div>
                </div>

                {/* Zone Analysis */}
                {cityRecs.zone_analysis && (
                    <div className="glass-card p-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">📍</span>
                            <h4 className="font-bold text-white text-sm">Zone Analysis</h4>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {cityRecs.zone_analysis.map((zone, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-lg p-3 transition-all duration-300 hover:scale-[1.01] ${zone.needs_new_station
                                        ? zone.urgency === 'high'
                                            ? 'bg-red-500/10 border border-red-500/30'
                                            : 'bg-yellow-500/10 border border-yellow-500/30'
                                        : 'bg-white/5 border border-white/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-bold text-sm tracking-wide">{zone.zone_name}</span>
                                        {zone.needs_new_station && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${zone.urgency === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                                }`}>
                                                {zone.urgency} Priority
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                                        <div className="flex items-center justify-between bg-black/20 rounded px-2 py-1">
                                            <span>EV Density</span>
                                            <span className="text-white font-mono">{zone.ev_density}/km²</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-black/20 rounded px-2 py-1">
                                            <span>Station Gap</span>
                                            <span className="text-white font-mono">{zone.avg_station_distance}km</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* City Recommendations */}
                <div className="space-y-3">
                    <h4 className="text-cyan-300 font-bold text-sm uppercase tracking-wider ml-1">Network Recommendations</h4>
                    {cityRecs.recommendations?.map((rec, idx) => (
                        <div
                            key={idx}
                            className={`rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] animate-card-enter ${getPriorityColor(rec.priority)}`}
                            style={{ animationDelay: `${0.3 + (idx * 0.1)}s` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-2xl">{getActionIcon(rec.action)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="text-white font-bold text-sm">{rec.title}</h5>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${rec.priority === 'high' ? 'bg-red-500/20 text-red-200' :
                                                rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-200' :
                                                    'bg-green-500/20 text-green-200'
                                            }`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-white/80 text-xs mb-2">{rec.description}</p>

                                    {/* Zone info if applicable */}
                                    {rec.zone && (
                                        <span className="inline-block mb-2 text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
                                            📍 {rec.zone}
                                        </span>
                                    )}

                                    {/* Expected Impact */}
                                    {rec.expected_impact && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Object.entries(rec.expected_impact).map(([key, value]) => (
                                                <span
                                                    key={key}
                                                    className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1"
                                                >
                                                    <span>↗</span> {key.replace(/_/g, ' ')}: <span className="font-bold">{value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Cost Comparison/Info */}
                                    <div className="mt-2 pt-2 border-t border-white/10 text-xs flex justify-end">
                                        {rec.comparison ? (
                                            <div className="flex gap-4">
                                                <div>
                                                    <span className="text-white/40 mr-1">New Station:</span>
                                                    <span className="text-white font-mono">₹{(rec.comparison.new_station_cost / 100000).toFixed(1)}L</span>
                                                </div>
                                                <div>
                                                    <span className="text-white/40 mr-1">Upgrade:</span>
                                                    <span className="text-emerald-400 font-mono font-bold">₹{(rec.comparison.charger_upgrade_cost / 100000).toFixed(1)}L</span>
                                                </div>
                                            </div>
                                        ) : rec.cost_indication && typeof rec.cost_indication === 'number' ? (
                                            <div>
                                                <span className="text-white/40 mr-1">Est. Investment:</span>
                                                <span className="text-cyan-300 font-bold font-mono">
                                                    ₹{(rec.cost_indication / 100000).toFixed(1)}L
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="glass-card p-6 animate-slide-in hover-lift h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span className="text-xl">💡</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Recommendations</h3>
                    <p className="text-xs text-gray-400">AI-driven actionable insights</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                <button
                    onClick={() => setViewMode('station')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 ${viewMode === 'station'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Station View
                </button>
                <button
                    onClick={() => setViewMode('city')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 ${viewMode === 'city'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Network View
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-400 text-sm animate-pulse">Generating insights...</p>
                </div>
            ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                    <span className="text-2xl mb-2 block">⚠️</span>
                    <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
            ) : viewMode === 'station' ? (
                renderStationRecommendations()
            ) : (
                renderCityRecommendations()
            )}
        </div>
    );
}
