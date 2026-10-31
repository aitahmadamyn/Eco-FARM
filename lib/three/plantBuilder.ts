import * as THREE from 'three';
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
  // 1. CLEAN INDUSTRIAL PBR MATERIALS (Matched to Preview)
  // ==========================================
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

  // Stainless steel: in dark scene without RoomEnvironment, provides dark lustrous metallic appearance with crisp sun specular
  const matStainless = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.18,
  });

  const matSafetyYellow = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    metalness: 0.3,
    roughness: 0.4,
  });

  const matConcrete = new THREE.MeshStandardMaterial({
    color: 0x8fa0b5,
    roughness: 0.85,
    metalness: 0.08,
  });

  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transmission: 0.85,
    transparent: true,
    opacity: 0.4,
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

  const matSolarBlue = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    metalness: 0.9,
    roughness: 0.2,
  });

  const matEquipmentBlue = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.5,
    roughness: 0.35,
  });

  // Helper to register zone mesh for raycasting and inspection
  function tagMesh(mesh: THREE.Mesh, zoneId: ZoneId) {
    mesh.userData.zoneId = zoneId;
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    zoneHitObjects.push({ zoneId, object: mesh, worldPos });
  }

  // ==========================================
  // 1. CONCRETE SLAB FOUNDATION
  // ==========================================
  const slab = new THREE.Mesh(new THREE.BoxGeometry(38, 0.6, 26), matConcrete);
  slab.position.y = -0.3;
  slab.receiveShadow = true;
  root.add(slab);

  // ==========================================
  // 2. ZONE A — RECEPTION & SHREDDING
  // ==========================================
  const zA_x = -13;
  const zA_z = 5;

  const bunker = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 3.2), matDarkSteel);
  bunker.position.set(zA_x - 1.2, 0.6, zA_z + 0.8);
  bunker.castShadow = true;
  tagMesh(bunker, 'zoneA');
  root.add(bunker);

  const shredder = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.6), matSafetyYellow);
  shredder.position.set(zA_x + 1.6, 1.0, zA_z + 0.8);
  shredder.castShadow = true;
  tagMesh(shredder, 'zoneA');
  root.add(shredder);

  // Inclined conveyor beam rising up towards dryer/cabin
  const convStart = new THREE.Vector3(zA_x + 2.0, 0.6, zA_z + 0.8);
  const convEnd = new THREE.Vector3(-7.5, 3.4, -0.8);
  const convLen = convStart.distanceTo(convEnd);
  const convBeam = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, convLen), matSteel);
  const convMid = new THREE.Vector3().addVectors(convStart, convEnd).multiplyScalar(0.5);
  convBeam.position.copy(convMid);
  convBeam.lookAt(convEnd);
  tagMesh(convBeam, 'zoneA');
  root.add(convBeam);

  // ==========================================
  // 3. ZONE B — CONTINUOUS TRAY DRYER
  // ==========================================
  const zB_x = -6.5;
  const zB_z = -1.8;

  const dryerHousing = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.4, 2.2), matEquipmentBlue);
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

  // Internal trays (visible in cutaway)
  for (let t = 0; t < 3; t++) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.06, 1.8), matStainless);
    tray.position.set(zB_x, 0.8 + t * 0.6, zB_z);
    interiorComponents.push(tray);
    root.add(tray);
  }

  // Centrifugal blower fan
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16), matDarkSteel);
  fan.rotation.z = Math.PI / 2;
  fan.position.set(zB_x + 2.7, 2.7, zB_z);
  tagMesh(fan, 'zoneB');
  root.add(fan);

  // Vapor exhaust chimney
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 2.2, 16), matStainless);
  exhaust.position.set(zB_x - 1.6, 3.2, zB_z);
  root.add(exhaust);

  // ==========================================
  // 4. ZONE C — PYROLYSIS & BIOCHAR
  // ==========================================
  const zC_x = 1.5;
  const zC_z = -1.8;

  const retort = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 4.2, 24), matDarkSteel);
  retort.rotation.z = Math.PI / 2;
  retort.position.set(zC_x, 1.7, zC_z);
  retort.castShadow = true;
  tagMesh(retort, 'zoneC');
  cutawayMeshes.push(retort);
  thermalColoredMeshes.push({
    mesh: retort,
    normalColor: new THREE.Color(0x334155),
    thermalColor: new THREE.Color(0xef4444),
  });
  root.add(retort);

  // Internal rotating auger screw
  const auger = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.0, 16), matStainless);
  auger.rotation.z = Math.PI / 2;
  auger.position.set(zC_x, 1.7, zC_z);
  interiorComponents.push(auger);
  root.add(auger);
  rotatingParts.push({ object: auger, axis: 'x', speed: 2 });

  // Cyclone separator
  const cyclone = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.4, 16), matStainless);
  cyclone.position.set(zC_x + 1.2, 2.8, zC_z - 1.0);
  tagMesh(cyclone, 'zoneC');
  root.add(cyclone);

  // Flameless thermal oxidizer
  const oxidizer = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 16), matDarkSteel);
  oxidizer.position.set(zC_x + 2.4, 2.4, zC_z - 0.8);
  tagMesh(oxidizer, 'zoneC');
  root.add(oxidizer);

  // Biochar drum station
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.9, 16), matBiochar);
  drum.position.set(zC_x + 2.2, 0.6, zC_z + 1.4);
  tagMesh(drum, 'zoneC');
  root.add(drum);

  // ==========================================
  // 5. ZONE D — HYBRID SAND THERMAL BATTERY (HERO)
  // ==========================================
  const zD_x = 10.5;
  const zD_z = -1.8;

  // Tall cylindrical silo vessel
  const vesselRadius = 2.0;
  const vesselHeight = 4.8;
  const sandVessel = new THREE.Mesh(
    new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 32),
    matStainless
  );
  sandVessel.position.set(zD_x, vesselHeight / 2, zD_z);
  sandVessel.castShadow = true;
  tagMesh(sandVessel, 'zoneD');
  cutawayMeshes.push(sandVessel);
  root.add(sandVessel);

  // Silo Hemispherical Dome (seamless rounded cap with specular highlight)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(vesselRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    matStainless
  );
  dome.position.set(zD_x, vesselHeight, zD_z);
  cutawayMeshes.push(dome);
  root.add(dome);

  // Internal sand core (revealed in cutaway mode)
  const sandCore = new THREE.Mesh(
    new THREE.CylinderGeometry(1.85, 1.85, vesselHeight - 0.2, 24),
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
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.8, 8), heaterMat);
    rod.position.set(zD_x + Math.cos(a) * 0.5, 2.8, zD_z + Math.sin(a) * 0.5);
    interiorComponents.push(rod);
    root.add(rod);
  }

  // Circulation pump and expansion skid
  const pump = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.8), matDarkSteel);
  pump.position.set(zD_x - 2.8, 0.5, zD_z);
  root.add(pump);

  // ==========================================
  // 6. ZONE E — SOLAR PV & THERMAL CANOPY
  // ==========================================
  const zE_x = 6.5;
  const zE_z = 6.5;

  // Canopy vertical columns (3 clearly visible in foreground in preview photo!)
  const colPositions: [number, number][] = [
    [-4.5, -2.5],
    [4.5, -2.5],
    [-4.5, 2.5],
    [4.5, 2.5],
  ];
  colPositions.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.18), matSteel);
    col.position.set(zE_x + cx, 1.8, zE_z + cz);
    col.castShadow = true;
    root.add(col);
  });

  // Solar PV panels array (4 columns x 3 rows tilted)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.0), matSolarBlue);
      panel.position.set(
        zE_x - 2.8 + c * 1.5,
        3.8 - (r - 1) * 0.28,
        zE_z - 1.0 + r * 1.1
      );
      panel.rotation.x = 0.26;
      tagMesh(panel, 'zoneE');
      root.add(panel);
    }
  }

  // Solar Inverter
  const inverter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.7), matSafetyYellow);
  inverter.position.set(zE_x - 3.2, 1.15, zE_z - 2.4);
  tagMesh(inverter, 'zoneE');
  root.add(inverter);

  // BESS battery storage unit
  const bess = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.9, 1.1), matDarkSteel);
  bess.position.set(zE_x - 1.0, 1.2, zE_z - 2.4);
  tagMesh(bess, 'zoneE');
  root.add(bess);

  // ==========================================
  // 7. ZONE F — SCADA CONTROL CABIN
  // ==========================================
  const zF_x = -12.5;
  const zF_z = -7.5;

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(7.0, 3.0, 4.6), matDarkSteel);
  cabin.position.set(zF_x, 1.8, zF_z);
  tagMesh(cabin, 'zoneF');
  root.add(cabin);

  // Cabin light roof slab (visible in preview)
  const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.3, 5.0), matStainless);
  cabinRoof.position.set(zF_x, 3.4, zF_z);
  root.add(cabinRoof);

  // Cabin panoramic glass front window
  const cabinWin = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.6, 0.08), matGlass);
  cabinWin.position.set(zF_x, 1.8, zF_z + 2.32);
  root.add(cabinWin);

  // ==========================================
  // 8. FLUID CIRCUITS & PIPING
  // ==========================================
  function createPipe(curve: THREE.Curve<THREE.Vector3>, color: number, rad = 0.08) {
    const geo = new THREE.TubeGeometry(curve, 24, rad, 8, false);
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.8,
      roughness: 0.25,
    });
    const p = new THREE.Mesh(geo, mat);
    root.add(p);
    return p;
  }

  // Solar -> Sand Battery (Amber)
  const solarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zE_x + 2.0, 3.8, zE_z),
    new THREE.Vector3(zD_x + 1.2, 1.8, zE_z),
    new THREE.Vector3(zD_x + 1.2, 1.8, zD_z + 1.5),
  ]);
  createPipe(solarCurve, 0xf59e0b);

  // Pyrolysis -> Sand Battery (Red)
  const pyroCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zC_x + 2.4, 3.6, zC_z - 0.8),
    new THREE.Vector3(zD_x - 1.5, 3.6, zD_z),
  ]);
  createPipe(pyroCurve, 0xef4444);

  // Sand Battery -> Dryer (Cyan)
  const dryerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zD_x - 2.5, 0.8, zD_z),
    new THREE.Vector3(zB_x + 2.8, 0.8, zD_z - 1.5),
    new THREE.Vector3(zB_x + 2.8, 1.2, zB_z),
  ]);
  createPipe(dryerCurve, 0x38bdf8);

  // Flexible bypass pipe looped in front of the silo (visible in preview)
  const siloBypassCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(zD_x - 1.8, 0.8, zD_z + 1.5),
    new THREE.Vector3(zD_x - 0.6, 0.3, zD_z + 4.2),
    new THREE.Vector3(zE_x + 4.5, 1.8, zE_z + 2.5),
  ]);
  createPipe(siloBypassCurve, 0xd1d5db, 0.07);

  return {
    rootGroup: root,
    cutawayMeshes,
    interiorComponents,
    zoneHitObjects,
    thermalColoredMeshes,
    rotatingParts,
  };
}
