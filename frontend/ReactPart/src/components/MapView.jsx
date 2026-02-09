import { MapContainer, TileLayer, CircleMarker, Tooltip, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom pin icon for pinned location
const pinIcon = new L.DivIcon({
    className: 'custom-pin-icon',
    html: '<div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><div style="position: absolute; width: 12px; height: 12px; background: white; border-radius: 50%; top: 7px; left: 7px;"></div></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

// Recommended location icon
const recommendedIcon = new L.DivIcon({
    className: 'recommended-location-icon',
    html: '<div style="background: linear-gradient(135deg, #22c55e, #06b6d4); width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="font-size: 14px;">✓</span></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

// Map click handler component
function MapClickHandler({ onMapClick, isPinMode }) {
    useMapEvents({
        click: (e) => {
            if (isPinMode && onMapClick) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

export default function MapView({
    stations,
    selectedId,
    onSelect,
    virtualStation = null,
    isVirtualStationActive = false,
    isPinMode = false,
    pinnedLocation = null,
    recommendedLocation = null,
    onMapClick = null
}) {
    // Default center (Delhi) - will adjust to show all stations
    const defaultCenter = [28.6139, 77.2090];

    // Calculate center from stations if available
    const getCenter = () => {
        if (pinnedLocation) return [pinnedLocation.lat, pinnedLocation.lon];
        if (!stations || stations.length === 0) return defaultCenter;
        const avgLat = stations.reduce((sum, s) => sum + (s.lat || 0), 0) / stations.length;
        const avgLon = stations.reduce((sum, s) => sum + (s.lon || 0), 0) / stations.length;
        return [avgLat || defaultCenter[0], avgLon || defaultCenter[1]];
    };

    // Get selected station data for radius circle
    const selectedStationData = stations?.find(s => s.station_id === selectedId);

    if (!stations || stations.length === 0) {
        return (
            <div className="glass-card p-6 animate-slide-in">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🗺️</span>
                    <h3 className="text-xl font-bold text-white">Station Map</h3>
                </div>
                <div className="h-[400px] w-full rounded-xl overflow-hidden flex items-center justify-center bg-white/5">
                    <div className="text-center">
                        <span className="text-5xl mb-4 block opacity-50">📍</span>
                        <p className="text-gray-400">Loading stations...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🗺️</span>
                    <h3 className="text-xl font-bold text-white">Station Map</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isPinMode && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40">
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-semibold text-purple-300">Pin Mode Active - Click to Pin</span>
                        </div>
                    )}
                    {isVirtualStationActive && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-semibold text-yellow-300">Virtual Station Active</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={`h-[450px] w-full rounded-xl overflow-hidden shadow-lg ${isPinMode ? 'cursor-crosshair ring-2 ring-purple-500' : ''}`}>
                <MapContainer center={getCenter()} zoom={5} className="h-full w-full">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />

                    {/* Map click handler for pin mode */}
                    <MapClickHandler onMapClick={onMapClick} isPinMode={isPinMode} />

                    {/* 2km Radius Circle around pinned location */}
                    {pinnedLocation && (
                        <Circle
                            center={[pinnedLocation.lat, pinnedLocation.lon]}
                            radius={2000} // 2km in meters
                            pathOptions={{
                                color: '#8b5cf6',
                                weight: 2,
                                fillColor: '#8b5cf6',
                                fillOpacity: 0.15,
                                dashArray: '10, 5'
                            }}
                        />
                    )}

                    {/* Pinned Location Marker */}
                    {pinnedLocation && (
                        <Marker
                            position={[pinnedLocation.lat, pinnedLocation.lon]}
                            icon={pinIcon}
                        >
                            <Tooltip permanent>
                                <div className="font-sans text-sm">
                                    <strong className="text-purple-600">📍 Pinned Location</strong>
                                    <br />
                                    <span className="text-slate-500 text-xs">
                                        {pinnedLocation.lat.toFixed(4)}, {pinnedLocation.lon.toFixed(4)}
                                    </span>
                                </div>
                            </Tooltip>
                        </Marker>
                    )}

                    {/* Recommended Station Location */}
                    {recommendedLocation && (
                        <Marker
                            position={[recommendedLocation.lat, recommendedLocation.lon]}
                            icon={recommendedIcon}
                        >
                            <Tooltip permanent>
                                <div className="font-sans text-sm">
                                    <strong className="text-green-600">✓ Recommended Location</strong>
                                    <br />
                                    <span className="text-slate-500 text-xs">Optimal station placement</span>
                                </div>
                            </Tooltip>
                        </Marker>
                    )}

                    {/* 2km Radius Circle when virtual station is active */}
                    {isVirtualStationActive && selectedStationData && (
                        <Circle
                            center={[selectedStationData.lat, selectedStationData.lon]}
                            radius={2000} // 2km in meters
                            pathOptions={{
                                color: '#22c55e',
                                weight: 2,
                                fillColor: '#22c55e',
                                fillOpacity: 0.1,
                                dashArray: '10, 5'
                            }}
                        />
                    )}

                    {/* Existing Stations */}
                    {stations.map(st => (
                        <CircleMarker
                            key={st.station_id}
                            center={[st.lat, st.lon]}
                            radius={st.station_id === selectedId ? 14 : 10}
                            pathOptions={{
                                fillColor: st.available_batteries < 5 ? '#ef4444' :
                                    st.available_batteries < 10 ? '#f59e0b' : '#22c55e',
                                color: st.station_id === selectedId ? '#0ea5e9' : 'white',
                                weight: st.station_id === selectedId ? 3 : 2,
                                fillOpacity: 0.85
                            }}
                            eventHandlers={{ click: () => onSelect(st.station_id) }}
                        >
                            <Tooltip>
                                <div className="font-sans text-sm">
                                    <strong className="text-slate-900">{st.station_id}</strong>
                                    <br />
                                    <span className="text-slate-600">
                                        Batteries: <strong>{Math.round(st.available_batteries)}</strong>
                                    </span>
                                    {st.swaps_completed !== undefined && (
                                        <>
                                            <br />
                                            <span className="text-green-600">Swaps: {Math.round(st.swaps_completed)}</span>
                                        </>
                                    )}
                                    {st.lost_swaps !== undefined && st.lost_swaps > 0 && (
                                        <>
                                            <br />
                                            <span className="text-red-600">Lost: {Math.round(st.lost_swaps)}</span>
                                        </>
                                    )}
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    ))}

                    {/* Virtual Station Marker */}
                    {isVirtualStationActive && virtualStation && (
                        <CircleMarker
                            center={[virtualStation.lat, virtualStation.lon]}
                            radius={12}
                            pathOptions={{
                                fillColor: '#facc15', // Yellow
                                color: '#eab308',
                                weight: 3,
                                fillOpacity: 0.9
                            }}
                        >
                            <Tooltip permanent>
                                <div className="font-sans text-sm">
                                    <strong className="text-amber-600">🏗️ Proposed Station</strong>
                                    <br />
                                    <span className="text-slate-500 text-xs">(Simulated)</span>
                                    <br />
                                    <span className="text-slate-600">
                                        Est. Capacity: <strong>{virtualStation.capacity || 15}</strong>
                                    </span>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )}
                </MapContainer>
            </div>

            {/* Map Legend */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span>Healthy (10+ batteries)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                    <span>Low (5-9 batteries)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span>Critical (&lt;5 batteries)</span>
                </div>
                {isVirtualStationActive && (
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                        <span>Virtual (Proposed)</span>
                    </div>
                )}
                {pinnedLocation && (
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        <span>Pinned Location</span>
                    </div>
                )}
            </div>
        </div>
    );
}
