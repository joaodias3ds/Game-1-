/**
 * Soviet Republic: Workers & Logistics (Edição Santa Esperança – BR)
 * Procedural 3D Models inspired by Santa Esperança & Brazilian Industrial Landscape
 */

import * as THREE from 'three';

// Shared PBR Materials
const materials = {
  // Brazilian Highway & Concrete
  asphaltDark: new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.85, metalness: 0.1 }),
  yellowRoadStripe: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.1 }),
  whiteRoadStripe: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.4, metalness: 0.1 }),
  concreteBase: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.85, metalness: 0.1 }),
  concreteLight: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.75, metalness: 0.1 }),
  terracottaTile: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85, metalness: 0.05 }), // Telhado colonial
  // Brazilian Industrial & Logistics Colors (conforme image_d92ebf14.png)
  logisticsTeal: new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.35, metalness: 0.2 }),
  corrugatedSteel: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.45, metalness: 0.6 }),
  stainlessTank: new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.25, metalness: 0.85 }),
  safetyYellow: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4, metalness: 0.1 }),
  brickWall: new THREE.MeshStandardMaterial({ color: 0x8b3a2b, roughness: 0.85, metalness: 0.05 }),
  // Nature & Agriculture
  ipeAmareloFoliage: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.65, metalness: 0.05 }), // Ipê Amarelo
  tropicalGreenFoliage: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.75, metalness: 0.05 }),
  araucariaGreen: new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.8, metalness: 0.05 }),
  treeTrunkWood: new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9, metalness: 0.05 }),
  sawnWoodPlanks: new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.8, metalness: 0.05 }),
  rawLogs: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95, metalness: 0.05 }),
  soyGoldenCrop: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.9, metalness: 0.05 }),
  // Vehicles
  truckWhiteCab: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 }),
  truckDarkChassis: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.5 }),
  truckReeferBox: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.3 }),
  rubberTire: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.05 }),
  glassWindow: new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.15, metalness: 0.7 }),
};

/**
 * 1. Centro de Distribuição (Logística Moderna - Fiel à image_d92ebf14.png)
 */
export function createDistributionCenterModel(): THREE.Group {
  const group = new THREE.Group();

  // Pátio de manobras / estacionamento em asfalto com baias
  const apronGeo = new THREE.BoxGeometry(16, 0.2, 12);
  const apron = new THREE.Mesh(apronGeo, materials.asphaltDark);
  apron.position.set(0, 0.1, 0);
  apron.receiveShadow = true;
  group.add(apron);

  // Galpão principal moderno cinza claro
  const warehouseGeo = new THREE.BoxGeometry(12, 4.5, 7.5);
  const warehouse = new THREE.Mesh(warehouseGeo, materials.concreteLight);
  warehouse.position.set(0, 2.35, -1.5);
  warehouse.castShadow = true;
  group.add(warehouse);

  // Telhado metálico em arco suave com lanternins
  const roofGeo = new THREE.BoxGeometry(12.2, 0.4, 7.7);
  const roof = new THREE.Mesh(roofGeo, materials.corrugatedSteel);
  roof.position.set(0, 4.65, -1.5);
  group.add(roof);

  // Cubo frontal em destaque verde-azulado (Logomarca e Guichê - conforme image_d92ebf14.png)
  const cubeGeo = new THREE.BoxGeometry(3.5, 4.8, 2.5);
  const cube = new THREE.Mesh(cubeGeo, materials.logisticsTeal);
  cube.position.set(-2.5, 2.5, 2.4);
  cube.castShadow = true;
  group.add(cube);

  // Símbolo cúbico branco no totem
  const logoBoxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.1);
  const logoBox = new THREE.Mesh(logoBoxGeo, materials.whiteRoadStripe);
  logoBox.position.set(-2.5, 3.2, 3.7);
  group.add(logoBox);

  // Baias de docas de carregamento com portões de enrolar
  for (let b = 0; b < 3; b++) {
    const dockBayGeo = new THREE.BoxGeometry(1.6, 2.4, 0.2);
    const dockBay = new THREE.Mesh(dockBayGeo, materials.truckDarkChassis);
    dockBay.position.set(0.5 + b * 2.2, 1.3, 2.26);
    group.add(dockBay);

    // Amortecedores amarelos de borracha
    const bumperGeo = new THREE.BoxGeometry(0.15, 1.2, 0.2);
    const bumpL = new THREE.Mesh(bumperGeo, materials.safetyYellow);
    bumpL.position.set(-0.2 + b * 2.2, 0.7, 2.35);
    const bumpR = new THREE.Mesh(bumperGeo, materials.safetyYellow);
    bumpR.position.set(1.2 + b * 2.2, 0.7, 2.35);
    group.add(bumpL);
    group.add(bumpR);
  }

  // Tanque vertical de inox com escada amarela (conforme image_d60f846d.png)
  const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 5.0, 16);
  const tank = new THREE.Mesh(tankGeo, materials.stainlessTank);
  tank.position.set(5.2, 2.6, 2.2);
  tank.castShadow = true;
  group.add(tank);

  const ladderGeo = new THREE.BoxGeometry(0.2, 4.8, 0.2);
  const ladder = new THREE.Mesh(ladderGeo, materials.safetyYellow);
  ladder.position.set(5.2, 2.6, 3.45);
  group.add(ladder);

  return group;
}

/**
 * 2. Bateria de Silos Graneleiros Metálicos (Fiel à image_d92ebf14 e image_b0d4dd91)
 */
export function createGrainSiloBatteryModel(): THREE.Group {
  const group = new THREE.Group();

  // Base de concreto
  const base = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 7), materials.concreteBase);
  base.position.y = 0.2;
  group.add(base);

  // 3 Silos Cilíndricos de Aço Canelado com Telhado Cônico
  const siloGeo = new THREE.CylinderGeometry(1.6, 1.6, 6.0, 16);
  const capGeo = new THREE.ConeGeometry(1.8, 1.5, 16);

  for (let s = 0; s < 3; s++) {
    const sx = -2.6 + s * 2.6;
    const silo = new THREE.Mesh(siloGeo, materials.stainlessTank);
    silo.position.set(sx, 3.2, -0.6);
    silo.castShadow = true;
    group.add(silo);

    const cap = new THREE.Mesh(capGeo, materials.corrugatedSteel);
    cap.position.set(sx, 6.95, -0.6);
    group.add(cap);
  }

  // Elevador de canecas e torre vertical amarela de transbordo
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.5, 0.8), materials.safetyYellow);
  tower.position.set(-3.8, 4.8, 1.8);
  tower.castShadow = true;
  group.add(tower);

  // Passarela inclinada superior ligando o elevador aos silos
  const walkway = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.3, 0.6), materials.safetyYellow);
  walkway.rotation.z = -0.15;
  walkway.position.set(-1.2, 7.8, 0.2);
  group.add(walkway);

  // Moega / Galpão coberto de descarga de caminhões
  const shed = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.6, 3.2), materials.concreteLight);
  shed.position.set(1.5, 1.4, 2.0);
  shed.castShadow = true;
  group.add(shed);

  return group;
}

/**
 * 3. Serraria Industrial & Pátio de Toras (Fiel à image_b0d4dd91)
 */
export function createSawmillModel(): THREE.Group {
  const group = new THREE.Group();

  // Pavimento de concreto e terra batida
  const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 8), materials.concreteBase);
  base.position.y = 0.1;
  group.add(base);

  // Galpão de desdobro de toras em estrutura de madeira e telhado de zinco
  const pillarGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.2, 6);
  for (let px = -4; px <= 1; px += 2.5) {
    for (let pz = -2.5; pz <= 2.5; pz += 5) {
      const p = new THREE.Mesh(pillarGeo, materials.treeTrunkWood);
      p.position.set(px, 1.7, pz);
      group.add(p);
    }
  }

  // Telhado duas águas de zinco sobre a serra
  const roof1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.1, 3.2), materials.corrugatedSteel);
  roof1.rotation.z = 0.2;
  roof1.position.set(-1.5, 3.6, -1.2);
  const roof2 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.1, 3.2), materials.corrugatedSteel);
  roof2.rotation.z = -0.2;
  roof2.position.set(-1.5, 3.6, 1.2);
  group.add(roof1);
  group.add(roof2);

  // Maquinário da serra fita / serra circular laranja
  const sawMachine = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.2), materials.safetyYellow);
  sawMachine.position.set(-1.5, 1.1, 0);
  sawMachine.castShadow = true;
  group.add(sawMachine);

  // Mesa de roletes transportadora de toras
  const rollerTable = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.5, 0.8), materials.truckDarkChassis);
  rollerTable.position.set(-1.5, 0.5, 0);
  group.add(rollerTable);

  // Pilha de toras brutas de madeira (logs)
  const logGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 8);
  logGeo.rotateZ(Math.PI / 2);
  for (let ly = 0; ly < 3; ly++) {
    for (let lz = 0; lz < 3 - ly; lz++) {
      const log = new THREE.Mesh(logGeo, materials.rawLogs);
      log.position.set(3.8, 0.35 + ly * 0.55, -1.5 + lz * 0.65);
      log.castShadow = true;
      group.add(log);
    }
  }

  // Pilhas organizadas de pranchas e tábuas serradas
  const plankStack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.6), materials.sawnWoodPlanks);
  plankStack.position.set(3.8, 0.7, 2.0);
  plankStack.castShadow = true;
  group.add(plankStack);

  return group;
}

/**
 * 4. Fazenda & Lavoura de Soja/Milho Dourado (Fiel à image_b0d4dd91)
 */
export function createFarmCropModel(): THREE.Group {
  const group = new THREE.Group();

  // Campo dourado de cultivo de soja/milho
  const cropField = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 10), materials.soyGoldenCrop);
  cropField.position.y = 0.125;
  cropField.receiveShadow = true;
  group.add(cropField);

  // Casa sede colonial brasileira com telhado de cerâmica colonial
  const houseBody = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 2.8), materials.concreteLight);
  houseBody.position.set(-2.8, 1.1, -2.8);
  houseBody.castShadow = true;
  group.add(houseBody);

  const houseRoof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 4), materials.terracottaTile);
  houseRoof.rotation.y = Math.PI / 4;
  houseRoof.position.set(-2.8, 2.6, -2.8);
  group.add(houseRoof);

  // Caixa d'água azul em cavalete elevado
  const tankTower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.5, 4), materials.truckDarkChassis);
  tankTower.position.set(-0.6, 1.25, -3.8);
  group.add(tankTower);

  const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 12), materials.logisticsTeal);
  waterTank.position.set(-0.6, 2.8, -3.8);
  group.add(waterTank);

  // Colheitadeira de grãos amarela em operação
  const combineBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 3.2), materials.safetyYellow);
  combineBody.position.set(2.2, 1.1, 1.5);
  combineBody.castShadow = true;
  group.add(combineBody);

  // Plataforma de corte frontal com molinete
  const headerGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.8, 8);
  headerGeo.rotateZ(Math.PI / 2);
  const headerReel = new THREE.Mesh(headerGeo, materials.truckDarkChassis);
  headerReel.position.set(2.2, 0.6, 3.4);
  group.add(headerReel);

  return group;
}

/**
 * 5. Árvore Ipê Amarelo Tropical (Fiel à image_d60f846d)
 */
export function createIpeAmareloTreeModel(): THREE.Group {
  const group = new THREE.Group();

  // Tronco orgânico de madeira escura
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.5, 7), materials.treeTrunkWood);
  trunk.position.y = 1.75;
  trunk.castShadow = true;
  group.add(trunk);

  // Copa exuberante de flores amarelas douradas
  const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), materials.ipeAmareloFoliage);
  foliage1.scale.set(1.2, 0.85, 1.2);
  foliage1.position.set(0, 4.2, 0);
  foliage1.castShadow = true;
  group.add(foliage1);

  const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 6, 6), materials.ipeAmareloFoliage);
  foliage2.position.set(0.6, 4.6, 0.4);
  group.add(foliage2);

  return group;
}

/**
 * 6. Palmeira Imperial Brasileira
 */
export function createPalmTreeModel(): THREE.Group {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 6.5, 6), materials.treeTrunkWood);
  trunk.position.y = 3.25;
  trunk.castShadow = true;
  group.add(trunk);

  // Frondes verdes no topo
  for (let f = 0; f < 6; f++) {
    const frond = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 2.2), materials.tropicalGreenFoliage);
    frond.rotation.x = 0.5;
    frond.rotation.y = (f * Math.PI) / 3;
    frond.position.set(0, 6.4, 0);
    group.add(frond);
  }

  return group;
}

/**
 * 7. Caminhão Baú Frigorífico / VUC Urbano (Fiel à image_3b87e24d)
 */
export function createBoxTruckModel(): THREE.Group {
  const group = new THREE.Group();

  // Cabine branca aerodinâmica
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.5), materials.truckWhiteCab);
  cab.position.set(0, 1.2, 1.3);
  cab.castShadow = true;
  group.add(cab);

  // Para-brisa panorâmico
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), materials.glassWindow);
  windshield.position.set(0, 1.45, 2.06);
  group.add(windshield);

  // Baú isotérmico refrigerado
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 3.4), materials.truckReeferBox);
  box.position.set(0, 1.6, -1.0);
  box.castShadow = true;
  group.add(box);

  // Aparelho de refrigeração no topo do baú (Thermo King style)
  const reeferUnit = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.6), materials.truckDarkChassis);
  reeferUnit.position.set(0, 2.7, 0.5);
  group.add(reeferUnit);

  // Chassi e Rodas duplas
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 12);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-0.9, 0.38, 1.3],
    [0.9, 0.38, 1.3],
    [-0.9, 0.38, -1.5],
    [0.9, 0.38, -1.5],
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, materials.rubberTire);
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  return group;
}

/**
 * 8. Caminhão Toreiro com Toras de Madeira (Fiel à image_3b87e24d)
 */
export function createLogTruckModel(): THREE.Group {
  const group = new THREE.Group();

  // Cabine
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.5), materials.truckWhiteCab);
  cab.position.set(0, 1.2, 1.4);
  cab.castShadow = true;
  group.add(cab);

  // Prancha com fueiros verticais metálicos
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.25, 4.0), materials.truckDarkChassis);
  bed.position.set(0, 0.85, -1.2);
  group.add(bed);

  // Fueiros laterais de contenção
  for (let f = -1.6; f <= 1.6; f += 1.6) {
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), materials.truckDarkChassis);
    postL.position.set(-0.85, 1.6, -1.2 + f);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), materials.truckDarkChassis);
    postR.position.set(0.85, 1.6, -1.2 + f);
    group.add(postL);
    group.add(postR);
  }

  // Carga de toras cilíndricas empilhadas com cintas amarelas
  const logGeo = new THREE.CylinderGeometry(0.24, 0.24, 3.8, 8);
  for (let layer = 0; layer < 3; layer++) {
    for (let c = 0; c < 3 - layer; c++) {
      const log = new THREE.Mesh(logGeo, materials.rawLogs);
      log.position.set(-0.48 + c * 0.48 + layer * 0.24, 1.1 + layer * 0.42, -1.2);
      group.add(log);
    }
  }

  // Cintas de amarração de carga amarelas
  for (let s = -1.4; s <= 1.4; s += 1.4) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.05, 0.1), materials.safetyYellow);
    strap.position.set(0, 2.2, -1.2 + s);
    group.add(strap);
  }

  // Rodas 6x4
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheels = [
    [-0.9, 0.38, 1.4],
    [0.9, 0.38, 1.4],
    [-0.9, 0.38, -0.6],
    [0.9, 0.38, -0.6],
    [-0.9, 0.38, -1.8],
    [0.9, 0.38, -1.8],
  ];
  wheels.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, materials.rubberTire);
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  return group;
}

/**
 * 9. Canteiro de Obras com Escavadeira Amarela e Colunas de Concreto (Fiel à image_d92ebf14)
 */
export function createRealisticConstructionOverlay(width: number, depth: number): THREE.Group {
  const group = new THREE.Group();

  // Escavação de terra batida
  const pit = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.2, depth + 1.2), materials.concreteBase);
  pit.position.y = 0.1;
  group.add(pit);

  // Colunas de concreto armado e vigas esqueleto
  const colGeo = new THREE.BoxGeometry(0.35, 3.2, 0.35);
  for (let x = -width / 2 + 0.6; x <= width / 2 - 0.6; x += 2.0) {
    for (let z = -depth / 2 + 0.6; z <= depth / 2 - 0.6; z += 2.0) {
      const col = new THREE.Mesh(colGeo, materials.concreteBase);
      col.position.set(x, 1.6, z);
      group.add(col);
    }
  }

  // Vigas superiores conectando as colunas
  const beamGeo = new THREE.BoxGeometry(width - 0.8, 0.25, 0.25);
  const beam1 = new THREE.Mesh(beamGeo, materials.concreteBase);
  beam1.position.set(0, 3.2, -depth / 2 + 0.6);
  const beam2 = new THREE.Mesh(beamGeo, materials.concreteBase);
  beam2.position.set(0, 3.2, depth / 2 - 0.6);
  group.add(beam1);
  group.add(beam2);

  // Escavadeira amarela hidráulica (CAT style no canteiro)
  const excavatorBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 2.0), materials.safetyYellow);
  excavatorBody.position.set(width / 2 + 1.6, 1.1, 0);
  excavatorBody.castShadow = true;
  group.add(excavatorBody);

  const excavatorBoom = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 3.2), materials.safetyYellow);
  excavatorBoom.rotation.x = -0.6;
  excavatorBoom.position.set(width / 2 + 1.6, 2.2, 1.2);
  group.add(excavatorBoom);

  return group;
}
