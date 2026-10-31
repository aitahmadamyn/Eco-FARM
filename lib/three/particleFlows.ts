import * as THREE from 'three';

export interface ParticleFlowSystem {
  group: THREE.Group;
  update: (delta: number, speedMultiplier: number) => void;
  dispose: () => void;
}

export function createProcessParticleFlows(): ParticleFlowSystem {
  const group = new THREE.Group();
  group.name = 'PROCESS_PARTICLE_FLOWS';

  // Helper to create instanced particles along a 3D curve
  interface FlowStream {
    curve: THREE.CatmullRomCurve3;
    mesh: THREE.InstancedMesh;
    particleCount: number;
    speeds: Float32Array;
    progress: Float32Array;
    dummy: THREE.Object3D;
  }

  const streams: FlowStream[] = [];

  const createStream = (
    points: THREE.Vector3[],
    color: number,
    count: number,
    particleSize: number,
    baseSpeed: number
  ) => {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.SphereGeometry(particleSize, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const speeds = new Float32Array(count);
    const progress = new Float32Array(count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      progress[i] = i / count;
      speeds[i] = baseSpeed * (0.85 + Math.random() * 0.3);
    }

    group.add(mesh);
    streams.push({ curve, mesh, particleCount: count, speeds, progress, dummy });
  };

  // 1. Raw Biomass Flow (Zone A: Shredder -> Conveyor -> Zone B Dryer Hopper)
  createStream(
    [
      new THREE.Vector3(-11.0, 0.6, 5.8),
      new THREE.Vector3(-9.2, 2.0, 2.5),
      new THREE.Vector3(-7.5, 3.4, -0.8),
    ],
    0x84cc16, // Greenish Biomass
    18,
    0.07,
    0.18
  );

  // 2. Dried Biomass Flow (Zone B Dryer -> Zone C Pyrolysis Feed)
  createStream(
    [
      new THREE.Vector3(-8.5, 0.5, -1.8),
      new THREE.Vector3(-4.0, 0.7, -1.8),
      new THREE.Vector3(-1.0, 1.7, -1.8),
    ],
    0xf59e0b, // Amber Dried Biomass
    14,
    0.06,
    0.22
  );

  // 3. Biochar Collection Flow (Zone C -> Drum)
  createStream(
    [
      new THREE.Vector3(3.2, 1.4, -1.8),
      new THREE.Vector3(3.4, 0.8, -0.6),
      new THREE.Vector3(3.7, 0.6, -0.4),
    ],
    0x18181b, // Charcoal Black
    10,
    0.05,
    0.25
  );

  // 4. Solar Thermal Collector Circuit (Zone E -> Zone D Sand Battery)
  createStream(
    [
      new THREE.Vector3(9.7, 4.1, 5.3),
      new THREE.Vector3(9.7, 1.8, 5.3),
      new THREE.Vector3(12.0, 1.8, 5.3),
      new THREE.Vector3(12.0, 1.8, 0.2),
      new THREE.Vector3(11.5, 1.8, 0.1),
    ],
    0xf59e0b, // Warm Solar Amber
    20,
    0.06,
    0.28
  );

  // 5. Pyrolysis Syngas Heat Recovery Flue Loop (Zone C -> Zone D Sand Battery)
  createStream(
    [
      new THREE.Vector3(3.9, 3.6, -2.6),
      new THREE.Vector3(3.9, 3.8, -4.6),
      new THREE.Vector3(9.0, 3.8, -4.6),
      new THREE.Vector3(9.0, 3.8, -1.8),
      new THREE.Vector3(8.7, 3.8, -1.8),
    ],
    0xef4444, // Glowing Red Heat Recovery
    22,
    0.07,
    0.32
  );

  // 6. Surplus PV Electricity Pulses to Sand Battery Immersion Heaters
  createStream(
    [
      new THREE.Vector3(3.3, 2.1, 4.1),
      new THREE.Vector3(3.3, 3.4, 4.1),
      new THREE.Vector3(9.3, 3.4, 4.1),
      new THREE.Vector3(9.9, 3.4, -1.8),
      new THREE.Vector3(9.9, 2.6, -1.8),
    ],
    0xfde047, // Bright Electric Yellow
    25,
    0.05,
    0.45
  );

  // 7. Sand Battery Discharging Heat Loop to Zone B Dryer Heat Exchanger (Clean Cyan Fluid)
  createStream(
    [
      new THREE.Vector3(8.0, 0.8, -2.3),
      new THREE.Vector3(7.3, 0.8, -4.6),
      new THREE.Vector3(-3.1, 0.8, -4.6),
      new THREE.Vector3(-3.1, 1.2, -1.8),
      new THREE.Vector3(-3.7, 1.2, -1.8),
    ],
    0x38bdf8, // Clean Hot Fluid (Cyan)
    24,
    0.065,
    0.26
  );

  const update = (delta: number, speedMultiplier: number) => {
    if (speedMultiplier <= 0) return;

    for (let s = 0; s < streams.length; s++) {
      const stream = streams[s];
      const { curve, mesh, particleCount, speeds, progress, dummy } = stream;

      for (let i = 0; i < particleCount; i++) {
        progress[i] = (progress[i] + speeds[i] * delta * speedMultiplier) % 1.0;
        const pt = curve.getPointAt(progress[i]);
        dummy.position.copy(pt);
        dummy.scale.setScalar(1.0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  };

  const dispose = () => {
    streams.forEach((s) => {
      s.mesh.geometry.dispose();
      if (Array.isArray(s.mesh.material)) {
        s.mesh.material.forEach((m) => m.dispose());
      } else {
        s.mesh.material.dispose();
      }
    });
  };

  return {
    group,
    update,
    dispose,
  };
}
