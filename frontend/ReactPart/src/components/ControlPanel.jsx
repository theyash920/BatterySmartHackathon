export default function ControlPanel({
    onRun,
    selectedStation,
    extraChargers,
    setExtraChargers,
    extraBatteries,
    setExtraBatteries,
    loading
}) {
    return (
        <div className="glass-card p-6 animate-slide-in hover-lift">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <span className="text-xl">⚙️</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Decision Controls</h3>
                    <p className="text-xs text-gray-400">Configure simulation parameters</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Selected Station Card */}
                <div className={`p-4 rounded-xl backdrop-blur-sm transition-all duration-300 ${selectedStation
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30'
                    : 'bg-white/5 border border-white/10'}`}>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selected Station</label>
                    <p className="text-lg font-bold text-white mt-2 flex items-center gap-2">
                        {selectedStation ? (
                            <>
                                <span className="text-cyan-400 animate-pulse">📍</span>
                                <span className="truncate">{selectedStation}</span>
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                    Active
                                </span>
                            </>
                        ) : (
                            <span className="text-gray-400 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                                Click on map to select
                            </span>
                        )}
                    </p>
                </div>

                {/* Extra Chargers Slider */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <label className="text-sm font-semibold text-gray-300 flex justify-between items-center mb-4">
                        <span className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">⚡</span>
                            <span>Bays</span>
                        </span>
                        <span className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent animate-count">
                            +{extraChargers}
                        </span>
                    </label>
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={extraChargers}
                            onChange={(e) => setExtraChargers(Number(e.target.value))}
                            className="w-full focus-ring"
                            disabled={!selectedStation}
                        />
                        {/* Progress fill indicator */}
                        <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 pointer-events-none"
                            style={{ width: `${(extraChargers / 10) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>0</span>
                        <span className="text-gray-400">Recommended: 2-5</span>
                        <span>10</span>
                    </div>
                </div>

                {/* Run Button */}
                <button
                    onClick={onRun}
                    disabled={loading}
                    className={`w-full py-4 btn-gradient btn-ripple text-base font-bold tracking-wide transition-all duration-300 ${loading ? 'opacity-50' : 'hover:scale-[1.02]'}`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-3">
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Running Simulation...</span>
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-3">
                            <span className="text-xl">▶</span>
                            <span>Run "What-If" Scenario</span>
                        </span>
                    )}
                </button>

                {/* Tip Card */}
                {!selectedStation && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 animate-slide-in">
                        <p className="text-xs text-yellow-200 text-center flex items-center gap-2 justify-center">
                            <span className="text-lg">💡</span>
                            <span>Tip: Select a station first for more accurate results</span>
                        </p>
                    </div>
                )}

                {/* Quick Stats */}
                {selectedStation && (
                    <div className="grid grid-cols-2 gap-2 animate-slide-in">
                        <div className="p-3 rounded-lg bg-white/5 text-center">
                            <p className="text-2xl font-bold text-cyan-400">{extraChargers}</p>
                            <p className="text-xs text-gray-400">Chargers Added</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 text-center">
                            <p className="text-2xl font-bold text-emerald-400">~{Math.round(extraChargers * 12)}</p>
                            <p className="text-xs text-gray-400">Est. Daily Swaps</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}