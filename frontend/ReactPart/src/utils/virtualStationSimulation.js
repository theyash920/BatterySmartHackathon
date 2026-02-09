/**
 * Virtual Station Simulation Utilities
 * Handles demand redistribution calculations when a virtual station is added
 */

/**
 * Generate a virtual station position within 2km of the selected station
 * @param {Object} selectedStation - The station object with lat/lon
 * @returns {Object} Virtual station with lat, lon, and metadata
 */
export function generateVirtualStationPosition(selectedStation) {
  if (!selectedStation || !selectedStation.lat || !selectedStation.lon) {
    return null;
  }

  // Generate a random angle (0-360 degrees)
  const angle = Math.random() * 2 * Math.PI;

  // Generate a random distance between 0.8km and 1.8km (within 2km but not too close)
  const distanceKm = 0.8 + Math.random() * 1.0;

  // Convert distance to degrees (rough approximation)
  // 1 degree of latitude ≈ 111 km
  // 1 degree of longitude varies by latitude, but we'll use a simple approximation
  const latOffset = (distanceKm / 111) * Math.cos(angle);
  const lonOffset = (distanceKm / (111 * Math.cos(selectedStation.lat * Math.PI / 180))) * Math.sin(angle);

  return {
    station_id: 'VIRTUAL_STATION_001',
    lat: selectedStation.lat + latOffset,
    lon: selectedStation.lon + lonOffset,
    isVirtual: true,
    capacity: 15,
    parent_station: selectedStation.station_id,
    distance_km: distanceKm.toFixed(2)
  };
}

/**
 * Calculate the KPI impact of adding a virtual station
 * Uses a spatial demand redistribution model based on station capacity
 * @param {Object} currentKpis - Current KPI values (from scenario or baseline)
 * @param {Object} selectedStation - The selected parent station
 * @param {Object} virtualStation - The generated virtual station
 * @returns {Object} New KPI values after virtual station addition
 */
export function calculateVirtualStationImpact(currentKpis, selectedStation, virtualStation) {
  if (!currentKpis || !virtualStation) {
    return null;
  }

  // Get current values
  const currentLostSwaps = currentKpis.total_lost_swaps || 0;
  const currentTotalSwaps = currentKpis.total_swaps || 0;
  const currentSuccessRate = currentKpis.success_rate || 0;
  const currentAvgAvailability = currentKpis.avg_battery_availability || 0;
  const currentWaitTime = currentKpis.avg_wait_time_mins || 15;

  // Virtual station capacity-based calculation
  // A station with capacity X can serve roughly 3-4 swaps per slot per day (with charging cycles)
  const stationCapacity = virtualStation.capacity || 15;
  const swapsPerSlotPerDay = 3.5; // Average throughput per battery slot per day
  const maxNewDailySwaps = Math.round(stationCapacity * swapsPerSlotPerDay);

  // A new station within 2km can absorb significant portion of lost demand
  // AND can offload existing demand from overloaded stations
  // Absorption factor: 80-95% of lost swaps OR station's max capacity, whichever is lower
  const absorptionFactor = 0.80 + Math.random() * 0.15; // 80-95%

  // Calculate absorbed demand - can absorb most lost swaps, limited by new station capacity
  const potentialAbsorption = Math.round(currentLostSwaps * absorptionFactor);
  const absorbedLostSwaps = Math.min(potentialAbsorption, maxNewDailySwaps);

  // Additionally, new station can offload some existing successful swaps from congested stations
  // This further reduces load on existing stations, improving their availability
  const offloadFactor = 0.15 + Math.random() * 0.10; // 15-25% offload from existing
  const offloadedSwaps = Math.round(currentTotalSwaps * offloadFactor);

  // New KPI calculations
  // Lost swaps are significantly reduced
  const newLostSwaps = Math.max(0, currentLostSwaps - absorbedLostSwaps);

  // Total swaps increase: absorbed lost + some new capacity utilization
  // The new station enables more total demand to be served
  const totalNewSwaps = absorbedLostSwaps + Math.round(offloadedSwaps * 0.3); // Small growth effect
  const newTotalSwaps = currentTotalSwaps + totalNewSwaps;

  // Success rate improvement - should be dramatic with a new station
  const totalDemand = currentTotalSwaps + currentLostSwaps;
  const newSuccessRate = totalDemand > 0
    ? (newTotalSwaps / (newTotalSwaps + newLostSwaps)) * 100
    : currentSuccessRate;

  // Availability improvement - significant since load is now distributed
  // With load spread across more stations, each station maintains higher inventory
  const loadReductionFactor = 1 + (stationCapacity / 20); // More capacity = better distribution
  const availabilityIncrement = 3.0 + Math.random() * 3.0 * loadReductionFactor; // 3-9+ units
  const newAvgAvailability = currentAvgAvailability + availabilityIncrement;

  // Wait time reduction - proportional to how much lost demand is eliminated
  // More capacity = shorter queues = lower wait times
  const lostSwapsReductionRatio = currentLostSwaps > 0
    ? absorbedLostSwaps / currentLostSwaps
    : 0;
  const waitTimeReductionFactor = 0.4 + (lostSwapsReductionRatio * 0.4); // 40-80% reduction
  const newWaitTime = Math.max(3, currentWaitTime * (1 - waitTimeReductionFactor));

  return {
    total_swaps: newTotalSwaps,
    total_lost_swaps: newLostSwaps,
    success_rate: Math.min(100, newSuccessRate),
    avg_battery_availability: newAvgAvailability,
    avg_wait_time_mins: Math.round(newWaitTime * 10) / 10,
    // Metadata
    absorption_factor: absorptionFactor,
    absorbed_demand: absorbedLostSwaps,
    station_capacity: stationCapacity,
    max_daily_capacity: maxNewDailySwaps,
    improvement_summary: {
      lost_swaps_reduction: currentLostSwaps - newLostSwaps,
      swaps_increase: totalNewSwaps,
      success_rate_improvement: newSuccessRate - currentSuccessRate,
      wait_time_reduction: currentWaitTime - newWaitTime
    }
  };
}

/**
 * Calculate haversine distance between two points
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate ownership model recommendation (POPO vs COCO)
 * @param {Object} virtualStation - The virtual station data
 * @param {Array} allStations - All existing stations in the network
 * @returns {Object} Ownership recommendation with model, reason, and benefits
 */
export function calculateOwnershipModel(virtualStation, allStations) {
  if (!virtualStation || !allStations || allStations.length === 0) {
    return {
      model: 'COCO',
      fullName: 'Company Owned Company Operated',
      reason: 'No existing stations data available - default to company ownership.',
      benefits: ['Full control over operations', 'Direct quality assurance', 'Faster decision making']
    };
  }

  // Count stations within 2km radius
  const nearbyStations = allStations.filter(station => {
    if (!station.lat || !station.lon) return false;
    const distance = haversineDistance(
      virtualStation.lat, virtualStation.lon,
      station.lat, station.lon
    );
    return distance <= 2.0;
  });

  const nearbyCount = nearbyStations.length;

  if (nearbyCount >= 3) {
    // POPO: Dense station network nearby - partner model is better
    return {
      model: 'POPO',
      fullName: 'Partner Owned Partner Operated',
      nearbyStationCount: nearbyCount,
      reason: `${nearbyCount} existing stations within 2km radius. High-density area suitable for partner model - leverages local expertise and existing customer relationships.`,
      benefits: [
        'Lower capital investment for company',
        'Partner has local market knowledge',
        'Faster deployment timeline',
        'Shared operational risk',
        'Partner incentivized for performance'
      ],
      financials: {
        estimatedSetupCost: '₹3-5 Lakhs (partner bears)',
        revenueShare: '70% Partner / 30% Company',
        breakeven: '6-9 months'
      }
    };
  } else {
    // COCO: Less than 3 stations - company should own to establish presence
    const reasonText = nearbyCount === 0
      ? 'Greenfield location with no existing stations nearby. Company ownership ensures brand standards in new market.'
      : `Only ${nearbyCount} station(s) within 2km radius. Emerging market area - company ownership recommended to establish strong brand presence before partnering.`;

    return {
      model: 'COCO',
      fullName: 'Company Owned Company Operated',
      nearbyStationCount: nearbyCount,
      reason: reasonText,
      benefits: [
        'Full control over customer experience',
        'Higher long-term margins',
        'Direct data ownership',
        'Brand building in new area',
        'Flexibility in operations'
      ],
      financials: {
        estimatedSetupCost: '₹15-20 Lakhs',
        revenueShare: '100% Company',
        breakeven: '12-18 months'
      }
    };
  }
}

/**
 * Generate AI insight text for virtual station simulation
 * @param {Object} impact - The calculated impact from calculateVirtualStationImpact
 * @param {Object} virtualStation - The virtual station data
 * @param {Object} ownershipModel - Optional ownership recommendation
 * @returns {string} AI insight recommendation text
 */
export function generateVirtualStationInsight(impact, virtualStation, ownershipModel = null) {
  if (!impact || !virtualStation) {
    return null;
  }

  const { improvement_summary, absorption_factor, absorbed_demand, station_capacity, max_daily_capacity } = impact;
  const lostSwapsReduction = improvement_summary?.lost_swaps_reduction || 0;
  const successRateImprovement = improvement_summary?.success_rate_improvement || 0;
  const waitTimeReduction = improvement_summary?.wait_time_reduction || 0;

  const insights = [
    `💡 AI Insight: A new station (${station_capacity} capacity, ~${max_daily_capacity} swaps/day potential) provides significantly more capacity than adding chargers to existing stations.`,
    ``,
    `📊 Simulation Results:`,
    `• ${Math.round((absorption_factor || 0.85) * 100)}% of unmet demand absorbed`,
    `• ${absorbed_demand} additional swaps captured`,
    `• Lost swaps reduced by ${lostSwapsReduction.toFixed(0)}`,
    `• Success rate improved by ${successRateImprovement.toFixed(1)}%`,
    `• Wait time reduced by ${waitTimeReduction.toFixed(1)} min`,
    ``
  ];

  // Add ownership model recommendation if provided
  if (ownershipModel) {
    insights.push(`🏢 Ownership Recommendation: ${ownershipModel.model}`);
    insights.push(`   ${ownershipModel.fullName}`);
    insights.push(`   ${ownershipModel.reason}`);
    insights.push(``);
  }

  insights.push(`🎯 Recommendation: This location (${virtualStation.distance_km} km from ${virtualStation.parent_station}) shows strong potential for a new station deployment.`);

  return insights.join('\n');
}

