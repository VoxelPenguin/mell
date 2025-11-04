import { Resource } from 'harperdb';
import { getCommunitiesInRange } from '../helpers/location-helpers';
import { RequestTarget } from '../node_modules/harperdb/resources/RequestTarget';
import { Community } from '../types/db-types';

const { Community: CommunityTable } = tables;

export class Location extends Resource {
  static override loadAsInstance = false; // enable the updated API

  override async get(target: RequestTarget) {
    const latitudeString = target.get('latitude');
    const longitudeString = target.get('longitude');

    if (!latitudeString || !longitudeString) {
      throw new Error('Latitude or longitude was not provided');
    }

    const latitude = +latitudeString;
    const longitude = +longitudeString;

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new Error(
        'The provided latitude and/or longitude was not a number',
      );
    }

    const asyncNearestCommunities: AsyncIterable<Community> =
      CommunityTable.search({
        sort: {
          attribute: 'geographicCenter',
          // @ts-expect-error: this is pulled directly from the docs, but the types
          // don't seem to be supported for vector indexing.
          // https://docs.harperdb.io/docs/developers/applications/defining-schemas#vector-indexing
          target: [latitude, longitude],
        },
        limit: 5,
      });

    const nearestCommunities = await Array.fromAsync(asyncNearestCommunities);

    return getCommunitiesInRange([latitude, longitude], nearestCommunities);
  }
}
