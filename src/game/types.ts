/**
 * Soviet Republic: Workers & Logistics (Edição Santa Esperança – BR)
 * Extended Type Definitions
 */

export type CurrencyType = 'reais' | 'dollars';

export interface ResourceAmount {
  resourceId: string;
  amountTons: number;
}

export type ConstructionStage = 'terraplanagem' | 'estrutura' | 'acabamento' | 'concluido';

export interface Building {
  id: string;
  type: string;
  name: string;
  x: number; // world coordinates
  z: number;
  rotation: number;
  width: number;
  depth: number;
  isConstructed: boolean;
  stage: ConstructionStage;
  progressPercent: number;
  requiredMaterials: Record<string, number>;
  deliveredMaterials: Record<string, number>;
  stageProgress: {
    terraplanagem: number; // 0 to 100
    estrutura: number;     // 0 to 100
    acabamento: number;    // 0 to 100
  };
  requiredWorkdays: number;
  currentWorkdays: number;
  assignedWorkers: number;
  maxWorkers: number;
  inventory: Record<string, number>;
  maxStorage: number;
  hasPower: boolean;
  powerRequiredMW: number;
  isCustoms?: boolean;
  connectedRoadId?: string;
  // Specific facility capacities
  maxVehicles?: number;
  assignedVehicleIds?: string[];
}

export interface RoadSegment {
  id: string;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  type: 'dirt' | 'gravel' | 'asphalt';
  isConstructed: boolean;
  progressPercent: number;
}

export type VehicleType =
  | 'dump_truck'
  | 'flatbed'
  | 'bus'
  | 'concrete_mixer'
  | 'box_truck'
  | 'semi_trailer'
  | 'log_truck'
  | 'van';

export interface RouteStop {
  buildingId: string;
  action: 'load' | 'unload';
  resourceId: string;
  targetPercent: number;
}

export interface AutomatedRoute {
  id: string;
  name: string;
  stops: RouteStop[];
  assignedVehicleIds: string[];
  isActive: boolean;
  totalTrips: number;
  tonsTransported: number;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  angle: number;
  speed: number;
  cargoResource?: string;
  cargoAmount: number;
  maxCapacity: number;
  fuel: number; // 0 to 100%
  status: 'idle' | 'loading' | 'traveling' | 'delivering' | 'returning' | 'no_road' | 'no_fuel';
  homeBuildingId: string;
  targetBuildingId?: string;
  path: [number, number][];
  pathIndex: number;
  passengers?: number;
  routeId?: string;
  currentStopIndex?: number;
  pitch?: number;
  roll?: number;
  wheelRotation?: number;
}

export interface FiveYearPlanTask {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  rewardReais: number;
  completed: boolean;
}

export interface GameNotification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
}
