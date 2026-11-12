import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTrade,
  canImportResource,
  canStartConstruction,
  advanceMultiStageConstruction,
  processIndustrialProduction,
  formatBrazilianDate,
  BUILDING_BLUEPRINTS,
} from './rules';
import { findRoadPath } from './pathfinding';
import { Building, RoadSegment, Vehicle } from './types';

test('calculateTrade uses Brazilian Real and Dollar currencies', () => {
  const tradeReal = calculateTrade('aco', 10, 'reais', false);
  assert.equal(tradeReal.unitPrice, 281.21);
  assert.equal(tradeReal.totalCost, 2812.1);
});

test('canImportResource verifies logistics capacity across Centro de Distribuicao, Silos and Armazens', () => {
  const buildings: Building[] = [];
  const check = canImportResource('aco', 20, buildings);
  assert.equal(check.allowed, false);

  const cd: Building = {
    id: 'cd_1',
    type: 'centro_distribuicao',
    name: 'Centro de Distribuição',
    x: 0,
    z: 0,
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
    assignedWorkers: 10,
    maxWorkers: 35,
    inventory: {},
    maxStorage: 800,
    hasPower: true,
    powerRequiredMW: 0.45,
  };

  const allowedCheck = canImportResource('aco', 20, [cd]);
  assert.equal(allowedCheck.allowed, true);
});

test('processIndustrialProduction runs forest and grain chains', () => {
  // 1. Reflorestamento produces logs
  const logs = processIndustrialProduction('reflorestamento', 18, 18, true, {}, 10);
  assert.equal(logs.outputResource, 'toras_madeira');
  assert.ok(logs.outputAmount > 0);

  // 2. Serraria processes logs into lumber
  const lumber = processIndustrialProduction('serraria', 22, 22, true, { toras_madeira: 20 }, 10);
  assert.equal(lumber.outputResource, 'madeira');
  assert.ok(lumber.outputAmount > 0);

  // 3. Fazenda produces crops
  const crops = processIndustrialProduction('fazenda_graos', 20, 20, true, {}, 10);
  assert.equal(crops.outputResource, 'plantacoes');
  assert.ok(crops.outputAmount > 0);
});

test('formatBrazilianDate formats date matching image_d92ebf14.png (15 de Mar de 1975)', () => {
  const d0 = formatBrazilianDate(0);
  assert.equal(d0, '15 de Mar de 1975');
});

test('blueprints include all logistics and chain facilities', () => {
  assert.ok(BUILDING_BLUEPRINTS['centro_distribuicao']);
  assert.ok(BUILDING_BLUEPRINTS['deposito_aberto']);
  assert.ok(BUILDING_BLUEPRINTS['armazem']);
  assert.ok(BUILDING_BLUEPRINTS['silo']);
  assert.ok(BUILDING_BLUEPRINTS['doca']);
  assert.ok(BUILDING_BLUEPRINTS['reflorestamento']);
  assert.ok(BUILDING_BLUEPRINTS['serraria']);
  assert.ok(BUILDING_BLUEPRINTS['fazenda_graos']);
});
