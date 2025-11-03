import { Community } from '../types/db-types';

const EARTH_RADIUS_METERS = 6371e3;

/**
 * Calculates the distance between two geographic points using
 * the Haversine formula.
 *
 * @param coords1
 * An array representing the first coordinate.  This should
 * take the form [latitude, longitude], where both values use
 * decimal degrees, and negative values represent west/south.
 *
 * @param coords2
 * An array representing the second coordinate.  This should
 * take the form [latitude, longitude], where both values use
 * decimal degrees, and negative values represent west/south.
 *
 * @returns
 * The great-circle distance between the two coordinates in
 * meters.  This distance is measured around the surface of
 * the Earth, NOT as a straight line "through" the Earth.
 */
export function getDistanceBetweenCoordinates(
  coords1: [number, number],
  coords2: [number, number],
): number {
  // angles
  const phi1 = (coords1[0] * Math.PI) / 180;
  const phi2 = (coords2[0] * Math.PI) / 180;
  const deltaPhi = ((coords2[0] - coords1[0]) * Math.PI) / 180;
  const deltaLambda = ((coords2[1] - coords1[1]) * Math.PI) / 180;

  // haversine formula
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function getCommunitiesInRange(
  location: [number, number],
  possibleCommunities: Community[],
): Community[] {
  return possibleCommunities.filter(
    (community) =>
      getDistanceBetweenCoordinates(location, community.geographicCenter) <=
      community.radiusMeters,
  );
}
