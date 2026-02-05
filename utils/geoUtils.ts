import { LocationData } from '../types';

// Calculate Haversine distance between two points in kilometers
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Optimizes route with fixed start and fixed end.
 * Logic: Start at locations[0], visit all intermediate stops using Nearest Neighbor, 
 * and always end at the last location provided.
 */
export const optimizeRouteLocations = (locations: LocationData[]): LocationData[] => {
  if (locations.length <= 2) return locations;

  const start = locations[0];
  const end = locations[locations.length - 1];
  const intermediate = locations.slice(1, -1);
  
  const optimized: LocationData[] = [start];
  const unvisited = new Set(intermediate);
  let current = start;

  while (unvisited.size > 0) {
    let nearest: LocationData | null = null;
    let minDistance = Infinity;

    for (const loc of unvisited) {
      if (current.lat !== undefined && current.lng !== undefined && loc.lat !== undefined && loc.lng !== undefined) {
        const dist = getDistance(current.lat, current.lng, loc.lat, loc.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = loc;
        }
      } else {
         nearest = loc;
         minDistance = 0;
         break;
      }
    }

    if (nearest) {
      optimized.push(nearest);
      unvisited.delete(nearest);
      current = nearest;
    } else {
      break;
    }
  }

  // Always append the fixed end point at the very last position
  optimized.push(end);

  return optimized;
};

export const generateGoogleMapsUrl = (locations: LocationData[]): string => {
  if (locations.length === 0) return 'https://www.google.com/maps';

  const baseUrl = 'https://www.google.com/maps/dir/';
  
  const path = locations.map(loc => {
    if (loc.address) {
      return encodeURIComponent(loc.address);
    } else if (loc.lat && loc.lng) {
      return `${loc.lat},${loc.lng}`;
    } else {
      return encodeURIComponent(loc.originalInput);
    }
  }).join('/');

  return `${baseUrl}${path}`;
};