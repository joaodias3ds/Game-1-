/**
 * Soviet Republic: Workers & Logistics (Edição Santa Esperança – BR)
 * Three.js 3D Viewport with Brazilian Landscape, River, Ipês Amarelos, and Highway Markings
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameState } from './simulation';
import { Building, Vehicle, RoadSegment } from './types';
import {
  createDistributionCenterModel,
  createGrainSiloBatteryModel,
  createSawmillModel,
  createFarmCropModel,
  createIpeAmareloTreeModel,
  createPalmTreeModel,
  createBoxTruckModel,
  createLogTruckModel,
  createRealisticConstructionOverlay,
} from './threeModels';

export interface SceneController {
  update: (state: GameState, dt: number) => void;
  destroy: () => void;
  onPointerClick: (event: MouseEvent) => void;
  setBuildTool: (tool: string | null) => void;
  resetCamera: () => void;
}

export function initThreeScene(
  container: HTMLDivElement,
  onSelectBuilding: (id: string | null) => void,
  onSelectVehicle: (id: string | null) => void,
  onPlaceBuilding: (blueprintType: string, x: number, z: number) => void
): SceneController {
  const isSoftwareGl = (() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? (ext as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Scene & Atmosphere matching Santa Esperança (Sunny Brazilian daytime with blue sky and soft hills)
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Tropical blue sky
  scene.fog = new THREE.FogExp2(0xa3c8d7, 0.0055);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  // Camera looking across Santa Esperança landscape
  const camera = new THREE.PerspectiveCamera(
    38,
    container.clientWidth / container.clientHeight,
    0.5,
    600
  );
  camera.position.set(0, 50, 52);
  const cameraTarget = new THREE.Vector3(0, 0, -6);
  camera.lookAt(cameraTarget);

  // Warm Brazilian Sunlight
  const sunLight = new THREE.DirectionalLight(0xfffaed, 2.5);
  sunLight.position.set(45, 75, 30);
  sunLight.castShadow = !isSoftwareGl;
  if (!isSoftwareGl) {
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 180;
    const d = 60;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
  }
  scene.add(sunLight);

  const hemiLight = new THREE.HemisphereLight(0xbee3f8, 0x3d5a2b, 1.2);
  scene.add(hemiLight);

  // Procedural Ground Texture: Brazilian green pastures, red earth, and rolling terrain (conforme image_d92ebf14)
  const groundCanvas = document.createElement('canvas');
  groundCanvas.width = 512;
  groundCanvas.height = 512;
  const ctx = groundCanvas.getContext('2d')!;
  ctx.fillStyle = '#4c6e32'; // Lush tropical pasture
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 400; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const rad = 15 + Math.random() * 50;
    ctx.fillStyle = Math.random() > 0.4 ? 'rgba(74, 119, 44, 0.4)' : 'rgba(122, 75, 41, 0.25)'; // Terra roxa/vermelha
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const groundTexture = new THREE.CanvasTexture(groundCanvas);
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(16, 16);
  groundTexture.colorSpace = THREE.SRGBColorSpace;
  groundTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const terrainGeo = new THREE.PlaneGeometry(280, 280, 32, 32);
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.9,
    metalness: 0.05,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = !isSoftwareGl;
  scene.add(terrain);

  // Rio Paraíba / Rio Santa Esperança (conforme image_d92ebf14 em segundo plano)
  const riverGeo = new THREE.PlaneGeometry(30, 280);
  riverGeo.rotateX(-Math.PI / 2);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x2b6cb0,
    roughness: 0.1,
    metalness: 0.8,
  });
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.position.set(-65, 0.02, 0);
  river.rotation.y = 0.12;
  scene.add(river);

  // Ponte de concreto armado sobre o rio
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 1.2, 34),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 })
  );
  bridge.position.set(-65, 1.2, -18);
  bridge.rotation.y = Math.PI / 2;
  scene.add(bridge);

  // Ipês Amarelos Floridos em destaque no mapa (conforme image_d60f846d)
  const ipeLocations: [number, number][] = [
    [-24, -12],
    [-8, 18],
    [16, -26],
    [28, 4],
    [8, 22],
    [-34, 14],
  ];
  ipeLocations.forEach(([ix, iz]) => {
    const ipe = createIpeAmareloTreeModel();
    ipe.position.set(ix, 0, iz);
    ipe.scale.set(1.1, 1.1, 1.1);
    scene.add(ipe);
  });

  // Palmeiras Tropicais
  const palmLocations: [number, number][] = [
    [-14, 2],
    [4, -12],
    [22, -14],
    [-2, 12],
  ];
  palmLocations.forEach(([px, pz]) => {
    const palm = createPalmTreeModel();
    palm.position.set(px, 0, pz);
    scene.add(palm);
  });

  // Dynamic Entity Containers
  const roadsContainer = new THREE.Group();
  const buildingsContainer = new THREE.Group();
  const vehiclesContainer = new THREE.Group();
  scene.add(roadsContainer);
  scene.add(buildingsContainer);
  scene.add(vehiclesContainer);

  const buildingMeshMap = new Map<string, THREE.Group>();
  const vehicleMeshMap = new Map<string, THREE.Group>();
  const roadMeshMap = new Map<string, THREE.Group>();

  // Raycaster & Mouse interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let currentActiveBuildTool: string | null = null;

  // Build Preview Ghost
  const previewGhost = new THREE.Mesh(
    new THREE.BoxGeometry(6, 4, 6),
    new THREE.MeshBasicMaterial({
      color: 0x0f766e,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    })
  );
  previewGhost.visible = false;
  scene.add(previewGhost);

  // Camera Orbit / Pan state
  let isDragging = false;
  let dragButton = 0;
  let prevMouseX = 0;
  let prevMouseY = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    dragButton = e.button;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isDragging) {
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;

      if (dragButton === 0 || dragButton === 2) {
        if (e.shiftKey || dragButton === 2) {
          camera.position.x -= dx * 0.12;
          camera.position.z -= dy * 0.12;
          cameraTarget.x -= dx * 0.12;
          cameraTarget.z -= dy * 0.12;
        } else {
          const angle = dx * 0.005;
          const offset = camera.position.clone().sub(cameraTarget);
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
          camera.position.copy(cameraTarget).add(offset);
        }
      }
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }

    if (currentActiveBuildTool) {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(terrain);
      if (hits.length > 0) {
        const hit = hits[0].point;
        previewGhost.visible = true;
        previewGhost.position.set(Math.round(hit.x / 4) * 4, 2, Math.round(hit.z / 4) * 4);
      }
    } else {
      previewGhost.visible = false;
    }
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.05;
    const dir = camera.position.clone().sub(cameraTarget).normalize();
    const currentDist = camera.position.distanceTo(cameraTarget);
    const newDist = Math.max(16, Math.min(130, currentDist + zoomDelta));
    camera.position.copy(cameraTarget).add(dir.multiplyScalar(newDist));
  };

  const keysDown = new Set<string>();
  const onKeyDown = (e: KeyboardEvent) => keysDown.add(e.key.toLowerCase());
  const onKeyUp = (e: KeyboardEvent) => keysDown.delete(e.key.toLowerCase());

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  container.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  container.addEventListener('wheel', onWheel, { passive: false });

  const onResize = () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);

  // Materials for Brazilian Highways & Roads
  const asphaltRoadMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.85,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const yellowLineMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.4,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const whiteStripeMat = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    roughness: 0.4,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const redDirtRoadMat = new THREE.MeshStandardMaterial({
    color: 0x8d4b32, // Terra vermelha do interior de SP/MG
    roughness: 0.98,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

  let frameId = 0;
  let isDestroyed = false;

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (isDestroyed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 60);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  function renderTick() {
    if (isDestroyed) return;

    const panSpeed = 0.6;
    if (keysDown.has('w') || keysDown.has('arrowup')) {
      camera.position.z -= panSpeed;
      cameraTarget.z -= panSpeed;
    }
    if (keysDown.has('s') || keysDown.has('arrowdown')) {
      camera.position.z += panSpeed;
      cameraTarget.z += panSpeed;
    }
    if (keysDown.has('a') || keysDown.has('arrowleft')) {
      camera.position.x -= panSpeed;
      cameraTarget.x -= panSpeed;
    }
    if (keysDown.has('d') || keysDown.has('arrowright')) {
      camera.position.x += panSpeed;
      cameraTarget.x += panSpeed;
    }

    camera.lookAt(cameraTarget);
    renderer.render(scene, camera);

    if (isSoftwareGl) {
      afterDraw(renderTick);
    } else {
      frameId = requestAnimationFrame(renderTick);
    }
  }

  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }
  renderTick();

  return {
    setBuildTool: (tool: string | null) => {
      currentActiveBuildTool = tool;
      if (!tool) previewGhost.visible = false;
    },

    resetCamera: () => {
      camera.position.set(0, 50, 52);
      cameraTarget.set(0, 0, -6);
      camera.lookAt(cameraTarget);
    },

    onPointerClick: (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (currentActiveBuildTool) {
        const hits = raycaster.intersectObject(terrain);
        if (hits.length > 0) {
          const pt = hits[0].point;
          onPlaceBuilding(currentActiveBuildTool, pt.x, pt.z);
        }
        return;
      }

      // Check click on buildings
      const buildingHitList: { id: string; dist: number }[] = [];
      buildingMeshMap.forEach((grp, id) => {
        const hits = raycaster.intersectObjects(grp.children, true);
        if (hits.length > 0) {
          buildingHitList.push({ id, dist: hits[0].distance });
        }
      });

      if (buildingHitList.length > 0) {
        buildingHitList.sort((a, b) => a.dist - b.dist);
        onSelectBuilding(buildingHitList[0].id);
        return;
      }

      // Check click on vehicles
      const vehicleHits: { id: string; dist: number }[] = [];
      vehicleMeshMap.forEach((grp, id) => {
        const hits = raycaster.intersectObjects(grp.children, true);
        if (hits.length > 0) {
          vehicleHits.push({ id, dist: hits[0].distance });
        }
      });

      if (vehicleHits.length > 0) {
        vehicleHits.sort((a, b) => a.dist - b.dist);
        onSelectVehicle(vehicleHits[0].id);
        return;
      }

      onSelectBuilding(null);
      onSelectVehicle(null);
    },

    update: (state: GameState) => {
      // 1. Sync Roads with Brazilian Highway Markings (Double yellow center line & white shoulders)
      state.roads.forEach((road) => {
        if (!roadMeshMap.has(road.id)) {
          const roadGroup = new THREE.Group();
          const dx = road.x2 - road.x1;
          const dz = road.z2 - road.z1;
          const len = Math.hypot(dx, dz);
          const roadWidth = road.type === 'asphalt' ? 3.8 : 3.0;

          const rGeo = new THREE.PlaneGeometry(roadWidth, len);
          rGeo.rotateX(-Math.PI / 2);

          const rMat = road.type === 'dirt' ? redDirtRoadMat : asphaltRoadMat;
          const roadBase = new THREE.Mesh(rGeo, rMat);
          roadBase.receiveShadow = !isSoftwareGl;
          roadGroup.add(roadBase);

          // Brazilian Asphalt Highway details (Faixa dupla amarela central conforme image_d60f846d)
          if (road.type === 'asphalt') {
            const yellowStripeGeo = new THREE.PlaneGeometry(0.12, len);
            yellowStripeGeo.rotateX(-Math.PI / 2);
            const stripeL = new THREE.Mesh(yellowStripeGeo, yellowLineMat);
            stripeL.position.set(-0.1, 0.015, 0);
            const stripeR = new THREE.Mesh(yellowStripeGeo, yellowLineMat);
            stripeR.position.set(0.1, 0.015, 0);
            roadGroup.add(stripeL);
            roadGroup.add(stripeR);

            // Faixas brancas laterais de acostamento
            const whiteStripeGeo = new THREE.PlaneGeometry(0.1, len);
            whiteStripeGeo.rotateX(-Math.PI / 2);
            const shoulderL = new THREE.Mesh(whiteStripeGeo, whiteStripeMat);
            shoulderL.position.set(-roadWidth / 2 + 0.2, 0.015, 0);
            const shoulderR = new THREE.Mesh(whiteStripeGeo, whiteStripeMat);
            shoulderR.position.set(roadWidth / 2 - 0.2, 0.015, 0);
            roadGroup.add(shoulderL);
            roadGroup.add(shoulderR);
          }

          roadGroup.position.set((road.x1 + road.x2) / 2, 0.02, (road.z1 + road.z2) / 2);
          roadGroup.rotation.y = -Math.atan2(dz, dx) + Math.PI / 2;

          roadsContainer.add(roadGroup);
          roadMeshMap.set(road.id, roadGroup);
        }
      });

      // 2. Sync Buildings with Brazilian Procedural Models
      state.buildings.forEach((bld) => {
        let bldGroup = buildingMeshMap.get(bld.id);

        if (!bldGroup) {
          bldGroup = new THREE.Group();
          bldGroup.position.set(bld.x, 0, bld.z);

          let model: THREE.Group;
          if (bld.type === 'centro_distribuicao' || bld.isCustoms) {
            model = createDistributionCenterModel();
          } else if (bld.type === 'silo') {
            model = createGrainSiloBatteryModel();
          } else if (bld.type === 'serraria') {
            model = createSawmillModel();
          } else if (bld.type === 'fazenda_graos') {
            model = createFarmCropModel();
          } else {
            // Default model adapted to Santa Esperança
            model = createDistributionCenterModel();
          }

          model.name = 'mainModel';
          bldGroup.add(model);

          if (!bld.isConstructed) {
            const overlay = createRealisticConstructionOverlay(bld.width * 2, bld.depth * 2);
            overlay.name = 'constructionOverlay';
            bldGroup.add(overlay);

            if (bld.stage === 'terraplanagem') {
              model.scale.set(0.9, 0.15, 0.9);
            } else if (bld.stage === 'estrutura') {
              model.scale.set(0.95, 0.55, 0.95);
            } else {
              model.scale.set(1.0, 0.9, 1.0);
            }
          }

          buildingsContainer.add(bldGroup);
          buildingMeshMap.set(bld.id, bldGroup);
        } else {
          const model = bldGroup.getObjectByName('mainModel');
          const overlay = bldGroup.getObjectByName('constructionOverlay');

          if (bld.isConstructed) {
            if (overlay) bldGroup.remove(overlay);
            if (model) model.scale.set(1, 1, 1);
          } else {
            if (model) {
              if (bld.stage === 'terraplanagem') {
                model.scale.set(0.9, 0.15, 0.9);
              } else if (bld.stage === 'estrutura') {
                model.scale.set(0.95, 0.55, 0.95);
              } else {
                model.scale.set(1.0, 0.9, 1.0);
              }
            }
          }
        }
      });

      // 3. Sync Vehicles with Brazilian Models & Road Physics
      state.vehicles.forEach((veh) => {
        let vehGroup = vehicleMeshMap.get(veh.id);
        if (!vehGroup) {
          vehGroup = new THREE.Group();
          let vModel: THREE.Group;
          if (veh.type === 'log_truck') {
            vModel = createLogTruckModel();
          } else if (veh.type === 'box_truck' || veh.type === 'semi_trailer') {
            vModel = createBoxTruckModel();
          } else {
            vModel = createBoxTruckModel();
          }
          vehGroup.add(vModel);
          vehiclesContainer.add(vehGroup);
          vehicleMeshMap.set(veh.id, vehGroup);
        }

        vehGroup.position.set(veh.x, 0, veh.z);
        vehGroup.rotation.y = veh.angle;
        vehGroup.rotation.z = veh.roll || 0;
      });
    },

    destroy: () => {
      isDestroyed = true;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);

      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    },
  };
}
