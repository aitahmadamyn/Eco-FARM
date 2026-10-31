import * as THREE from 'three';
import {
  createConcretePavementTexture,
  createHazardStripesTexture,
  createSolarPanelTexture,
  createSandTexture,
  createCarbonBiocharTexture,
  createLabelTexture,
  createIndustrialChequerPlateTexture,
} from './textureFactory';
import { ZoneId } from '../types/plant';

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
  // 1. SHARED HIGH-GRADE INDUSTRIAL PBR MATERIALS
  // ==========================================
  const concreteTexture = createConcretePavementTexture();
  concreteTexture.repeat.set(8, 6);
  const hazardTexture = createHazardStripesTexture();
  hazardTexture.repeat.set(16, 1);
  const chequerTexture = createIndustrialChequerPlateTexture();
  chequerTexture.repeat.set(4, 4);
  const sandTexture = createSandTexture();
  const biocharTexture = createCarbonBiocharTexture();
  const pvTexture = createSolarPanelTexture();

  // Materials
  const matConcrete = new THREE.MeshStandardMaterial({
    map: concreteTexture,
    roughness: 0.85,
    metalness: 0.1,
  });

  const matSteelGalv = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.35,
  });

  const matSteelDark = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.4,
  });

  const matSafetyYellow = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    metalness: 0.2,
    roughness: 0.35,
  });

  const matHazardStripe = new THREE.MeshStandardMaterial({
    map: hazardTexture,
    roughness: 0.4,
    metalness: 0.1,
  });

  const matStainlessSteel = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.18,
  });

  const matPolishedChrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.1,
  });

  const matIndustrialGreen = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Machine enamel green
    metalness: 0.4,
    roughness: 0.45,
  });

  const matIndustrialBlue = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Equipment blue
    metalness: 0.45,
    roughness: 0.4,
  });

  const matPyrolysisRetort = new THREE.MeshStandardMaterial({
    color: 0x475569, // Refractory insulated jacket
    metalness: 0.75,
    roughness: 0.35,
  });

  const matThermalInsulation = new THREE.MeshStandardMaterial({
    color: 0xd1d5db, // Embossed aluminum insulation clad
    metalness: 0.85,
    roughness: 0.25,
  });

  const matSandMedium = new THREE.MeshStandardMaterial({
    map: sandTexture,
    roughness: 0.95,
    metalness: 0.05,
    color: 0xf59e0b,
  });

  const matBiochar = new THREE.MeshStandardMaterial({
    map: biocharTexture,
    roughness: 0.92,
    metalness: 0.1,
    color: 0x1c1917,
  });

  const matChequerPlate = new THREE.MeshStandardMaterial({
    map: chequerTexture,
    metalness: 0.8,
    roughness: 0.35,
  });

  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transmission: 0.9,
    opacity: 1,
    transparent: true,
    roughness: 0.1,
    ior: 1.5,
    thickness: 0.8,
  });

  // Dedicated Cutaway Materials
  const matSandVesselOuter = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.85,
    roughness: 0.25,
  });

  const matDryerOuter = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.5,
    roughness: 0.35,
  });

  const matPyrolysisOuter = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.7,
    roughness: 0.4,
  });

  // Track outer meshes for cutaway toggling
  cutawayMeshes.push(
    new THREE.Mesh(new THREE.BufferGeometry(), matSandVesselOuter),
    new THREE.Mesh(new THREE.BufferGeometry(), matDryerOuter),
    new THREE.Mesh(new THREE.BufferGeometry(), matPyrolysisOuter)
  );

  // ==========================================
  // 2. FOUNDATION & CIVIL INFRASTRUCTURE
  // ==========================================
  const civilGroup = new THREE.Group();
  civilGroup.name = 'Civil_Infrastructure';

  // Heavy concrete platform slab with expansion joints
  const slabGeo = new THREE.BoxGeometry(38, 0.6, 26);
  const groundSlab = new THREE.Mesh(slabGeo, matConcrete);
  groundSlab.position.y = -0.3;
  groundSlab.receiveShadow = true;
  civilGroup.add(groundSlab);

  // Foundation bevel edge
  const edgeGeo = new THREE.BoxGeometry(38.4, 0.2, 26.4);
  const slabSubBase = new THREE.Mesh(edgeGeo, matSteelDark);
  slabSubBase.position.y = -0.55;
  slabSubBase.receiveShadow = true;
  civilGroup.add(slabSubBase);

  // Safety perimeter hazard stripes border along front edge
  const hazardBorderGeo = new THREE.BoxGeometry(38, 0.05, 0.6);
  const hazardBorder = new THREE.Mesh(hazardBorderGeo, matHazardStripe);
  hazardBorder.position.set(0, 0.03, 12.5);
  hazardBorder.receiveShadow = true;
  civilGroup.add(hazardBorder);

  // Drainage trench & grate
  const trenchGeo = new THREE.BoxGeometry(36, 0.08, 0.5);
  const trenchGrate = new THREE.Mesh(trenchGeo, matSteelDark);
  trenchGrate.position.set(0, 0.02, 11.8);
  civilGroup.add(trenchGrate);

  // Perimeter steel safety railings and yellow safety bollards
  const bollardPositions = [
    [-17, 12], [-14, 12], [-10, 12], [10, 12], [14, 12], [17, 12],
    [-18, 8], [-18, -4], [-18, -11], [18, 8], [18, -4], [18, -11]
  ];
  const bollardGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 16);
  const bollardCapGeo = new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  bollardPositions.forEach(([bx, bz]) => {
    const bollard = new THREE.Mesh(bollardGeo, matSafetyYellow);
    bollard.position.set(bx, 0.45, bz);
    bollard.castShadow = true;
    bollard.receiveShadow = true;
    const cap = new THREE.Mesh(bollardCapGeo, matSafetyYellow);
    cap.position.y = 0.45;
    bollard.add(cap);
    civilGroup.add(bollard);
  });

  root.add(civilGroup);

  // Helper for equipment concrete equipment plinths / pedestals
  const createPlinth = (x: number, z: number, w: number, d: number, h: number = 0.3) => {
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      matConcrete
    );
    plinth.position.set(x, h / 2, z);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    root.add(plinth);
    return plinth;
  };

  // Helper to tag all meshes in a zone group for click/touch inspection
  const tagZoneGroup = (group: THREE.Group, zoneId: ZoneId) => {
    group.userData.zoneId = zoneId;
    group.traverse((child) => {
      child.userData.zoneId = zoneId;
    });
  };

  // Helper for Zone Sign / Placard Post
  const createZoneMarker = (zoneId: ZoneId, tag: string, sub: string, x: number, z: number) => {
    const markerGroup = new THREE.Group();
    markerGroup.position.set(x, 0, z);

    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 12);
    const post = new THREE.Mesh(postGeo, matSteelDark);
    post.position.y = 1.1;
    post.castShadow = true;
    markerGroup.add(post);

    const signGeo = new THREE.BoxGeometry(1.6, 0.45, 0.06);
    const signTex = createLabelTexture(tag, sub);
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      metalness: 0.3,
      roughness: 0.3,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.2, 0);
    sign.castShadow = true;
    markerGroup.add(sign);

    // Hit box for raycasting
    const hitGeo = new THREE.BoxGeometry(2.0, 2.6, 1.2);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 1.3;
    markerGroup.add(hitMesh);

    zoneHitObjects.push({
      zoneId,
      object: hitMesh,
      worldPos: new THREE.Vector3(x, 1.5, z)
    });

    root.add(markerGroup);
  };

  // ==========================================
  // ZONE A – BIOMASS RECEPTION AND PREPARATION
  // ==========================================
  const zoneAGroup = new THREE.Group();
  zoneAGroup.name = 'ZONE_A_RECEPTION';
  const zA_x = -13;
  const zA_z = 5;

  createPlinth(zA_x, zA_z, 7, 6, 0.25);
  createZoneMarker('zoneA', 'ZONE A', 'Biomass Reception & Shredding', zA_x - 3.2, zA_z + 3.0);

  // Inground Biomass Intake Bunker with Steel Grate & Chute
  const bunkerFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.2, 3.2),
    matSteelDark
  );
  bunkerFrame.position.set(zA_x - 1.2, 0.6, zA_z + 0.8);
  bunkerFrame.castShadow = true;
  zoneAGroup.add(bunkerFrame);

  // Bunker hopper inner taper
  const hopperInner = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 1.1, 4),
    matStainlessSteel
  );
  hopperInner.rotation.x = Math.PI;
  hopperInner.position.set(zA_x - 1.2, 0.7, zA_z + 0.8);
  zoneAGroup.add(hopperInner);

  // Biomass residue pile inside bunker
  const biomassMat = new THREE.MeshStandardMaterial({
    color: 0x854d0e, // Raw agricultural residues (straw, olive pomace, woodchips)
    roughness: 0.9,
    metalness: 0.1,
  });
  const biomassPile = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.1, 1),
    biomassMat
  );
  biomassPile.scale.set(1.4, 0.6, 1.2);
  biomassPile.position.set(zA_x - 1.2, 0.8, zA_z + 0.8);
  zoneAGroup.add(biomassPile);

  // Safety Grate over bunker
  const grateGeo = new THREE.BoxGeometry(3.2, 0.05, 2.8);
  const grateMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    wireframe: true,
  });
  const grate = new THREE.Mesh(grateGeo, grateMat);
  grate.position.set(zA_x - 1.2, 1.22, zA_z + 0.8);
  zoneAGroup.add(grate);

  // Hydraulic tipping feed guide plates
  const guidePlateMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.4 });
  const guideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 3.0), guidePlateMat);
  guideL.position.set(zA_x - 2.9, 1.4, zA_z + 0.8);
  guideL.rotation.z = -0.3;
  zoneAGroup.add(guideL);

  // Industrial Heavy-Duty Shredder & Hammer Mill Unit
  const shredderHousing = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.5, 1.6),
    matIndustrialGreen
  );
  shredderHousing.position.set(zA_x + 1.6, 1.0, zA_z + 0.8);
  shredderHousing.castShadow = true;
  zoneAGroup.add(shredderHousing);

  // Shredder Infeed Funnel Hopper
  const shredderHopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.6, 0.9, 4),
    matStainlessSteel
  );
  shredderHopper.position.set(zA_x + 1.6, 2.2, zA_z + 0.8);
  shredderHopper.rotation.y = Math.PI / 4;
  zoneAGroup.add(shredderHopper);

  // Shredder High-Torque Electric Motor & Gearbox
  const motorBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16),
    matSteelDark
  );
  motorBody.rotation.z = Math.PI / 2;
  motorBody.position.set(zA_x + 2.8, 0.8, zA_z + 0.8);
  motorBody.castShadow = true;
  zoneAGroup.add(motorBody);

  const motorFanCover = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16),
    matSafetyYellow
  );
  motorFanCover.rotation.z = Math.PI / 2;
  motorFanCover.position.set(zA_x + 3.3, 0.8, zA_z + 0.8);
  zoneAGroup.add(motorFanCover);

  // Over-belt Neodymium Magnetic Separator suspended above
  const magSeparator = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.4, 0.9),
    matSafetyYellow
  );
  magSeparator.position.set(zA_x + 1.6, 2.9, zA_z + 0.8);
  zoneAGroup.add(magSeparator);

  // Mechanical Inclined Conveyor System (Troughed Belt)
  // Reaches from shredder discharge (X: -11.4, Y: 0.6, Z: 5.8) up to Zone B Dryer Inlet (X: -7.5, Y: 3.4, Z: -0.8)
  const conveyorGroup = new THREE.Group();
  const conveyorStart = new THREE.Vector3(zA_x + 2.0, 0.6, zA_z + 0.8);
  const conveyorEnd = new THREE.Vector3(-7.5, 3.4, -0.8);
  const conveyorLength = conveyorStart.distanceTo(conveyorEnd);

  // Truss / Beam for conveyor
  const beamGeo = new THREE.BoxGeometry(0.8, 0.2, conveyorLength);
  const beamMesh = new THREE.Mesh(beamGeo, matSteelGalv);
  conveyorGroup.add(beamMesh);

  // Conveyor Belt
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const beltMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.06, conveyorLength),
    beltMat
  );
  beltMesh.position.y = 0.12;
  conveyorGroup.add(beltMesh);

  // Skirtboards on conveyor sides
  const skirtMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
  const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, conveyorLength), skirtMat);
  skirtL.position.set(-0.32, 0.2, 0);
  const skirtR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, conveyorLength), skirtMat);
  skirtR.position.set(0.32, 0.2, 0);
  conveyorGroup.add(skirtL, skirtR);

  // Position and orient conveyor
  const conveyorMid = new THREE.Vector3().addVectors(conveyorStart, conveyorEnd).multiplyScalar(0.5);
  conveyorGroup.position.copy(conveyorMid);
  conveyorGroup.lookAt(conveyorEnd);
  zoneAGroup.add(conveyorGroup);

  // Conveyor Support Structural A-Frames
  const trestle1Pos = new THREE.Vector3().lerpVectors(conveyorStart, conveyorEnd, 0.4);
  const trestleGeo = new THREE.CylinderGeometry(0.06, 0.06, trestle1Pos.y, 8);
  const trestleL = new THREE.Mesh(trestleGeo, matSteelGalv);
  trestleL.position.set(trestle1Pos.x - 0.4, trestle1Pos.y / 2, trestle1Pos.z);
  const trestleR = new THREE.Mesh(trestleGeo, matSteelGalv);
  trestleR.position.set(trestle1Pos.x + 0.4, trestle1Pos.y / 2, trestle1Pos.z);
  zoneAGroup.add(trestleL, trestleR);

  // Prepared biomass surge feeder hopper at conveyor head
  const surgeHopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.35, 1.1, 16),
    matStainlessSteel
  );
  surgeHopper.position.set(conveyorEnd.x, conveyorEnd.y + 0.4, conveyorEnd.z);
  surgeHopper.castShadow = true;
  zoneAGroup.add(surgeHopper);

  tagZoneGroup(zoneAGroup, 'zoneA');
  root.add(zoneAGroup);

  // ==========================================
  // ZONE B – BIOMASS DRYING SYSTEM
  // ==========================================
  const zoneBGroup = new THREE.Group();
  zoneBGroup.name = 'ZONE_B_DRYING';
  const zB_x = -6.5;
  const zB_z = -1.8;

  createPlinth(zB_x, zB_z, 6.5, 4.5, 0.3);
  createZoneMarker('zoneB', 'ZONE B', 'Continuous Biomass Dryer', zB_x - 3.2, zB_z + 2.5);

  // Main Dryer Insulated Chamber
  const dryerHousingGeo = new THREE.BoxGeometry(4.6, 2.4, 2.2);
  const dryerHousing = new THREE.Mesh(dryerHousingGeo, matIndustrialBlue);
  dryerHousing.position.set(zB_x, 1.5, zB_z);
  dryerHousing.castShadow = true;
  dryerHousing.receiveShadow = true;
  zoneBGroup.add(dryerHousing);
  cutawayMeshes.push(dryerHousing);

  // Inspection sight glasses along the dryer chamber front
  for (let sx = -1.5; sx <= 1.5; sx += 1.0) {
    const sightGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16),
      matGlass
    );
    sightGlass.rotation.x = Math.PI / 2;
    sightGlass.position.set(zB_x + sx, 1.6, zB_z + 1.12);
    zoneBGroup.add(sightGlass);

    const sightFrame = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.03, 8, 16),
      matStainlessSteel
    );
    sightFrame.position.set(zB_x + sx, 1.6, zB_z + 1.14);
    zoneBGroup.add(sightFrame);
  }

  // Interior: 3-tier perforated drying conveyor trays (visible in cutaway mode)
  for (let tier = 0; tier < 3; tier++) {
    const trayY = 0.8 + tier * 0.6;
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.06, 1.8),
      matChequerPlate
    );
    tray.position.set(zB_x, trayY, zB_z);
    zoneBGroup.add(tray);
    interiorComponents.push(tray);

    // Biomass bed on trays (dries from green-brown to dried golden-tan)
    const bedColor = tier === 0 ? 0x78350f : tier === 1 ? 0xa16207 : 0xd97706;
    const trayBedMat = new THREE.MeshStandardMaterial({ color: bedColor, roughness: 0.95 });
    const trayBed = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.05, 1.6),
      trayBedMat
    );
    trayBed.position.set(zB_x, trayY + 0.05, zB_z);
    zoneBGroup.add(trayBed);
    interiorComponents.push(trayBed);
  }

  // Liquid-to-Air Heat Exchanger unit mounted at dryer intake
  const hxGroup = new THREE.Group();
  hxGroup.position.set(zB_x + 2.7, 1.4, zB_z);
  const hxBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.6, 1.6),
    matThermalInsulation
  );
  hxBody.castShadow = true;
  hxGroup.add(hxBody);

  // Finned coil details on heat exchanger
  const finGeo = new THREE.BoxGeometry(0.7, 0.04, 1.4);
  for (let fy = -0.6; fy <= 0.6; fy += 0.2) {
    const fin = new THREE.Mesh(finGeo, matStainlessSteel);
    fin.position.y = fy;
    hxGroup.add(fin);
  }
  zoneBGroup.add(hxGroup);

  // Industrial Centrifugal Circulation Fan & Blower
  const fanGroup = new THREE.Group();
  fanGroup.position.set(zB_x + 2.7, 2.7, zB_z);

  const fanScroll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16),
    matIndustrialGreen
  );
  fanScroll.rotation.z = Math.PI / 2;
  fanGroup.add(fanScroll);

  const fanMotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.6, 16),
    matSteelDark
  );
  fanMotor.rotation.z = Math.PI / 2;
  fanMotor.position.set(0.5, 0, 0);
  fanGroup.add(fanMotor);

  // Rotating impeller visible through intake
  const impeller = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.05, 8),
    matSafetyYellow
  );
  impeller.rotation.z = Math.PI / 2;
  fanGroup.add(impeller);
  rotatingParts.push({ object: impeller, axis: 'x', speed: 8 });
  zoneBGroup.add(fanGroup);

  // Hot-air circulation ducting connecting fan into dryer chamber
  const ductGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.4, 16);
  const ductDrying = new THREE.Mesh(ductGeo, matThermalInsulation);
  ductDrying.position.set(zB_x + 1.8, 2.6, zB_z);
  ductDrying.rotation.z = Math.PI / 2;
  zoneBGroup.add(ductDrying);

  // Moisture Exhaust Vent Stack with droplet separator hood
  const stackGeo = new THREE.CylinderGeometry(0.2, 0.22, 2.2, 16);
  const exhaustStack = new THREE.Mesh(stackGeo, matStainlessSteel);
  exhaustStack.position.set(zB_x - 1.6, 3.2, zB_z);
  exhaustStack.castShadow = true;
  zoneBGroup.add(exhaustStack);

  const stackCap = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.25, 16),
    matStainlessSteel
  );
  stackCap.position.set(zB_x - 1.6, 4.4, zB_z);
  zoneBGroup.add(stackCap);

  // IoT Sensor probes (Temperature PT100 and Capacitive Humidity)
  const probeStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
  const probeHeadGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  const probeHeadMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });

  const tempProbe = new THREE.Mesh(probeStemGeo, matStainlessSteel);
  tempProbe.position.set(zB_x - 0.5, 2.8, zB_z + 0.6);
  const tempHead = new THREE.Mesh(probeHeadGeo, probeHeadMat);
  tempHead.position.y = 0.2;
  tempProbe.add(tempHead);
  zoneBGroup.add(tempProbe);

  // Discharge rotary airlock valve feeding dried biomass towards pyrolysis
  const airlockValve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.5, 16),
    matSteelDark
  );
  airlockValve.position.set(zB_x - 2.0, 0.5, zB_z);
  airlockValve.rotation.z = Math.PI / 2;
  zoneBGroup.add(airlockValve);

  tagZoneGroup(zoneBGroup, 'zoneB');
  root.add(zoneBGroup);

  // ==========================================
  // ZONE C – INDUSTRIAL PYROLYSIS UNIT
  // ==========================================
  const zoneCGroup = new THREE.Group();
  zoneCGroup.name = 'ZONE_C_PYROLYSIS';
  const zC_x = 1.5;
  const zC_z = -1.8;

  createPlinth(zC_x, zC_z, 6.5, 4.5, 0.35);
  createZoneMarker('zoneC', 'ZONE C', 'Pyrolysis & Biochar Retort', zC_x - 3.0, zC_z + 2.5);

  // Main Pyrolysis Retort Vessel (horizontal cylindrical double-wall reactor)
  const retortOuterGeo = new THREE.CylinderGeometry(0.85, 0.85, 4.2, 24);
  const retortOuter = new THREE.Mesh(retortOuterGeo, matPyrolysisRetort);
  retortOuter.rotation.z = Math.PI / 2;
  retortOuter.position.set(zC_x, 1.7, zC_z);
  retortOuter.castShadow = true;
  zoneCGroup.add(retortOuter);
  cutawayMeshes.push(retortOuter);

  thermalColoredMeshes.push({
    mesh: retortOuter,
    normalColor: new THREE.Color(0x475569),
    thermalColor: new THREE.Color(0xdc2626), // 520°C Glowing hot
  });

  // Stiffener flanges and ceramic heating bands along reactor barrel
  for (let rx = -1.8; rx <= 1.8; rx += 0.7) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.88, 0.04, 8, 24),
      matStainlessSteel
    );
    band.rotation.y = Math.PI / 2;
    band.position.set(zC_x + rx, 1.7, zC_z);
    zoneCGroup.add(band);
  }

  // Internal Pyrolysis Ribbon Auger Screw (visible in cutaway)
  const augerShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 4.0, 16),
    matStainlessSteel
  );
  augerShaft.rotation.z = Math.PI / 2;
  augerShaft.position.set(zC_x, 1.7, zC_z);
  zoneCGroup.add(augerShaft);
  interiorComponents.push(augerShaft);

  // Spiral flights for auger
  const flightCount = 14;
  for (let f = 0; f < flightCount; f++) {
    const flight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.04, 16),
      matStainlessSteel
    );
    flight.rotation.z = Math.PI / 2;
    flight.rotation.x = (f * Math.PI) / 3;
    flight.position.set(zC_x - 1.8 + (f * 3.6) / flightCount, 1.7, zC_z);
    zoneCGroup.add(flight);
    interiorComponents.push(flight);
    rotatingParts.push({ object: flight, axis: 'x', speed: 1.5 });
  }

  // Pyrolysis Drive Motor & High-Torque Gearbox (on left end)
  const pyroMotor = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.9, 0.8),
    matIndustrialGreen
  );
  pyroMotor.position.set(zC_x - 2.5, 1.7, zC_z);
  pyroMotor.castShadow = true;
  zoneCGroup.add(pyroMotor);

  // Transfer screw connecting Zone B Dryer discharge to Zone C Pyrolysis Infeed
  const transferTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 3.4, 16),
    matThermalInsulation
  );
  transferTube.position.set((zB_x - 2.0 + (zC_x - 1.6)) / 2, 0.8, zC_z);
  transferTube.rotation.z = Math.PI / 2.2;
  zoneCGroup.add(transferTube);

  // Cyclone Particulate Separator (gas treatment cleaning before combustion)
  const cycloneGroup = new THREE.Group();
  cycloneGroup.position.set(zC_x + 1.2, 2.8, zC_z - 1.0);

  const cycloneTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16),
    matStainlessSteel
  );
  const cycloneCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1.2, 16),
    matStainlessSteel
  );
  cycloneCone.rotation.x = Math.PI;
  cycloneCone.position.y = -1.0;
  cycloneGroup.add(cycloneTop, cycloneCone);

  const dustPot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16),
    matSteelDark
  );
  dustPot.position.y = -1.8;
  cycloneGroup.add(dustPot);
  zoneCGroup.add(cycloneGroup);

  // Syngas gas collection duct from reactor to cyclone
  const syngasDuct = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.5, 12),
    matStainlessSteel
  );
  syngasDuct.position.set(zC_x + 0.8, 2.7, zC_z - 0.5);
  syngasDuct.rotation.x = Math.PI / 4;
  zoneCGroup.add(syngasDuct);

  // Controlled Combustion Chamber / Thermal Oxidizer
  // Safely combusts cleaned pyrolysis gases (syngas) without atmospheric pollution
  const thermalOxidizer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 1.8, 16),
    matPyrolysisRetort
  );
  thermalOxidizer.position.set(zC_x + 2.4, 2.4, zC_z - 0.8);
  thermalOxidizer.castShadow = true;
  zoneCGroup.add(thermalOxidizer);

  // Flame sight port on thermal oxidizer
  const flamePort = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf97316 })
  );
  flamePort.position.set(zC_x + 2.4, 2.4, zC_z - 0.25);
  zoneCGroup.add(flamePort);

  // Shell-and-tube Flue Heat Recovery Exchanger (captures combustion heat for Sand Battery)
  const flueHx = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 1.4, 16),
    matThermalInsulation
  );
  flueHx.rotation.z = Math.PI / 2;
  flueHx.position.set(zC_x + 2.4, 3.6, zC_z - 0.8);
  zoneCGroup.add(flueHx);

  // Clean Flue Exhaust Stack
  const cleanStack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 2.4, 16),
    matStainlessSteel
  );
  cleanStack.position.set(zC_x + 3.0, 4.8, zC_z - 0.8);
  cleanStack.castShadow = true;
  zoneCGroup.add(cleanStack);

  // Water-Cooled Biochar Discharge Screw Conveyor & Airtight Collection Station
  const biocharScrew = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 1.6, 16),
    matSteelDark
  );
  biocharScrew.position.set(zC_x + 1.8, 0.8, zC_z + 0.8);
  biocharScrew.rotation.z = Math.PI / 3;
  zoneCGroup.add(biocharScrew);

  // Hermetic Biochar Collection Drum (Airtight 200L drum station)
  const biocharDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.9, 16),
    matBiochar
  );
  biocharDrum.position.set(zC_x + 2.2, 0.6, zC_z + 1.4);
  biocharDrum.castShadow = true;
  zoneCGroup.add(biocharDrum);

  const drumLid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16),
    matSteelDark
  );
  drumLid.position.set(zC_x + 2.2, 1.05, zC_z + 1.4);
  zoneCGroup.add(drumLid);

  // Nitrogen purge cylinder rack beside biochar drum
  const n2Bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.4, 12),
    matIndustrialGreen
  );
  n2Bottle.position.set(zC_x + 2.8, 0.9, zC_z + 1.4);
  zoneCGroup.add(n2Bottle);

  tagZoneGroup(zoneCGroup, 'zoneC');
  root.add(zoneCGroup);

  // ==========================================
  // ZONE D – HYBRID SAND THERMAL BATTERY
  // ==========================================
  const zoneDGroup = new THREE.Group();
  zoneDGroup.name = 'ZONE_D_SAND_BATTERY';
  const zD_x = 10.5;
  const zD_z = -1.8;

  createPlinth(zD_x, zD_z, 6.5, 6.5, 0.4);
  createZoneMarker('zoneD', 'ZONE D', 'Hybrid Sand Thermal Battery', zD_x - 3.2, zD_z + 3.2);

  // Hero Sand Storage Vessel (Cylindrical Insulated Silo)
  const vesselRadius = 2.0;
  const vesselHeight = 4.8;
  const vesselGeo = new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 32);
  const sandVessel = new THREE.Mesh(vesselGeo, matSandVesselOuter);
  sandVessel.position.set(zD_x, vesselHeight / 2 + 0.4, zD_z);
  sandVessel.castShadow = true;
  sandVessel.receiveShadow = true;
  zoneDGroup.add(sandVessel);
  cutawayMeshes.push(sandVessel);

  // Stainless steel cladding reinforcement rings
  for (let ry = 1.0; ry < vesselHeight; ry += 0.9) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(vesselRadius + 0.04, 0.03, 8, 32),
      matStainlessSteel
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(zD_x, 0.4 + ry, zD_z);
    zoneDGroup.add(ring);
  }

  // Top Dome & Access Manhole
  const domeGeo = new THREE.SphereGeometry(vesselRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 4);
  const vesselDome = new THREE.Mesh(domeGeo, matSandVesselOuter);
  vesselDome.position.set(zD_x, 0.4 + vesselHeight - 0.4, zD_z);
  zoneDGroup.add(vesselDome);
  cutawayMeshes.push(vesselDome);

  const manhole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16),
    matSteelDark
  );
  manhole.position.set(zD_x, 0.4 + vesselHeight + 0.25, zD_z);
  zoneDGroup.add(manhole);

  // CUTAWAY INTERIORS FOR SAND BATTERY:
  // 1. Solid High-Purity Quartz Silica Sand Core
  const sandCoreGeo = new THREE.CylinderGeometry(vesselRadius - 0.15, vesselRadius - 0.15, vesselHeight - 0.4, 24);
  const sandCoreMesh = new THREE.Mesh(sandCoreGeo, matSandMedium);
  sandCoreMesh.position.set(zD_x, vesselHeight / 2 + 0.4, zD_z);
  zoneDGroup.add(sandCoreMesh);
  interiorComponents.push(sandCoreMesh);

  thermalColoredMeshes.push({
    mesh: sandCoreMesh,
    normalColor: new THREE.Color(0xf59e0b),
    thermalColor: new THREE.Color(0xfb923c), // 450°C
  });

  // 2. Submerged Incoloy 800 Electrical Immersion Heaters (Surplus PV Electric Heating)
  const heaterBundleGroup = new THREE.Group();
  heaterBundleGroup.position.set(zD_x - 0.6, 0.4 + vesselHeight / 2, zD_z);
  const heaterRodGeo = new THREE.CylinderGeometry(0.04, 0.04, vesselHeight - 1.2, 8);
  const heaterMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.2,
  });

  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
    const rx = Math.cos(angle) * 0.4;
    const rz = Math.sin(angle) * 0.4;
    const rod = new THREE.Mesh(heaterRodGeo, heaterMat);
    rod.position.set(rx, 0, rz);
    heaterBundleGroup.add(rod);
  }
  zoneDGroup.add(heaterBundleGroup);
  interiorComponents.push(heaterBundleGroup);

  // 3. Submerged Spiral Heat Exchanger Coils (Solar & Pyrolysis In / Dryer Out)
  const coilGroup = new THREE.Group();
  coilGroup.position.set(zD_x + 0.5, 0.4 + vesselHeight / 2, zD_z);
  const coilTurns = 10;
  for (let c = 0; c < coilTurns; c++) {
    const cy = -vesselHeight / 2 + 0.6 + (c * (vesselHeight - 1.2)) / coilTurns;
    const coilLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.04, 8, 24),
      matStainlessSteel
    );
    coilLoop.rotation.x = Math.PI / 2;
    coilLoop.position.y = cy;
    coilGroup.add(coilLoop);
  }
  zoneDGroup.add(coilGroup);
  interiorComponents.push(coilGroup);

  // 4. Multi-Level Thermocouple Sensor Tree (Bottom, Mid, Top)
  const thermoTree = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, vesselHeight - 0.8, 8),
    matStainlessSteel
  );
  thermoTree.position.set(zD_x, 0.4 + vesselHeight / 2, zD_z + 0.7);
  zoneDGroup.add(thermoTree);
  interiorComponents.push(thermoTree);

  // External Circulation Pump Skid & Expansion Vessel
  const pumpSkid = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.2, 1.8),
    matSteelDark
  );
  pumpSkid.position.set(zD_x - 2.8, 0.5, zD_z);
  zoneDGroup.add(pumpSkid);

  // Redundant Hot Thermal Fluid Circulation Pumps
  for (let p = -0.5; p <= 0.5; p += 1.0) {
    const pumpMotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12),
      matIndustrialBlue
    );
    pumpMotor.rotation.z = Math.PI / 2;
    pumpMotor.position.set(zD_x - 2.8, 0.8, zD_z + p);
    zoneDGroup.add(pumpMotor);

    const pumpVolute = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 0.22, 12),
      matSteelDark
    );
    pumpVolute.position.set(zD_x - 2.5, 0.8, zD_z + p);
    zoneDGroup.add(pumpVolute);
  }

  // Thermal Fluid Expansion Vessel (Vertical pressure vessel)
  const expansionVessel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 1.4, 16),
    matSafetyYellow
  );
  expansionVessel.position.set(zD_x - 2.8, 1.7, zD_z - 1.2);
  zoneDGroup.add(expansionVessel);

  tagZoneGroup(zoneDGroup, 'zoneD');
  root.add(zoneDGroup);

  // ==========================================
  // ZONE E – RENEWABLE ENERGY INTEGRATION
  // ==========================================
  const zoneEGroup = new THREE.Group();
  zoneEGroup.name = 'ZONE_E_RENEWABLES';
  const zE_x = 6.5;
  const zE_z = 6.5;

  createPlinth(zE_x, zE_z, 11, 6.5, 0.25);
  createZoneMarker('zoneE', 'ZONE E', 'Solar PV & Thermal Integration', zE_x - 5.2, zE_z + 3.2);

  // Elevated Structural Steel Canopy Frame supporting PV and Solar Thermal
  const canopyHeight = 3.6;
  const canopyColGeo = new THREE.BoxGeometry(0.18, canopyHeight, 0.18);

  const canopyCols = [
    [zE_x - 4.8, zE_z - 2.6],
    [zE_x + 4.8, zE_z - 2.6],
    [zE_x - 4.8, zE_z + 2.6],
    [zE_x + 4.8, zE_z + 2.6],
    [zE_x, zE_z - 2.6],
    [zE_x, zE_z + 2.6],
  ];

  canopyCols.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(canopyColGeo, matSteelGalv);
    col.position.set(cx, canopyHeight / 2 + 0.25, cz);
    col.castShadow = true;
    zoneEGroup.add(col);
  });

  // Longitudinal & transverse roof purlins / rafters
  const beamFront = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.2, 0.14), matSteelGalv);
  beamFront.position.set(zE_x, canopyHeight + 0.25, zE_z + 2.6);
  const beamRear = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.2, 0.14), matSteelGalv);
  beamRear.position.set(zE_x, canopyHeight + 0.75, zE_z - 2.6); // 15° Tilt towards south/sun
  zoneEGroup.add(beamFront, beamRear);

  // 1. Solar Photovoltaic Array (16 High-Efficiency Mono-Crystalline PV Modules)
  const pvPanelMat = new THREE.MeshStandardMaterial({
    map: pvTexture,
    metalness: 0.85,
    roughness: 0.15,
  });

  const pvCols = 4;
  const pvRows = 3;
  const pvWidth = 1.4;
  const pvHeight = 1.0;

  for (let c = 0; c < pvCols; c++) {
    for (let r = 0; r < pvRows; r++) {
      const px = zE_x - 4.0 + c * 1.5;
      const pz = zE_z - 1.2 + r * 1.1;
      const py = canopyHeight + 0.5 - (r - 1) * 0.28;

      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(pvWidth, 0.05, pvHeight),
        pvPanelMat
      );
      panel.position.set(px, py, pz);
      panel.rotation.x = 0.26; // ~15° tilt
      panel.castShadow = true;
      zoneEGroup.add(panel);
    }
  }

  // 2. Solar Thermal Evacuated Tube Collectors Array
  // Positioned on the eastern side of the canopy structure
  const stGroup = new THREE.Group();
  stGroup.position.set(zE_x + 3.2, canopyHeight + 0.5, zE_z - 0.2);
  stGroup.rotation.x = 0.26;

  // Header manifold
  const manifold = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 2.6, 16),
    matThermalInsulation
  );
  manifold.rotation.z = Math.PI / 2;
  manifold.position.z = -1.2;
  stGroup.add(manifold);

  // Evacuated glass tubes with copper heat pipes
  const tubeMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e3a8a,
    metalness: 0.6,
    roughness: 0.1,
    transmission: 0.5,
    transparent: true,
  });

  const tubeCount = 14;
  for (let t = 0; t < tubeCount; t++) {
    const tx = -1.1 + (t * 2.2) / tubeCount;
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.2, 12),
      tubeMat
    );
    tube.rotation.x = Math.PI / 2;
    tube.position.set(tx, 0, 0);
    stGroup.add(tube);
  }
  zoneEGroup.add(stGroup);

  // 3. Heavy-Duty IP66 Solar Inverter & Electrical Switchboard Cabinet
  const inverterCabinet = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.8, 0.7),
    matIndustrialGreen
  );
  inverterCabinet.position.set(zE_x - 3.2, 1.15, zE_z - 2.4);
  inverterCabinet.castShadow = true;
  zoneEGroup.add(inverterCabinet);

  // Cabinet door details & cooling louvers
  const louverMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  const louvers = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.05), louverMat);
  louvers.position.set(zE_x - 3.2, 1.5, zE_z - 2.02);
  zoneEGroup.add(louvers);

  // 4. Lithium Iron Phosphate (LFP) BESS Container (60 kWh battery storage bank)
  const bessCabinet = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.9, 1.1),
    matSteelDark
  );
  bessCabinet.position.set(zE_x - 1.0, 1.2, zE_z - 2.4);
  bessCabinet.castShadow = true;
  zoneEGroup.add(bessCabinet);

  // BESS HVAC climate unit on side
  const bessHvac = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.6, 0.5),
    matStainlessSteel
  );
  bessHvac.position.set(zE_x - 2.0, 1.4, zE_z - 2.4);
  zoneEGroup.add(bessHvac);

  // 5. Heavy-Duty Power Busway Conduit running PV Surplus directly to Sand Battery
  // (Overhead yellow/gold conduit)
  const buswayCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zE_x - 3.2, 2.1, zE_z - 2.4),
    new THREE.Vector3(zE_x - 3.2, 3.4, zE_z - 2.4),
    new THREE.Vector3(zD_x - 1.2, 3.4, zE_z - 2.4),
    new THREE.Vector3(zD_x - 0.6, 3.4, zD_z),
    new THREE.Vector3(zD_x - 0.6, 2.6, zD_z),
  ]);
  const buswayGeo = new THREE.TubeGeometry(buswayCurve, 32, 0.08, 8, false);
  const buswayMat = new THREE.MeshStandardMaterial({
    color: 0xeab308, // High-voltage yellow
    metalness: 0.7,
    roughness: 0.3,
  });
  const buswayMesh = new THREE.Mesh(buswayGeo, buswayMat);
  zoneEGroup.add(buswayMesh);

  tagZoneGroup(zoneEGroup, 'zoneE');
  root.add(zoneEGroup);

  // ==========================================
  // ZONE F – AUTOMATION AND AI CONTROL CENTER
  // ==========================================
  const zoneFGroup = new THREE.Group();
  zoneFGroup.name = 'ZONE_F_CONTROL_ROOM';
  const zF_x = -12.5;
  const zF_z = -7.5;

  createPlinth(zF_x, zF_z, 8.5, 6.0, 0.3);
  createZoneMarker('zoneF', 'ZONE F', 'Automation & AI SCADA Hub', zF_x - 4.0, zF_z + 3.0);

  // Prefabricated Modular Control Room Cabin
  const cabinWidth = 7.0;
  const cabinHeight = 3.0;
  const cabinDepth = 4.6;

  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Modern architectural dark slate
    metalness: 0.5,
    roughness: 0.35,
  });
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinDepth),
    cabinMat
  );
  cabin.position.set(zF_x, cabinHeight / 2 + 0.3, zF_z);
  cabin.castShadow = true;
  zoneFGroup.add(cabin);

  // Large Panoramic Viewing Window overlooking the entire pilot plant
  const windowGeo = new THREE.BoxGeometry(5.2, 1.6, 0.08);
  const cabinWindow = new THREE.Mesh(windowGeo, matGlass);
  cabinWindow.position.set(zF_x, 1.8, zF_z + cabinDepth / 2 + 0.02);
  zoneFGroup.add(cabinWindow);

  // Interior: Multi-bay PLC Industrial Automation Cabinets (visible through window)
  const plcGroup = new THREE.Group();
  plcGroup.position.set(zF_x - 1.8, 1.4, zF_z - 1.0);
  for (let p = 0; p < 2; p++) {
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 2.0, 0.6),
      matIndustrialGreen
    );
    cabinet.position.x = p * 1.2;
    plcGroup.add(cabinet);

    // Front door window showing PLC I/O racks with blinkers
    const plcWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.8, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    plcWindow.position.set(p * 1.2, 0.4, 0.32);
    plcGroup.add(plcWindow);

    // LED status light row
    for (let led = 0; led < 6; led++) {
      const ledLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshBasicMaterial({ color: led % 2 === 0 ? 0x22c55e : 0xeab308 })
      );
      ledLight.position.set(p * 1.2 - 0.25 + led * 0.1, 0.7, 0.35);
      plcGroup.add(ledLight);
    }
  }
  zoneFGroup.add(plcGroup);

  // Interior: Operator Workstation Desk with Triple SCADA Monitors
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.8, 1.0),
    matSteelDark
  );
  desk.position.set(zF_x + 1.2, 0.7, zF_z + 0.6);
  zoneFGroup.add(desk);

  // Triple SCADA monitors
  const monitorMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  for (let m = -1; m <= 1; m++) {
    const mon = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.04), monitorMat);
    mon.position.set(zF_x + 1.2 + m * 0.72, 1.35, zF_z + 0.6);
    mon.rotation.y = -m * 0.2;
    zoneFGroup.add(mon);
  }

  // Exterior Warning Stack Light Tower (Green / Amber / Red Beacon)
  const beaconPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8),
    matSteelDark
  );
  beaconPost.position.set(zF_x + cabinWidth / 2 - 0.4, cabinHeight + 0.9, zF_z + cabinDepth / 2 - 0.4);
  zoneFGroup.add(beaconPost);

  const colors = [0xef4444, 0xf59e0b, 0x22c55e];
  colors.forEach((col, i) => {
    const lamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12),
      new THREE.MeshBasicMaterial({ color: col })
    );
    lamp.position.set(zF_x + cabinWidth / 2 - 0.4, cabinHeight + 1.2 + i * 0.14, zF_z + cabinDepth / 2 - 0.4);
    zoneFGroup.add(lamp);
  });

  // HVAC Unit on roof of control cabin
  const cabinHvac = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 1.2),
    matStainlessSteel
  );
  cabinHvac.position.set(zF_x - 1.2, cabinHeight + 0.7, zF_z);
  zoneFGroup.add(cabinHvac);

  tagZoneGroup(zoneFGroup, 'zoneF');
  root.add(zoneFGroup);

  // ==========================================
  // 7. ARCHITECTURAL STRUCTURAL STEEL & CATWALKS
  // ==========================================
  const structuralGroup = new THREE.Group();
  structuralGroup.name = 'Structural_Gantry_Walkways';

  // Elevated Maintenance Catwalk connecting Zone B (Dryer) and Zone C (Pyrolysis)
  const walkwayHeight = 2.4;
  const walkwayLength = 12.0;

  const catwalkFloor = new THREE.Mesh(
    new THREE.BoxGeometry(walkwayLength, 0.08, 1.2),
    matChequerPlate
  );
  catwalkFloor.position.set(-2.5, walkwayHeight, -3.4);
  catwalkFloor.castShadow = true;
  catwalkFloor.receiveShadow = true;
  structuralGroup.add(catwalkFloor);

  // Support columns for catwalk
  for (let cx = -7.5; cx <= 2.5; cx += 5.0) {
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, walkwayHeight, 0.16),
      matSteelGalv
    );
    col.position.set(cx, walkwayHeight / 2, -3.4);
    col.castShadow = true;
    structuralGroup.add(col);
  }

  // Safety Yellow Railing on catwalk
  const railGeo = new THREE.CylinderGeometry(0.03, 0.03, walkwayLength, 8);
  const topRail = new THREE.Mesh(railGeo, matSafetyYellow);
  topRail.rotation.z = Math.PI / 2;
  topRail.position.set(-2.5, walkwayHeight + 1.0, -3.95);
  const midRail = new THREE.Mesh(railGeo, matSafetyYellow);
  midRail.rotation.z = Math.PI / 2;
  midRail.position.set(-2.5, walkwayHeight + 0.5, -3.95);
  structuralGroup.add(topRail, midRail);

  // Vertical stanchions
  for (let rx = -8.0; rx <= 3.0; rx += 1.8) {
    const stanchion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8),
      matSafetyYellow
    );
    stanchion.position.set(rx, walkwayHeight + 0.5, -3.95);
    structuralGroup.add(stanchion);
  }

  // Cage ladder access to catwalk
  const ladderGroup = new THREE.Group();
  ladderGroup.position.set(3.4, 0, -3.4);
  for (let rung = 0.3; rung < walkwayHeight; rung += 0.3) {
    const rungMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6),
      matSteelGalv
    );
    rungMesh.rotation.z = Math.PI / 2;
    rungMesh.position.y = rung;
    ladderGroup.add(rungMesh);
  }
  const ladderStringerL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, walkwayHeight + 1.0, 6), matSteelGalv);
  ladderStringerL.position.set(-0.25, (walkwayHeight + 1.0) / 2, 0);
  const ladderStringerR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, walkwayHeight + 1.0, 6), matSteelGalv);
  ladderStringerR.position.set(0.25, (walkwayHeight + 1.0) / 2, 0);
  ladderGroup.add(ladderStringerL, ladderStringerR);
  structuralGroup.add(ladderGroup);

  // Industrial High-Efficiency LED Floodlight Poles
  const floodlightPositions = [
    [-17, 10], [17, 10], [-17, -10], [17, -10]
  ];
  floodlightPositions.forEach(([fx, fz]) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 6.5, 8),
      matSteelGalv
    );
    pole.position.set(fx, 3.25, fz);
    pole.castShadow = true;
    structuralGroup.add(pole);

    const lightFixture = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.3, 0.4),
      matSteelDark
    );
    lightFixture.position.set(fx, 6.4, fz);
    lightFixture.lookAt(0, 1.5, 0);
    structuralGroup.add(lightFixture);

    const emitter = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.25),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    emitter.position.set(0, 0, 0.21);
    lightFixture.add(emitter);
  });

  root.add(structuralGroup);

  // ==========================================
  // 8. ENGINEERING PIPING CIRCUITS (DIN/ASME STANDARDS)
  // ==========================================
  const pipingGroup = new THREE.Group();
  pipingGroup.name = 'Engineering_Piping_Circuits';

  // Circuit 1: Solar Thermal Collectors -> Sand Battery (Yellow/Orange Glycol Line)
  const solarThermalCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zE_x + 3.2, canopyHeight + 0.5, zE_z - 1.2),
    new THREE.Vector3(zE_x + 3.2, 1.8, zE_z - 1.2),
    new THREE.Vector3(zD_x + 1.5, 1.8, zE_z - 1.2),
    new THREE.Vector3(zD_x + 1.5, 1.8, zD_z + 2.0),
    new THREE.Vector3(zD_x + 1.0, 1.8, zD_z + 1.9),
  ]);
  const solarThermalPipeGeo = new THREE.TubeGeometry(solarThermalCurve, 32, 0.09, 8, false);
  const matSolarThermalPipe = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Amber Solar Thermal
    metalness: 0.8,
    roughness: 0.25,
  });
  const solarThermalPipe = new THREE.Mesh(solarThermalPipeGeo, matSolarThermalPipe);
  pipingGroup.add(solarThermalPipe);

  // Circuit 2: Pyrolysis Flue Gas Recovered Heat -> Sand Battery (Red Flue Oil Line)
  const pyroFlueCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zC_x + 2.4, 3.6, zC_z - 0.8),
    new THREE.Vector3(zC_x + 2.4, 3.8, zC_z - 2.8),
    new THREE.Vector3(zD_x - 1.5, 3.8, zC_z - 2.8),
    new THREE.Vector3(zD_x - 1.5, 3.8, zD_z),
    new THREE.Vector3(zD_x - 1.8, 3.8, zD_z),
  ]);
  const pyroFluePipeGeo = new THREE.TubeGeometry(pyroFlueCurve, 32, 0.1, 8, false);
  const matPyroFluePipe = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red Pyrolysis Recovery
    metalness: 0.8,
    roughness: 0.2,
  });
  const pyroFluePipe = new THREE.Mesh(pyroFluePipeGeo, matPyroFluePipe);
  pipingGroup.add(pyroFluePipe);

  // Circuit 3: Sand Battery Discharge -> Zone B Dryer Heat Exchanger (Cyan / Light Blue)
  // Dedicated clean closed loop supplying heat to the biomass dryer
  const dryerSupplyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zD_x - 2.5, 0.8, zD_z - 0.5),
    new THREE.Vector3(zD_x - 3.2, 0.8, zD_z - 2.8),
    new THREE.Vector3(zB_x + 3.4, 0.8, zD_z - 2.8),
    new THREE.Vector3(zB_x + 3.4, 1.2, zB_z),
    new THREE.Vector3(zB_x + 2.8, 1.2, zB_z),
  ]);
  const dryerSupplyPipeGeo = new THREE.TubeGeometry(dryerSupplyCurve, 32, 0.09, 8, false);
  const matDryerSupplyPipe = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Clean Thermal Fluid Supply
    metalness: 0.8,
    roughness: 0.25,
  });
  const dryerSupplyPipe = new THREE.Mesh(dryerSupplyPipeGeo, matDryerSupplyPipe);
  pipingGroup.add(dryerSupplyPipe);

  // Return pipe from Dryer back to Sand Battery
  const dryerReturnCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zB_x + 2.8, 0.9, zB_z),
    new THREE.Vector3(zB_x + 3.6, 0.9, zB_z),
    new THREE.Vector3(zB_x + 3.6, 0.5, zD_z - 2.6),
    new THREE.Vector3(zD_x - 3.4, 0.5, zD_z - 2.6),
    new THREE.Vector3(zD_x - 3.4, 0.6, zD_z + 0.5),
    new THREE.Vector3(zD_x - 2.5, 0.6, zD_z + 0.5),
  ]);
  const dryerReturnPipeGeo = new THREE.TubeGeometry(dryerReturnCurve, 32, 0.08, 8, false);
  const matDryerReturnPipe = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Cool Return
    metalness: 0.8,
    roughness: 0.3,
  });
  const dryerReturnPipe = new THREE.Mesh(dryerReturnPipeGeo, matDryerReturnPipe);
  pipingGroup.add(dryerReturnPipe);

  root.add(pipingGroup);

  return {
    rootGroup: root,
    cutawayMeshes,
    interiorComponents,
    zoneHitObjects,
    thermalColoredMeshes,
    rotatingParts,
  };
}
