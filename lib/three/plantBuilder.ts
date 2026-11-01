import * as THREE from 'three';
import { ZoneId } from '../types/plant';
import {
  createConcretePavementTexture,
  createHazardStripesTexture,
  createSolarPanelTexture,
  createCarbonBiocharTexture,
  createLabelTexture,
} from './textureFactory';

export interface PlantBuildResult {
  rootGroup: THREE.Group;
  cutawayMeshes: THREE.Mesh[];
  interiorComponents: THREE.Object3D[];
  zoneHitObjects: { zoneId: ZoneId; object: THREE.Object3D; worldPos: THREE.Vector3 }[];
  thermalColoredMeshes: { mesh: THREE.Mesh; normalColor: THREE.Color; thermalColor: THREE.Color }[];
  rotatingParts: { object: THREE.Object3D; axis: 'x' | 'y' | 'z'; speed: number }[];
}

export function buildEcofarmCircularPlant(): PlantBuildResult {
  const root = new THREE.Group();
  root.name = 'ECOFARM_CIRCULAR_PLANT';

  const cutawayMeshes: THREE.Mesh[] = [];
  const interiorComponents: THREE.Object3D[] = [];
  const zoneHitObjects: { zoneId: ZoneId; object: THREE.Object3D; worldPos: THREE.Vector3 }[] = [];
  const thermalColoredMeshes: { mesh: THREE.Mesh; normalColor: THREE.Color; thermalColor: THREE.Color }[] = [];
  const rotatingParts: { object: THREE.Object3D; axis: 'x' | 'y' | 'z'; speed: number }[] = [];

  // ==========================================
  // 1. INDUSTRIAL PBR MATERIALS
  // ==========================================
  const concreteTexture = createConcretePavementTexture();
  concreteTexture.repeat.set(9, 6);

  const hazardTexture = createHazardStripesTexture();

  const solarTexture = createSolarPanelTexture();

  const matSteel = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.35,
  });

  const matDarkSteel = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.4,
  });

  const matStainless = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.18,
  });

  const matSafetyYellow = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    metalness: 0.35,
    roughness: 0.35,
  });

  const matIndustrialGreen = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    metalness: 0.45,
    roughness: 0.4,
  });

  const matConcrete = new THREE.MeshStandardMaterial({
    map: concreteTexture,
    roughness: 0.85,
    metalness: 0.08,
  });

  const matHazardCurb = new THREE.MeshStandardMaterial({
    map: hazardTexture,
    roughness: 0.5,
    metalness: 0.2,
  });

  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transmission: 0.85,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
  });

  const matSand = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.95,
    metalness: 0.05,
  });

  const matBiochar = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.9,
    metalness: 0.1,
  });

  const matSolarPanel = new THREE.MeshStandardMaterial({
    map: solarTexture,
    metalness: 0.9,
    roughness: 0.2,
  });

  const matEquipmentBlue = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.55,
    roughness: 0.35,
  });

  const matVacuumTube = new THREE.MeshPhysicalMaterial({
    color: 0x1d4ed8,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85,
    roughness: 0.15,
    metalness: 0.3,
  });

  const matWhiteFunnel = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.1,
  });

  // Helper to register zone mesh for raycasting and inspection
  function tagMesh(mesh: THREE.Mesh, zoneId: ZoneId) {
    mesh.userData.zoneId = zoneId;
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    zoneHitObjects.push({ zoneId, object: mesh, worldPos });
  }

  // Helper to add 3D Zone placard signpost
  function createSignpost(text: string, x: number, z: number, zoneId: ZoneId) {
    const postGroup = new THREE.Group();
    postGroup.position.set(x, 0, z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), matDarkSteel);
    pole.position.y = 0.9;
    postGroup.add(pole);

    const signTexture = createLabelTexture(text);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.04), signMat);
    board.position.set(0, 1.8, 0);
    tagMesh(board, zoneId);
    postGroup.add(board);

    root.add(postGroup);
  }

  // ==========================================
  // 1. CONCRETE SLAB, RAISED PLINTHS & PERIMETER SAFETY
  // ==========================================
  const slab = new THREE.Mesh(new THREE.BoxGeometry(38, 0.6, 26), matConcrete);
  slab.position.y = -0.3;
  slab.receiveShadow = true;
  root.add(slab);

  // Elevated Concrete Equipment Foundation Plinths (as seen in original engineering model)
  const processPlinth = new THREE.Mesh(new THREE.BoxGeometry(22, 0.16, 5.2), matConcrete);
  processPlinth.position.set(3.5, 0.08, -1.2);
  processPlinth.receiveShadow = true;
  root.add(processPlinth);

  const solarPlinth = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.16, 5.2), matConcrete);
  solarPlinth.position.set(1.5, 0.08, 3.8);
  solarPlinth.receiveShadow = true;
  root.add(solarPlinth);

  // Front edge hazard safety curb
  const frontCurbTexture = hazardTexture.clone();
  frontCurbTexture.repeat.set(24, 1);
  const matFrontCurb = new THREE.MeshStandardMaterial({
    map: frontCurbTexture,
    roughness: 0.5,
    metalness: 0.2,
  });
  const frontCurb = new THREE.Mesh(new THREE.BoxGeometry(38, 0.12, 0.5), matFrontCurb);
  frontCurb.position.set(0, 0.06, 12.75);
  root.add(frontCurb);

  // Left edge hazard safety curb
  const leftCurbTexture = hazardTexture.clone();
  leftCurbTexture.repeat.set(1, 16);
  const matLeftCurb = new THREE.MeshStandardMaterial({
    map: leftCurbTexture,
    roughness: 0.5,
    metalness: 0.2,
  });
  const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 26), matLeftCurb);
  leftCurb.position.set(-18.75, 0.06, 0);
  root.add(leftCurb);

  // Perimeter yellow safety bollards
  const bollardPositions: [number, number][] = [
    [-17, 12.5], [-12, 12.5], [-7, 12.5], [-2, 12.5], [3, 12.5], [8, 12.5], [13, 12.5], [17, 12.5],
    [-18.5, 8], [-18.5, 3], [-18.5, -2], [-18.5, -7], [-18.5, -11],
    [17.5, -5], [17.5, 5],
  ];
  bollardPositions.forEach(([bx, bz]) => {
    const bollard = new THREE.Group();
    bollard.position.set(bx, 0, bz);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 12), matSafetyYellow);
    post.position.y = 0.45;
    post.castShadow = true;
    bollard.add(post);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.12, 12), matDarkSteel);
    cap.position.y = 0.85;
    bollard.add(cap);

    root.add(bollard);
  });

  // Tall yard floodlight mast (back-left corner)
  const mastGroup = new THREE.Group();
  mastGroup.position.set(-17.5, 0, 11);
  const mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 7.5, 12), matSteel);
  mastPole.position.y = 3.75;
  mastPole.castShadow = true;
  mastGroup.add(mastPole);

  const mastArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.2), matSteel);
  mastArm.position.set(0.5, 7.5, -0.4);
  mastArm.rotation.y = -0.5;
  mastGroup.add(mastArm);

  const luminaire = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.45), matDarkSteel);
  luminaire.position.set(1.0, 7.4, -0.7);
  luminaire.rotation.z = -0.3;
  mastGroup.add(luminaire);

  const lightFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.65, 0.4),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  lightFace.rotation.x = Math.PI / 2;
  lightFace.position.set(1.0, 7.33, -0.7);
  mastGroup.add(lightFace);
  root.add(mastGroup);

  // ==========================================
  // 2. ZONE A — BIOMASS INTAKE & ELEVATED CONVEYOR
  // ==========================================
  const zA_x = -13;
  const zA_z = 4.5;

  // Inground reception pit bunker
  const bunker = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 3.2), matDarkSteel);
  bunker.position.set(zA_x - 1.2, 0.55, zA_z + 0.8);
  bunker.castShadow = true;
  tagMesh(bunker, 'zoneA');
  root.add(bunker);

  // Circular biomass pile inside pit
  const biomassMound = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.35, 0.25, 20),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.95 })
  );
  biomassMound.position.set(zA_x - 1.2, 1.15, zA_z + 0.8);
  root.add(biomassMound);

  // Green shredder & feeder unit
  const shredderBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.6), matIndustrialGreen);
  shredderBody.position.set(zA_x + 1.6, 0.9, zA_z + 0.8);
  shredderBody.castShadow = true;
  tagMesh(shredderBody, 'zoneA');
  root.add(shredderBody);

  // Yellow infeed funnel hopper on top of green shredder
  const infeedHopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.45, 0.8, 4, 1, false, Math.PI / 4),
    matSafetyYellow
  );
  infeedHopper.position.set(zA_x + 1.6, 2.0, zA_z + 0.8);
  tagMesh(infeedHopper, 'zoneA');
  root.add(infeedHopper);

  // Shredder drive motor (yellow cylinder)
  const shredderMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16), matSafetyYellow);
  shredderMotor.rotation.z = Math.PI / 2;
  shredderMotor.position.set(zA_x + 2.7, 0.6, zA_z + 0.8);
  root.add(shredderMotor);

  // Inclined belt conveyor (from shredder rising up to elevated intake hopper on dryer roof)
  const convStart = new THREE.Vector3(zA_x + 2.0, 0.8, zA_z + 0.8);
  const convEnd = new THREE.Vector3(-4.6, 2.75, -1.8);
  const convLen = convStart.distanceTo(convEnd);
  const convMid = new THREE.Vector3().addVectors(convStart, convEnd).multiplyScalar(0.5);

  const conveyorTruss = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, convLen), matSafetyYellow);
  conveyorTruss.position.copy(convMid);
  conveyorTruss.lookAt(convEnd);
  tagMesh(conveyorTruss, 'zoneA');
  root.add(conveyorTruss);

  // Conveyor black rubber belt
  const conveyorBelt = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, convLen - 0.1), matDarkSteel);
  conveyorBelt.position.copy(convMid);
  conveyorBelt.position.y += 0.14;
  conveyorBelt.lookAt(convEnd);
  root.add(conveyorBelt);

  // Support A-frame legs for inclined conveyor
  const convLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), matSteel);
  convLeg1.position.set(zA_x + 5.2, 1.1, zA_z - 0.5);
  root.add(convLeg1);

  // Secondary elevated reception hopper atop the continuous dryer unit (White inverted conical funnel)
  const elevatedHopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.42, 1.1, 24),
    matWhiteFunnel
  );
  elevatedHopper.position.set(-4.6, 3.25, -1.8);
  tagMesh(elevatedHopper, 'zoneA');
  root.add(elevatedHopper);

  // Vertical stainless exhaust chimney with conical rain cap on the continuous dryer roof
  const dryerChimney = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.5, 16), matStainless);
  dryerChimney.position.set(-3.2, 3.4, -1.8);
  root.add(dryerChimney);

  const dryerCap = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.22, 16), matStainless);
  dryerCap.position.set(-3.2, 4.25, -1.8);
  root.add(dryerCap);

  createSignpost('Zone A', zA_x - 1.0, zA_z + 3.0, 'zoneA');

  // ==========================================
  // 3. ZONE B — CONTINUOUS TRAY DRYER SYSTEM
  // ==========================================
  const zB_x = -3.5;
  const zB_z = -1.8;

  // Light blue enclosure module with 4 round observation portholes
  const dryerHousing = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.3, 2.2), matEquipmentBlue);
  dryerHousing.position.set(zB_x, 1.5, zB_z);
  dryerHousing.castShadow = true;
  tagMesh(dryerHousing, 'zoneB');
  cutawayMeshes.push(dryerHousing);
  thermalColoredMeshes.push({
    mesh: dryerHousing,
    normalColor: new THREE.Color(0x0284c7),
    thermalColor: new THREE.Color(0x38bdf8),
  });
  root.add(dryerHousing);

  // 4 circular glass inspection portholes on dryer housing front
  for (let p = 0; p < 4; p++) {
    const porthole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16), matGlass);
    porthole.rotation.x = Math.PI / 2;
    porthole.position.set(zB_x - 1.5 + p * 1.0, 1.6, zB_z + 1.12);
    root.add(porthole);

    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 16), matStainless);
    bezel.position.set(zB_x - 1.5 + p * 1.0, 1.6, zB_z + 1.14);
    root.add(bezel);
  }

  // Internal trays (visible in cutaway)
  for (let t = 0; t < 3; t++) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 1.8), matStainless);
    tray.position.set(zB_x, 0.8 + t * 0.6, zB_z);
    interiorComponents.push(tray);
    root.add(tray);
  }

  // Green motor / blower assembly at dryer end
  const dryerBlower = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 16), matIndustrialGreen);
  dryerBlower.rotation.z = Math.PI / 2;
  dryerBlower.position.set(zB_x + 2.7, 1.5, zB_z);
  tagMesh(dryerBlower, 'zoneB');
  root.add(dryerBlower);

  // Rotary Drum Dryer: dark horizontal cylinder with silver bands
  const drumX = 2.4;
  const drumZ = -0.5;
  const drumRadius = 0.85;
  const drumLength = 4.2;

  const drumMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(drumRadius, drumRadius, drumLength, 24),
    matDarkSteel
  );
  drumMesh.rotation.z = Math.PI / 2;
  drumMesh.position.set(drumX, 1.5, drumZ);
  drumMesh.castShadow = true;
  tagMesh(drumMesh, 'zoneB');
  cutawayMeshes.push(drumMesh);
  thermalColoredMeshes.push({
    mesh: drumMesh,
    normalColor: new THREE.Color(0x334155),
    thermalColor: new THREE.Color(0x0284c7),
  });
  root.add(drumMesh);

  // Silver reinforcing rings wrapped around the rotary drum
  for (let r = 0; r < 6; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(drumRadius + 0.02, 0.04, 8, 24),
      matStainless
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.set(drumX - 1.8 + r * 0.72, 1.5, drumZ);
    root.add(ring);
  }

  // Rotary drum support rollers / trunnions
  const trunnion1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 2.0), matSteel);
  trunnion1.position.set(drumX - 1.2, 0.35, drumZ);
  root.add(trunnion1);

  // Elevated Operator Catwalk with Yellow Safety Railing (Flanking dryer and drum)
  const catwalkDeck = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.08, 0.9), matSteel);
  catwalkDeck.position.set(-0.3, 1.35, -2.9);
  catwalkDeck.receiveShadow = true;
  root.add(catwalkDeck);

  // Stanchions supporting the catwalk deck
  for (let s = 0; s < 7; s++) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.35, 8), matSteel);
    st.position.set(-5.4 + s * 1.7, 0.675, -2.9);
    root.add(st);
  }

  // Yellow safety handrail along catwalk outer edge
  const railTop = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.05, 0.05), matSafetyYellow);
  railTop.position.set(-0.3, 2.45, -3.32);
  root.add(railTop);

  const railMid = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.03, 0.03), matSafetyYellow);
  railMid.position.set(-0.3, 1.9, -3.32);
  root.add(railMid);

  for (let rp = 0; rp < 8; rp++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), matSafetyYellow);
    post.position.set(-5.4 + rp * 1.54, 1.9, -3.32);
    root.add(post);
  }

  // Dual Parallel Light-Blue Arched Process Loops (Outer flank of catwalk)
  const blueLoop1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.6, 1.4, -1.2),
    new THREE.Vector3(2.2, 2.1, -4.0),
    new THREE.Vector3(-1.2, 2.1, -4.0),
    new THREE.Vector3(-3.6, 1.3, -2.6),
  ]);
  const pLoop1 = new THREE.Mesh(
    new THREE.TubeGeometry(blueLoop1, 32, 0.07, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.25 })
  );
  root.add(pLoop1);

  const blueLoop2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.8, 1.1, -1.2),
    new THREE.Vector3(2.4, 1.8, -4.3),
    new THREE.Vector3(-1.0, 1.8, -4.3),
    new THREE.Vector3(-3.6, 1.0, -2.6),
  ]);
  const pLoop2 = new THREE.Mesh(
    new THREE.TubeGeometry(blueLoop2, 32, 0.07, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.25 })
  );
  root.add(pLoop2);

  createSignpost('Zone B', zB_x, zB_z + 2.4, 'zoneB');

  // ==========================================
  // 4. ZONE C — INDUSTRIAL PYROLYSIS & BIOCHAR
  // ==========================================
  const zC_x = 5.6;
  const zC_z = -1.8;

  // Vertical/horizontal retort vessel
  const retort = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.8, 20), matDarkSteel);
  retort.position.set(zC_x, 1.8, zC_z);
  retort.castShadow = true;
  tagMesh(retort, 'zoneC');
  cutawayMeshes.push(retort);
  thermalColoredMeshes.push({
    mesh: retort,
    normalColor: new THREE.Color(0x334155),
    thermalColor: new THREE.Color(0xef4444),
  });
  root.add(retort);

  // Internal rotating screw auger
  const auger = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 16), matStainless);
  auger.position.set(zC_x, 1.8, zC_z);
  interiorComponents.push(auger);
  root.add(auger);
  rotatingParts.push({ object: auger, axis: 'y', speed: 2 });

  // Cyclone separator (silver cone and top cylinder)
  const cycloneGroup = new THREE.Group();
  cycloneGroup.position.set(zC_x + 0.8, 2.8, zC_z - 0.8);
  const cycloneCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.0, 16), matStainless);
  cycloneGroup.add(cycloneCyl);
  const cycloneCone = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.1, 0.8, 16), matStainless);
  cycloneCone.position.y = -0.9;
  cycloneGroup.add(cycloneCone);
  tagMesh(cycloneCyl, 'zoneC');
  root.add(cycloneGroup);

  // Tall vertical exhaust stack (flue stack)
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 5.5, 16), matStainless);
  chimney.position.set(zC_x + 0.8, 4.2, zC_z - 0.8);
  root.add(chimney);

  // Biochar collection drum
  const biocharDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.9, 16), matBiochar);
  biocharDrum.position.set(zC_x + 0.8, 0.55, zC_z + 1.2);
  tagMesh(biocharDrum, 'zoneC');
  root.add(biocharDrum);

  createSignpost('Zone C', zC_x + 1.2, zC_z + 2.4, 'zoneC');

  // ==========================================
  // 5. ZONE D — HYBRID SAND THERMAL BATTERY (HERO VESSEL)
  // ==========================================
  const zD_x = 11.2;
  const zD_z = -0.5;

  const vesselRadius = 2.1;
  const vesselHeight = 4.5;

  // Tall cylindrical vessel body in gleaming stainless steel
  const sandVessel = new THREE.Mesh(
    new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 32),
    matStainless
  );
  sandVessel.position.set(zD_x, vesselHeight / 2, zD_z);
  sandVessel.castShadow = true;
  tagMesh(sandVessel, 'zoneD');
  cutawayMeshes.push(sandVessel);
  root.add(sandVessel);

  // Horizontal ring ribs wrapped around silo body
  for (let k = 1; k <= 4; k++) {
    const siloRing = new THREE.Mesh(
      new THREE.TorusGeometry(vesselRadius + 0.03, 0.035, 8, 32),
      matStainless
    );
    siloRing.rotation.x = Math.PI / 2;
    siloRing.position.set(zD_x, k * 0.9, zD_z);
    root.add(siloRing);
  }

  // Flat top cover of silo cylinder
  const siloTopCap = new THREE.Mesh(
    new THREE.CylinderGeometry(vesselRadius + 0.05, vesselRadius + 0.05, 0.12, 32),
    matStainless
  );
  siloTopCap.position.set(zD_x, vesselHeight, zD_z);
  root.add(siloTopCap);

  // Cylindrical neck collar supporting the dome mushroom cap
  const siloNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 0.45, 24),
    matStainless
  );
  siloNeck.position.set(zD_x, vesselHeight + 0.22, zD_z);
  root.add(siloNeck);

  // Vertical conduit pipe down front face of silo
  const siloConduit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, vesselHeight, 12),
    matStainless
  );
  siloConduit.position.set(zD_x, vesselHeight / 2, zD_z + vesselRadius + 0.06);
  root.add(siloConduit);

  // Spacer struts supporting the umbrella/mushroom dome cap
  for (let s = 0; s < 6; s++) {
    const angle = (s * Math.PI * 2) / 6;
    const spacer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8), matSteel);
    spacer.position.set(
      zD_x + Math.cos(angle) * (vesselRadius * 0.8),
      vesselHeight + 0.22,
      zD_z + Math.sin(angle) * (vesselRadius * 0.8)
    );
    root.add(spacer);
  }

  // Distinctive hemispherical / mushroom umbrella dome cap (with air gap underneath)
  const domeRadius = vesselRadius + 0.15;
  const siloDome = new THREE.Mesh(
    new THREE.SphereGeometry(domeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48),
    matStainless
  );
  siloDome.position.set(zD_x, vesselHeight + 0.44, zD_z);
  cutawayMeshes.push(siloDome);
  root.add(siloDome);

  // Internal quartz sand core (revealed during cutaway mode)
  const sandCore = new THREE.Mesh(
    new THREE.CylinderGeometry(vesselRadius - 0.2, vesselRadius - 0.2, vesselHeight - 0.4, 24),
    matSand
  );
  sandCore.position.set(zD_x, vesselHeight / 2, zD_z);
  tagMesh(sandCore, 'zoneD');
  interiorComponents.push(sandCore);
  thermalColoredMeshes.push({
    mesh: sandCore,
    normalColor: new THREE.Color(0xf59e0b),
    thermalColor: new THREE.Color(0xf97316),
  });
  root.add(sandCore);

  // Submerged electric immersion heaters
  const heaterMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.6,
  });
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.6, 8), heaterMat);
    rod.position.set(zD_x + Math.cos(a) * 0.6, 2.4, zD_z + Math.sin(a) * 0.6);
    interiorComponents.push(rod);
    root.add(rod);
  }

  createSignpost('Zone D', zD_x - 2.8, zD_z + 2.8, 'zoneD');

  // ==========================================
  // 6. ZONE E — RENEWABLES (SOLAR PV & SOLAR THERMAL EVACUATED TUBES)
  // ==========================================
  const zE_x = 0.5;
  const zE_z = 3.6;

  // Ground mount racking legs for solar PV
  const rackLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.1), matSteel);
  rackLeg1.position.set(zE_x - 2.8, 0.9, zE_z - 1.2);
  root.add(rackLeg1);

  const rackLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.1), matSteel);
  rackLeg2.position.set(zE_x + 2.8, 0.9, zE_z - 1.2);
  root.add(rackLeg2);

  // 2 rows of 4 tilted bifacial solar PV panels (8 panels total)
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 2; row++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 1.1), matSolarPanel);
      panel.position.set(
        zE_x - 2.25 + col * 1.5,
        1.7 - row * 0.55,
        zE_z - 0.6 + row * 1.05
      );
      panel.rotation.x = 0.48; // Tilted towards the camera / south
      panel.castShadow = true;
      tagMesh(panel, 'zoneE');
      root.add(panel);
    }
  }

  // Solar Thermal Evacuated Tube Collector Array (positioned to the right/front of PV)
  const st_x = zE_x + 4.2;
  const st_z = zE_z + 1.2;

  // Header manifold pipe (insulated silver cylinder)
  const headerManifold = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 16), matStainless);
  headerManifold.rotation.z = Math.PI / 2;
  headerManifold.position.set(st_x, 1.8, st_z - 1.0);
  root.add(headerManifold);

  // Collector mounting rack frame
  const stFrame = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.08, 1.8), matDarkSteel);
  stFrame.position.set(st_x, 1.1, st_z);
  stFrame.rotation.x = 0.52;
  root.add(stFrame);

  // 14 evacuated glass solar thermal tubes (blue cylinders)
  for (let tb = 0; tb < 14; tb++) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.7, 12), matVacuumTube);
    tube.position.set(st_x - 1.2 + tb * 0.185, 1.15, st_z);
    tube.rotation.x = 0.52;
    tagMesh(tube, 'zoneE');
    root.add(tube);
  }

  // Ground-mounted electrical balance of plant (Inverter & Green Control Cabinet)
  const inverterCab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.9), matDarkSteel);
  inverterCab.position.set(zE_x + 1.2, 0.75, zE_z - 0.5);
  inverterCab.castShadow = true;
  root.add(inverterCab);

  const greenCab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.8), matIndustrialGreen);
  greenCab.position.set(zE_x + 2.5, 0.65, zE_z - 0.5);
  greenCab.castShadow = true;
  root.add(greenCab);

  const vertYellowConduit = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.4, 8), matSafetyYellow);
  vertYellowConduit.position.set(zE_x + 2.0, 1.2, zE_z - 0.1);
  root.add(vertYellowConduit);

  createSignpost('Zone E', zE_x - 3.8, zE_z + 1.8, 'zoneE');

  // Structural Pipe Rack Frame (horizontal beams spanning above)
  const pipeFrameGroup = new THREE.Group();
  const pf_cols: [number, number][] = [
    [zE_x - 4.5, zE_z + 2.5],
    [zE_x + 4.5, zE_z + 2.5],
    [zE_x + 6.5, zE_z + 2.5],
  ];
  pf_cols.forEach(([px, pz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.4, 0.14), matSteel);
    col.position.set(px, 1.7, pz);
    pipeFrameGroup.add(col);
  });
  const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.14, 0.14), matSteel);
  crossBeam.position.set(zE_x + 1.0, 3.4, zE_z + 2.5);
  pipeFrameGroup.add(crossBeam);
  root.add(pipeFrameGroup);

  // ==========================================
  // 7. ZONE F — SCADA CONTROL CABIN & UTILITY BUILDING
  // ==========================================
  const zF_x = -10.5;
  const zF_z = -5.8;

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(7.0, 3.2, 4.6), matDarkSteel);
  cabin.position.set(zF_x, 1.6, zF_z);
  cabin.castShadow = true;
  tagMesh(cabin, 'zoneF');
  root.add(cabin);

  // Cabin roof slab
  const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.25, 5.0), matSteel);
  cabinRoof.position.set(zF_x, 3.3, zF_z);
  root.add(cabinRoof);

  // Yellow roof handrails / safety railing
  const railMat = matSafetyYellow;
  const railFront = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.05, 0.05), railMat);
  railFront.position.set(zF_x, 3.8, zF_z + 2.4);
  root.add(railFront);

  for (let postIdx = 0; postIdx < 5; postIdx++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), railMat);
    post.position.set(zF_x - 3.4 + postIdx * 1.7, 3.55, zF_z + 2.4);
    root.add(post);
  }

  // Cabin roof exhaust duct
  const cabinVent = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.2), matSteel);
  cabinVent.position.set(zF_x - 1.8, 3.8, zF_z);
  root.add(cabinVent);

  // Red beacon warning light on roof mast
  const beaconMast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), matDarkSteel);
  beaconMast.position.set(zF_x - 0.8, 4.0, zF_z + 1.2);
  root.add(beaconMast);

  const beaconLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.9,
    })
  );
  beaconLight.position.set(zF_x - 0.8, 4.65, zF_z + 1.2);
  root.add(beaconLight);

  // Panoramic operator window on front
  const cabinWin = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.4, 0.06), matGlass);
  cabinWin.position.set(zF_x, 1.8, zF_z + 2.32);
  root.add(cabinWin);

  // Industrial 3-Tier Status Indicator Tower (Green / Amber / Red stack light)
  const stackPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8), matDarkSteel);
  stackPole.position.set(zF_x - 3.4, 4.2, zF_z + 2.3);
  root.add(stackPole);

  const matStackRed = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.5,
  });
  const lightRed = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), matStackRed);
  lightRed.position.set(zF_x - 3.4, 4.65, zF_z + 2.3);
  root.add(lightRed);

  const matStackAmber = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.5,
  });
  const lightAmber = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), matStackAmber);
  lightAmber.position.set(zF_x - 3.4, 4.79, zF_z + 2.3);
  root.add(lightAmber);

  const matStackGreen = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.9,
  });
  const lightGreen = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), matStackGreen);
  lightGreen.position.set(zF_x - 3.4, 4.93, zF_z + 2.3);
  root.add(lightGreen);

  createSignpost('Zone F', zF_x - 4.2, zF_z + 2.8, 'zoneF');

  // ==========================================
  // 8. DEDICATED HEAT EXCHANGER STATION & COMBUSION CHAMBER
  // ==========================================
  // Plate Heat Exchanger (PHE) between Sand Battery and Dryer System
  const hexGroup = new THREE.Group();
  hexGroup.position.set(7.5, 0.55, -0.9);

  // Structural plate frame
  const hexFrame = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.1, 0.55), matDarkSteel);
  hexGroup.add(hexFrame);

  // Corrugated stainless plate pack inside
  const hexPlates = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.45), matStainless);
  hexPlates.position.y = 0.05;
  hexGroup.add(hexPlates);

  // 4 Tie bolts with hex nuts
  const boltPositions = [[-0.3, 0.45], [0.3, 0.45], [-0.3, -0.4], [0.3, -0.4]];
  boltPositions.forEach(([bx, by]) => {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 8), matStainless);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(bx, by, 0);
    hexGroup.add(bolt);
  });

  // Centrifugal Clean-Air / Thermal Fluid Circulation Pump
  const hexPump = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 16), matEquipmentBlue);
  hexPump.rotation.z = Math.PI / 2;
  hexPump.position.set(0.65, -0.15, 0);
  hexGroup.add(hexPump);

  const hexMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.38, 16), matDarkSteel);
  hexMotor.rotation.z = Math.PI / 2;
  hexMotor.position.set(1.05, -0.15, 0);
  hexGroup.add(hexMotor);

  // Pressure indicator gauge with brass bezel
  const gaugeStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), matStainless);
  gaugeStem.position.set(-0.15, 0.65, 0.2);
  hexGroup.add(gaugeStem);

  const gaugeDial = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), matStainless);
  gaugeDial.rotation.x = Math.PI / 2;
  gaugeDial.position.set(-0.15, 0.78, 0.2);
  hexGroup.add(gaugeDial);

  tagMesh(hexFrame, 'zoneD');
  root.add(hexGroup);

  // Pyrolysis Recoverable Gas Combustion & Energy Recovery Chamber (Zone C)
  const combustor = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.1, 20), matStainless);
  combustor.position.set(zC_x + 0.8, 3.4, zC_z - 0.8);
  combustor.castShadow = true;
  tagMesh(combustor, 'zoneC');
  root.add(combustor);

  // Sight port / flame inspection window
  const sightPort = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), matStainless);
  sightPort.rotation.x = Math.PI / 2;
  sightPort.position.set(zC_x + 0.8, 3.4, zC_z - 0.3);
  root.add(sightPort);

  const sightGlass = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
  sightGlass.position.set(zC_x + 0.8, 3.4, zC_z - 0.25);
  root.add(sightGlass);

  // Electrical Cable Conduit: PV Inverter to Sand Battery Resistance Heaters (3rd Charging Source)
  const pvConduitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zE_x + 1.2, 1.4, zE_z - 0.5),
    new THREE.Vector3(zE_x + 3.8, 2.2, zE_z - 0.5),
    new THREE.Vector3(zD_x - 3.0, 2.6, zD_z + 1.5),
    new THREE.Vector3(zD_x - 0.6, 4.4, zD_z + 0.4),
    new THREE.Vector3(zD_x, vesselHeight + 0.1, zD_z),
  ]);
  const pvConduit = new THREE.Mesh(
    new THREE.TubeGeometry(pvConduitCurve, 24, 0.045, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 })
  );
  root.add(pvConduit);

  // ==========================================
  // 9. PROCESS PIPING & YELLOW CONDUIT LOOP
  // ==========================================
  function createPipe(curve: THREE.Curve<THREE.Vector3>, color: number, rad = 0.08) {
    const geo = new THREE.TubeGeometry(curve, 28, rad, 8, false);
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.8,
      roughness: 0.25,
    });
    const p = new THREE.Mesh(geo, mat);
    root.add(p);
    return p;
  }

  // High arching hot flue gas pipe: Pyrolysis Combustor -> Sand Battery (Red)
  const pyroCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zC_x + 0.8, 4.0, zC_z - 0.8),
    new THREE.Vector3(zD_x - 2.5, 4.3, zD_z),
    new THREE.Vector3(zD_x - 1.8, 4.0, zD_z),
  ]);
  createPipe(pyroCurve, 0xef4444, 0.09);

  // Clean-Air / Heat Transfer Circuit via Plate Heat Exchanger: Sand Battery -> HEX -> Dryer (Cyan)
  const dryerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zD_x - 2.1, 0.8, zD_z),
    new THREE.Vector3(8.2, 0.7, -0.9),
    new THREE.Vector3(6.8, 0.7, -0.9),
    new THREE.Vector3(drumX + 2.0, 0.8, drumZ - 1.2),
    new THREE.Vector3(zB_x + 2.4, 1.2, zB_z),
  ]);
  createPipe(dryerCurve, 0x38bdf8, 0.08);

  // Bright Yellow Flexible Thermal Conduit Loop (Solar Thermal Evacuated Tubes -> Sand Silo)
  const yellowCableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(st_x + 1.2, 1.8, st_z - 0.8),
    new THREE.Vector3(st_x + 1.8, 0.9, st_z + 1.4),
    new THREE.Vector3(zE_x + 6.2, 0.35, zE_z + 2.6),
    new THREE.Vector3(zD_x - 1.2, 0.5, zD_z + 2.8),
    new THREE.Vector3(zD_x - 1.6, 0.8, zD_z + 1.2),
  ]);
  createPipe(yellowCableCurve, 0xeab308, 0.11);

  return {
    rootGroup: root,
    cutawayMeshes,
    interiorComponents,
    zoneHitObjects,
    thermalColoredMeshes,
    rotatingParts,
  };
}
