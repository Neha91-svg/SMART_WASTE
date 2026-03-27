/**
 * Route Optimization using Dijkstra's Algorithm + Nearest-Neighbor TSP Heuristic
 * 
 * This module implements:
 * 1. Haversine distance calculation between GPS coordinates
 * 2. Graph construction from waste locations
 * 3. Dijkstra's shortest path algorithm
 * 4. Nearest-neighbor heuristic for solving the Traveling Salesman Problem (TSP)
 * 5. Priority-based sorting (High > Medium > Low waste levels)
 * 6. Efficiency comparison between fixed and optimized routes
 */

// ============================================================
// HAVERSINE DISTANCE: Compute real-world distance between GPS points
// ============================================================
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// ============================================================
// PRIORITY WEIGHT: Assign priority weights based on waste level
// ============================================================
function getPriorityWeight(wasteLevel) {
  switch (wasteLevel) {
    case 'High': return 1;    // Highest priority (visit first)
    case 'Medium': return 2;
    case 'Low': return 3;     // Lowest priority
    default: return 2;
  }
}

// ============================================================
// GRAPH BUILDER: Create adjacency matrix from locations
// ============================================================
function buildGraph(locations) {
  const n = locations.length;
  const graph = Array.from({ length: n }, () => Array(n).fill(Infinity));

  for (let i = 0; i < n; i++) {
    graph[i][i] = 0;
    for (let j = i + 1; j < n; j++) {
      const dist = haversineDistance(
        locations[i].lat, locations[i].lng,
        locations[j].lat, locations[j].lng
      );
      graph[i][j] = dist;
      graph[j][i] = dist;
    }
  }
  return graph;
}

// ============================================================
// DIJKSTRA'S ALGORITHM: Find shortest path from source to all nodes
// ============================================================
function dijkstra(graph, source) {
  const n = graph.length;
  const dist = Array(n).fill(Infinity);
  const visited = Array(n).fill(false);
  const prev = Array(n).fill(-1);

  dist[source] = 0;

  for (let count = 0; count < n; count++) {
    // Find unvisited node with minimum distance (priority queue simulation)
    let u = -1;
    let minDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < minDist) {
        minDist = dist[i];
        u = i;
      }
    }
    if (u === -1) break;

    visited[u] = true;

    // Update distances to neighboring nodes
    for (let v = 0; v < n; v++) {
      if (!visited[v] && graph[u][v] !== Infinity) {
        const newDist = dist[u] + graph[u][v];
        if (newDist < dist[v]) {
          dist[v] = newDist;
          prev[v] = u;
        }
      }
    }
  }

  return { dist, prev };
}

// ============================================================
// NEAREST-NEIGHBOR TSP: Visit all nodes using greedy nearest approach
// with priority weighting (High waste locations visited first)
// ============================================================
function nearestNeighborTSP(locations, graph, startIndex = 0) {
  const n = locations.length;
  const visited = Array(n).fill(false);
  const route = [startIndex];
  visited[startIndex] = true;
  let totalDistance = 0;
  let current = startIndex;

  for (let step = 1; step < n; step++) {
    let nearest = -1;
    let nearestScore = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        // Score = distance * priority weight
        // High priority locations get lower scores → visited sooner
        const priority = getPriorityWeight(locations[j].wasteLevel || 'Medium');
        const score = graph[current][j] * (priority * 0.5);

        if (score < nearestScore) {
          nearestScore = score;
          nearest = j;
        }
      }
    }

    if (nearest !== -1) {
      visited[nearest] = true;
      totalDistance += graph[current][nearest];
      route.push(nearest);
      current = nearest;
    }
  }

  return { route, totalDistance };
}

// ============================================================
// FIXED ROUTE: Sequential visit order (baseline for comparison)
// ============================================================
function calculateFixedRoute(locations, graph) {
  let totalDistance = 0;
  const route = locations.map((_, i) => i);

  for (let i = 0; i < locations.length - 1; i++) {
    totalDistance += graph[i][i + 1];
  }

  return { route, totalDistance };
}

// ============================================================
// MAIN OPTIMIZER: Combines all steps to produce optimized route
// ============================================================
function optimizeRoute(wasteLocations, truckStart) {
  if (!wasteLocations || wasteLocations.length === 0) {
    return { error: 'No waste locations provided' };
  }

  // Combine truck start with waste locations
  const allLocations = [
    { lat: truckStart.lat, lng: truckStart.lng, wasteLevel: 'Low', label: 'Truck Start' },
    ...wasteLocations.map(loc => ({
      lat: loc.location ? loc.location.lat : loc.lat,
      lng: loc.location ? loc.location.lng : loc.lng,
      wasteLevel: loc.wasteLevel || 'Medium',
      label: loc.address || loc.label || 'Waste Point'
    }))
  ];

  // Build distance graph
  const graph = buildGraph(allLocations);

  // Run Dijkstra from truck start (node 0)
  const dijkstraResult = dijkstra(graph, 0);

  // Solve TSP using nearest-neighbor with priority weighting
  const optimized = nearestNeighborTSP(allLocations, graph, 0);

  // Calculate fixed (sequential) route for comparison
  const fixed = calculateFixedRoute(allLocations, graph);

  // Average truck speed: 30 km/h in city
  const AVG_SPEED = 30;
  const FUEL_PER_KM = 0.15; // liters per km

  const optimizedTime = (optimized.totalDistance / AVG_SPEED) * 60; // minutes
  const fixedTime = (fixed.totalDistance / AVG_SPEED) * 60;

  const distanceSaved = fixed.totalDistance - optimized.totalDistance;
  const timeSaved = fixedTime - optimizedTime;
  const fuelSaved = distanceSaved * FUEL_PER_KM;

  // Build ordered coordinates for the optimized route
  const optimizedCoordinates = optimized.route.map(index => ({
    lat: allLocations[index].lat,
    lng: allLocations[index].lng,
    label: allLocations[index].label,
    wasteLevel: allLocations[index].wasteLevel
  }));

  return {
    optimizedRoute: optimizedCoordinates,
    fixedRoute: fixed.route.map(index => ({
      lat: allLocations[index].lat,
      lng: allLocations[index].lng,
      label: allLocations[index].label
    })),
    metrics: {
      optimizedDistance: Math.round(optimized.totalDistance * 100) / 100,
      fixedDistance: Math.round(fixed.totalDistance * 100) / 100,
      distanceSaved: Math.round(distanceSaved * 100) / 100,
      optimizedTime: Math.round(optimizedTime),
      fixedTime: Math.round(fixedTime),
      timeSaved: Math.round(timeSaved),
      fuelSaved: Math.round(fuelSaved * 100) / 100,
      distanceImprovement: fixed.totalDistance > 0
        ? Math.round((distanceSaved / fixed.totalDistance) * 100)
        : 0,
      timeImprovement: fixedTime > 0
        ? Math.round((timeSaved / fixedTime) * 100)
        : 0,
      totalStops: wasteLocations.length,
      highPriorityStops: wasteLocations.filter(l => (l.wasteLevel || l.wasteLevel) === 'High').length
    },
    dijkstraDistances: dijkstraResult.dist.slice(1) // distances from start to each node
  };
}

module.exports = { optimizeRoute, haversineDistance, dijkstra, buildGraph };
