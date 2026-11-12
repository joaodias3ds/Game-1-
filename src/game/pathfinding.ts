/**
 * Soviet Republic: Workers & Logistics
 * Road Graph Network & A* Pathfinding (Ensures vehicles travel strictly along roads)
 */

import { RoadSegment } from './types';

interface GraphNode {
  id: string;
  x: number;
  z: number;
  neighbors: { node: GraphNode; distance: number }[];
}

export function buildRoadGraph(roads: RoadSegment[]): Map<string, GraphNode> {
  const nodes = new Map<string, GraphNode>();

  const getNodeKey = (x: number, z: number): string => {
    // Snap to 0.5 units to merge adjacent road endpoints
    const sx = Math.round(x * 2) / 2;
    const sz = Math.round(z * 2) / 2;
    return `${sx.toFixed(1)},${sz.toFixed(1)}`;
  };

  const getOrCreateNode = (x: number, z: number): GraphNode => {
    const key = getNodeKey(x, z);
    let node = nodes.get(key);
    if (!node) {
      node = { id: key, x, z, neighbors: [] };
      nodes.set(key, node);
    }
    return node;
  };

  for (const road of roads) {
    if (!road.isConstructed) continue; // Unconstructed roads cannot be traversed

    const n1 = getOrCreateNode(road.x1, road.z1);
    const n2 = getOrCreateNode(road.x2, road.z2);

    const dist = Math.hypot(n2.x - n1.x, n2.z - n1.z);

    // Bidirectional road connection
    if (!n1.neighbors.some((nbr) => nbr.node.id === n2.id)) {
      n1.neighbors.push({ node: n2, distance: dist });
    }
    if (!n2.neighbors.some((nbr) => nbr.node.id === n1.id)) {
      n2.neighbors.push({ node: n1, distance: dist });
    }
  }

  return nodes;
}

/**
 * Finds the closest road node within maxDistance
 */
export function findNearestRoadNode(
  x: number,
  z: number,
  nodes: Map<string, GraphNode>,
  maxDistance = 25
): GraphNode | null {
  let bestNode: GraphNode | null = null;
  let bestDist = maxDistance;

  for (const node of nodes.values()) {
    const d = Math.hypot(node.x - x, node.z - z);
    if (d < bestDist) {
      bestDist = d;
      bestNode = node;
    }
  }

  return bestNode;
}

/**
 * A* Pathfinding along connected road segments
 */
export function findRoadPath(
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  roads: RoadSegment[]
): [number, number][] | null {
  const graph = buildRoadGraph(roads);
  if (graph.size === 0) return null;

  const startNode = findNearestRoadNode(startX, startZ, graph, 30);
  const endNode = findNearestRoadNode(endX, endZ, graph, 30);

  if (!startNode || !endNode) {
    return null; // Cannot reach road network
  }

  if (startNode.id === endNode.id) {
    return [
      [startX, startZ],
      [startNode.x, startNode.z],
      [endX, endZ],
    ];
  }

  // A* implementation
  const openSet = new Set<string>([startNode.id]);
  const cameFrom = new Map<string, GraphNode>();

  const gScore = new Map<string, number>();
  gScore.set(startNode.id, 0);

  const fScore = new Map<string, number>();
  fScore.set(startNode.id, Math.hypot(endNode.x - startNode.x, endNode.z - startNode.z));

  while (openSet.size > 0) {
    // Get node with lowest fScore
    let currentId: string | null = null;
    let lowestF = Infinity;

    for (const id of openSet) {
      const f = fScore.get(id) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentId = id;
      }
    }

    if (!currentId) break;

    if (currentId === endNode.id) {
      // Reconstruct path
      const pathNodes: [number, number][] = [];
      let curr: GraphNode | undefined = endNode;
      while (curr) {
        pathNodes.unshift([curr.x, curr.z]);
        curr = cameFrom.get(curr.id);
      }

      // Prepend exact start and append exact destination
      return [
        [startX, startZ],
        ...pathNodes,
        [endX, endZ],
      ];
    }

    openSet.delete(currentId);
    const currentNode = graph.get(currentId)!;

    for (const { node: neighbor, distance } of currentNode.neighbors) {
      const tentativeG = (gScore.get(currentId) ?? Infinity) + distance;
      if (tentativeG < (gScore.get(neighbor.id) ?? Infinity)) {
        cameFrom.set(neighbor.id, currentNode);
        gScore.set(neighbor.id, tentativeG);
        fScore.set(neighbor.id, tentativeG + Math.hypot(endNode.x - neighbor.x, endNode.z - neighbor.z));
        openSet.add(neighbor.id);
      }
    }
  }

  // No connected road path found
  return null;
}
