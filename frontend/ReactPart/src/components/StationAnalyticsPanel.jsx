import { useState, useEffect } from 'react';
import { getStationAnalytics } from '../services/api';

export default function StationAnalyticsPanel({ selectedStation, onClose }) {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!selectedStation) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getStationAnalytics(selectedStation);
                setAnalytics(res.data);
            } catch (err) {
                setError('Failed to load analytics: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedStation]);

    if (!selectedStation) {
        return (
            <div className="glass-card p-6 animate-slide-in hover-lift">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-xl">🔍</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Station Analytics</h3>
                        <p className="text-xs text-gray-400">Deep performance insights</p>
                    </div>
                </div>
                <div className="text-center py-6">
                    <span className="text-4xl opacity-30 block mb-3">📊</span>
                    <p className="text-gray-400 text-sm">
                        Select a station from the map to view detailed analytics.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="glass-card p-6 animate-slide-in">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-xl">🔍</span>
                    </div>
                    <div className="flex-1">
                        <div className="h-5 w-32 bg-white/10 rounded skeleton mb-2"></div>
                        <div className="h-3 w-24 bg-white/5 rounded skeleton"></div>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-400 text-sm">Loading analytics...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-6 animate-slide-in border-red-500/30 bg-red-500/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <span className="text-xl">⚠️</span>
                    </div>
                    <div>
                        <p className="text-red-300 font-medium">Failed to load analytics</p>
                        <p className="text-red-400/70 text-xs">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    const getHealthColor = (status) => {
        switch (status) {
            case 'healthy': return 'text-green-400';
            case 'moderate': return 'text-yellow-400';
            case 'concerning': return 'text-orange-400';
            case 'critical': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getHealthBg = (status) => {
        switch (status) {
            case 'healthy': return 'bg-green-500/20 border-green-400/30';
            case 'moderate': return 'bg-yellow-500/20 border-yellow-400/30';
            case 'concerning': return 'bg-orange-500/20 border-orange-400/30';
            case 'critical': return 'bg-red-500/20 border-red-400/30';
            default: return 'bg-gray-500/20 border-gray-400/30';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    };

    return (
        <div className="glass-card p-6 animate-slide-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-xl">🔍</span>
                        Station Analytics
                    </h3>
                    <p className="text-cyan-200/70 text-xs mt-1 max-w-[200px] truncate">
                        {selectedStation}
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white transition p-1"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Health Score */}
            <div className={`rounded-xl p-4 mb-4 border ${getHealthBg(analytics.health_status)}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Health Score</span>
                    <span className={`text-2xl font-bold ${getHealthColor(analytics.health_status)}`}>
                        {analytics.health_score}/100
                    </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${analytics.health_status === 'healthy' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                            analytics.health_status === 'moderate' ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                analytics.health_status === 'concerning' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                                    'bg-gradient-to-r from-red-500 to-rose-400'
                            }`}
                        style={{ width: `${analytics.health_score}%` }}
                    ></div>
                </div>
                <p className={`text-sm mt-2 font-medium capitalize ${getHealthColor(analytics.health_status)}`}>
                    {analytics.health_status}
                </p>
            </div>

            {/* Primary Issue */}
            {analytics.primary_issue && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 mb-4">
                    <h4 className="text-red-300 font-semibold text-sm mb-2 flex items-center gap-2">
                        ⚠️ Primary Issue
                    </h4>
                    <p className="text-white text-sm font-medium">
                        {analytics.primary_issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-white/70 text-xs mt-1">{analytics.primary_issue.description}</p>
                </div>
            )}

            {/* Utilization Metrics */}
            <div className="mb-4">
                <h4 className="text-cyan-300 font-semibold text-sm mb-3">📊 Utilization Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/50 text-xs">Charger Utilization</p>
                        <p className="text-white font-bold text-lg">
                            {analytics.utilization?.charger_utilization_percent || 0}%
                        </p>
                        <p className={`text-xs ${analytics.utilization?.efficiency_rating === 'optimal' ? 'text-green-400' :
                            analytics.utilization?.efficiency_rating === 'overloaded' ? 'text-red-400' :
                                'text-yellow-400'
                            }`}>
                            {analytics.utilization?.efficiency_rating || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/50 text-xs">Inventory Turnover</p>
                        <p className="text-white font-bold text-lg">
                            {analytics.utilization?.inventory_turnover_ratio || 0}x
                        </p>
                        <p className="text-white/50 text-xs">per day</p>
                    </div>
                </div>
            </div>

            {/* Queue Analysis */}
            <div className="mb-4">
                <h4 className="text-cyan-300 font-semibold text-sm mb-3">⏱️ Queue Analysis</h4>
                <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm">Avg Wait Time</span>
                        <span className={`font-bold ${analytics.queue_analysis?.severity === 'high' ? 'text-red-400' :
                            analytics.queue_analysis?.severity === 'medium' ? 'text-yellow-400' :
                                'text-green-400'
                            }`}>
                            {analytics.queue_analysis?.avg_waiting_time_minutes || 0} min
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm">Est. Queue Length</span>
                        <span className="text-white font-medium">
                            {analytics.queue_analysis?.estimated_queue_length || 0} vehicles
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Status</span>
                        <span className={`text-sm font-medium capitalize ${analytics.queue_analysis?.queue_status === 'excellent' ? 'text-green-400' :
                            analytics.queue_analysis?.queue_status === 'acceptable' ? 'text-blue-400' :
                                analytics.queue_analysis?.queue_status === 'concerning' ? 'text-yellow-400' :
                                    'text-red-400'
                            }`}>
                            {analytics.queue_analysis?.queue_status || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Loss Analysis */}
            {analytics.loss_analysis?.reasons?.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-cyan-300 font-semibold text-sm mb-3">📉 Loss Reasons</h4>
                    <div className="space-y-2">
                        {analytics.loss_analysis.reasons.map((reason, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span>{getSeverityIcon(reason.severity)}</span>
                                    <span className="text-white font-medium text-sm capitalize">
                                        {reason.reason.replace(/_/g, ' ')}
                                    </span>
                                    <span className="ml-auto text-cyan-300 text-sm font-bold">
                                        {reason.contribution_percent}%
                                    </span>
                                </div>
                                <p className="text-white/60 text-xs">{reason.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Capacity Analysis */}
            <div>
                <h4 className="text-cyan-300 font-semibold text-sm mb-3">⚡ Capacity Status</h4>
                <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm">Daily Demand</span>
                        <span className="text-white font-medium">
                            {analytics.capacity_analysis?.demand_per_day || 0} swaps
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm">Daily Capacity</span>
                        <span className="text-white font-medium">
                            {analytics.capacity_analysis?.capacity_per_day || 0} swaps
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm">Demand/Capacity</span>
                        <span className={`font-bold ${analytics.capacity_analysis?.demand_capacity_ratio > 1 ? 'text-red-400' :
                            analytics.capacity_analysis?.demand_capacity_ratio > 0.85 ? 'text-yellow-400' :
                                'text-green-400'
                            }`}>
                            {((analytics.capacity_analysis?.demand_capacity_ratio || 0) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10">
                        <p className={`text-xs font-medium ${analytics.capacity_analysis?.mismatch_status === 'balanced' ? 'text-green-400' :
                            analytics.capacity_analysis?.mismatch_status === 'undercapacity' ? 'text-red-400' :
                                'text-yellow-400'
                            }`}>
                            {analytics.capacity_analysis?.recommendation || ''}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
