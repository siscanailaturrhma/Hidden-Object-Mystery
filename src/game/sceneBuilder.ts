import * as THREE from 'three';
import { GameLevel, HiddenItem, InteractiveContainer } from '../types';

export interface SceneBuildResult {
  scene: THREE.Scene;
  clickableObjects: THREE.Object3D[];
  itemMeshMap: Map<string, THREE.Object3D>;
  containerMeshMap: Map<string, { group: THREE.Group; movingPart: THREE.Object3D; isOpen: boolean; type: string }>;
  pointLights: THREE.PointLight[];
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
}

export function build3DLevelScene(level: GameLevel): SceneBuildResult {
  const theme = getEnvironmentTheme(level.environment);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(theme.bg);
  scene.fog = new THREE.FogExp2(theme.bg, 0.032);

  const clickableObjects: THREE.Object3D[] = [];
  const itemMeshMap = new Map<string, THREE.Object3D>();
  const containerMeshMap = new Map<string, { group: THREE.Group; movingPart: THREE.Object3D; isOpen: boolean; type: string }>();
  const pointLights: THREE.PointLight[] = [];

  // 1. Lighting Setup
  const ambientLight = new THREE.AmbientLight(theme.ambient, theme.ambientInt);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xfff7ed, 1.25);
  directionalLight.position.set(6, 12, 7);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 25;
  directionalLight.shadow.bias = -0.001;
  scene.add(directionalLight);

  // Themed accent point lights
  const mainLamp = new THREE.PointLight(theme.lamp1, theme.lamp1Int, 9);
  mainLamp.position.set(...theme.lamp1Pos);
  scene.add(mainLamp);
  pointLights.push(mainLamp);

  const secondLamp = new THREE.PointLight(theme.lamp2, theme.lamp2Int, 8);
  secondLamp.position.set(...theme.lamp2Pos);
  scene.add(secondLamp);
  pointLights.push(secondLamp);

  // 2. Diorama Room Base (Cutaway walls & floor)
  buildRoomShell(scene, level, theme);

  // 3. Furniture & Environmental Props for all 10 rooms
  switch (level.environment) {
    case 'study':
      buildStudyEnvironment(scene);
      break;
    case 'alchemy':
      buildAlchemyEnvironment(scene);
      break;
    case 'bookstore':
      buildBookstoreEnvironment(scene);
      break;
    case 'observatory':
      buildObservatoryEnvironment(scene);
      break;
    case 'clocktower':
      buildClocktowerEnvironment(scene);
      break;
    case 'greenhouse':
      buildGreenhouseEnvironment(scene);
      break;
    case 'pirate_cabin':
      buildPirateCabinEnvironment(scene);
      break;
    case 'art_studio':
      buildArtStudioEnvironment(scene);
      break;
    case 'oriental_teahouse':
      buildTeahouseEnvironment(scene);
      break;
    case 'vault':
      buildVaultEnvironment(scene);
      break;
    default:
      buildStudyEnvironment(scene);
      break;
  }

  // 4. Interactive Containers (Drawers / Chests)
  if (level.containers) {
    for (const container of level.containers) {
      const containerData = buildInteractiveContainer(container);
      scene.add(containerData.group);
      containerMeshMap.set(container.id, containerData);
      clickableObjects.push(containerData.movingPart);
    }
  }

  // 5. Build Hidden Target Items
  for (const item of level.items) {
    const itemMesh = createItemMesh(item);
    itemMesh.position.set(...item.position);
    if (item.rotation) {
      itemMesh.rotation.set(...item.rotation);
    }
    itemMesh.userData = {
      isTargetItem: true,
      itemId: item.id,
      itemData: item,
      originalScale: itemMesh.scale.clone(),
    };

    // If hidden inside a container, attach or hide initially
    if (item.hiddenInside) {
      const container = containerMeshMap.get(item.hiddenInside);
      if (container && !container.isOpen) {
        itemMesh.visible = false;
      }
    }

    scene.add(itemMesh);
    clickableObjects.push(itemMesh);
    itemMeshMap.set(item.id, itemMesh);
  }

  return {
    scene,
    clickableObjects,
    itemMeshMap,
    containerMeshMap,
    pointLights,
    ambientLight,
    directionalLight,
  };
}

interface EnvironmentTheme {
  bg: number;
  ambient: number;
  ambientInt: number;
  lamp1: number;
  lamp1Int: number;
  lamp1Pos: [number, number, number];
  lamp2: number;
  lamp2Int: number;
  lamp2Pos: [number, number, number];
  floor: number;
  wall: number;
  rug: number;
}

function getEnvironmentTheme(env: GameLevel['environment']): EnvironmentTheme {
  switch (env) {
    case 'alchemy':
      return {
        bg: 0x110e1b,
        ambient: 0x93c5fd,
        ambientInt: 0.75,
        lamp1: 0x818cf8,
        lamp1Int: 2.2,
        lamp1Pos: [-1.2, 2.5, -0.8],
        lamp2: 0x38bdf8,
        lamp2Int: 1.5,
        lamp2Pos: [1.8, 2.2, 1.2],
        floor: 0x27272a,
        wall: 0x1f2937,
        rug: 0x4338ca,
      };
    case 'bookstore':
      return {
        bg: 0x141814,
        ambient: 0xfef3c7,
        ambientInt: 0.85,
        lamp1: 0xf59e0b,
        lamp1Int: 1.8,
        lamp1Pos: [-1.4, 2.2, -0.5],
        lamp2: 0x10b981,
        lamp2Int: 1.2,
        lamp2Pos: [1.6, 2.0, 1.0],
        floor: 0x452918,
        wall: 0x273629,
        rug: 0x065f46,
      };
    case 'observatory':
      return {
        bg: 0x0a0f1d,
        ambient: 0x93c5fd,
        ambientInt: 0.72,
        lamp1: 0x38bdf8,
        lamp1Int: 2.1,
        lamp1Pos: [0, 2.8, 0],
        lamp2: 0xfacc15,
        lamp2Int: 1.4,
        lamp2Pos: [-1.8, 2.2, -1.2],
        floor: 0x1e293b,
        wall: 0x0f172a,
        rug: 0x1e1b4b,
      };
    case 'clocktower':
      return {
        bg: 0x14100c,
        ambient: 0xfef3c7,
        ambientInt: 0.78,
        lamp1: 0xf97316,
        lamp1Int: 2.2,
        lamp1Pos: [-1.5, 2.5, -1.0],
        lamp2: 0xeab308,
        lamp2Int: 1.6,
        lamp2Pos: [1.5, 2.2, 1.2],
        floor: 0x292524,
        wall: 0x3c271b,
        rug: 0x78350f,
      };
    case 'greenhouse':
      return {
        bg: 0x0f1912,
        ambient: 0xdcfce7,
        ambientInt: 0.9,
        lamp1: 0xfef08a,
        lamp1Int: 1.8,
        lamp1Pos: [0, 2.8, 0],
        lamp2: 0x4ade80,
        lamp2Int: 1.3,
        lamp2Pos: [-1.6, 2.2, -1.2],
        floor: 0x78350f,
        wall: 0x166534,
        rug: 0x14532d,
      };
    case 'pirate_cabin':
      return {
        bg: 0x0c1116,
        ambient: 0xffedd5,
        ambientInt: 0.75,
        lamp1: 0xf59e0b,
        lamp1Int: 2.2,
        lamp1Pos: [-1.2, 2.4, -0.6],
        lamp2: 0x0284c7,
        lamp2Int: 1.2,
        lamp2Pos: [1.8, 2.0, 1.4],
        floor: 0x3e2723,
        wall: 0x2c1810,
        rug: 0x881337,
      };
    case 'art_studio':
      return {
        bg: 0x171513,
        ambient: 0xffedd5,
        ambientInt: 0.88,
        lamp1: 0xfbbf24,
        lamp1Int: 1.9,
        lamp1Pos: [1.6, 2.6, -1.0],
        lamp2: 0xf43f5e,
        lamp2Int: 1.2,
        lamp2Pos: [-1.6, 2.0, 1.2],
        floor: 0x573d2a,
        wall: 0x44372e,
        rug: 0x9a3412,
      };
    case 'oriental_teahouse':
      return {
        bg: 0x141311,
        ambient: 0xfef3c7,
        ambientInt: 0.85,
        lamp1: 0xf59e0b,
        lamp1Int: 1.8,
        lamp1Pos: [-1.4, 2.2, -1.2],
        lamp2: 0xfde047,
        lamp2Int: 1.4,
        lamp2Pos: [1.6, 2.0, 1.0],
        floor: 0x3b2d1f,
        wall: 0x29211a,
        rug: 0x365314,
      };
    case 'vault':
      return {
        bg: 0x0a0c10,
        ambient: 0xe2e8f0,
        ambientInt: 0.72,
        lamp1: 0xef4444,
        lamp1Int: 2.0,
        lamp1Pos: [0, 2.8, 0],
        lamp2: 0x38bdf8,
        lamp2Int: 1.8,
        lamp2Pos: [-1.6, 2.2, -1.2],
        floor: 0x1e293b,
        wall: 0x0f172a,
        rug: 0x334155,
      };
    case 'study':
    default:
      return {
        bg: 0x181614,
        ambient: 0xffedd5,
        ambientInt: 0.85,
        lamp1: 0xfbbf24,
        lamp1Int: 1.8,
        lamp1Pos: [-1.2, 2.5, -0.8],
        lamp2: 0xf97316,
        lamp2Int: 1.4,
        lamp2Pos: [1.8, 2.2, 1.2],
        floor: 0x5c3d2e,
        wall: 0x473934,
        rug: 0x881337,
      };
  }
}

// Room base geometry
function buildRoomShell(scene: THREE.Scene, level: GameLevel, theme: EnvironmentTheme) {
  const roomSize = 7.5;
  const wallHeight = 4.2;

  // Floor
  const floorGeo = new THREE.BoxGeometry(roomSize, 0.4, roomSize);
  const floorMat = new THREE.MeshStandardMaterial({
    color: theme.floor,
    roughness: 0.65,
    metalness: level.environment === 'vault' ? 0.6 : 0.1,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Plinth border (diorama base frame)
  const plinthGeo = new THREE.BoxGeometry(roomSize + 0.4, 0.5, roomSize + 0.4);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.8,
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = -0.45;
  scene.add(plinth);

  // Back Wall (Z = -roomSize/2)
  const backWallGeo = new THREE.BoxGeometry(roomSize, wallHeight, 0.3);
  const wallMat = new THREE.MeshStandardMaterial({
    color: theme.wall,
    roughness: 0.85,
    metalness: level.environment === 'vault' ? 0.5 : 0.05,
  });
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, wallHeight / 2, -roomSize / 2 + 0.15);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Left Wall (X = -roomSize/2)
  const leftWallGeo = new THREE.BoxGeometry(0.3, wallHeight, roomSize);
  const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
  leftWall.position.set(-roomSize / 2 + 0.15, wallHeight / 2, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Decorative wainscoting / skirting board
  const skirtingMat = new THREE.MeshStandardMaterial({
    color: level.environment === 'vault' ? 0x0f172a : 0x2e1a12,
    roughness: 0.7,
  });
  const skirtBack = new THREE.Mesh(new THREE.BoxGeometry(roomSize, 0.3, 0.35), skirtingMat);
  skirtBack.position.set(0, 0.15, -roomSize / 2 + 0.17);
  scene.add(skirtBack);

  const skirtLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, roomSize), skirtingMat);
  skirtLeft.position.set(-roomSize / 2 + 0.17, 0.15, 0);
  scene.add(skirtLeft);

  // Ornate Rug
  const rugGeo = new THREE.PlaneGeometry(3.6, 3.6);
  const rugMat = new THREE.MeshStandardMaterial({
    color: theme.rug,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.01, 0.2);
  rug.receiveShadow = true;
  scene.add(rug);
}

// ----------------- ENVIRONMENT BUILDERS -----------------
function buildStudyEnvironment(scene: THREE.Scene) {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.75, roughness: 0.3 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.5 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });

  // Detective Desk
  const desk = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.3), woodMat);
  top.position.y = 1.15;
  top.castShadow = true;
  top.receiveShadow = true;
  desk.add(top);

  // Desk legs
  const legGeo = new THREE.BoxGeometry(0.12, 1.15, 0.12);
  const legPositions = [
    [-1.2, 0.575, -0.55],
    [1.2, 0.575, -0.55],
    [-1.2, 0.575, 0.55],
    [1.2, 0.575, 0.55],
  ];
  for (const pos of legPositions) {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    desk.add(leg);
  }
  desk.position.set(0.4, 0, -0.5);
  scene.add(desk);

  // Large Bookshelf on Back Wall
  const shelf = new THREE.Group();
  const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.5), woodMat);
  shelfFrame.position.set(1.8, 1.6, -3.2);
  shelfFrame.castShadow = true;
  scene.add(shelfFrame);

  // Add colorful books onto the shelf
  const bookColors = [0xb91c1c, 0x1e3a8a, 0x065f46, 0xd97706, 0x581c87];
  for (let row = 0; row < 3; row++) {
    for (let b = 0; b < 9; b++) {
      const bColor = bookColors[(row * 9 + b) % bookColors.length];
      const bookMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.08 + Math.random() * 0.04, 0.45 + Math.random() * 0.15, 0.35),
        new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.7 })
      );
      bookMesh.position.set(0.85 + b * 0.2, 0.8 + row * 0.9, -3.1);
      bookMesh.rotation.y = (Math.random() - 0.5) * 0.08;
      shelf.add(bookMesh);
    }
  }
  scene.add(shelf);

  // Globe on stand
  const globeStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.15, 0.5), goldMat);
  globeStand.position.set(1.8, 1.4, 1.3);
  const globeSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
  );
  globeSphere.position.set(1.8, 1.7, 1.3);
  scene.add(globeStand);
  scene.add(globeSphere);

  // Detective Armchair
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.9), leatherMat);
  seat.position.y = 0.5;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.2), leatherMat);
  back.position.set(0, 1.0, -0.35);
  chair.add(seat);
  chair.add(back);
  chair.position.set(0.4, 0, 0.6);
  chair.rotation.y = Math.PI;
  scene.add(chair);

  // Side Table with green banker lamp
  const sideTable = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 16), woodMat);
  sideTable.position.set(-1.4, 0.55, -1.2);
  scene.add(sideTable);

  const bankerLampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.4), goldMat);
  bankerLampBase.position.set(-1.4, 1.3, -1.2);
  const bankerLampShade = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.12, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.3 })
  );
  bankerLampShade.position.set(-1.4, 1.5, -1.2);
  scene.add(bankerLampBase);
  scene.add(bankerLampShade);

  // Stack of mystery papers on desk
  for (let i = 0; i < 4; i++) {
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.015, 0.5), paperMat);
    paper.position.set(0.1 + i * 0.02, 1.22 + i * 0.015, -0.4 + i * 0.02);
    paper.rotation.y = (i * 0.15);
    scene.add(paper);
  }

  // Wall Art
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.8, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 })
  );
  frame.position.set(-1.5, 2.5, -3.3);
  scene.add(frame);
}

function buildAlchemyEnvironment(scene: THREE.Scene) {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x261914, roughness: 0.7 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });

  // Central Alchemical Altar
  const altar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 1.1, 8), stoneMat);
  altar.position.set(0, 0.55, 0);
  scene.add(altar);

  // Altar rune circle
  const runeRing = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 0.75, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  runeRing.rotation.x = -Math.PI / 2;
  runeRing.position.set(0, 1.11, 0);
  scene.add(runeRing);

  // Alchemy Cauldron in the corner
  const cauldron = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.4, side: THREE.DoubleSide })
  );
  cauldron.rotation.x = Math.PI;
  cauldron.position.set(2.2, 0.6, 1.6);
  scene.add(cauldron);

  // Glowing liquid inside cauldron
  const liquid = new THREE.Mesh(
    new THREE.CircleGeometry(0.44, 16),
    new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.6 })
  );
  liquid.rotation.x = -Math.PI / 2;
  liquid.position.set(2.2, 0.45, 1.6);
  scene.add(liquid);

  // Wall Potion Shelf
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 0.4), darkWood);
  shelf.position.set(-0.8, 2.3, -2.4);
  scene.add(shelf);

  // Decorative bottles on shelf
  const flaskColors = [0xef4444, 0x10b981, 0x3b82f6, 0xfbbf24];
  for (let i = 0; i < 5; i++) {
    const flask = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.35, 12),
      new THREE.MeshStandardMaterial({
        color: flaskColors[i % flaskColors.length],
        roughness: 0.2,
        transparent: true,
        opacity: 0.85,
      })
    );
    flask.position.set(-1.8 + i * 0.5, 2.5, -2.4);
    scene.add(flask);
  }

  // Work table against north wall
  const table = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 1.0), darkWood);
  table.position.set(0, 0.5, -2.0);
  scene.add(table);

  // Distillation Alembic Glass set
  const alembic = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), copperMat);
  alembic.position.set(0.9, 1.2, -2.0);
  scene.add(alembic);
}

function buildBookstoreEnvironment(scene: THREE.Scene) {
  const lightWood = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7, roughness: 0.3 });

  // Espresso Coffee Bar Counter
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 2.8), lightWood);
  bar.position.set(-1.6, 0.55, -0.2);
  scene.add(bar);

  // Marble top
  const barTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.08, 2.9),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 })
  );
  barTop.position.set(-1.6, 1.14, -0.2);
  scene.add(barTop);

  // Espresso Machine on Bar
  const espressoMachine = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), brassMat);
  espressoMachine.position.set(-1.5, 1.48, -0.9);
  scene.add(espressoMachine);

  // Cafe table and two chairs
  const cafeTable = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.06, 16), lightWood);
  cafeTable.position.set(1.6, 1.1, -1.2);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.1, 12), darkStone);
  tableLeg.position.set(1.6, 0.55, -1.2);
  scene.add(cafeTable);
  scene.add(tableLeg);

  // Wall Bookcase along North wall
  const fullShelf = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.4, 0.45), lightWood);
  fullShelf.position.set(0.6, 1.7, -3.2);
  scene.add(fullShelf);

  // Reading bench in center
  const readingBench = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.8), lightWood);
  readingBench.position.set(0, 0.25, 1.4);
  scene.add(readingBench);

  // Chalkboard Menu on wall
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.6, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  board.position.set(-3.2, 2.4, -0.8);
  board.rotation.y = Math.PI / 2;
  scene.add(board);
}

function buildObservatoryEnvironment(scene: THREE.Scene) {
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x271a14, roughness: 0.7 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const starMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });

  // 1. Large Brass Celestial Telescope on Tripod
  const telescopeGroup = new THREE.Group();
  telescopeGroup.position.set(0, 0, -0.4);

  // 3 Tripod legs
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 1.8), darkWood);
    leg.position.set(Math.sin(angle) * 0.45, 0.8, Math.cos(angle) * 0.45);
    leg.rotation.z = Math.sin(angle) * 0.25;
    leg.rotation.x = -Math.cos(angle) * 0.25;
    telescopeGroup.add(leg);
  }

  // Telescope mount & barrel
  const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25), brassMat);
  mount.position.y = 1.65;
  telescopeGroup.add(mount);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 1.8, 16), brassMat);
  barrel.position.set(0, 1.9, 0.1);
  barrel.rotation.x = Math.PI / 4; // aimed at sky
  telescopeGroup.add(barrel);

  const finderScope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12), brassMat);
  finderScope.position.set(0.12, 2.05, 0.05);
  finderScope.rotation.x = Math.PI / 4;
  telescopeGroup.add(finderScope);

  scene.add(telescopeGroup);

  // 2. Large Armillary Sphere on Stone Pedestal
  const armillary = new THREE.Group();
  armillary.position.set(-1.8, 0, -1.2);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.1, 12), stoneMat);
  pedestal.position.y = 0.55;
  armillary.add(pedestal);

  const centerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), brassMat);
  centerSphere.position.y = 1.35;
  armillary.add(centerSphere);

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.015, 8, 24), brassMat);
  ring1.position.y = 1.35;
  armillary.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.015, 8, 24), brassMat);
  ring2.position.y = 1.35;
  ring2.rotation.x = Math.PI / 3;
  armillary.add(ring2);

  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.015, 8, 24), brassMat);
  ring3.position.y = 1.35;
  ring3.rotation.y = Math.PI / 3;
  armillary.add(ring3);

  scene.add(armillary);

  // 3. Star Chart Drafting Table
  const draftTable = new THREE.Group();
  draftTable.position.set(1.6, 0, -1.0);
  const tableBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.0), darkWood);
  tableBase.position.y = 0.5;
  const tiltedBoard = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 1.1), darkWood);
  tiltedBoard.position.set(0, 1.08, 0);
  tiltedBoard.rotation.x = 0.2;
  const mapPaper = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.01, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  mapPaper.position.set(0, 1.12, 0);
  mapPaper.rotation.x = 0.2;

  draftTable.add(tableBase);
  draftTable.add(tiltedBoard);
  draftTable.add(mapPaper);
  scene.add(draftTable);

  // 4. Constellation Chart Dial on Back Wall
  const starRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.95, 32), brassMat);
  starRing.position.set(0, 2.7, -3.3);
  scene.add(starRing);

  for (let s = 0; s < 12; s++) {
    const sAng = (s * Math.PI * 2) / 12;
    const starDot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), starMat);
    starDot.position.set(Math.sin(sAng) * 0.88, 2.7 + Math.cos(sAng) * 0.88, -3.28);
    scene.add(starDot);
  }

  // 5. Observatory Deck Ladder
  const ladder = new THREE.Group();
  ladder.position.set(2.4, 1.6, 1.0);
  ladder.rotation.z = -0.15;
  const rail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.2), brassMat);
  rail1.position.x = -0.22;
  const rail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.2), brassMat);
  rail2.position.x = 0.22;
  ladder.add(rail1);
  ladder.add(rail2);
  for (let r = 0; r < 7; r++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44), brassMat);
    rung.rotation.z = Math.PI / 2;
    rung.position.y = -1.2 + r * 0.4;
    ladder.add(rung);
  }
  scene.add(ladder);
}

function buildClocktowerEnvironment(scene: THREE.Scene) {
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x292524, metalness: 0.85, roughness: 0.3 });
  const gearMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.25 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, metalness: 0.8, roughness: 0.3 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x3b1d0e, roughness: 0.6 });

  // 1. Giant Interlocking Gears on Back Wall
  const createGear = (radius: number, teeth: number, mat: THREE.Material) => {
    const g = new THREE.Group();
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.08, 24), mat);
    disk.rotation.x = Math.PI / 2;
    g.add(disk);

    // Inner cutout ring
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, 0.085, 16), ironMat);
    hole.rotation.x = Math.PI / 2;
    g.add(hole);

    // Gear teeth
    for (let t = 0; t < teeth; t++) {
      const ang = (t * Math.PI * 2) / teeth;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), mat);
      tooth.position.set(Math.sin(ang) * (radius + 0.05), Math.cos(ang) * (radius + 0.05), 0);
      tooth.rotation.z = -ang;
      g.add(tooth);
    }
    return g;
  };

  const gear1 = createGear(1.1, 16, gearMat);
  gear1.position.set(0.3, 2.1, -3.15);
  scene.add(gear1);

  const gear2 = createGear(0.7, 12, ironMat);
  gear2.position.set(-1.2, 2.7, -3.15);
  scene.add(gear2);

  const gear3 = createGear(0.5, 8, copperMat);
  gear3.position.set(1.6, 2.6, -3.15);
  scene.add(gear3);

  // 2. Heavy Grandfather Pendulum
  const pendulum = new THREE.Group();
  pendulum.position.set(0.3, 2.1, -2.8);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8), gearMat);
  rod.position.y = -0.9;
  const bob = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24), gearMat);
  bob.rotation.x = Math.PI / 2;
  bob.position.y = -1.8;
  pendulum.add(rod);
  pendulum.add(bob);
  scene.add(pendulum);

  // 3. Clockmaker's Workbench
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.0), darkWood);
  bench.position.set(-1.4, 0.5, -0.6);
  scene.add(bench);

  // Bench Vise and miniature components
  const vise = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.25), ironMat);
  vise.position.set(-2.2, 1.1, -0.6);
  scene.add(vise);

  // 4. Steam Pipes with Pressure Gauges along Left Wall
  const pipeMat = copperMat;
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.8), pipeMat);
  pipe.position.set(-3.2, 2.0, 0);
  pipe.rotation.x = Math.PI / 2;
  scene.add(pipe);

  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), gearMat);
  gauge.position.set(-3.1, 2.2, 0.4);
  gauge.rotation.z = Math.PI / 2;
  scene.add(gauge);

  // 5. Antique Grandfather Clock Standing Cabinet
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.8, 0.5), darkWood);
  cabinet.position.set(1.8, 1.4, 1.0);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), new THREE.MeshStandardMaterial({ color: 0xfffbeb }));
  face.position.set(1.8, 2.3, 1.26);
  scene.add(cabinet);
  scene.add(face);
}

function buildGreenhouseEnvironment(scene: THREE.Scene) {
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
  const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.85 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    transmission: 0.9,
    roughness: 0.1,
  });

  // 1. Long Potting Work Bench
  const pottingBench = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 1.1), darkWood);
  pottingBench.position.set(-1.2, 0.5, -1.6);
  scene.add(pottingBench);

  // Terracotta flower pots on bench
  for (let p = 0; p < 4; p++) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.22, 12), terracottaMat);
    pot.position.set(-2.0 + p * 0.4, 1.12, -1.6);
    scene.add(pot);

    const plantSprout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), leafMat);
    plantSprout.position.set(-2.0 + p * 0.4, 1.25, -1.6);
    scene.add(plantSprout);
  }

  // 2. Glass Cloche Dome Terrarium on Bench
  const clocheBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16), darkWood);
  clocheBase.position.set(-0.8, 1.02, -1.6);
  const clocheDome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), glassMat);
  clocheDome.position.set(-0.8, 1.1, -1.6);
  scene.add(clocheBase);
  scene.add(clocheDome);

  // 3. Potted Exotic Palms
  const largePalmPot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.28, 0.65, 16), terracottaMat);
  largePalmPot.position.set(1.8, 0.33, -1.5);
  scene.add(largePalmPot);

  for (let f = 0; f < 6; f++) {
    const frondAng = (f * Math.PI * 2) / 6;
    const frond = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.02), leafMat);
    frond.position.set(1.8 + Math.sin(frondAng) * 0.35, 1.1, -1.5 + Math.cos(frondAng) * 0.35);
    frond.rotation.z = Math.sin(frondAng) * 0.6;
    frond.rotation.x = Math.cos(frondAng) * 0.6;
    scene.add(frond);
  }

  // 4. Tiered Plant Display Shelf
  const shelf = new THREE.Group();
  shelf.position.set(1.6, 0, 0.8);
  for (let t = 0; t < 3; t++) {
    const tier = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.35), darkWood);
    tier.position.set(0, 0.4 + t * 0.4, -t * 0.25);
    shelf.add(tier);

    const miniPot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.14, 10), terracottaMat);
    miniPot.position.set(-0.4, 0.5 + t * 0.4, -t * 0.25);
    shelf.add(miniPot);
  }
  scene.add(shelf);

  // 5. Metal Watering Can
  const canMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
  const waterCan = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.28, 14), canMat);
  waterCan.position.set(0.2, 0.14, 1.6);
  scene.add(waterCan);
}

function buildPirateCabinEnvironment(scene: THREE.Scene) {
  const oakMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.65 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.8, roughness: 0.35 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });

  // 1. Galleon Stern Arched Windows
  const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x27170c, roughness: 0.7 });
  for (let w = -1; w <= 1; w++) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.06), windowFrameMat);
    win.position.set(w * 1.8, 2.5, -3.3);
    scene.add(win);
  }

  // 2. Large Pirate Ship Helm (Steering Wheel)
  const helmGroup = new THREE.Group();
  helmGroup.position.set(-1.6, 1.4, -1.4);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), oakMat);
  hub.rotation.x = Math.PI / 2;
  helmGroup.add(hub);

  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 24), oakMat);
  helmGroup.add(wheelRim);

  for (let s = 0; s < 8; s++) {
    const sAng = (s * Math.PI * 2) / 8;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3), oakMat);
    spoke.rotation.z = sAng;
    helmGroup.add(spoke);
  }
  const helmPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.4), oakMat);
  helmPost.position.set(0, -0.7, 0);
  helmGroup.add(helmPost);
  scene.add(helmGroup);

  // 3. Iron Naval Cannon on Wooden Carriage
  const cannon = new THREE.Group();
  cannon.position.set(1.8, 0.45, -1.2);
  cannon.rotation.y = -Math.PI / 4;

  const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 1.2), oakMat);
  cannon.add(carriage);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.5, 16), ironMat);
  barrel.rotation.x = Math.PI / 2.2;
  barrel.position.set(0, 0.3, 0.1);
  cannon.add(barrel);
  scene.add(cannon);

  // 4. Captain's Navigation Table
  const navTable = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 1.2), oakMat);
  navTable.position.set(0.2, 0.5, 0);
  scene.add(navTable);

  const mapParchment = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.015, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 })
  );
  mapParchment.position.set(0.2, 1.02, 0);
  scene.add(mapParchment);

  // 5. Stacked Rum Kegs / Grog Barrels
  for (let b = 0; b < 3; b++) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.7, 14), oakMat);
    barrel.position.set(-2.0 + (b % 2) * 0.5, 0.35 + Math.floor(b / 2) * 0.6, 0.8);
    scene.add(barrel);
  }
}

function buildArtStudioEnvironment(scene: THREE.Scene) {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
  const canvasMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });

  // 1. Large Wooden Painter's Tripod Easel
  const easel = new THREE.Group();
  easel.position.set(-0.4, 0, -0.6);

  const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.8, 0.06), woodMat);
  leg1.position.set(-0.4, 1.4, 0);
  leg1.rotation.z = -0.12;
  const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.8, 0.06), woodMat);
  leg2.position.set(0.4, 1.4, 0);
  leg2.rotation.z = 0.12;
  const backLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.8, 0.06), woodMat);
  backLeg.position.set(0, 1.4, -0.5);
  backLeg.rotation.x = -0.22;

  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.9, 0.06), woodMat);
  mast.position.y = 1.45;

  // Stretched Canvas Artwork
  const canvas = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.05), canvasMat);
  canvas.position.set(0, 1.5, 0.05);

  easel.add(leg1);
  easel.add(leg2);
  easel.add(backLeg);
  easel.add(mast);
  easel.add(canvas);
  scene.add(easel);

  // 2. Classical Sculpted Plaster Bust on Column
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.2, 16), marbleMat);
  pedestal.position.set(1.8, 0.6, -1.6);
  const bustHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), marbleMat);
  bustHead.position.set(1.8, 1.4, -1.6);
  bustHead.scale.set(0.8, 1.2, 0.9);
  scene.add(pedestal);
  scene.add(bustHead);

  // 3. Taboret Table with Paint Bottles and Palette
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.9), woodMat);
  table.position.set(-1.8, 0.5, -0.8);
  scene.add(table);

  // Stool with draped cloth
  const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16), woodMat);
  stool.position.set(1.2, 0.3, 0.8);
  const drape = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 })
  );
  drape.position.set(1.2, 0.64, 0.8);
  scene.add(stool);
  scene.add(drape);
}

function buildTeahouseEnvironment(scene: THREE.Scene) {
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.55 });
  const tatamiMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.85 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });

  // 1. Low Chabudai Wooden Tea Table
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 1.2), bambooMat);
  table.position.set(0, 0.38, 0);
  const legPositions = [
    [-0.7, 0.19, -0.5],
    [0.7, 0.19, -0.5],
    [-0.7, 0.19, 0.5],
    [0.7, 0.19, 0.5],
  ];
  for (const pos of legPositions) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.08), bambooMat);
    leg.position.set(...(pos as [number, number, number]));
    scene.add(leg);
  }
  scene.add(table);

  // Tea Tray on Table
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.02, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 })
  );
  tray.position.set(0, 0.45, 0);
  scene.add(tray);

  // Zabuton Floor Cushions
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.8 });
  const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), cushionMat);
  c1.position.set(0, 0.04, 0.9);
  const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), cushionMat);
  c2.position.set(0, 0.04, -0.9);
  scene.add(c1);
  scene.add(c2);

  // 2. Shoji Screen Grid on Back Wall
  for (let s = 0; s < 3; s++) {
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.2, 0.04), paperMat);
    screen.position.set(-2.0 + s * 2.0, 1.8, -3.3);
    scene.add(screen);
  }

  // 3. Miniature Bonsai Tree on Pedestal
  const bonsaiStand = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.8, 12), bambooMat);
  bonsaiStand.position.set(-1.8, 0.4, -1.4);
  const bonsaiTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.4, 8), bambooMat);
  bonsaiTrunk.position.set(-1.8, 0.9, -1.4);
  bonsaiTrunk.rotation.z = 0.2;
  const bonsaiFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), tatamiMat);
  bonsaiFoliage.position.set(-1.85, 1.15, -1.4);
  scene.add(bonsaiStand);
  scene.add(bonsaiTrunk);
  scene.add(bonsaiFoliage);

  // 4. Granite Toro Stone Lantern in Corner
  const lanternBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.5), stoneMat);
  lanternBase.position.set(1.8, 0.15, -1.4);
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.6), stoneMat);
  lanternPost.position.set(1.8, 0.6, -1.4);
  const lanternRoof = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 4), stoneMat);
  lanternRoof.position.set(1.8, 1.05, -1.4);
  lanternRoof.rotation.y = Math.PI / 4;
  scene.add(lanternBase);
  scene.add(lanternPost);
  scene.add(lanternRoof);
}

function buildVaultEnvironment(scene: THREE.Scene) {
  const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.25 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // 1. Giant Round Bank Vault Door on Back Wall
  const vaultDoor = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.35, 32), titaniumMat);
  vaultDoor.rotation.x = Math.PI / 2;
  vaultDoor.position.set(0, 2.1, -3.2);
  scene.add(vaultDoor);

  const vaultWheel = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 8, 24), darkSteel);
  vaultWheel.position.set(0, 2.1, -3.0);
  scene.add(vaultWheel);

  // 2. Safe Deposit Box Grid along Left Wall
  const safetyWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 3.8), titaniumMat);
  safetyWall.position.set(-3.2, 1.8, -0.4);
  scene.add(safetyWall);

  // 3. Central High-Security Display Pedestal
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 1.2, 8), darkSteel);
  pedestal.position.set(0, 0.6, 0);
  scene.add(pedestal);

  const glassCase = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.7),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      transmission: 0.95,
      roughness: 0.05,
    })
  );
  glassCase.position.set(0, 1.55, 0);
  scene.add(glassCase);

  // Laser security beam cross
  const beam1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8), laserMat);
  beam1.rotation.z = Math.PI / 2;
  beam1.position.set(0, 1.45, 0);
  const beam2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8), laserMat);
  beam2.rotation.x = Math.PI / 2;
  beam2.position.set(0, 1.65, 0);
  scene.add(beam1);
  scene.add(beam2);

  // 4. Stacks of Gleaming Gold Bullion on Transport Pallet
  const pallet = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.15, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
  );
  pallet.position.set(1.6, 0.08, -1.2);
  scene.add(pallet);

  for (let layer = 0; layer < 3; layer++) {
    for (let b = 0; b < 4 - layer; b++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.14), goldMat);
      bar.position.set(1.3 + b * 0.2, 0.2 + layer * 0.085, -1.2);
      scene.add(bar);
    }
  }

  // 5. Security Terminal Keypad Post
  const terminal = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), darkSteel);
  terminal.position.set(-1.6, 0.6, 1.2);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.05), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  screen.position.set(-1.6, 1.15, 1.03);
  scene.add(terminal);
  scene.add(screen);
}

// ----------------- INTERACTIVE CONTAINERS -----------------
function buildInteractiveContainer(container: InteractiveContainer) {
  const group = new THREE.Group();
  group.position.set(...container.position);

  let movingPart: THREE.Object3D;
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x3f1d0b, roughness: 0.5 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });

  if (container.type === 'chest') {
    // Chest base
    const chestBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.45), darkWood);
    chestBase.castShadow = true;
    group.add(chestBase);

    // Chest lid (rotates on hinge at the back)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.2, -0.22); // hinge position
    const lidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.7, 12, 1, false, 0, Math.PI), darkWood);
    lidMesh.rotation.z = Math.PI / 2;
    lidMesh.rotation.y = Math.PI / 2;
    lidMesh.position.set(0, 0, 0.22);

    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.05), brassMat);
    latch.position.set(0, -0.05, 0.45);
    lidMesh.add(latch);

    lidGroup.add(lidMesh);
    group.add(lidGroup);
    movingPart = lidGroup;

    movingPart.userData = {
      isContainer: true,
      containerId: container.id,
      containerType: 'chest',
      name: container.name,
      isOpen: false,
    };
  } else if (container.type === 'drawer') {
    // Desk drawer housing
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, 0.7), darkWood);
    group.add(housing);

    // Pull-out drawer box
    const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.2, 0.65), darkWood);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 12), brassMat);
    handle.position.set(0, 0, 0.34);
    drawer.add(handle);

    group.add(drawer);
    movingPart = drawer;

    movingPart.userData = {
      isContainer: true,
      containerId: container.id,
      containerType: 'drawer',
      name: container.name,
      isOpen: false,
    };
  } else {
    // Cupboard door
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.05), darkWood);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), brassMat);
    knob.position.set(0.18, 0, 0.04);
    door.add(knob);
    group.add(door);
    movingPart = door;

    movingPart.userData = {
      isContainer: true,
      containerId: container.id,
      containerType: 'cupboard',
      name: container.name,
      isOpen: false,
    };
  }

  return {
    group,
    movingPart,
    isOpen: false,
    type: container.type,
  };
}

// ----------------- HIDDEN OBJECT PROCEDURAL MESH CREATORS -----------------
function createItemMesh(item: HiddenItem): THREE.Object3D {
  const group = new THREE.Group();
  const color = new THREE.Color(item.color);

  switch (item.meshType) {
    case 'magnifier': {
      // Brass rim and handle
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        roughness: 0.05,
        transmission: 0.9,
      });

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 16, 24), brassMat);
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.01, 24), glassMat);
      glass.rotation.x = Math.PI / 2;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.25, 12), brassMat);
      handle.position.set(0, -0.24, 0);

      group.add(rim);
      group.add(glass);
      group.add(handle);
      group.scale.set(0.9, 0.9, 0.9);
      break;
    }

    case 'watch': {
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const faceMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.4 });

      const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24), goldMat);
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.042, 24), faceMat);
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), goldMat);
      loop.position.set(0, 0.14, 0);

      group.add(casing);
      group.add(dial);
      group.add(loop);
      break;
    }

    case 'key': {
      const keyMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.85, roughness: 0.3 });
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16), keyMat);
      bow.position.y = 0.14;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25), keyMat);
      const bit1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.015), keyMat);
      bit1.position.set(0.03, -0.09, 0);
      const bit2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.015), keyMat);
      bit2.position.set(0.035, -0.05, 0);

      group.add(bow);
      group.add(shaft);
      group.add(bit1);
      group.add(bit2);
      break;
    }

    case 'potion': {
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        transmission: 0.8,
        roughness: 0.1,
      });
      const liquidMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      const corkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });

      const flask = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), glassMat);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1), glassMat);
      neck.position.y = 0.14;
      const liquid = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), liquidMat);
      const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.06), corkMat);
      cork.position.y = 0.2;

      group.add(flask);
      group.add(neck);
      group.add(liquid);
      group.add(cork);
      break;
    }

    case 'crystal': {
      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.7,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.9,
      });
      const crystalMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), crystalMat);
      crystalMesh.scale.set(0.8, 1.6, 0.8);
      group.add(crystalMesh);
      break;
    }

    case 'scroll': {
      const scrollMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.85 });
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 16), scrollMat);
      roll.rotation.z = Math.PI / 2;
      const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.01, 8, 16), ribbonMat);
      ribbon.rotation.y = Math.PI / 2;
      group.add(roll);
      group.add(ribbon);
      break;
    }

    case 'camera': {
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8, roughness: 0.2 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.09), bodyMat);
      const topPlate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.09), silverMat);
      topPlate.position.y = 0.085;
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), silverMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = 0.07;
      const shutter = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03), silverMat);
      shutter.position.set(0.07, 0.11, 0);

      group.add(body);
      group.add(topPlate);
      group.add(lens);
      group.add(shutter);
      break;
    }

    case 'gem': {
      const gemMat = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 0.3,
      });
      const bandMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });

      const band = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 12, 20), bandMat);
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05), gemMat);
      stone.position.y = 0.09;

      group.add(band);
      group.add(stone);
      break;
    }

    case 'pipe': {
      const briarMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.6 });
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.1, 12), briarMat);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18), briarMat);
      stem.rotation.z = -Math.PI / 3;
      stem.position.set(0.08, -0.02, 0);
      group.add(bowl);
      group.add(stem);
      break;
    }

    case 'compass': {
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
      const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 20), brassMat);
      const needle = new THREE.Mesh(
        new THREE.ConeGeometry(0.02, 0.14, 4),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
      );
      needle.rotation.x = Math.PI / 2;
      needle.position.y = 0.02;
      group.add(casing);
      group.add(needle);
      break;
    }

    case 'book': {
      const coverMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
      const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
      const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

      // Book cover (hardcover)
      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.32), coverMat);
      // Pages
      const pages = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.3), pagesMat);
      pages.position.set(0.015, 0, 0);
      // Gold spine
      const spine = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.052, 0.32), goldTrimMat);
      spine.position.set(-0.115, 0, 0);
      // Gold emblem on front
      const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.005, 0.1), goldTrimMat);
      emblem.position.set(0.02, 0.027, 0);

      group.add(cover);
      group.add(pages);
      group.add(spine);
      group.add(emblem);
      break;
    }

    case 'cup':
    default: {
      const ceramicMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });
      const cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 16), ceramicMat);
      const handleMesh = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 12), ceramicMat);
      handleMesh.position.set(0.07, 0, 0);
      group.add(cupMesh);
      group.add(handleMesh);
      break;
    }
  }

  // Add invisible slightly larger hit proxy box for easy clicking on mobile / desktop
  const hitBoxGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
  const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
  group.add(hitBox);

  return group;
}
