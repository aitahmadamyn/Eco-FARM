import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildEcofarmCircularPlant, PlantBuildResult } from './plantBuilder';
import { createProcessParticleFlows, ParticleFlowSystem } from './particleFlows';
import { CameraPreset, DisplayMode, ZoneId } from '../types/plant';

export interface SceneManagerCallbacks {
  onZoneSelected: (zoneId: ZoneId) => void;
  onZoneHovered: (zoneId: ZoneId | null) => void;
}

export class EcofarmSceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private plantData: PlantBuildResult;
  private particleFlows: ParticleFlowSystem;
  private callbacks: SceneManagerCallbacks;

  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Camera transition state
  private isTransitioningCamera: boolean = false;
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3();
  private targetControlsTarget: THREE.Vector3 = new THREE.Vector3();
  private flowSpeedMultiplier: number = 1.0;
  private currentDisplayMode: DisplayMode = 'realistic';

  // Raycasting
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private hoveredZoneId: ZoneId | null = null;

  constructor(container: HTMLElement, callbacks: SceneManagerCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Fog Setup (Industrial sky horizon)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep industrial slate
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    // 3. Camera Setup (Isometric 3/4 Elevated Default)
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.5, 200);
    this.camera.position.set(22, 17, 24);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.8, 0);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't go below ground
    this.controls.minDistance = 4;
    this.controls.maxDistance = 65;

    this.controls.addEventListener('start', () => {
      this.isTransitioningCamera = false;
    });

    // 5. Balanced 3-Point Studio & Sun Lighting Rig
    this.setupLighting();

    // 7. Build Plant Procedural Models
    this.plantData = buildEcofarmCircularPlant();
    this.scene.add(this.plantData.rootGroup);

    // 8. Animated Process Particle Flows
    this.particleFlows = createProcessParticleFlows();
    this.scene.add(this.particleFlows.group);

    // Event listeners for touch, mouse and pen
    window.addEventListener('resize', this.onWindowResize);
    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('pointerdown', this.onPointerDown);
    this.container.addEventListener('pointerup', this.onPointerUp);

    // Start render loop
    this.startLoop();
  }

  private setupLighting() {
    // Hemisphere fill (clean skylight for architectural slab)
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.4);
    hemiLight.position.set(0, 30, 0);
    this.scene.add(hemiLight);

    // Sun Key Light (Directional with crisp specular highlights)
    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.4); // Warm sunlight
    sunLight.position.set(24, 28, 20);
    sunLight.castShadow = !this.isSoftwareGl;
    if (sunLight.castShadow) {
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 80;
      const d = 24;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(sunLight);

    // Cool Rim / Accent Light from behind
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-20, 16, -18);
    this.scene.add(rimLight);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private pointerDownPos: { x: number; y: number; time: number } = { x: 0, y: 0, time: 0 };

  private getZoneFromObject(obj: THREE.Object3D | null): ZoneId | null {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      if (cur.userData && cur.userData.zoneId) {
        return cur.userData.zoneId as ZoneId;
      }
      cur = cur.parent;
    }
    return null;
  }

  private onPointerDown = (e: PointerEvent) => {
    this.pointerDownPos = { x: e.clientX, y: e.clientY, time: performance.now() };
  };

  private onPointerUp = (e: PointerEvent) => {
    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    const dist = Math.hypot(dx, dy);
    const duration = performance.now() - this.pointerDownPos.time;

    // If moved less than 12px and released within 600ms, it is a deliberate touch/click!
    if (dist < 12 && duration < 600) {
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

      // 1. Check zone placard marker pins
      const hitCandidates = this.plantData.zoneHitObjects.map((z) => z.object);
      const pinHits = this.raycaster.intersectObjects(hitCandidates, false);
      if (pinHits.length > 0) {
        const found = this.plantData.zoneHitObjects.find((z) => z.object === pinHits[0].object);
        if (found) {
          this.callbacks.onZoneSelected(found.zoneId);
          this.setCameraPreset(found.zoneId);
          return;
        }
      }

      // 2. Check all physical plant equipment meshes
      const plantHits = this.raycaster.intersectObjects(this.plantData.rootGroup.children, true);
      for (const hit of plantHits) {
        const zoneId = this.getZoneFromObject(hit.object);
        if (zoneId) {
          this.callbacks.onZoneSelected(zoneId);
          this.setCameraPreset(zoneId);
          return;
        }
      }
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    let detectedZone: ZoneId | null = null;

    // Check marker pins
    const hitCandidates = this.plantData.zoneHitObjects.map((z) => z.object);
    const pinHits = this.raycaster.intersectObjects(hitCandidates, false);
    if (pinHits.length > 0) {
      const found = this.plantData.zoneHitObjects.find((z) => z.object === pinHits[0].object);
      if (found) detectedZone = found.zoneId;
    }

    // Check physical equipment
    if (!detectedZone) {
      const plantHits = this.raycaster.intersectObjects(this.plantData.rootGroup.children, true);
      for (const hit of plantHits) {
        const zid = this.getZoneFromObject(hit.object);
        if (zid) {
          detectedZone = zid;
          break;
        }
      }
    }

    if (detectedZone !== this.hoveredZoneId) {
      this.hoveredZoneId = detectedZone;
      this.callbacks.onZoneHovered(detectedZone);
      this.container.style.cursor = detectedZone ? 'pointer' : 'default';
    }
  };

  public zoom(delta: number) {
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    const currentDist = dir.length();
    const newDist = Math.max(5, Math.min(65, currentDist + delta));
    dir.normalize().multiplyScalar(newDist);
    this.targetCameraPos.copy(this.controls.target).add(dir);
    this.targetControlsTarget.copy(this.controls.target);
    this.isTransitioningCamera = true;
  }

  public setCameraPreset(preset: CameraPreset) {
    const presets: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
      isometric: { pos: [22, 17, 24], target: [0, 1.8, 0] },
      plan: { pos: [0, 36, 0.1], target: [0, 0, 0] },
      zoneA: { pos: [-16, 7.5, 12], target: [-13, 1.5, 5] },
      zoneB: { pos: [-7.5, 5.5, 4.5], target: [-6.5, 1.8, -1.8] },
      zoneC: { pos: [2.0, 5.5, 4.5], target: [1.5, 2.0, -1.8] },
      zoneD: { pos: [11.5, 7.0, 6.0], target: [10.5, 2.6, -1.8] },
      zoneE: { pos: [8.5, 7.0, 13.5], target: [6.5, 2.5, 6.5] },
      zoneF: { pos: [-13.0, 5.2, -1.8], target: [-12.5, 1.8, -7.5] },
    };

    const targetConfig = presets[preset];
    if (!targetConfig) return;

    this.targetCameraPos.set(...targetConfig.pos);
    this.targetControlsTarget.set(...targetConfig.target);
    this.isTransitioningCamera = true;
  }

  public setDisplayMode(mode: DisplayMode) {
    this.currentDisplayMode = mode;

    if (mode === 'cutaway') {
      // Make outer hulls transparent to reveal internal sand core, heating coils, auger, trays
      this.plantData.cutawayMeshes.forEach((mesh) => {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            m.transparent = true;
            m.opacity = 0.22;
            m.depthWrite = false;
          });
        } else {
          mesh.material.transparent = true;
          mesh.material.opacity = 0.22;
          mesh.material.depthWrite = false;
        }
      });
      this.plantData.interiorComponents.forEach((obj) => (obj.visible = true));
    } else {
      // Restore opaque materials
      this.plantData.cutawayMeshes.forEach((mesh) => {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            m.transparent = false;
            m.opacity = 1.0;
            m.depthWrite = true;
          });
        } else {
          mesh.material.transparent = false;
          mesh.material.opacity = 1.0;
          mesh.material.depthWrite = true;
        }
      });
    }

    if (mode === 'thermal') {
      // Tint equipment to thermodynamic temperature spectrum
      this.plantData.thermalColoredMeshes.forEach(({ mesh, thermalColor }) => {
        if ('color' in mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).color.copy(thermalColor);
        }
      });
    } else {
      this.plantData.thermalColoredMeshes.forEach(({ mesh, normalColor }) => {
        if ('color' in mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).color.copy(normalColor);
        }
      });
    }
  }

  public setFlowSpeedMultiplier(multiplier: number) {
    this.flowSpeedMultiplier = multiplier;
  }

  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.1);

      // Smooth exponential camera damping
      if (this.isTransitioningCamera) {
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 4.0, delta);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 4.0, delta);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 4.0, delta);

        this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetControlsTarget.x, 4.0, delta);
        this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetControlsTarget.y, 4.0, delta);
        this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetControlsTarget.z, 4.0, delta);

        if (
          this.camera.position.distanceTo(this.targetCameraPos) < 0.08 &&
          this.controls.target.distanceTo(this.targetControlsTarget) < 0.08
        ) {
          this.camera.position.copy(this.targetCameraPos);
          this.controls.target.copy(this.targetControlsTarget);
          this.isTransitioningCamera = false;
        }
      }

      this.controls.update();

      // Rotate mechanical parts (impellers, augers)
      this.plantData.rotatingParts.forEach(({ object, axis, speed }) => {
        object.rotation[axis] += speed * delta * this.flowSpeedMultiplier;
      });

      // Update particle flows
      this.particleFlows.update(delta, this.flowSpeedMultiplier);

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onWindowResize);
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    this.container.removeEventListener('pointerup', this.onPointerUp);

    this.controls.dispose();
    this.particleFlows.dispose();
    this.renderer.dispose();

    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
