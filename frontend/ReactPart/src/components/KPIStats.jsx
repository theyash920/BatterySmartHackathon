export default function KPIStats({ baseline, scenario, virtualStationImpact = null, isVirtualStationActive = false, labelPrefix = '', realtimeStats = null }) {
    const metrics = [
        {
            label: `${labelPrefix} Swaps`,
            key: 'total_swaps',
            icon: '🔄',
            gradient: 'from-blue-500 to-cyan-500',
            glowColor: 'rgba(59, 130, 246, 0.5)',
            improveDirection: 'up' // higher is better
        },
        {
            label: `${labelPrefix} Lost Swaps`,
            key: 'total_lost_swaps',
            icon: '⚠️',
            gradient: 'from-red-500 to-pink-500',
            glowColor: 'rgba(239, 68, 68, 0.5)',
            improveDirection: 'down' // lower is better
        },

        {
            label: 'Bays Availability',
            key: 'avg_battery_availability',
            icon: '🔋',
            gradient: 'from-purple-500 to-violet-500',
            glowColor: 'rgba(168, 85, 247, 0.5)',
            improveDirection: 'up'
        },
        {
            label: 'Avg Wait Time',
            key: 'avg_wait_time_mins',
            suffix: ' min',
            icon: '⏱️',
            gradient: 'from-orange-500 to-amber-500',
            glowColor: 'rgba(249, 115, 22, 0.5)',
            improveDirection: 'down'
        }
    ];

    // Get the effective values (with virtual station impact if active, or from realtime stats)
    const getEffectiveValue = (key, metric) => {
        // For realtime metrics, get from realtimeStats.network
        if (metric?.isRealtime && realtimeStats?.network) {
            return realtimeStats.network[key];
        }
        const baseValue = scenario?.[key] ?? baseline?.[key];
        if (!isVirtualStationActive || !virtualStationImpact) return baseValue;
        return virtualStationImpact[key] ?? baseValue;
    };

    // Calculate delta for display
    const getDelta = (key) => {
        if (!baseline?.[key] || !scenario?.[key]) return null;
        return scenario[key] - baseline[key];
    };

    // Calculate virtual station impact delta
    const getVirtualDelta = (key, metric) => {
        if (!isVirtualStationActive || !virtualStationImpact) return null;
        const beforeValue = scenario?.[key] ?? baseline?.[key];
        if (beforeValue === undefined) return null;
        const afterValue = virtualStationImpact[key];
        if (afterValue === undefined) return null;

        const delta = afterValue - beforeValue;
        const isGood = metric.improveDirection === 'down' ? delta < 0 : delta > 0;

        return {
            value: delta,
            isGood,
            text: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`,
            arrow: isGood ? (metric.improveDirection === 'down' ? '↓' : '↑') : (metric.improveDirection === 'down' ? '↑' : '↓')
        };
    };

    const formatDelta = (delta, key) => {
        if (delta === null) return null;
        const sign = delta > 0 ? '+' : '';
        // For lost_swaps, negative is good
        const isGood = key === 'total_lost_swaps' ? delta < 0 : delta > 0;
        return {
            text: `${sign}${delta.toFixed(1)}`,
            isGood,
            color: isGood ? 'text-green-400' : delta !== 0 ? 'text-red-400' : 'text-gray-400'
        };
    };

    if (!baseline && !scenario) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-in">
                {metrics.map((m, idx) => (
                    <div key={idx} className="glass-card p-5 relative overflow-hidden group">
                        <div className="absolute inset-0 skeleton opacity-10"></div>
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <span className="text-2xl opacity-50 grayscale">{m.icon}</span>
                            </div>
                            <div className="h-4 w-24 bg-white/10 rounded skeleton"></div>
                        </div>
                        <div className="h-8 w-16 bg-white/10 rounded skeleton mb-2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((m, index) => {
                const delta = getDelta(m.key);
                const deltaFormatted = formatDelta(delta, m.key);
                const value = getEffectiveValue(m.key, m);
                const virtualDelta = getVirtualDelta(m.key, m);

                // Calculate percentage for mini progress bar
                const maxValues = {
                    'total_swaps': 150,
                    'total_lost_swaps': 50,
                    'avg_battery_availability': 20,
                    'avg_wait_time_mins': 30
                };
                const percentage = Math.min(100, ((value || 0) / maxValues[m.key]) * 100);

                return (
                    <div
                        key={m.label}
                        className={`glass-card p-5 group relative animate-card-enter hover-lift ${isVirtualStationActive ? 'ring-1 ring-yellow-500/30' : ''}`}
                        style={{
                            '--glow-color': m.glowColor,
                            animationDelay: `${index * 0.1}s`
                        }}
                    >
                        {/* Virtual Station Impact Badge */}
                        {isVirtualStationActive && virtualDelta && (
                            <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold animate-count backdrop-blur-md z-20 flex items-center gap-1 shadow-lg
                                ${virtualDelta.isGood
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-green-500/20'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-500/20'
                                }`}>
                                <span className="animate-pulse">{virtualDelta.arrow}</span> {virtualDelta.text}
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/5 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                    {m.icon}
                                </div>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">
                                    {m.label}
                                </p>
                            </div>

                            {/* Trend indicator */}
                            {deltaFormatted && !isVirtualStationActive && (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border border-white/5
                                    ${deltaFormatted.isGood ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {deltaFormatted.isGood ? '↑' : '↓'}
                                </div>
                            )}
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className={`text-3xl font-black bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent animate-count tracking-tight`}>
                                    {value?.toFixed?.(1) ?? value ?? '--'}{m.suffix || ''}
                                </span>
                                {deltaFormatted && !isVirtualStationActive && (
                                    <span className={`text-xs font-bold ${deltaFormatted.color} flex items-center gap-0.5 transition-all duration-300 bg-white/5 px-1.5 py-0.5 rounded`}>
                                        <span className={deltaFormatted.isGood ? 'text-green-400' : 'text-red-400'}>{deltaFormatted.isGood ? '↗' : '↘'}</span>
                                        <span>{deltaFormatted.text}</span>
                                    </span>
                                )}
                            </div>

                            {baseline?.[m.key] !== undefined && (
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-gray-500 font-mono">
                                        BASE: <span className="text-gray-400">{baseline[m.key]?.toFixed?.(1) ?? baseline[m.key]}{m.suffix || ''}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mini progress bar */}
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${m.gradient} animate-progress transition-all duration-1000 group-hover:shadow-[0_0_10px_currentColor]`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {/* Virtual Station Impact Label */}
                        {isVirtualStationActive && virtualDelta && (
                            <div className="mt-3 pt-2 border-t border-white/5">
                                <p className="text-[10px] text-yellow-500/70 flex items-center gap-1.5 font-medium">
                                    <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                    <span>Virtual Station Impact</span>
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}