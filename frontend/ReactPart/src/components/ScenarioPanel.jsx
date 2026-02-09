import { useState, useEffect } from 'react';
import { getScenarios, loadScenario } from '../services/api';

export default function ScenarioPanel({ onSelectScenario, loading }) {
  const [scenarios, setScenarios] = useState([]);
  const [runningId, setRunningId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await getScenarios();
        setScenarios(res.data);
      } catch (err) {
        setError('Failed to load scenarios');
      }
    };
    fetchScenarios();
  }, []);

  // Run the scenario when button is clicked
  const handleRunScenario = async (id, e) => {
    e.stopPropagation(); // Prevent any parent click
    if (loading || runningId) return;

    setRunningId(id);
    try {
      const res = await loadScenario(id);
      onSelectScenario(res.data);
    } catch (err) {
      setError('Failed to run scenario');
    } finally {
      setRunningId(null);
    }
  };

  // Get scenario icon based on type
  const getScenarioIcon = (name) => {
    if (name.toLowerCase().includes('peak')) return '⚡';
    if (name.toLowerCase().includes('charger')) return '🔌';
    if (name.toLowerCase().includes('battery')) return '🔋';
    if (name.toLowerCase().includes('demand')) return '📈';
    return '🎯';
  };

  if (error) {
    return (
      <div className="glass-card p-5 border-red-400/50 bg-red-500/10 animate-slide-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <span className="text-red-200 font-medium">{error}</span>
            <p className="text-xs text-red-300/70">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-full animate-slide-in hover-lift">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Scenario Analysis</h3>
          <p className="text-xs text-gray-400">Pre-configured simulation templates</p>
        </div>
      </div>

      {/* Scenarios Count Badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300 border border-white/10">
          {scenarios.length} Available Scenarios
        </span>
      </div>

      {/* Scenario List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {scenarios.map((scenario, index) => {
          const isRunning = runningId === scenario.id;
          const isDisabled = loading || (runningId && runningId !== scenario.id);

          return (
            <div
              key={scenario.id}
              className={`p-4 rounded-xl transition-all duration-300 border animate-card-enter
                bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg
                ${isDisabled ? 'opacity-50' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getScenarioIcon(scenario.name)}</span>
                  <h4 className="font-bold text-white">
                    {scenario.name}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {scenario.tweaks_count} Tweaks
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-3 pl-7">
                {scenario.description}
              </p>

              {/* Parameters */}
              {scenario.parameters && (
                <div className="flex flex-wrap gap-2 mb-4 pl-7">
                  {Object.entries(scenario.parameters).map(([key, value]) => (
                    <span
                      key={key}
                      className="text-[10px] uppercase font-bold text-emerald-200 bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-400/30"
                    >
                      {key.replace(/_/g, ' ')}: {String(value)}
                    </span>
                  ))}
                </div>
              )}

              {/* Run Button inside card */}
              <button
                onClick={(e) => handleRunScenario(scenario.id, e)}
                disabled={isDisabled}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 
                  flex items-center justify-center gap-2 btn-ripple
                  ${isDisabled
                    ? 'bg-gray-600/30 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]'
                  }`}
              >
                {isRunning ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Running Simulation...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">▶</span>
                    <span>Run this Scenario</span>
                  </>
                )}
              </button>
            </div>
          );
        })}

        {/* Empty State */}
        {scenarios.length === 0 && !error && (
          <div className="text-center py-8">
            <span className="text-4xl opacity-30 block mb-3">📋</span>
            <p className="text-gray-400">Loading scenarios...</p>
          </div>
        )}
      </div>
    </div>
  );
}
