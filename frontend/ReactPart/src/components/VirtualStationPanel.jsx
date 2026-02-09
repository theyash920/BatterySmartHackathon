import { useState } from 'react';
import { createPortal } from 'react-dom';
import { analyzeStationRemoval } from '../services/api';

/**
 * VirtualStationPanel Component
 * Provides UI to add/remove a virtual station within 2km of a selected station
 * AND analyze nearby stations for potential removal
 * AND pin any location for station placement analysis
 */
export default function VirtualStationPanel({
  selectedStation,
  isVirtualStationActive,
  onAddVirtualStation,
  onRemoveVirtualStation,
  loading,
  ownershipModel,
  isPinMode,
  onTogglePinMode,
  locationAnalysis,
  onClearPinAnalysis
}) {
  const isDisabled = !selectedStation || loading;

  // Removal analysis state
  const [removalAnalysis, setRemovalAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showRemovalPanel, setShowRemovalPanel] = useState(false);

  const handleAnalyzeRemoval = async () => {
    // Handle both object with station_id and direct string
    const stationId = typeof selectedStation === 'string'
      ? selectedStation
      : selectedStation?.station_id;

    if (!stationId) {
      console.error('No station ID available');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await analyzeStationRemoval(stationId);
      setRemovalAnalysis(response.data);
      setShowRemovalPanel(true);
    } catch (error) {
      console.error('Removal analysis failed:', error);
      setRemovalAnalysis({ status: 'error', message: error.message });
      setShowRemovalPanel(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const closeRemovalPanel = () => {
    setShowRemovalPanel(false);
    setRemovalAnalysis(null);
  };

  return (
    <div className="glass-card p-5 animate-slide-in hover-lift">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span className="text-xl">🏗️</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Spatial What-If</h3>
          <p className="text-xs text-gray-400">Add/Remove station simulation</p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Simulate adding a new station within <span className="text-cyan-400 font-semibold">2 km</span> of the selected location to redistribute demand.
      </p>

      {/* Pin Location Mode Toggle */}
      <div className="mb-4">
        <button
          onClick={onTogglePinMode}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 
                      flex items-center justify-center gap-2
                      ${isPinMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30'
            }`}
        >
          <span>{isPinMode ? '📍' : '📌'}</span>
          <span>{isPinMode ? 'Exit Pin Mode' : 'Pin Any Location'}</span>
        </button>
        {isPinMode && (
          <p className="text-xs text-purple-300 mt-2 text-center">
            Click anywhere on the map to analyze that location
          </p>
        )}
      </div>

      {/* Location Analysis Results */}
      {locationAnalysis && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h4 className="font-bold text-white">Location Analysis</h4>
            </div>
            <button
              onClick={onClearPinAnalysis}
              className="text-gray-400 hover:text-white text-lg"
            >
              ×
            </button>
          </div>

          {/* Area Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-cyan-400">{locationAnalysis.nearby_count}</p>
              <p className="text-[10px] text-gray-400">Stations in 2km</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-amber-400">{locationAnalysis.area_metrics?.demand_score || 0}%</p>
              <p className="text-[10px] text-gray-400">Demand Score</p>
            </div>
          </div>

          {/* Recommendation */}
          {locationAnalysis.recommendation && (
            <>
              <div className={`p-3 rounded-lg mb-3 ${locationAnalysis.recommendation.optimal_location.ownership_model === 'POPO'
                ? 'bg-amber-500/10 border border-amber-500/30'
                : 'bg-cyan-500/10 border border-cyan-500/30'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{locationAnalysis.recommendation.optimal_location.ownership_model === 'POPO' ? '🤝' : '🏢'}</span>
                  <span className={`font-bold ${locationAnalysis.recommendation.optimal_location.ownership_model === 'POPO' ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                    {locationAnalysis.recommendation.optimal_location.ownership_model} Recommended
                  </span>
                </div>
                <p className="text-xs text-gray-300">{locationAnalysis.recommendation.optimal_location.reason}</p>
              </div>

              {/* Expected Impact */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-sm font-bold text-green-400">
                    +{locationAnalysis.recommendation.expected_impact.absorbed_swaps_per_day}
                  </p>
                  <p className="text-[10px] text-gray-500">Swaps/Day</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-400">
                    -{locationAnalysis.recommendation.expected_impact.wait_time_reduction_mins}min
                  </p>
                  <p className="text-[10px] text-gray-500">Wait Time</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-yellow-400">
                    {locationAnalysis.recommendation.expected_impact.estimated_revenue_per_day}
                  </p>
                  <p className="text-[10px] text-gray-500">Revenue/Day</p>
                </div>
              </div>

              {/* Suggested Capacity */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-1">Suggested Configuration:</p>
                <div className="flex gap-3 text-xs">
                  <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300">
                    ⚡ {locationAnalysis.recommendation.suggested_capacity.chargers} Chargers
                  </span>
                  <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300">
                    🔋 {locationAnalysis.recommendation.suggested_capacity.battery_slots} Slots
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {isVirtualStationActive ? (
        <button
          onClick={onRemoveVirtualStation}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 
                        bg-gradient-to-r from-amber-500 to-orange-500 text-white
                        hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-orange-500/30
                        flex items-center justify-center gap-2
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>♻️</span>
          <span>Remove Virtual Station</span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Add Virtual Station Button */}
          <div className="relative group">
            <button
              onClick={onAddVirtualStation}
              disabled={isDisabled}
              className={`w-full py-3 rounded-xl font-bold transition-all duration-300 
                              flex items-center justify-center gap-2
                              ${isDisabled
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30'
                }`}
            >
              <span>➕</span>
              <span>Add Virtual Station</span>
            </button>

            {/* Tooltip for disabled state */}
            {isDisabled && !loading && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 
                              bg-slate-800 text-gray-200 text-xs px-3 py-2 rounded-lg
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              whitespace-nowrap pointer-events-none z-10
                              border border-white/10">
                Select a station on the map to enable this action
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                                  w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-white/10"></div>
              </div>
            )}
          </div>

          {/* Analyze Removal Button */}
          <div className="relative group">
            <button
              onClick={handleAnalyzeRemoval}
              disabled={isDisabled || analyzing}
              className={`w-full py-3 rounded-xl font-bold transition-all duration-300 
                              flex items-center justify-center gap-2
                              ${isDisabled || analyzing
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 hover:shadow-lg hover:shadow-red-500/30'
                }`}
            >
              <span>{analyzing ? '🔄' : '🗑️'}</span>
              <span>{analyzing ? 'Analyzing...' : 'Analyze Station Removal'}</span>
            </button>
          </div>
        </div>
      )}

      {isVirtualStationActive && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-300 text-sm">
            <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
            <span className="font-medium">Virtual station active</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            KPIs now reflect simulated demand redistribution
          </p>
        </div>
      )}

      {/* POPO/COCO Ownership Recommendation */}
      {isVirtualStationActive && ownershipModel && (
        <div className={`mt-4 p-4 rounded-xl border ${ownershipModel.model === 'POPO'
          ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
          : 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30'
          }`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{ownershipModel.model === 'POPO' ? '🤝' : '🏢'}</span>
            <div>
              <h4 className={`font-bold text-lg ${ownershipModel.model === 'POPO' ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                Recommended: {ownershipModel.model}
              </h4>
              <p className="text-xs text-gray-400">{ownershipModel.fullName}</p>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-3">
            {ownershipModel.reason}
          </p>

          {/* Benefits */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1">✅ Key Benefits:</p>
            <div className="flex flex-wrap gap-1">
              {ownershipModel.benefits?.slice(0, 3).map((benefit, idx) => (
                <span key={idx} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300">
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Financials */}
          {ownershipModel.financials && (
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
              <div className="text-center">
                <p className={`text-sm font-bold ${ownershipModel.model === 'POPO' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                  {ownershipModel.financials.estimatedSetupCost}
                </p>
                <p className="text-[10px] text-gray-500">Setup Cost</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${ownershipModel.model === 'POPO' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                  {ownershipModel.financials.revenueShare}
                </p>
                <p className="text-[10px] text-gray-500">Revenue Share</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${ownershipModel.model === 'POPO' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                  {ownershipModel.financials.breakeven}
                </p>
                <p className="text-[10px] text-gray-500">Breakeven</p>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Removal Analysis Results Modal */}
      {showRemovalPanel && removalAnalysis && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in px-4">
          <div className="glass-card rounded-3xl p-0 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50 border border-white/10 relative">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 p-6 border-b border-white/10 flex items-center justify-between shrink-0 hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl shadow-inner border border-red-500/30">
                  📊
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Station Removal Analysis</h3>
                  <p className="text-xs text-red-200/60">Optimization & Consolidation</p>
                </div>
              </div>
              <button
                onClick={closeRemovalPanel}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all transform hover:rotate-90"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {removalAnalysis.status === 'no_nearby_stations' ? (
                <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-5xl">
                    🔍
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">No Candidates Found</h4>
                  <p className="text-gray-400 text-sm max-w-xs">{removalAnalysis.message}</p>
                </div>
              ) : removalAnalysis.status === 'error' ? (
                <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-5xl animate-pulse">
                    ⚠️
                  </div>
                  <h4 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h4>
                  <p className="text-red-200/60 text-sm max-w-xs">{removalAnalysis.message}</p>
                </div>
              ) : (
                <>
                  {/* Analysis Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 hover:bg-white/10 transition-colors group">
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Stations in 2km</p>
                      <p className="text-4xl font-black text-cyan-400 group-hover:scale-110 transition-transform">{removalAnalysis.nearby_count}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 hover:bg-white/10 transition-colors group">
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Min Daily Target</p>
                      <p className="text-4xl font-black text-amber-400 group-hover:scale-110 transition-transform">{removalAnalysis.min_daily_target}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 hover:bg-white/10 transition-colors group">
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Meeting Target</p>
                      <p className="text-4xl font-black text-emerald-400 group-hover:scale-110 transition-transform">
                        {removalAnalysis.nearby_stations?.filter(s => s.meets_sales_target).length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  {removalAnalysis.recommendation && (
                    <div className="mb-8 rounded-2xl overflow-hidden relative group hover-lift">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-pink-600/20 to-purple-600/20 animate-pulse-slow"></div>
                      <div className="relative p-5 border border-red-500/30 rounded-2xl bg-black/20 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
                            💡
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                              Recommendation: Remove Station
                              <span className="text-[10px] px-2 py-0.5 bg-red-500 text-white rounded font-bold uppercase tracking-wider">High Impact</span>
                            </h4>
                            <div className="bg-black/30 rounded-lg p-2 mb-3 border border-white/5">
                              <span className="text-red-300 font-mono text-sm break-all">
                                {removalAnalysis.recommendation.remove_station?.station_id}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{removalAnalysis.recommendation.reason}</p>

                            {/* Impact Stats */}
                            {removalAnalysis.recommendation.impact && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">↻</div>
                                  <div>
                                    <p className="text-lg font-bold text-white leading-none">
                                      {removalAnalysis.recommendation.impact.daily_swaps_redistributed}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">Swaps Redistributed</p>
                                  </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">$</div>
                                  <div>
                                    <p className="text-lg font-bold text-white leading-none">
                                      {removalAnalysis.recommendation.impact.estimated_cost_savings}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">Est. Monthly Savings</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nearby Stations Table */}
                  <div className="mb-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span>📍</span> Nearby Stations Performance (2km)
                    </h4>
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-white/5">
                          <tr>
                            <th className="py-3 px-4 font-semibold">Station ID</th>
                            <th className="py-3 px-4 font-semibold text-right">Traffic</th>
                            <th className="py-3 px-4 font-semibold text-right">Wait</th>
                            <th className="py-3 px-4 font-semibold text-right">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {removalAnalysis.nearby_stations?.map((station, idx) => {
                            const isRecommended = station.station_id === removalAnalysis.recommendation?.remove_station?.station_id;
                            return (
                              <tr
                                key={idx}
                                className={`transition-colors hover:bg-white/5 ${isRecommended ? 'bg-red-500/10 hover:bg-red-500/20' : ''
                                  }`}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    {isRecommended && (
                                      <span className="text-lg animate-pulse" title="Recommended for removal">🗑️</span>
                                    )}
                                    <div className="flex flex-col">
                                      <span className={`font-mono text-xs ${!station.meets_sales_target ? 'text-red-300' : 'text-gray-300'}`}>
                                        {station.station_id.slice(0, 8)}...{station.station_id.slice(-6)}
                                      </span>
                                      <span className="text-[10px] text-gray-500">
                                        {station.distance ? `${station.distance}m away` : 'Nearby'}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className={`font-mono font-bold ${station.meets_sales_target ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {station.swaps_per_day}
                                  </span>
                                  <span className="text-[10px] text-gray-500 block">swaps/day</span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="font-mono text-gray-300">{station.avg_waiting_time}</span>
                                  <span className="text-[10px] text-gray-500 block">min</span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${station.performance_score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    station.performance_score >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                      'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                    {station.performance_score}%
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end shrink-0">
              <button
                onClick={closeRemovalPanel}
                className="px-8 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
