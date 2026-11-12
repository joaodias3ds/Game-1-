/**
 * Soviet Republic: Workers & Logistics (Edição Santa Esperança – BR)
 * Core simulation rules and calculations (pure logic decoupled from UI)
 */

import { ConstructionStage, Building, Vehicle } from './types';

export interface ResourceMarketItem {
  id: string;
  name: string;
  priceReais: number;
  priceDollars: number;
  category: 'bulk' | 'construction' | 'industrial' | 'consumer' | 'energy';
}

export const INITIAL_MARKET_PRICES: ResourceMarketItem[] = [
  { id: 'alimentos', name: 'Alimentos Industrializados', priceReais: 111.34, priceDollars: 22.2, category: 'consumer' },
  { id: 'plantacoes', name: 'Grãos & Soja Agrícola', priceReais: 16.56, priceDollars: 3.3, category: 'consumer' },
  { id: 'toras_madeira', name: 'Toras de Madeira Bruta', priceReais: 5.80, priceDollars: 1.1, category: 'bulk' },
  { id: 'madeira', name: 'Madeira Serrada & Pranchas', priceReais: 18.72, priceDollars: 3.7, category: 'construction' },
  { id: 'brita', name: 'Brita & Cascalho', priceReais: 6.91, priceDollars: 1.4, category: 'construction' },
  { id: 'pedra', name: 'Pedra Bruta de Pedreira', priceReais: 3.51, priceDollars: 0.7, category: 'bulk' },
  { id: 'cimento', name: 'Cimento Portland', priceReais: 14.80, priceDollars: 2.9, category: 'construction' },
  { id: 'aco', name: 'Aço Estrutural (Vigas/Vergalhões)', priceReais: 281.21, priceDollars: 56.2, category: 'construction' },
  { id: 'paineis_pre', name: 'Painéis Pré-Moldados de Concreto', priceReais: 24.50, priceDollars: 4.9, category: 'construction' },
  { id: 'carvao', name: 'Carvão Mineral', priceReais: 11.63, priceDollars: 2.3, category: 'energy' },
  { id: 'combustivel', name: 'Óleo Diesel Rodoviário', priceReais: 88.50, priceDollars: 17.7, category: 'energy' },
  { id: 'petroleo', name: 'Petróleo Cru', priceReais: 45.54, priceDollars: 9.1, category: 'energy' },
  { id: 'betume', name: 'Betume Asfáltico', priceReais: 210.47, priceDollars: 42.1, category: 'construction' },
  { id: 'carne', name: 'Carne & Proteína Animal', priceReais: 228.79, priceDollars: 45.7, category: 'consumer' },
  { id: 'bebidas', name: 'Bebidas Destiladas & Álcool', priceReais: 249.66, priceDollars: 49.9, category: 'consumer' },
  { id: 'quimicos', name: 'Produtos Químicos Industriais', priceReais: 868.75, priceDollars: 173.7, category: 'industrial' },
];

export interface BuildingBlueprint {
  type: string;
  name: string;
  category: 'transport' | 'logistics' | 'utilities' | 'citizens' | 'industry' | 'construction';
  costReais: number;
  materialsNeeded: {
    brita?: number;
    aco?: number;
    paineis_pre?: number;
    madeira?: number;
    cimento?: number;
  };
  workdaysNeeded: number;
  maxWorkers: number;
  powerRequiredMW: number;
  description: string;
  size: [number, number];
  maxStorage?: number;
  maxVehicles?: number;
}

export const BUILDING_BLUEPRINTS: Record<string, BuildingBlueprint> = {
  // --- ABA LOGÍSTICA (Conforme image_d92ebf14.png) ---
  centro_distribuicao: {
    type: 'centro_distribuicao',
    name: 'Centro de Distribuição',
    category: 'logistics',
    costReais: 48000,
    materialsNeeded: { brita: 35, aco: 25, paineis_pre: 45, cimento: 20 },
    workdaysNeeded: 420,
    maxWorkers: 35,
    powerRequiredMW: 0.45,
    maxStorage: 800,
    maxVehicles: 18,
    description: 'Grande centro logístico com docas de carga, vagas de carretas e armazenagem refrigerada.',
    size: [4, 3],
  },
  deposito_aberto: {
    type: 'deposito_aberto',
    name: 'Depósito Aberto',
    category: 'logistics',
    costReais: 12000,
    materialsNeeded: { brita: 20, cimento: 8 },
    workdaysNeeded: 140,
    maxWorkers: 8,
    powerRequiredMW: 0.05,
    maxStorage: 500,
    maxVehicles: 8,
    description: 'Pátio pavimentado aberto com cobertura para toras de madeira, brita, perfis de aço e tubos.',
    size: [3, 2],
  },
  armazem: {
    type: 'armazem',
    name: 'Armazém Geral',
    category: 'logistics',
    costReais: 22000,
    materialsNeeded: { brita: 18, aco: 14, paineis_pre: 20, cimento: 12 },
    workdaysNeeded: 260,
    maxWorkers: 15,
    powerRequiredMW: 0.18,
    maxStorage: 450,
    maxVehicles: 10,
    description: 'Galpão fechado de estrutura metálica para estocagem de bens de consumo e insumos secos.',
    size: [3, 2],
  },
  silo: {
    type: 'silo',
    name: 'Silo Graneleiro',
    category: 'logistics',
    costReais: 28000,
    materialsNeeded: { brita: 20, aco: 30, cimento: 22 },
    workdaysNeeded: 310,
    maxWorkers: 10,
    powerRequiredMW: 0.25,
    maxStorage: 700,
    maxVehicles: 6,
    description: 'Bateria de silos metálicos cilíndricos com elevador de grãos para soja, milho e trigo.',
    size: [2, 2],
  },
  doca: {
    type: 'doca',
    name: 'Doca de Carga & Transbordo',
    category: 'logistics',
    costReais: 18500,
    materialsNeeded: { brita: 15, aco: 18, cimento: 14 },
    workdaysNeeded: 220,
    maxWorkers: 12,
    powerRequiredMW: 0.15,
    maxStorage: 350,
    maxVehicles: 12,
    description: 'Plataforma elevada com baias de carregamento rápido para caminhões e furgões urbanos.',
    size: [3, 1],
  },

  // --- ABA INDÚSTRIA & CADEIAS PRODUTIVAS (Conforme image_b0d4dd91.png) ---
  reflorestamento: {
    type: 'reflorestamento',
    name: 'Horto Florestal & Manejo de Eucalipto/Araucária',
    category: 'industry',
    costReais: 9500,
    materialsNeeded: { brita: 5 },
    workdaysNeeded: 90,
    maxWorkers: 18,
    powerRequiredMW: 0.05,
    description: 'Área reflorestada sustentável; extrai toras de madeira bruta para a cadeia de marcenaria.',
    size: [3, 3],
  },
  serraria: {
    type: 'serraria',
    name: 'Serraria Industrial & Madeireira',
    category: 'industry',
    costReais: 24500,
    materialsNeeded: { brita: 15, aco: 12, madeira: 15, cimento: 10 },
    workdaysNeeded: 280,
    maxWorkers: 22,
    powerRequiredMW: 0.35,
    description: 'Desdobra toras de madeira bruta em tábuas e pranchas aparelhadas para a construção civil.',
    size: [3, 2],
  },
  fazenda_graos: {
    type: 'fazenda_graos',
    name: 'Fazenda & Lavoura de Grãos (Soja/Milho)',
    category: 'industry',
    costReais: 16000,
    materialsNeeded: { brita: 8, madeira: 10 },
    workdaysNeeded: 150,
    maxWorkers: 20,
    powerRequiredMW: 0.08,
    description: 'Lavouras irrigadas colhidas mecanicamente para abastecer os silos graneleiros.',
    size: [3, 3],
  },
  fabrica_alimentos: {
    type: 'fabrica_alimentos',
    name: 'Fábrica de Alimentos & Moagem',
    category: 'industry',
    costReais: 36000,
    materialsNeeded: { brita: 25, aco: 20, paineis_pre: 30, cimento: 18 },
    workdaysNeeded: 380,
    maxWorkers: 30,
    powerRequiredMW: 0.40,
    description: 'Beneficia grãos, farinha e ração, gerando alimentos embalados para o comércio.',
    size: [3, 2],
  },
  pedreira: {
    type: 'pedreira',
    name: 'Pedreira Nacional a Céu Aberto',
    category: 'industry',
    costReais: 11200,
    materialsNeeded: { brita: 10, aco: 5, cimento: 8 },
    workdaysNeeded: 150,
    maxWorkers: 25,
    powerRequiredMW: 0.10,
    description: 'Extrai rocha e pedra bruta do solo para britagem e obras rodoviárias.',
    size: [3, 3],
  },
  britador: {
    type: 'britador',
    name: 'Usina de Britagem & Cascalho',
    category: 'industry',
    costReais: 18500,
    materialsNeeded: { brita: 20, aco: 15, paineis_pre: 10, cimento: 12 },
    workdaysNeeded: 260,
    maxWorkers: 20,
    powerRequiredMW: 0.40,
    description: 'Tritura pedra bruta em brita nº 1 e cascalho para concreto e pavimentação.',
    size: [2, 2],
  },

  // --- ABA CONSTRUÇÃO ---
  escritorio_construcao: {
    type: 'escritorio_construcao',
    name: 'Escritório de Construção & Obras',
    category: 'construction',
    costReais: 24000,
    materialsNeeded: { brita: 20, aco: 15, paineis_pre: 15, cimento: 12 },
    workdaysNeeded: 310,
    maxWorkers: 15,
    powerRequiredMW: 0.25,
    description: 'Central de engenharia: despacha caçambas, carretas e operários para os canteiros.',
    size: [3, 2],
  },
  posto_combustivel: {
    type: 'posto_combustivel',
    name: 'Posto de Abastecimento Petrobrás',
    category: 'transport',
    costReais: 12500,
    materialsNeeded: { brita: 10, aco: 12, cimento: 8 },
    workdaysNeeded: 160,
    maxWorkers: 6,
    powerRequiredMW: 0.15,
    description: 'Fornece óleo diesel rodoviário para que caminhões e carretas não fiquem sem combustível.',
    size: [2, 1],
  },

  // --- ABA CIDADÃOS ---
  khrushchevka_small: {
    type: 'khrushchevka_small',
    name: 'Conjunto Habitacional Santa Esperança',
    category: 'citizens',
    costReais: 14500,
    materialsNeeded: { brita: 15, aco: 8, paineis_pre: 35, cimento: 10 },
    workdaysNeeded: 220,
    maxWorkers: 0,
    powerRequiredMW: 0.15,
    description: 'Bloco residencial para 120 famílias com comércio no térreo e saneamento básico.',
    size: [2, 2],
  },
  monumento_lenin: {
    type: 'monumento_lenin',
    name: 'Monumento aos Construtores de Santa Esperança',
    category: 'citizens',
    costReais: 6200,
    materialsNeeded: { brita: 8, aco: 12, cimento: 14 },
    workdaysNeeded: 110,
    maxWorkers: 0,
    powerRequiredMW: 0.02,
    description: 'Monumento cívico que inspira a comunidade e eleva a felicidade da população (+15%).',
    size: [1, 1],
  },

  // --- ABA REDES ---
  subestacao: {
    type: 'subestacao',
    name: 'Subestação Elétrica Distribuidora',
    category: 'utilities',
    costReais: 8400,
    materialsNeeded: { brita: 6, aco: 14, cimento: 6 },
    workdaysNeeded: 90,
    maxWorkers: 4,
    powerRequiredMW: 0,
    description: 'Transforma e distribui energia elétrica para bairros e indústrias vizinhas.',
    size: [1, 1],
  },
};

/**
 * Validates whether an import trade is allowed based on storage space or construction demand
 */
export function canImportResource(
  resourceId: string,
  amountTons: number,
  buildings: Building[]
): { allowed: boolean; reason?: string } {
  const customs = buildings.find((b) => b.isCustoms);
  let availableStorage = 0;

  if (customs) {
    const currentCustomsWeight = Object.values(customs.inventory).reduce((acc, val) => acc + val, 0);
    availableStorage += Math.max(0, customs.maxStorage - currentCustomsWeight);
  }

  const storageBuildings = buildings.filter(
    (b) =>
      b.isConstructed &&
      (b.type === 'armazem' ||
        b.type === 'centro_distribuicao' ||
        b.type === 'deposito_aberto' ||
        b.type === 'silo' ||
        b.type === 'doca')
  );

  for (const sb of storageBuildings) {
    const currentWeight = Object.values(sb.inventory).reduce((acc, val) => acc + val, 0);
    availableStorage += Math.max(0, sb.maxStorage - currentWeight);
  }

  let constructionDemand = 0;
  for (const b of buildings) {
    if (!b.isConstructed && b.requiredMaterials[resourceId]) {
      const delivered = b.deliveredMaterials[resourceId] || 0;
      const needed = b.requiredMaterials[resourceId];
      if (delivered < needed) {
        constructionDemand += needed - delivered;
      }
    }
  }

  if (availableStorage < amountTons && constructionDemand < amountTons) {
    return {
      allowed: false,
      reason: `Capacidade de armazenagem insuficiente no município para ${amountTons}t de ${resourceId}! Construa um Centro de Distribuição, Silo ou Armazém.`,
    };
  }

  return { allowed: true };
}

/**
 * Validates whether construction can be initiated
 */
export function canStartConstruction(
  buildings: Building[],
  vehicles: Vehicle[]
): { allowed: boolean; reason?: string } {
  const co = buildings.find((b) => b.isConstructed && b.type === 'escritorio_construcao');
  if (!co) {
    return {
      allowed: false,
      reason: 'Você precisa de um Escritório de Construção & Obras operacional antes de assentar novas fundações!',
    };
  }

  const operationalVehicles = vehicles.filter((v) => v.status !== 'no_fuel');
  if (operationalVehicles.length === 0) {
    return {
      allowed: false,
      reason: 'Você precisa de caminhões operacionais na sua frota! Adquira veículos na Concessionária/Alfândega.',
    };
  }

  return { allowed: true };
}

/**
 * Multi-Stage Construction advance:
 */
export function advanceMultiStageConstruction(
  building: Building,
  dtSeconds: number,
  workersPresent: number
): {
  stage: ConstructionStage;
  progressPercent: number;
  stageProgress: { terraplanagem: number; estrutura: number; acabamento: number };
  isFullyConstructed: boolean;
} {
  const req = building.requiredMaterials;
  const del = building.deliveredMaterials;

  const reqBrita = req.brita || 0;
  const delBrita = del.brita || 0;
  const terraplanagemMatOk = reqBrita === 0 || delBrita >= reqBrita * 0.9;

  const reqAco = req.aco || 0;
  const delAco = del.aco || 0;
  const reqCimento = req.cimento || 0;
  const delCimento = del.cimento || 0;
  const estruturaMatOk =
    terraplanagemMatOk &&
    (reqAco === 0 || delAco >= reqAco * 0.9) &&
    (reqCimento === 0 || delCimento >= reqCimento * 0.9);

  const reqPaineis = req.paineis_pre || 0;
  const delPaineis = del.paineis_pre || 0;
  const reqMadeira = req.madeira || 0;
  const delMadeira = del.madeira || 0;
  const acabamentoMatOk =
    estruturaMatOk &&
    (reqPaineis === 0 || delPaineis >= reqPaineis * 0.9) &&
    (reqMadeira === 0 || delMadeira >= reqMadeira * 0.9);

  const stageProgress = { ...building.stageProgress };
  const workSpeed = (workersPresent * dtSeconds) / 2.0;

  if (building.stage === 'terraplanagem') {
    if (delBrita >= reqBrita * 0.5) {
      stageProgress.terraplanagem = Math.min(100, stageProgress.terraplanagem + workSpeed * 0.8);
    }
    if (stageProgress.terraplanagem >= 100 && terraplanagemMatOk) {
      building.stage = 'estrutura';
    }
  } else if (building.stage === 'estrutura') {
    if (delAco >= reqAco * 0.4 && delCimento >= reqCimento * 0.4) {
      stageProgress.estrutura = Math.min(100, stageProgress.estrutura + workSpeed * 0.6);
    }
    if (stageProgress.estrutura >= 100 && estruturaMatOk) {
      building.stage = 'acabamento';
    }
  } else if (building.stage === 'acabamento') {
    if (delPaineis >= reqPaineis * 0.5 || delMadeira >= reqMadeira * 0.5) {
      stageProgress.acabamento = Math.min(100, stageProgress.acabamento + workSpeed * 0.5);
    }
    if (stageProgress.acabamento >= 100 && acabamentoMatOk) {
      building.stage = 'concluido';
    }
  }

  const overallProgress = Math.floor(
    stageProgress.terraplanagem * 0.3 + stageProgress.estrutura * 0.4 + stageProgress.acabamento * 0.3
  );

  return {
    stage: building.stage,
    progressPercent: Math.min(100, overallProgress),
    stageProgress,
    isFullyConstructed: building.stage === 'concluido',
  };
}

/**
 * Calculate trade cost and revenue in Reais and Dollars
 */
export function calculateTrade(
  resourceId: string,
  amountTons: number,
  currency: 'reais' | 'dollars',
  isExport: boolean
): { totalCost: number; unitPrice: number } {
  const item = INITIAL_MARKET_PRICES.find((i) => i.id === resourceId);
  if (!item) {
    throw new Error(`Recurso desconhecido: ${resourceId}`);
  }
  const basePrice = currency === 'reais' ? item.priceReais : item.priceDollars;
  const rate = isExport ? 0.90 : 1.0;
  const unitPrice = parseFloat((basePrice * rate).toFixed(2));
  const totalCost = parseFloat((unitPrice * amountTons).toFixed(2));
  return { totalCost, unitPrice };
}

/**
 * Calculate production progress for active factories & chains
 * (Florestal, Agrícola, Concreto & Britagem)
 */
export function processIndustrialProduction(
  buildingType: string,
  workersAssigned: number,
  maxWorkers: number,
  hasPower: boolean,
  inventory: Record<string, number>,
  dtSeconds: number
): {
  outputResource?: string;
  outputAmount: number;
  consumedResources: Record<string, number>;
} {
  if (!hasPower || workersAssigned <= 0 || maxWorkers <= 0) {
    return { outputAmount: 0, consumedResources: {} };
  }

  const workerRatio = Math.min(1.0, workersAssigned / maxWorkers);
  const cycleRate = (dtSeconds / 10) * workerRatio;

  switch (buildingType) {
    case 'reflorestamento': {
      // Produz toras de madeira de manejo
      const output = parseFloat((cycleRate * 3.5).toFixed(2));
      return { outputResource: 'toras_madeira', outputAmount: output, consumedResources: {} };
    }
    case 'serraria': {
      // 2 toras_madeira -> 1.8 madeira aparelhada
      const reqLogs = cycleRate * 2.5;
      const availLogs = inventory['toras_madeira'] || 0;
      if (availLogs <= 0) return { outputAmount: 0, consumedResources: {} };
      const actualConsumed = Math.min(availLogs, reqLogs);
      const output = parseFloat((actualConsumed * 0.9).toFixed(2));
      return {
        outputResource: 'madeira',
        outputAmount: output,
        consumedResources: { toras_madeira: parseFloat(actualConsumed.toFixed(2)) },
      };
    }
    case 'fazenda_graos': {
      // Colheita de soja e milho
      const output = parseFloat((cycleRate * 4.2).toFixed(2));
      return { outputResource: 'plantacoes', outputAmount: output, consumedResources: {} };
    }
    case 'fabrica_alimentos': {
      // 2.0 plantacoes -> 2.0 alimentos industrializados
      const reqGrains = cycleRate * 2.0;
      const availGrains = inventory['plantacoes'] || 0;
      if (availGrains <= 0) return { outputAmount: 0, consumedResources: {} };
      const actualConsumed = Math.min(availGrains, reqGrains);
      const output = parseFloat((actualConsumed * 1.0).toFixed(2));
      return {
        outputResource: 'alimentos',
        outputAmount: output,
        consumedResources: { plantacoes: parseFloat(actualConsumed.toFixed(2)) },
      };
    }
    case 'pedreira': {
      const output = parseFloat((cycleRate * 4.0).toFixed(2));
      return { outputResource: 'pedra', outputAmount: output, consumedResources: {} };
    }
    case 'britador': {
      const requiredStone = cycleRate * 3.0;
      const availableStone = inventory['pedra'] || 0;
      if (availableStone <= 0) return { outputAmount: 0, consumedResources: {} };
      const actualConsumed = Math.min(availableStone, requiredStone);
      const output = parseFloat((actualConsumed * 0.9).toFixed(2));
      return {
        outputResource: 'brita',
        outputAmount: output,
        consumedResources: { pedra: parseFloat(actualConsumed.toFixed(2)) },
      };
    }
    default:
      return { outputAmount: 0, consumedResources: {} };
  }
}

/**
 * Format Date matching image_d92ebf14.png: "15 de Mar de 1975"
 */
const MONTHS_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export function formatBrazilianDate(totalDays: number): string {
  const baseDay = 15;
  const baseMonth = 2; // Março (0-indexed)
  const baseYear = 1975;

  let currentDay = baseDay + Math.floor(totalDays);
  let currentMonth = baseMonth;
  let currentYear = baseYear;

  while (currentDay > 30) {
    currentDay -= 30;
    currentMonth++;
    if (currentMonth >= 12) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return `${currentDay} de ${MONTHS_PT[currentMonth]} de ${currentYear}`;
}
