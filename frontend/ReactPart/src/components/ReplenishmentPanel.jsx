import { useState, useEffect } from 'react';
import { getStationReplenishment, getNetworkReplenishment } from '../services/api';

export default function ReplenishmentPanel({ selectedStation }) {
    const [stationData, setStationData] = useState(null);
    const [networkData, setNetworkData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('station'); // 'station' or 'network'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (viewMode === 'network') {
                    const res = await getNetworkReplenishment();
                    setNetworkData(res.data);
                } else if (selectedStation) {
                    const res = await getStationReplenishment(selectedStation);
                    setStationData(res.data);
                }
            } catch (err) {
                setError('Failed to load data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedStation, viewMode]);

    const renderStationView = () => {
        if (!stationData) {
            return (
                <div className="text-center py-8 opacity-50">
                    <span className="text-4xl mb-3 block">🏪</span>
                    <p className="text-gray-400 text-sm">
                        Select a station to view replenishment schedule
                    </p>
                </div>
            );
        }

        const { schedule, stock_policy, alerts } = stationData;

        return (
            <div className="space-y-4">
                {/* Alerts */}
                {alerts && alerts.length > 0 && (
                    <div className="space-y-2 animate-slide-in">
                        {alerts.map((alert, idx) => (
                            <div
                                key={idx}
                                className={`rounded-xl p-3 text-sm border flex items-start gap-3 ${alert.type === 'critical'
                                    ? 'bg-red-500/10 border-red-500/30 text-red-200 shadow-lg shadow-red-500/10'
                                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200 shadow-lg shadow-yellow-500/10'
                                    }`}
                            >
                                <span className="text-lg">{alert.type === 'critical' ? '🚨' : '⚠️'}</span>
                                <div>
                                    <p className="font-bold">{alert.message}</p>
                                    <p className="text-xs mt-1 opacity-80">{alert.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Current Stock Status */}
                <div className="glass-card p-4 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📦</span>
                        <h4 className="font-bold text-white text-sm">Stock Status</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Stock</p>
                            <p className="text-white font-black text-2xl">
                                {stock_policy?.current_stock || 0}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Max Capacity</p>
                            <p className="text-white font-black text-2xl">
                                {stock_policy?.max_capacity || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recommended Stock Levels */}
                <div className="glass-card p-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📊</span>
                        <h4 className="font-bold text-white text-sm">Recommended Levels</h4>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-gray-300 text-sm">Before Morning Peak</span>
                            <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                                {stock_policy?.recommended_stock?.before_morning_peak || 0} 🔋
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-gray-300 text-sm">Before Evening Peak</span>
                            <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                                {stock_policy?.recommended_stock?.before_evening_peak || 0} 🔋
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-gray-300 text-sm">Normal Operations</span>
                            <span className="text-white font-medium">
                                {stock_policy?.recommended_stock?.normal_operations || 0} 🔋
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 bg-red-500/5 border border-red-500/20 rounded-lg">
                            <span className="text-red-200 text-sm">Minimum Safety</span>
                            <span className="text-red-400 font-bold">
                                {stock_policy?.recommended_stock?.minimum_safety || 0} 🔋
                            </span>
                        </div>
                    </div>
                </div>

                {/* Replenishment Schedule */}
                <div className="glass-card p-4 animate-slide-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">⏰</span>
                        <h4 className="font-bold text-white text-sm">Charging Schedule</h4>
                    </div>
                    <div className="space-y-3">
                        {schedule && schedule.map((item, idx) => (
                            <div
                                key={idx}
                                className={`rounded-xl p-3 border transition-all duration-300 ${item.priority === 'high'
                                    ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-bold text-sm capitalize flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                                        {item.period.replace(/_/g, ' ')}
                                    </span>
                                    {item.priority === 'high' && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded border border-orange-500/30">
                                            HIGH PRIORITY
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs pl-3.5 border-l border-white/10 ml-0.5">
                                    <div>
                                        <span className="text-gray-500 block mb-0.5">Start Time</span>
                                        <span className="text-white font-mono">{item.start_time}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block mb-0.5">Ready By</span>
                                        <span className="text-emerald-400 font-mono font-bold">{item.target_ready_by}</span>
                                    </div>
                                    <div className="col-span-2 pt-1 mt-1 border-t border-white/5">
                                        <span className="text-gray-500">Batteries to charge: </span>
                                        <span className="text-cyan-300 font-bold ml-1">
                                            {item.batteries_to_charge} units
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Charging Metrics */}
                <div className="glass-card p-4 animate-slide-in" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">⚡</span>
                        <h4 className="font-bold text-white text-sm">Charging Capacity</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                            <p className="text-gray-400 text-xs mb-1">Chargers</p>
                            <p className="text-white font-bold text-lg">
                                {stock_policy?.charging_metrics?.chargers_available || 0}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                            <p className="text-gray-400 text-xs mb-1">Rate/Hour</p>
                            <p className="text-white font-bold text-lg">
                                {stock_policy?.charging_metrics?.charging_rate_per_hour || 0}
                            </p>
                        </div>
                        <div className="col-span-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-2 flex justify-between items-center px-4 border border-blue-500/20">
                            <p className="text-blue-200 text-xs font-medium">Time to Full Stock</p>
                            <p className="text-cyan-300 font-bold">
                                {stock_policy?.charging_metrics?.full_stock_time_hours || 0} hours
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderNetworkView = () => {
        if (!networkData) return null;

        return (
            <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 animate-slide-in">
                    <div className={`rounded-xl p-4 border transition-all duration-300 ${networkData.network_alerts?.critical > 0
                        ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/10'
                        : 'bg-emerald-500/10 border-emerald-500/30'
                        }`}>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Critical Alerts</p>
                        <p className={`font-black text-3xl ${networkData.network_alerts?.critical > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                            }`}>
                            {networkData.network_alerts?.critical || 0}
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Warnings</p>
                        <p className="text-yellow-400 font-black text-3xl">
                            {networkData.network_alerts?.warning || 0}
                        </p>
                    </div>
                </div>

                {/* Stations Needing Attention */}
                <div className="glass-card p-4 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🚨</span>
                            <h4 className="font-bold text-white text-sm">Response Needed</h4>
                        </div>
                        <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs font-bold text-white">
                            {networkData.stations_needing_attention} Stations
                        </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        {networkData.stations
                            ?.filter(s => s.stock_gap > 0)
                            ?.slice(0, 10)
                            ?.map((station, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-xl p-3 border transition-all duration-300 hover:scale-[1.02] ${station.has_critical_alert
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-white text-sm font-bold truncate flex-1 pr-2">
                                            {station.station_id?.slice(0, 20)}...
                                        </p>
                                        {station.has_critical_alert && (
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end text-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <span>Current: <span className="text-white font-bold">{station.current_stock}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <span>Target: <span className="text-white font-bold">{station.recommended_peak_stock}</span></span>
                                            </div>
                                        </div>
                                        <span className={`font-bold px-2 py-1 rounded ${station.stock_gap > 5
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            }`}>
                                            Gap: +{station.stock_gap}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="glass-card p-6 animate-slide-in hover-lift h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-xl">📦</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Replenishment</h3>
                    <p className="text-xs text-gray-400">Stock & Supply Chain</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                <button
                    onClick={() => setViewMode('station')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 ${viewMode === 'station'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Station View
                </button>
                <button
                    onClick={() => setViewMode('network')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 ${viewMode === 'network'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Network View
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-400 text-sm animate-pulse">Loading stock data...</p>
                </div>
            ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                    <span className="text-2xl mb-2 block">⚠️</span>
                    <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
            ) : viewMode === 'station' ? (
                renderStationView()
            ) : (
                renderNetworkView()
            )}
        </div>
    );
}
