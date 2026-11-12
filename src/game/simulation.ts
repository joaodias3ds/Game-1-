/**
 * Soviet Republic: Workers & Logistics (Edição Desenvolvimento & Logística Nacional)
 * Complete game simulation state and loop with Route Manager & Road Pathfinding
 */

import {
  Building,
  RoadSegment,
  Vehicle,
  AutomatedRoute,
  FiveYearPlanTask,
  GameNotification,
} from './types';
import {
  BUILDING_BLUEPRINTS,
  calculateTrade,
  canImportResource,
  canStartConstruction,
  advanceMultiStageConstruction,
  processIndustrialProduction,
} from './rules';
import { findRoadPath } from './pathfinding';
import { sound } from './sound';

export interface GameState {
  fundsReais: number;
  fundsDollars: number;
  gameDays: number;
  speed: number;
  windSpeed: number;
  population: number;
  availableWorkers: number;
  foreignWorkersAtCustoms: number;
  healthPercent: number;
  happinessPercent: number;
  buildings: Building[];
  roads: RoadSegment[];
  vehicles: Vehicle[];
  routes: AutomatedRoute[];
  fiveYearTasks: FiveYearPlanTask[];
  notifications: GameNotification[];
  selectedBuildingId: string | null;
  selectedVehicleId: string | null;
  isCustomsOpen: boolean;
  isRouteManagerOpen: boolean;
  activeBuildTool: string | null;
}

export function createInitialGameState(): GameState {
  const initialBuildings: Building[] = [
    // 1. Posto de Fronteira & Alfândega Interestadual
    {
      id: 'customs_zhodcaw',
      type: 'posto_alfandegario',
      name: 'Posto de Fronteira & Alfândega Interestadual',
      x: 0,
      z: -38,
      rotation: 0,
      width: 4,
      depth: 3,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 15,
      maxWorkers: 50,
      inventory: {
        brita: 150,
        aco: 80,
        paineis_pre: 100,
        cimento: 70,
        carvao: 120,
        combustivel: 250,
        alimentos: 100,
      },
      maxStorage: 1000,
      hasPower: true,
      powerRequiredMW: 0,
      isCustoms: true,
    },
    // 2. Escritório de Construção Estatal (CO)
    {
      id: 'bld_co_1',
      type: 'escritorio_construcao',
      name: 'Escritório de Obras & Construção nº 1',
      x: 14,
      z: -18,
      rotation: 0,
      width: 3,
      depth: 2,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 10,
      maxWorkers: 15,
      inventory: {
        combustivel: 80,
      },
      maxStorage: 200,
      hasPower: true,
      powerRequiredMW: 0.25,
    },
    // 3. Posto de Abastecimento Diesel (Gas station)
    {
      id: 'bld_fuel_1',
      type: 'posto_combustivel',
      name: 'Posto de Abastecimento Diesel Petrobrás',
      x: 6,
      z: -18,
      rotation: 0,
      width: 2,
      depth: 1,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 4,
      maxWorkers: 6,
      inventory: {
        combustivel: 180,
      },
      maxStorage: 250,
      hasPower: true,
      powerRequiredMW: 0.15,
    },
    // 4. Galpão de Carga & Armazém Geral
    {
      id: 'bld_warehouse_1',
      type: 'armazem_geral',
      name: 'Galpão de Distribuição Central',
      x: -12,
      z: -18,
      rotation: 0,
      width: 2,
      depth: 2,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 6,
      maxWorkers: 10,
      inventory: {
        brita: 40,
        cimento: 25,
        aco: 15,
      },
      maxStorage: 300,
      hasPower: true,
      powerRequiredMW: 0.15,
    },
    // 5. Canteiro de Obras: Habitação Popular Bloco 101 (Multi-stage)
    {
      id: 'bld_khrush_1',
      type: 'khrushchevka_small',
      name: 'Conjunto Habitacional Popular Bloco 101',
      x: -18,
      z: 6,
      rotation: 0,
      width: 2,
      depth: 2,
      isConstructed: false,
      stage: 'estrutura',
      progressPercent: 42,
      requiredMaterials: { brita: 15, aco: 8, paineis_pre: 35, cimento: 10 },
      deliveredMaterials: { brita: 15, aco: 6, paineis_pre: 10, cimento: 6 },
      stageProgress: { terraplanagem: 100, estrutura: 55, acabamento: 0 },
      requiredWorkdays: 220,
      currentWorkdays: 85,
      assignedWorkers: 8,
      maxWorkers: 0,
      inventory: {},
      maxStorage: 50,
      hasPower: false,
      powerRequiredMW: 0.15,
    },
    // 6. Pedreira Nacional a Céu Aberto
    {
      id: 'bld_quarry_1',
      type: 'pedreira',
      name: 'Pedreira Nacional a Céu Aberto',
      x: 22,
      z: 14,
      rotation: 0,
      width: 3,
      depth: 3,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: { brita: 10, aco: 5, cimento: 8 },
      deliveredMaterials: { brita: 10, aco: 5, cimento: 8 },
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 150,
      currentWorkdays: 150,
      assignedWorkers: 10,
      maxWorkers: 25,
      inventory: { pedra: 65 },
      maxStorage: 200,
      hasPower: true,
      powerRequiredMW: 0.10,
    },
    // 7. Usina de Britagem & Cascalho
    {
      id: 'bld_crusher_1',
      type: 'britador',
      name: 'Usina de Britagem & Cascalho',
      x: 12,
      z: 14,
      rotation: 0,
      width: 2,
      depth: 2,
      isConstructed: false,
      stage: 'acabamento',
      progressPercent: 78,
      requiredMaterials: { brita: 20, aco: 15, paineis_pre: 10, cimento: 12 },
      deliveredMaterials: { brita: 20, aco: 15, paineis_pre: 8, cimento: 12 },
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 45 },
      requiredWorkdays: 260,
      currentWorkdays: 195,
      assignedWorkers: 6,
      maxWorkers: 20,
      inventory: { pedra: 15, brita: 10 },
      maxStorage: 200,
      hasPower: true,
      powerRequiredMW: 0.40,
    },
    // 8. Monumento aos Construtores da Pátria
    {
      id: 'bld_lenin_1',
      type: 'monumento_lenin',
      name: 'Monumento aos Construtores da Pátria',
      x: -18,
      z: -2,
      rotation: 0,
      width: 1,
      depth: 1,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 0,
      maxWorkers: 0,
      inventory: {},
      maxStorage: 0,
      hasPower: true,
      powerRequiredMW: 0.02,
    },
    // 9. Centro de Distribuição Regional (Fiel à image_d92ebf14.png)
    {
      id: 'bld_cd_1',
      type: 'centro_distribuicao',
      name: 'Centro de Distribuição Municipal',
      x: -14,
      z: -6,
      rotation: 0,
      width: 4,
      depth: 3,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 12,
      maxWorkers: 35,
      inventory: {
        alimentos: 45,
        combustivel: 85,
        aco: 20,
      },
      maxStorage: 800,
      hasPower: true,
      powerRequiredMW: 0.45,
      maxVehicles: 18,
    },
    // 10. Bateria de Silos Graneleiros Metálicos
    {
      id: 'bld_silo_1',
      type: 'silo',
      name: 'Bateria de Silos Graneleiros',
      x: -14,
      z: 12,
      rotation: 0,
      width: 2,
      depth: 2,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 6,
      maxWorkers: 10,
      inventory: {
        plantacoes: 140,
      },
      maxStorage: 700,
      hasPower: true,
      powerRequiredMW: 0.25,
      maxVehicles: 6,
    },
    // 11. Fazenda Agrícola & Lavoura de Soja/Milho
    {
      id: 'bld_farm_1',
      type: 'fazenda_graos',
      name: 'Fazenda & Lavoura de Soja Santa Fé',
      x: -28,
      z: 12,
      rotation: 0,
      width: 4,
      depth: 3,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 14,
      maxWorkers: 25,
      inventory: {
        plantacoes: 85,
      },
      maxStorage: 300,
      hasPower: true,
      powerRequiredMW: 0.15,
      maxVehicles: 8,
    },
    // 12. Serraria Industrial & Madeireira
    {
      id: 'bld_sawmill_1',
      type: 'serraria',
      name: 'Serraria Industrial & Madeireira',
      x: 22,
      z: -6,
      rotation: 0,
      width: 3,
      depth: 2,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 10,
      maxWorkers: 22,
      inventory: {
        toras_madeira: 30,
        madeira: 20,
      },
      maxStorage: 300,
      hasPower: true,
      powerRequiredMW: 0.35,
      maxVehicles: 8,
    },
    // 13. Horto Florestal & Reflorestamento Sustentável
    {
      id: 'bld_forestry_1',
      type: 'reflorestamento',
      name: 'Horto Florestal de Eucalipto & Pinus',
      x: 32,
      z: -6,
      rotation: 0,
      width: 3,
      depth: 3,
      isConstructed: true,
      stage: 'concluido',
      progressPercent: 100,
      requiredMaterials: {},
      deliveredMaterials: {},
      stageProgress: { terraplanagem: 100, estrutura: 100, acabamento: 100 },
      requiredWorkdays: 0,
      currentWorkdays: 0,
      assignedWorkers: 8,
      maxWorkers: 18,
      inventory: {
        toras_madeira: 55,
      },
      maxStorage: 200,
      hasPower: true,
      powerRequiredMW: 0.05,
      maxVehicles: 6,
    },
  ];

  const initialRoads: RoadSegment[] = [
    // Rodovia Federal de acesso da Alfândega
    { id: 'road_0', x1: 0, z1: -38, x2: 0, z2: -25, type: 'asphalt', isConstructed: true, progressPercent: 100 },
    { id: 'road_1', x1: 0, z1: -25, x2: 0, z2: -18, type: 'asphalt', isConstructed: true, progressPercent: 100 },
    // Avenida leste até Escritório de Construção e Posto
    { id: 'road_2a', x1: 0, z1: -18, x2: 6, z2: -18, type: 'asphalt', isConstructed: true, progressPercent: 100 },
    { id: 'road_2b', x1: 6, z1: -18, x2: 14, z2: -18, type: 'gravel', isConstructed: true, progressPercent: 100 },
    // Acesso oeste ao Galpão de Carga e Centro de Distribuição
    { id: 'road_2c', x1: 0, z1: -18, x2: -12, z2: -18, type: 'gravel', isConstructed: true, progressPercent: 100 },
    { id: 'road_cd', x1: -12, z1: -18, x2: -14, z2: -6, type: 'asphalt', isConstructed: true, progressPercent: 100 },
    // Eixo troncal sul
    { id: 'road_3', x1: 0, z1: -18, x2: 0, z2: 6, type: 'asphalt', isConstructed: true, progressPercent: 100 },
    // Rota oeste para Conjunto Habitacional
    { id: 'road_4', x1: 0, z1: 6, x2: -18, z2: 6, type: 'gravel', isConstructed: true, progressPercent: 100 },
    { id: 'road_5', x1: -18, z1: 6, x2: -18, z2: -2, type: 'dirt', isConstructed: true, progressPercent: 100 },
    // Conexão rodoviária para Silos Graneleiros e Lavoura de Grãos
    { id: 'road_silo', x1: -14, z1: -6, x2: -14, z2: 12, type: 'asphalt', isConstructed: true, progressPercent: 100 },
    { id: 'road_farm', x1: -14, z1: 12, x2: -28, z2: 12, type: 'dirt', isConstructed: true, progressPercent: 100 },
    // Eixo leste para Serraria e Horto Florestal
    { id: 'road_sawmill', x1: 14, z1: -18, x2: 22, z2: -6, type: 'gravel', isConstructed: true, progressPercent: 100 },
    { id: 'road_forestry', x1: 22, z1: -6, x2: 32, z2: -6, type: 'dirt', isConstructed: true, progressPercent: 100 },
    // Eixo leste para Polo Industrial (Britador & Pedreira)
    { id: 'road_3b', x1: 0, z1: 6, x2: 0, z2: 14, type: 'asphalt', isConstructed: true, progressPercent: 100 },
    { id: 'road_6', x1: 0, z1: 14, x2: 12, z2: 14, type: 'gravel', isConstructed: true, progressPercent: 100 },
    { id: 'road_7', x1: 12, z1: 14, x2: 22, z2: 14, type: 'dirt', isConstructed: true, progressPercent: 100 },
  ];

  const initialVehicles: Vehicle[] = [
    // 1. Scania / KrAZ Heavy Dump Truck
    {
      id: 'veh_truck_1',
      name: 'Caminhão Basculante Pesado 6x4',
      type: 'dump_truck',
      x: 14,
      z: -18,
      targetX: 0,
      targetZ: -38,
      angle: Math.PI,
      speed: 13,
      cargoResource: 'brita',
      cargoAmount: 0,
      maxCapacity: 14,
      fuel: 95,
      status: 'idle',
      homeBuildingId: 'bld_co_1',
      path: [],
      pathIndex: 0,
      routeId: 'route_1',
      currentStopIndex: 0,
    },
    // 2. Mercedes / ZiS Flatbed Heavy Truck
    {
      id: 'veh_flatbed_1',
      name: 'Cavalo Mecânico Prancha Aberta',
      type: 'flatbed',
      x: 12,
      z: -18,
      targetX: 0,
      targetZ: -38,
      angle: Math.PI,
      speed: 14,
      cargoResource: 'paineis_pre',
      cargoAmount: 0,
      maxCapacity: 12,
      fuel: 90,
      status: 'idle',
      homeBuildingId: 'bld_co_1',
      path: [],
      pathIndex: 0,
    },
    // 3. Worker Bus
    {
      id: 'veh_bus_1',
      name: 'Ônibus Coletivo de Operários',
      type: 'bus',
      x: 0,
      z: -20,
      targetX: -18,
      targetZ: 6,
      angle: 0,
      speed: 16,
      cargoResource: undefined,
      cargoAmount: 0,
      maxCapacity: 40,
      passengers: 10,
      fuel: 85,
      status: 'traveling',
      homeBuildingId: 'bld_co_1',
      targetBuildingId: 'bld_khrush_1',
      path: [
        [0, -20],
        [0, 6],
        [-18, 6],
      ],
      pathIndex: 0,
    },
    // 4. Caminhão VUC Baú Frigorífico (Distribuição e Grãos)
    {
      id: 'veh_box_1',
      name: 'Caminhão VUC 3/4 Baú',
      type: 'box_truck',
      x: -14,
      z: 12,
      targetX: -28,
      targetZ: 12,
      angle: 0,
      speed: 15,
      cargoResource: 'plantacoes',
      cargoAmount: 0,
      maxCapacity: 8,
      fuel: 92,
      status: 'idle',
      homeBuildingId: 'bld_cd_1',
      path: [],
      pathIndex: 0,
      routeId: 'route_grain',
      currentStopIndex: 0,
    },
    // 5. Caminhão Bitrem Toreiro Florestal
    {
      id: 'veh_log_1',
      name: 'Caminhão Bitrem Toreiro 6x4',
      type: 'log_truck',
      x: 32,
      z: -6,
      targetX: 22,
      targetZ: -6,
      angle: 0,
      speed: 11,
      cargoResource: 'toras_madeira',
      cargoAmount: 0,
      maxCapacity: 18,
      fuel: 88,
      status: 'idle',
      homeBuildingId: 'bld_co_1',
      path: [],
      pathIndex: 0,
      routeId: 'route_timber',
      currentStopIndex: 0,
    },
  ];

  // Automated Routes (Rotas Automatizadas Configuradas)
  const initialRoutes: AutomatedRoute[] = [
    {
      id: 'route_1',
      name: 'Linha Brita: Alfândega -> Bloco 101',
      isActive: true,
      totalTrips: 4,
      tonsTransported: 48,
      assignedVehicleIds: ['veh_truck_1'],
      stops: [
        {
          buildingId: 'customs_zhodcaw',
          action: 'load',
          resourceId: 'brita',
          targetPercent: 100,
        },
        {
          buildingId: 'bld_khrush_1',
          action: 'unload',
          resourceId: 'brita',
          targetPercent: 0,
        },
      ],
    },
    {
      id: 'route_grain',
      name: 'Linha Agrícola: Fazenda Santa Fé -> Silo Graneleiro',
      isActive: true,
      totalTrips: 6,
      tonsTransported: 48,
      assignedVehicleIds: ['veh_box_1'],
      stops: [
        {
          buildingId: 'bld_farm_1',
          action: 'load',
          resourceId: 'plantacoes',
          targetPercent: 100,
        },
        {
          buildingId: 'bld_silo_1',
          action: 'unload',
          resourceId: 'plantacoes',
          targetPercent: 0,
        },
      ],
    },
    {
      id: 'route_timber',
      name: 'Linha Florestal: Horto Eucalipto -> Serraria',
      isActive: true,
      totalTrips: 3,
      tonsTransported: 54,
      assignedVehicleIds: ['veh_log_1'],
      stops: [
        {
          buildingId: 'bld_forestry_1',
          action: 'load',
          resourceId: 'toras_madeira',
          targetPercent: 100,
        },
        {
          buildingId: 'bld_sawmill_1',
          action: 'unload',
          resourceId: 'toras_madeira',
          targetPercent: 0,
        },
      ],
    },
  ];

  const initialTasks: FiveYearPlanTask[] = [
    {
      id: 'plan_1',
      title: 'Importação Alfandegária de Painéis e Aço',
      description: 'Importar materiais no Posto Alfandegário para alimentar as obras nacionais.',
      target: 20,
      current: 12,
      unit: 't',
      rewardReais: 25000,
      completed: false,
    },
    {
      id: 'plan_2',
      title: 'Concluir Conjunto Habitacional Popular',
      description: 'Terminar as etapas de estrutura e acabamento do Bloco 101.',
      target: 100,
      current: 42,
      unit: '%',
      rewardReais: 50000,
      completed: false,
    },
    {
      id: 'plan_3',
      title: 'Auto-suficiência Nacional de Brita',
      description: 'Concluir a Usina de Britagem para dispensar a importação de cascalho em dólares.',
      target: 100,
      current: 78,
      unit: '%',
      rewardReais: 45000,
      completed: false,
    },
    {
      id: 'plan_4',
      title: 'Construção da Usina Termelétrica a Carvão',
      description: 'Erguer a usina para eletrificar todas as fábricas e casas da república.',
      target: 1,
      current: 0,
      unit: 'usina',
      rewardReais: 120000,
      completed: false,
    },
    {
      id: 'plan_5',
      title: 'Crescimento Populacional dos Trabalhadores',
      description: 'Atingir uma população ativa de 200 trabalhadores com moradia e emprego.',
      target: 200,
      current: 0,
      unit: 'cidadãos',
      rewardReais: 80000,
      completed: false,
    },
  ];

  return {
    fundsReais: 48762300,
    fundsDollars: 1608453,
    gameDays: 74,
    speed: 1,
    windSpeed: 17,
    population: 42685,
    availableWorkers: 1850,
    foreignWorkersAtCustoms: 15,
    healthPercent: 88,
    happinessPercent: 92,
    buildings: initialBuildings,
    roads: initialRoads,
    vehicles: initialVehicles,
    routes: initialRoutes,
    fiveYearTasks: initialTasks,
    notifications: [
      {
        id: 'n_start',
        text: 'Prefeitura Municipal de Santa Esperança – BR: Redes logísticas e rotas ativas!',
        type: 'info',
        timestamp: Date.now(),
      },
    ],
    selectedBuildingId: 'bld_cd_1',
    selectedVehicleId: null,
    isCustomsOpen: false,
    isRouteManagerOpen: false,
    activeBuildTool: null,
  };
}

/**
 * Main simulation step function
 */
export function tickSimulation(state: GameState, dtSeconds: number): GameState {
  if (state.speed === 0) return state;

  const effectiveDt = dtSeconds * state.speed;
  const newDays = state.gameDays + (effectiveDt / 60);

  const updatedVehicles = [...state.vehicles];
  const updatedBuildings = state.buildings.map((b) => ({
    ...b,
    inventory: { ...b.inventory },
    requiredMaterials: { ...b.requiredMaterials },
    deliveredMaterials: { ...b.deliveredMaterials },
    stageProgress: { ...b.stageProgress },
  }));
  const updatedRoutes = [...state.routes];
  let newNotifications = [...state.notifications];

  const customs = updatedBuildings.find((b) => b.isCustoms);
  const constructionSites = updatedBuildings.filter((b) => !b.isConstructed);

  // 1. Process Automated Routes & Vehicles
  updatedVehicles.forEach((veh) => {
    // Fuel consumption while running
    if (veh.status === 'traveling') {
      veh.fuel = Math.max(0, veh.fuel - effectiveDt * 0.04);
      if (veh.fuel <= 0) {
        veh.status = 'no_fuel';
        newNotifications.push({
          id: `fuel_out_${veh.id}`,
          text: `Alerta: ${veh.name} ficou sem combustível diesel na estrada!`,
          type: 'warning',
          timestamp: Date.now(),
        });
      }
    }

    // Check if vehicle has an active automated route assigned
    if (veh.routeId && (veh.status === 'idle' || veh.status === 'loading')) {
      const route = updatedRoutes.find((r) => r.id === veh.routeId && r.isActive);
      if (route && route.stops.length >= 2) {
        const stopIndex = veh.currentStopIndex ?? 0;
        const currentStop = route.stops[stopIndex];
        const targetBld = updatedBuildings.find((b) => b.id === currentStop.buildingId);

        if (targetBld) {
          // Route pathfinding along road network
          const roadPath = findRoadPath(veh.x, veh.z, targetBld.x, targetBld.z, state.roads);
          if (!roadPath) {
            veh.status = 'no_road';
          } else {
            veh.status = 'traveling';
            veh.targetBuildingId = targetBld.id;
            veh.cargoResource = currentStop.resourceId;
            veh.path = roadPath;
            veh.pathIndex = 0;
          }
        }
      }
    }

    // If idle without route, auto-dispatch to incomplete construction sites
    if (veh.status === 'idle' && !veh.routeId) {
      for (const site of constructionSites) {
        for (const [matKey, reqAmount] of Object.entries(site.requiredMaterials)) {
          const delivered = site.deliveredMaterials[matKey] || 0;
          if (delivered < reqAmount) {
            const canHaul =
              (veh.type === 'dump_truck' && (matKey === 'brita' || matKey === 'cimento')) ||
              (veh.type === 'flatbed' && (matKey === 'aco' || matKey === 'paineis_pre' || matKey === 'madeira'));

            if (canHaul && customs) {
              const availableInCustoms = customs.inventory[matKey] || 0;
              if (availableInCustoms > 0) {
                // Must travel along road network
                const pathToCustoms = findRoadPath(veh.x, veh.z, customs.x, customs.z, state.roads);
                if (pathToCustoms) {
                  veh.status = 'traveling';
                  veh.cargoResource = matKey;
                  veh.targetBuildingId = site.id;
                  veh.path = pathToCustoms;
                  veh.pathIndex = 0;
                  break;
                }
              }
            }
          }
        }
        if (veh.status !== 'idle') break;
      }
    }

    // Vehicle physics & movement along road path
    if (veh.status === 'traveling' && veh.path.length > 0) {
      const targetPoint = veh.path[veh.pathIndex] || [veh.x, veh.z];
      const dx = targetPoint[0] - veh.x;
      const dz = targetPoint[1] - veh.z;
      const dist = Math.hypot(dx, dz);

      // Desired angle
      const targetAngle = Math.atan2(dx, dz);
      // Smooth turning physics
      let angleDiff = targetAngle - veh.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      veh.angle += angleDiff * Math.min(1.0, effectiveDt * 5);

      // Pitch & Roll physics tilt on turns
      veh.roll = -angleDiff * 0.15;
      veh.wheelRotation = (veh.wheelRotation || 0) + veh.speed * effectiveDt * 0.8;

      if (dist < 1.4) {
        veh.pathIndex++;
        if (veh.pathIndex >= veh.path.length) {
          // Reached destination stop!
          if (veh.targetBuildingId) {
            const destBuilding = updatedBuildings.find((b) => b.id === veh.targetBuildingId);

            // If on automated route, execute stop action
            if (veh.routeId) {
              const route = updatedRoutes.find((r) => r.id === veh.routeId);
              if (route) {
                const stopIdx = veh.currentStopIndex ?? 0;
                const stop = route.stops[stopIdx];

                if (stop.action === 'load' && destBuilding && veh.cargoResource) {
                  // Load cargo
                  const avail = destBuilding.inventory[veh.cargoResource] || 0;
                  const toLoad = Math.min(veh.maxCapacity, avail);
                  if (toLoad > 0) {
                    destBuilding.inventory[veh.cargoResource] -= toLoad;
                    veh.cargoAmount = toLoad;
                    sound.playTruckEngine();
                  }
                } else if (stop.action === 'unload' && destBuilding && veh.cargoResource) {
                  // Unload cargo
                  if (destBuilding.isConstructed) {
                    destBuilding.inventory[veh.cargoResource] =
                      (destBuilding.inventory[veh.cargoResource] || 0) + veh.cargoAmount;
                  } else {
                    destBuilding.deliveredMaterials[veh.cargoResource] =
                      (destBuilding.deliveredMaterials[veh.cargoResource] || 0) + veh.cargoAmount;
                  }
                  route.totalTrips += 1;
                  route.tonsTransported += veh.cargoAmount;
                  veh.cargoAmount = 0;
                  sound.playHammerClang();
                }

                // Advance to next stop on route
                veh.currentStopIndex = (stopIdx + 1) % route.stops.length;
                veh.status = 'idle';
                veh.path = [];
                veh.pathIndex = 0;
              }
            } else {
              // Standard construction delivery
              if (destBuilding && veh.cargoResource && veh.cargoAmount > 0) {
                destBuilding.deliveredMaterials[veh.cargoResource] =
                  (destBuilding.deliveredMaterials[veh.cargoResource] || 0) + veh.cargoAmount;
                veh.cargoAmount = 0;
                sound.playHammerClang();
              } else if (customs && veh.cargoResource && veh.cargoAmount === 0) {
                const toLoad = Math.min(veh.maxCapacity, customs.inventory[veh.cargoResource] || 0);
                if (toLoad > 0) {
                  customs.inventory[veh.cargoResource] -= toLoad;
                  veh.cargoAmount = toLoad;
                  const targetBld = updatedBuildings.find((b) => b.id === veh.targetBuildingId);
                  if (targetBld) {
                    const roadPath = findRoadPath(customs.x, customs.z, targetBld.x, targetBld.z, state.roads);
                    if (roadPath) {
                      veh.path = roadPath;
                      veh.pathIndex = 0;
                    }
                  }
                }
              }

              if (veh.cargoAmount === 0) {
                veh.status = 'idle';
                veh.path = [];
                veh.pathIndex = 0;
              }
            }
          }
        }
      } else {
        const moveStep = Math.min(dist, veh.speed * effectiveDt * 0.45);
        veh.x += (dx / dist) * moveStep;
        veh.z += (dz / dist) * moveStep;
      }
    }
  });

  // 2. Advance Multi-Stage Construction
  updatedBuildings.forEach((bld) => {
    if (!bld.isConstructed) {
      const result = advanceMultiStageConstruction(bld, effectiveDt, bld.assignedWorkers || 6);

      bld.stage = result.stage;
      bld.progressPercent = result.progressPercent;
      bld.stageProgress = result.stageProgress;

      if (result.isFullyConstructed) {
        bld.isConstructed = true;
        bld.progressPercent = 100;
        sound.playVictoryHymn();
        newNotifications.push({
          id: `bld_done_${bld.id}_${Date.now()}`,
          text: `Obra concluída com sucesso: ${bld.name}! A infraestrutura nacional avança.`,
          type: 'success',
          timestamp: Date.now(),
        });
      }
    } else if (bld.type !== 'posto_alfandegario') {
      // 3. Process Active Factories & Production
      const prod = processIndustrialProduction(
        bld.type,
        bld.assignedWorkers,
        bld.maxWorkers,
        bld.hasPower,
        bld.inventory,
        effectiveDt
      );

      if (prod.outputResource && prod.outputAmount > 0) {
        for (const [inKey, inAmt] of Object.entries(prod.consumedResources)) {
          bld.inventory[inKey] = Math.max(0, (bld.inventory[inKey] || 0) - inAmt);
        }
        bld.inventory[prod.outputResource] = (bld.inventory[prod.outputResource] || 0) + prod.outputAmount;
      }
    }
  });

  // 4. Update Citizen Population & Welfare
  const residentialBuildings = updatedBuildings.filter(
    (b) => b.isConstructed && (b.type === 'khrushchevka_small' || b.type === 'khrushchevka_large')
  );

  let currentPopulation = 0;
  residentialBuildings.forEach((r) => {
    const capacity = r.type === 'khrushchevka_large' ? 320 : 120;
    currentPopulation += capacity;
  });

  // Check Power Generation from Thermal Plant
  const hasWorkingPowerPlant = updatedBuildings.some(
    (b) => b.isConstructed && b.type === 'usina_termoeletrica' && (b.inventory['carvao'] || 0) > 0
  );

  updatedBuildings.forEach((b) => {
    b.hasPower = hasWorkingPowerPlant || b.isCustoms || b.x < 15;
  });

  // 5. Update Five-Year Plan Tasks
  const updatedTasks = state.fiveYearTasks.map((t) => {
    if (t.completed) return t;
    let currentVal = t.current;

    if (t.id === 'plan_2') {
      const khrush = updatedBuildings.find((b) => b.id === 'bld_khrush_1');
      if (khrush) currentVal = khrush.progressPercent;
    } else if (t.id === 'plan_3') {
      const crusher = updatedBuildings.find((b) => b.id === 'bld_crusher_1');
      if (crusher) currentVal = crusher.progressPercent;
    } else if (t.id === 'plan_4') {
      const plant = updatedBuildings.find((b) => b.isConstructed && b.type === 'usina_termoeletrica');
      if (plant) currentVal = 1;
    } else if (t.id === 'plan_5') {
      currentVal = currentPopulation;
    }

    const isDone = currentVal >= t.target;
    if (isDone && !t.completed) {
      sound.playVictoryHymn();
      newNotifications.push({
        id: `task_done_${t.id}`,
        text: `Meta Nacional Cumprida! "${t.title}". Recompensa: +R$ ${t.rewardReais.toLocaleString('pt-BR')}`,
        type: 'success',
        timestamp: Date.now(),
      });
    }

    return {
      ...t,
      current: currentVal,
      completed: isDone,
    };
  });

  if (newNotifications.length > 5) {
    newNotifications = newNotifications.slice(-5);
  }

  return {
    ...state,
    gameDays: newDays,
    population: currentPopulation,
    availableWorkers: Math.max(15, Math.floor(currentPopulation * 0.7)),
    buildings: updatedBuildings,
    vehicles: updatedVehicles,
    routes: updatedRoutes,
    fiveYearTasks: updatedTasks,
    notifications: newNotifications,
  };
}

/**
 * Perform a customs trade action with storage validation check
 */
export function executeCustomsTrade(
  state: GameState,
  resourceId: string,
  amountTons: number,
  currency: 'reais' | 'dollars',
  isExport: boolean
): GameState {
  if (!isExport) {
    // Check storage or active construction requirement
    const importValidation = canImportResource(resourceId, amountTons, state.buildings);
    if (!importValidation.allowed) {
      sound.playWarning();
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: `err_import_${Date.now()}`,
            text: importValidation.reason || 'Importação não autorizada sem capacidade de armazenagem.',
            type: 'warning',
            timestamp: Date.now(),
          },
        ],
      };
    }
  }

  const { totalCost } = calculateTrade(resourceId, amountTons, currency, isExport);

  if (!isExport) {
    if (currency === 'reais' && state.fundsReais < totalCost) {
      sound.playWarning();
      return state;
    }
    if (currency === 'dollars' && state.fundsDollars < totalCost) {
      sound.playWarning();
      return state;
    }

    const newReais = currency === 'reais' ? state.fundsReais - totalCost : state.fundsReais;
    const newDollars = currency === 'dollars' ? state.fundsDollars - totalCost : state.fundsDollars;

    const updatedBuildings = state.buildings.map((b) => {
      if (b.isCustoms) {
        return {
          ...b,
          inventory: {
            ...b.inventory,
            [resourceId]: (b.inventory[resourceId] || 0) + amountTons,
          },
        };
      }
      return b;
    });

    sound.playStampTrade();

    return {
      ...state,
      fundsReais: newReais,
      fundsDollars: newDollars,
      buildings: updatedBuildings,
      notifications: [
        ...state.notifications,
        {
          id: `trade_${Date.now()}`,
          text: `Importado: ${amountTons}t de ${resourceId} (-${currency === 'reais' ? 'R$' : '$'} ${totalCost.toLocaleString('pt-BR')})`,
          type: 'info',
          timestamp: Date.now(),
        },
      ],
    };
  } else {
    const customs = state.buildings.find((b) => b.isCustoms);
    if (!customs || (customs.inventory[resourceId] || 0) < amountTons) {
      sound.playWarning();
      return state;
    }

    const newReais = currency === 'reais' ? state.fundsReais + totalCost : state.fundsReais;
    const newDollars = currency === 'dollars' ? state.fundsDollars + totalCost : state.fundsDollars;

    const updatedBuildings = state.buildings.map((b) => {
      if (b.isCustoms) {
        return {
          ...b,
          inventory: {
            ...b.inventory,
            [resourceId]: Math.max(0, (b.inventory[resourceId] || 0) - amountTons),
          },
        };
      }
      return b;
    });

    sound.playStampTrade();

    return {
      ...state,
      fundsReais: newReais,
      fundsDollars: newDollars,
      buildings: updatedBuildings,
      notifications: [
        ...state.notifications,
        {
          id: `trade_${Date.now()}`,
          text: `Exportado: ${amountTons}t de ${resourceId} (+${currency === 'reais' ? 'R$' : '$'} ${totalCost.toLocaleString('pt-BR')})`,
          type: 'success',
          timestamp: Date.now(),
        },
      ],
    };
  }
}

/**
 * Hire foreign workers from customs
 */
export function hireForeignWorkers(state: GameState, count: number): GameState {
  const cost = count * 150;
  if (state.fundsReais < cost || state.foreignWorkersAtCustoms < count) {
    sound.playWarning();
    return state;
  }

  sound.playStampTrade();

  return {
    ...state,
    fundsReais: state.fundsReais - cost,
    availableWorkers: state.availableWorkers + count,
    foreignWorkersAtCustoms: state.foreignWorkersAtCustoms - count,
    notifications: [
      ...state.notifications,
      {
        id: `hire_${Date.now()}`,
        text: `Contratados ${count} operários na fronteira (-R$ ${cost.toLocaleString('pt-BR')})`,
        type: 'info',
        timestamp: Date.now(),
      },
    ],
  };
}

/**
 * Place a new building blueprint on the map with CO and vehicle prerequisite checks
 */
export function placeBuilding(
  state: GameState,
  blueprintType: string,
  x: number,
  z: number
): GameState {
  // Check CO and working vehicle requirement
  const canStart = canStartConstruction(state.buildings, state.vehicles);
  if (!canStart.allowed) {
    sound.playWarning();
    return {
      ...state,
      activeBuildTool: null,
      notifications: [
        ...state.notifications,
        {
          id: `warn_no_co_${Date.now()}`,
          text: canStart.reason || 'Necessário Escritório de Construção e veículos.',
          type: 'warning',
          timestamp: Date.now(),
        },
      ],
    };
  }

  const bp = BUILDING_BLUEPRINTS[blueprintType];
  if (!bp) return state;

  if (state.fundsReais < bp.costReais) {
    sound.playWarning();
    return state;
  }

  const newBuilding: Building = {
    id: `bld_${blueprintType}_${Date.now()}`,
    type: bp.type,
    name: `${bp.name} nº ${state.buildings.length + 1}`,
    x: Math.round(x / 4) * 4,
    z: Math.round(z / 4) * 4,
    rotation: 0,
    width: bp.size[0],
    depth: bp.size[1],
    isConstructed: false,
    stage: 'terraplanagem',
    progressPercent: 0,
    requiredMaterials: { ...bp.materialsNeeded },
    deliveredMaterials: {},
    stageProgress: { terraplanagem: 0, estrutura: 0, acabamento: 0 },
    requiredWorkdays: bp.workdaysNeeded,
    currentWorkdays: 0,
    assignedWorkers: 0,
    maxWorkers: bp.maxWorkers,
    inventory: {},
    maxStorage: 200,
    hasPower: false,
    powerRequiredMW: bp.powerRequiredMW,
  };

  sound.playHammerClang();

  return {
    ...state,
    fundsReais: state.fundsReais - bp.costReais,
    buildings: [...state.buildings, newBuilding],
    notifications: [
      ...state.notifications,
      {
        id: `place_${newBuilding.id}`,
        text: `Canteiro de obras iniciado: ${bp.name} (-R$ ${bp.costReais.toLocaleString('pt-BR')})`,
        type: 'info',
        timestamp: Date.now(),
      },
    ],
    activeBuildTool: null,
  };
}

/**
 * Purchase a new vehicle at customs / dealership
 */
export function purchaseVehicle(
  state: GameState,
  vehicleType: 'dump_truck' | 'flatbed' | 'bus' | 'concrete_mixer',
  name: string,
  costReais: number
): GameState {
  if (state.fundsReais < costReais) {
    sound.playWarning();
    return state;
  }

  const customs = state.buildings.find((b) => b.isCustoms);
  const startX = customs ? customs.x : 0;
  const startZ = customs ? customs.z + 4 : -34;

  const newVehicle: Vehicle = {
    id: `veh_${vehicleType}_${Date.now()}`,
    name,
    type: vehicleType,
    x: startX,
    z: startZ,
    targetX: startX,
    targetZ: startZ,
    angle: 0,
    speed: vehicleType === 'bus' ? 16 : 13,
    cargoResource: undefined,
    cargoAmount: 0,
    maxCapacity: vehicleType === 'dump_truck' ? 14 : vehicleType === 'flatbed' ? 12 : 40,
    fuel: 100,
    status: 'idle',
    homeBuildingId: 'bld_co_1',
    path: [],
    pathIndex: 0,
  };

  sound.playTruckEngine();

  return {
    ...state,
    fundsReais: state.fundsReais - costReais,
    vehicles: [...state.vehicles, newVehicle],
    notifications: [
      ...state.notifications,
      {
        id: `veh_buy_${newVehicle.id}`,
        text: `Veículo adquirido para a frota: ${name} (-R$ ${costReais.toLocaleString('pt-BR')})`,
        type: 'success',
        timestamp: Date.now(),
      },
    ],
  };
}

/**
 * Create or update an automated route
 */
export function saveAutomatedRoute(state: GameState, route: AutomatedRoute): GameState {
  const existingIdx = state.routes.findIndex((r) => r.id === route.id);
  let updatedRoutes: AutomatedRoute[];

  if (existingIdx >= 0) {
    updatedRoutes = [...state.routes];
    updatedRoutes[existingIdx] = route;
  } else {
    updatedRoutes = [...state.routes, route];
  }

  // Assign route to specified vehicles
  const updatedVehicles = state.vehicles.map((v) => {
    if (route.assignedVehicleIds.includes(v.id)) {
      return {
        ...v,
        routeId: route.id,
        currentStopIndex: 0,
      };
    } else if (v.routeId === route.id) {
      return {
        ...v,
        routeId: undefined,
        currentStopIndex: undefined,
      };
    }
    return v;
  });

  sound.playStampTrade();

  return {
    ...state,
    routes: updatedRoutes,
    vehicles: updatedVehicles,
    notifications: [
      ...state.notifications,
      {
        id: `route_save_${Date.now()}`,
        text: `Linha de transporte configurada: "${route.name}" com ${route.assignedVehicleIds.length} veículo(s).`,
        type: 'success',
        timestamp: Date.now(),
      },
    ],
  };
}

/**
 * Delete an automated route
 */
export function deleteAutomatedRoute(state: GameState, routeId: string): GameState {
  const updatedRoutes = state.routes.filter((r) => r.id !== routeId);
  const updatedVehicles = state.vehicles.map((v) => (v.routeId === routeId ? { ...v, routeId: undefined } : v));

  sound.playClick();

  return {
    ...state,
    routes: updatedRoutes,
    vehicles: updatedVehicles,
  };
}
