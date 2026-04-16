import { ATLANTIC_COAST_STATES, PACIFIC_COAST_STATES, US_REGIONS } from '@/constants/regions';
import { useMemo } from 'react';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number; // used for ordering / display
  unlocked: boolean;
}

export function useMilestones(visitedStates: Set<string>): Milestone[] {
  return useMemo(() => {
    const count = visitedStates.size;

    const hasCoastToCoast =
      PACIFIC_COAST_STATES.some((s) => visitedStates.has(s)) &&
      ATLANTIC_COAST_STATES.some((s) => visitedStates.has(s));

    const allRegionsCovered = US_REGIONS.every((r) =>
      r.states.some((s) => visitedStates.has(s)),
    );

    return [
      {
        id: 'first-step',
        title: 'First Step',
        description: 'Visit your first state',
        icon: 'sprout',
        threshold: 1,
        unlocked: count >= 1,
      },
      {
        id: 'explorer',
        title: 'Explorer',
        description: 'Visit 10 states',
        icon: 'map-search',
        threshold: 10,
        unlocked: count >= 10,
      },
      {
        id: 'all-regions',
        title: 'Four Corners',
        description: 'Visit a state in every region',
        icon: 'compass-rose',
        threshold: 15,
        unlocked: allRegionsCovered,
      },
      {
        id: 'halfway',
        title: 'Halfway There',
        description: 'Visit 26 states',
        icon: 'star-four-points',
        threshold: 26,
        unlocked: count >= 26,
      },
      {
        id: 'coast-to-coast',
        title: 'Coast to Coast',
        description: 'Visit states on both coasts',
        icon: 'waves',
        threshold: 30,
        unlocked: hasCoastToCoast,
      },
      {
        id: 'all-51',
        title: 'All 51',
        description: 'Visit every state & DC',
        icon: 'crown',
        threshold: 51,
        unlocked: count >= 51,
      },
    ];
  }, [visitedStates]);
}

/**
 * Returns newly unlocked milestone IDs by comparing previous and current visited states.
 */
export function getNewlyUnlockedMilestones(
  prevCount: number,
  newCount: number,
  prevVisited: Set<string>,
  newVisited: Set<string>,
): string[] {
  const result: string[] = [];

  if (prevCount < 1 && newCount >= 1) result.push('first-step');
  if (prevCount < 10 && newCount >= 10) result.push('explorer');
  if (prevCount < 26 && newCount >= 26) result.push('halfway');
  if (prevCount < 51 && newCount >= 51) result.push('all-51');

  const hadPacific = PACIFIC_COAST_STATES.some((s) => prevVisited.has(s));
  const hadAtlantic = ATLANTIC_COAST_STATES.some((s) => prevVisited.has(s));
  const hasPacific = PACIFIC_COAST_STATES.some((s) => newVisited.has(s));
  const hasAtlantic = ATLANTIC_COAST_STATES.some((s) => newVisited.has(s));
  if (!(hadPacific && hadAtlantic) && hasPacific && hasAtlantic) {
    result.push('coast-to-coast');
  }

  const prevAllRegions = US_REGIONS.every((r) => r.states.some((s) => prevVisited.has(s)));
  const newAllRegions = US_REGIONS.every((r) => r.states.some((s) => newVisited.has(s)));
  if (!prevAllRegions && newAllRegions) result.push('all-regions');

  return result;
}
