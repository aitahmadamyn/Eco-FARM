import * as THREE from 'three';

export interface ParticleFlowSystem {
  group: THREE.Group;
  update: (delta: number, speedMultiplier: number) => void;
  dispose: () => void;
}

export function createProcessParticleFlows(): ParticleFlowSystem {
  const group = new THREE.Group();
  group.name = 'PROCESS_PARTICLE_FLOWS';

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

  // 1. Raw Biomass Infeed along Conveyor
  createStream(
    [
      new THREE.Vector3(-11.0, 0.6, 5.8),
      new THREE.Vector3(-9.25, 2.0, 2.5),
      new THREE.Vector3(-7.5, 3.4, -0.8),
    ],
    0x84cc16, // Biomass green
    12,
    0.07,
    0.2
  );

  // 2. Solar Circuit -> Sand Battery (Yellow)
  createStream(
    [
      new THREE.Vector3(8.5, 3.8, 6.5),
      new THREE.Vector3(11.7, 1.8, 6.5),
      new THREE.Vector3(11.7, 1.8, -0.3),
    ],
    0xf59e0b, // Amber / Solar
    14,
    0.065,
    0.25
  );

  // 3. Pyrolysis Syngas Heat Circuit -> Sand Battery (Red)
  createStream(
    [
      new THREE.Vector3(3.9, 3.6, -2.6),
      new THREE.Vector3(9.0, 3.6, -1.8),
    ],
    0xef4444, // Red heat recovery
    14,
    0.065,
    0.3
  );

  // 4. Sand Battery Clean Hot Air Discharge -> Zone B Dryer (Cyan)
  createStream(
    [
      new THREE.Vector3(8.0, 0.8, -1.8),
      new THREE.Vector3(-3.7, 0.8, -3.3),
      new THREE.Vector3(-3.7, 1.2, -1.8),
    ],
    0x38bdf8, // Clean Cyan
    16,
    0.065,
    0.28
  );

  return {
    group,
    update: (delta: number, speedMultiplier: number) => {
      if (speedMultiplier === 0) return;
      streams.forEach((stream) => {
        const { curve, mesh, dummy, speeds, progress, particleCount } = stream;
        for (let i = 0; i < particleCount; i++) {
          progress[i] = (progress[i] + speeds[i] * delta * speedMultiplier) % 1.0;
          const point = curve.getPointAt(progress[i]);
          dummy.position.copy(point);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      });
    },
    dispose: () => {
      streams.forEach((stream) => {
        stream.mesh.geometry.dispose();
        if (Array.isArray(stream.mesh.material)) {
          stream.mesh.material.forEach((m) => m.dispose());
        } else {
          stream.mesh.material.dispose();
        }
      });
    },
  };
}
