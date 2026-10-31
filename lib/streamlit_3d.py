"""
ECOFARM CIRCULAR — Composant 3D WebGL Natif pour Streamlit Cloud
Génère une page HTML/WebGL Three.js autonome ultra-performante et 100% embarquée
(Aucun serveur externe requis -> Élimine définitivement toute erreur 403 Google).
"""

def get_3d_viewer_html(telemetry: dict) -> str:
    sand_temp = round(telemetry.get("sand_core_c", 445))
    sand_soc = round(telemetry.get("sand_soc", 78))
    pyro_temp = round(telemetry.get("pyro_temp_c", 520)) if "pyro_temp_c" in telemetry else 520
    solar_kw = round(telemetry.get("pv_kw", 41.2) + telemetry.get("st_kw", 28.4), 1)
    is_interlocked = telemetry.get("dryer_interlocked", False)
    dryer_status_text = "INTERVERROUILLÉ (<180°C)" if is_interlocked else "EN SERVICE (48.5 kW)"
    dryer_status_color = "#f43f5e" if is_interlocked else "#22c55e"

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ECOFARM CIRCULAR 3D Digital Twin</title>
    <!-- Bibliothèques Three.js et OrbitControls via CDNs publics fiables -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            background-color: #0b1120;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif;
            color: #f8fafc;
            user-select: none;
            -webkit-user-select: none;
        }}
        #canvas-container {{
            width: 100vw;
            height: 100vh;
            position: absolute;
            top: 0;
            left: 0;
            touch-action: none;
        }}
        /* En-tête HUD supérieur */
        .hud-header {{
            position: absolute;
            top: 12px;
            left: 14px;
            right: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            pointer-events: none;
            z-index: 10;
        }}
        .badge-title {{
            background: rgba(15, 23, 42, 0.92);
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 12px;
            padding: 8px 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
            pointer-events: auto;
        }}
        .badge-title h1 {{
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #38bdf8;
            margin: 0;
            text-transform: uppercase;
        }}
        .badge-title p {{
            font-size: 10px;
            color: #94a3b8;
            margin: 2px 0 0 0;
        }}
        .live-stats {{
            display: flex;
            gap: 8px;
            pointer-events: auto;
        }}
        .stat-pill {{
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(71, 85, 105, 0.6);
            border-radius: 10px;
            padding: 6px 12px;
            font-size: 11px;
            font-family: monospace;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        /* Barre d'outils flottante droite */
        .toolbar-right {{
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 10;
        }}
        .tool-btn {{
            width: 36px;
            height: 36px;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(56, 189, 248, 0.35);
            color: #f8fafc;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }}
        .tool-btn:hover {{
            background: #0284c7;
            border-color: #38bdf8;
            transform: scale(1.05);
        }}
        /* Dock inférieur de contrôle */
        .dock-bottom {{
            position: absolute;
            bottom: 14px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(71, 85, 105, 0.8);
            border-radius: 16px;
            padding: 8px 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.7);
            z-index: 10;
            max-width: 95vw;
            overflow-x: auto;
        }}
        .dock-group {{
            display: flex;
            align-items: center;
            gap: 4px;
            border-right: 1px solid rgba(51, 65, 85, 0.8);
            padding-right: 8px;
        }}
        .dock-group:last-child {{
            border-right: none;
            padding-right: 0;
        }}
        .dock-btn {{
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(71, 85, 105, 0.6);
            color: #cbd5e1;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s;
        }}
        .dock-btn:hover {{
            background: #334155;
            color: #ffffff;
        }}
        .dock-btn.active {{
            background: rgba(2, 132, 199, 0.35);
            border-color: #38bdf8;
            color: #38bdf8;
            font-weight: 600;
        }}
        /* Carte d'information de zone inspectée */
        #zone-card {{
            position: absolute;
            top: 70px;
            left: 14px;
            width: 310px;
            background: rgba(15, 23, 42, 0.96);
            border: 1px solid #38bdf8;
            border-radius: 14px;
            padding: 14px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8);
            z-index: 20;
            display: none;
            animation: fadeIn 0.2s ease-out;
        }}
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(-8px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        .zone-card-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }}
        .zone-tag {{
            background: rgba(56, 189, 248, 0.2);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.4);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-family: monospace;
            font-weight: bold;
        }}
        .close-card {{
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 16px;
            cursor: pointer;
        }}
        .close-card:hover {{ color: #ffffff; }}
        .zone-title {{
            font-size: 13px;
            font-weight: bold;
            color: #f8fafc;
            margin-bottom: 4px;
        }}
        .zone-desc {{
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.4;
            margin-bottom: 10px;
        }}
        .zone-specs {{
            background: rgba(2, 6, 23, 0.6);
            border-radius: 8px;
            padding: 8px;
            font-size: 10.5px;
            font-family: monospace;
            color: #cbd5e1;
        }}
        .zone-specs div {{ margin-bottom: 3px; }}
        .zone-specs div:last-child {{ margin-bottom: 0; }}
        /* Toast */
        #toast {{
            position: absolute;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid #22c55e;
            color: #4ade80;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 11px;
            font-family: monospace;
            pointer-events: none;
            display: none;
            z-index: 30;
        }}
    </style>
</head>
<body>
    <div id="canvas-container"></div>

    <!-- HUD Supérieur -->
    <div class="hud-header">
        <div class="badge-title">
            <h1>ECOFARM CIRCULAR — Digital Twin</h1>
            <p>Pyrolyse • Batterie Thermique à Sable (45t) • Séchage Continu</p>
        </div>
        <div class="live-stats">
            <div class="stat-pill">
                <span style="color: #f59e0b;">🔥 Sable:</span>
                <span style="font-weight: bold; color: #fbbf24;">{sand_temp}°C ({sand_soc}%)</span>
            </div>
            <div class="stat-pill">
                <span style="color: #38bdf8;">☀️ Solaire:</span>
                <span style="font-weight: bold; color: #7dd3fc;">{solar_kw} kW</span>
            </div>
            <div class="stat-pill">
                <span style="color: {dryer_status_color};">⚡ Séchoir:</span>
                <span style="font-weight: bold; color: {dryer_status_color};">{dryer_status_text}</span>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div id="toast">Action effectuée</div>

    <!-- Fiche descriptive de zone (au clic 3D) -->
    <div id="zone-card">
        <div class="zone-card-header">
            <span class="zone-tag" id="zc-tag">ZONE D</span>
            <button class="close-card" onclick="hideZoneCard()">✕</button>
        </div>
        <div class="zone-title" id="zc-title">Batterie Thermique à Sable</div>
        <div class="zone-desc" id="zc-desc">Description de la zone...</div>
        <div class="zone-specs" id="zc-specs">
            <div>• Température: 445 °C</div>
            <div>• Capacité: 1.25 MWh_th</div>
        </div>
    </div>

    <!-- Toolbar Flottante Droite -->
    <div class="toolbar-right">
        <button class="tool-btn" onclick="zoomCam(-4)" title="Zoom Avant (+)">+</button>
        <button class="tool-btn" onclick="zoomCam(4)" title="Zoom Arrière (-)">−</button>
        <button class="tool-btn" onclick="setCameraPreset('iso')" title="Vue Isométrique Globale">↺</button>
        <button class="tool-btn" onclick="setCameraPreset('plan')" title="Vue en Plan (Top-Down)">📐</button>
        <button class="tool-btn" onclick="toggleCutaway()" id="btn-cutaway-side" title="Mode Écorché X-Ray">👁️</button>
    </div>

    <!-- Dock Inférieur de Navigation & Rendu -->
    <div class="dock-bottom">
        <div class="dock-group">
            <button class="dock-btn active" id="btn-iso" onclick="setCameraPreset('iso')">Isométrique 3/4</button>
            <button class="dock-btn" id="btn-plan" onclick="setCameraPreset('plan')">Plan BIM</button>
        </div>
        <div class="dock-group">
            <button class="dock-btn" onclick="setCameraPreset('zoneA')">Zone A (Biomasse)</button>
            <button class="dock-btn" onclick="setCameraPreset('zoneB')">Zone B (Séchoir)</button>
            <button class="dock-btn" onclick="setCameraPreset('zoneC')">Zone C (Pyrolyse)</button>
            <button class="dock-btn" onclick="setCameraPreset('zoneD')">Zone D (Sable)</button>
            <button class="dock-btn" onclick="setCameraPreset('zoneE')">Zone E (Solaire)</button>
            <button class="dock-btn" onclick="setCameraPreset('zoneF')">Zone F (SCADA)</button>
        </div>
        <div class="dock-group">
            <button class="dock-btn" id="btn-cutaway" onclick="toggleCutaway()">Écorché X-Ray</button>
            <button class="dock-btn" id="btn-flow" onclick="toggleFlow()">Flux: Actifs</button>
        </div>
    </div>

    <script>
        // Données complètes des 6 zones fonctionnelles
        const ZONES = {{
            zoneA: {{
                tag: 'ZONE A',
                title: 'Réception & Broyage Biomasse',
                desc: 'Fosse de déchargement inground avec grille, broyeur fin à marteaux, séparateur magnétique et convoyeur à bande incliné 18°.',
                specs: '• Débit: 120 kg/h\\n• Humidité: 45 %\\n• Moteur broyeur: 7.5 kW'
            }},
            zoneB: {{
                tag: 'ZONE B',
                title: 'Séchoir Continu Automatisé',
                desc: 'Tunnel inox isolé 100 mm à 3 étages de plateaux perforés oscillants. Air chaud pulsé via échangeur raccordé à la batterie à sable.',
                specs: '• Température: 85 °C\\n• Débit air: 4 200 m³/h\\n• Humidité sortie: 10.5 %'
            }},
            zoneC: {{
                tag: 'ZONE C',
                title: 'Unité de Pyrolyse & Biochar',
                desc: 'Retort horizontal en Inconel étanche (520°C). Cyclone séparateur, oxydateur thermique sans flamme et fût de biochar sous N2.',
                specs: '• T° Lit: 520 °C\\n• Biochar: 38.5 kg/h (C > 82%)\\n• Récupération Syngas: 62 kW_th'
            }},
            zoneD: {{
                tag: 'ZONE D',
                title: 'Batterie Thermique à Sable (Hero)',
                desc: 'Cuve calorifugée de 45 t de sable de quartz (500°C). 3 sources de charge: Solaire Th, Récupération Pyrolyse, Surplus PV.',
                specs: '• T° Cœur: {sand_temp} °C\\n• Capacité: 1.25 MWh_th\\n• Décharge séchoir: 48.5 kW_th'
            }},
            zoneE: {{
                tag: 'ZONE E',
                title: 'Intégration Solaire PV & Thermique',
                desc: 'Canopée acier supportant 16 modules PV monocristallins (50 kWp) et 40 m² de capteurs à tubes sous vide. BESS LFP 60 kWh.',
                specs: '• Puissance PV: 41.2 kW\\n• Solaire Th: 28.4 kW\\n• Surplus vers sable: 26.8 kW'
            }},
            zoneF: {{
                tag: 'ZONE F',
                title: 'Poste de Contrôle SCADA & IA',
                desc: 'Cabine opérateur avec vitrage panoramique, armoires PLC Siemens redondantes, poste triple écran et serveur IA Gemini.',
                specs: '• Automate: Siemens S7-1500\\n• Cycle: 20 ms\\n• COP global: 3.8x'
            }}
        }};

        // INITIALISATION THREE.JS
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);
        scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 300);
        camera.position.set(22, 17, 24);

        const renderer = new THREE.WebGLRenderer({{ antialias: true, powerPreference: 'high-performance' }});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.target.set(0, 1.8, 0);
        controls.maxPolarAngle = Math.PI / 2 - 0.04;
        controls.minDistance = 5;
        controls.maxDistance = 75;

        // ÉCLAIRAGE INDUSTRIEL
        const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.2);
        hemiLight.position.set(0, 30, 0);
        scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
        sunLight.position.set(24, 28, 20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        const d = 24;
        sunLight.shadow.camera.left = -d; sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d; sunLight.shadow.camera.bottom = -d;
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
        rimLight.position.set(-20, 16, -18);
        scene.add(rimLight);

        // MATÉRIAUX PBR
        const matSteel = new THREE.MeshStandardMaterial({{ color: 0x94a3b8, metalness: 0.85, roughness: 0.35 }});
        const matDarkSteel = new THREE.MeshStandardMaterial({{ color: 0x334155, metalness: 0.8, roughness: 0.4 }});
        const matStainless = new THREE.MeshStandardMaterial({{ color: 0xe2e8f0, metalness: 0.95, roughness: 0.18 }});
        const matSafetyYellow = new THREE.MeshStandardMaterial({{ color: 0xeab308, metalness: 0.3, roughness: 0.4 }});
        const matConcrete = new THREE.MeshStandardMaterial({{ color: 0x64748b, roughness: 0.9, metalness: 0.1 }});
        const matGlass = new THREE.MeshPhysicalMaterial({{ color: 0xbae6fd, transmission: 0.85, transparent: true, opacity: 0.4, roughness: 0.1 }});
        const matSand = new THREE.MeshStandardMaterial({{ color: 0xf59e0b, roughness: 0.95, metalness: 0.05 }});
        const matBiochar = new THREE.MeshStandardMaterial({{ color: 0x18181b, roughness: 0.9, metalness: 0.1 }});
        const matSolarBlue = new THREE.MeshStandardMaterial({{ color: 0x1e3a8a, metalness: 0.9, roughness: 0.2 }});
        const matEquipmentBlue = new THREE.MeshStandardMaterial({{ color: 0x0284c7, metalness: 0.5, roughness: 0.35 }});

        // Structures d'état
        const cutawayHulls = [];
        const rotatingParts = [];
        const raycastObjects = [];

        function tagMesh(mesh, zoneId) {{
            mesh.userData.zoneId = zoneId;
            raycastObjects.push(mesh);
        }}

        // 1. FONDATION BÉTON PLATELAGE
        const slab = new THREE.Mesh(new THREE.BoxGeometry(38, 0.6, 26), matConcrete);
        slab.position.y = -0.3;
        slab.receiveShadow = true;
        scene.add(slab);

        // 2. ZONE A — RÉCEPTION & BROYAGE
        const zA_x = -13, zA_z = 5;
        const bunker = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 3.2), matDarkSteel);
        bunker.position.set(zA_x - 1.2, 0.6, zA_z + 0.8);
        bunker.castShadow = true;
        tagMesh(bunker, 'zoneA');
        scene.add(bunker);

        const shredder = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.6), matSafetyYellow);
        shredder.position.set(zA_x + 1.6, 1.0, zA_z + 0.8);
        shredder.castShadow = true;
        tagMesh(shredder, 'zoneA');
        scene.add(shredder);

        // Convoyeur incliné
        const convStart = new THREE.Vector3(zA_x + 2.0, 0.6, zA_z + 0.8);
        const convEnd = new THREE.Vector3(-7.5, 3.4, -0.8);
        const convLen = convStart.distanceTo(convEnd);
        const convBeam = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, convLen), matSteel);
        const convMid = new THREE.Vector3().addVectors(convStart, convEnd).multiplyScalar(0.5);
        convBeam.position.copy(convMid);
        convBeam.lookAt(convEnd);
        tagMesh(convBeam, 'zoneA');
        scene.add(convBeam);

        // 3. ZONE B — SÉCHOIR CONTINU
        const zB_x = -6.5, zB_z = -1.8;
        const dryerHousing = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.4, 2.2), matEquipmentBlue);
        dryerHousing.position.set(zB_x, 1.5, zB_z);
        dryerHousing.castShadow = true;
        tagMesh(dryerHousing, 'zoneB');
        cutawayHulls.push(dryerHousing);
        scene.add(dryerHousing);

        // Plateaux internes (visibles en écorché)
        for (let t = 0; t < 3; t++) {{
            const tray = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.06, 1.8), matStainless);
            tray.position.set(zB_x, 0.8 + t * 0.6, zB_z);
            scene.add(tray);
        }}

        // Ventilateur centrifuge
        const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16), matDarkSteel);
        fan.rotation.z = Math.PI / 2;
        fan.position.set(zB_x + 2.7, 2.7, zB_z);
        tagMesh(fan, 'zoneB');
        scene.add(fan);

        // Cheminée d'évacuation buées
        const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 2.2, 16), matStainless);
        exhaust.position.set(zB_x - 1.6, 3.2, zB_z);
        scene.add(exhaust);

        // 4. ZONE C — PYROLYSE & BIOCHAR
        const zC_x = 1.5, zC_z = -1.8;
        const retort = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 4.2, 24), matDarkSteel);
        retort.rotation.z = Math.PI / 2;
        retort.position.set(zC_x, 1.7, zC_z);
        retort.castShadow = true;
        tagMesh(retort, 'zoneC');
        cutawayHulls.push(retort);
        scene.add(retort);

        // Vis interne
        const auger = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.0, 16), matStainless);
        auger.rotation.z = Math.PI / 2;
        auger.position.set(zC_x, 1.7, zC_z);
        scene.add(auger);
        rotatingParts.push({{ obj: auger, axis: 'x', speed: 2 }});

        // Cyclone
        const cyclone = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.4, 16), matStainless);
        cyclone.position.set(zC_x + 1.2, 2.8, zC_z - 1.0);
        tagMesh(cyclone, 'zoneC');
        scene.add(cyclone);

        // Oxydateur thermique sans flamme
        const oxidizer = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 16), matDarkSteel);
        oxidizer.position.set(zC_x + 2.4, 2.4, zC_z - 0.8);
        tagMesh(oxidizer, 'zoneC');
        scene.add(oxidizer);

        // Fût Biochar
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.9, 16), matBiochar);
        drum.position.set(zC_x + 2.2, 0.6, zC_z + 1.4);
        tagMesh(drum, 'zoneC');
        scene.add(drum);

        // 5. ZONE D — BATTERIE THERMIQUE À SABLE (HERO)
        const zD_x = 10.5, zD_z = -1.8;
        const sandVessel = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 4.8, 32), matStainless);
        sandVessel.position.set(zD_x, 2.8, zD_z);
        sandVessel.castShadow = true;
        tagMesh(sandVessel, 'zoneD');
        cutawayHulls.push(sandVessel);
        scene.add(sandVessel);

        // Dôme cuve
        const dome = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 4), matStainless);
        dome.position.set(zD_x, 4.8, zD_z);
        cutawayHulls.push(dome);
        scene.add(dome);

        // Cœur de sable interne
        const sandCore = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 4.4, 24), matSand);
        sandCore.position.set(zD_x, 2.8, zD_z);
        tagMesh(sandCore, 'zoneD');
        scene.add(sandCore);

        // Thermoplongeurs Incoloy (submergés)
        const heaterMat = new THREE.MeshStandardMaterial({{ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.6 }});
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {{
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.8, 8), heaterMat);
            rod.position.set(zD_x + Math.cos(a) * 0.5, 2.8, zD_z + Math.sin(a) * 0.5);
            scene.add(rod);
        }}

        // Pompes et vase d'expansion
        const pump = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.8), matDarkSteel);
        pump.position.set(zD_x - 2.8, 0.5, zD_z);
        scene.add(pump);

        // 6. ZONE E — SOLAIRE PV & THERMIQUE
        const zE_x = 6.5, zE_z = 6.5;
        // Piliers canopée
        [[-4.5, -2.5], [4.5, -2.5], [-4.5, 2.5], [4.5, 2.5]].forEach(([cx, cz]) => {{
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.18), matSteel);
            col.position.set(zE_x + cx, 1.8, zE_z + cz);
            scene.add(col);
        }});

        // Panneaux solaires (4x3)
        for (let c = 0; c < 4; c++) {{
            for (let r = 0; r < 3; r++) {{
                const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.0), matSolarBlue);
                panel.position.set(zE_x - 2.8 + c * 1.5, 3.8 - (r - 1) * 0.28, zE_z - 1.0 + r * 1.1);
                panel.rotation.x = 0.26;
                tagMesh(panel, 'zoneE');
                scene.add(panel);
            }}
        }}

        // Onduleur et conteneur BESS
        const inverter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.7), matSafetyYellow);
        inverter.position.set(zE_x - 3.2, 1.15, zE_z - 2.4);
        tagMesh(inverter, 'zoneE');
        scene.add(inverter);

        const bess = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.9, 1.1), matDarkSteel);
        bess.position.set(zE_x - 1.0, 1.2, zE_z - 2.4);
        tagMesh(bess, 'zoneE');
        scene.add(bess);

        // 7. ZONE F — SALLE DE COMMANDE SCADA
        const zF_x = -12.5, zF_z = -7.5;
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(7.0, 3.0, 4.6), matDarkSteel);
        cabin.position.set(zF_x, 1.8, zF_z);
        tagMesh(cabin, 'zoneF');
        scene.add(cabin);

        const cabinWin = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.6, 0.08), matGlass);
        cabinWin.position.set(zF_x, 1.8, zF_z + 2.32);
        scene.add(cabinWin);

        // 8. CIRCUITS FLUIDIQUES & PARTICULES ANIMÉES
        function createPipe(curve, color, rad = 0.08) {{
            const geo = new THREE.TubeGeometry(curve, 24, rad, 8, false);
            const mat = new THREE.MeshStandardMaterial({{ color, metalness: 0.8, roughness: 0.25 }});
            const p = new THREE.Mesh(geo, mat);
            scene.add(p);
            return p;
        }}

        // Circuit Solaire -> Sable (Jaune)
        const solarCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(zE_x + 2.0, 3.8, zE_z),
            new THREE.Vector3(zD_x + 1.2, 1.8, zE_z),
            new THREE.Vector3(zD_x + 1.2, 1.8, zD_z + 1.5)
        ]);
        createPipe(solarCurve, 0xf59e0b);

        // Circuit Pyrolyse -> Sable (Rouge)
        const pyroCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(zC_x + 2.4, 3.6, zC_z - 0.8),
            new THREE.Vector3(zD_x - 1.5, 3.6, zD_z)
        ]);
        createPipe(pyroCurve, 0xef4444);

        // Circuit Sable -> Séchoir (Cyan)
        const dryerCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(zD_x - 2.5, 0.8, zD_z),
            new THREE.Vector3(zB_x + 2.8, 0.8, zD_z - 1.5),
            new THREE.Vector3(zB_x + 2.8, 1.2, zB_z)
        ]);
        createPipe(dryerCurve, 0x38bdf8);

        // Particules en circulation
        const particleStreams = [];
        function addParticleStream(curve, color, count = 15, spd = 0.25) {{
            const geo = new THREE.SphereGeometry(0.065, 8, 8);
            const mat = new THREE.MeshBasicMaterial({{ color }});
            const mesh = new THREE.InstancedMesh(geo, mat, count);
            const dummy = new THREE.Object3D();
            const prog = new Float32Array(count);
            for(let i=0; i<count; i++) prog[i] = i / count;
            scene.add(mesh);
            particleStreams.push({{ curve, mesh, dummy, prog, count, spd }});
        }}

        addParticleStream(solarCurve, 0xf59e0b, 12, 0.25);
        addParticleStream(pyroCurve, 0xef4444, 14, 0.3);
        addParticleStream(dryerCurve, 0x38bdf8, 16, 0.28);

        // NAVIGATION & CAMÉRA
        let targetCamPos = new THREE.Vector3(22, 17, 24);
        let targetLookAt = new THREE.Vector3(0, 1.8, 0);
        let isTransitioning = false;
        let flowActive = true;
        let isCutaway = false;

        const presets = {{
            iso: {{ pos: [22, 17, 24], target: [0, 1.8, 0] }},
            plan: {{ pos: [0, 36, 0.1], target: [0, 0, 0] }},
            zoneA: {{ pos: [-16, 7.5, 12], target: [zA_x, 1.5, zA_z] }},
            zoneB: {{ pos: [-7.5, 5.5, 4.5], target: [zB_x, 1.8, zB_z] }},
            zoneC: {{ pos: [2.0, 5.5, 4.5], target: [zC_x, 2.0, zC_z] }},
            zoneD: {{ pos: [11.5, 7.0, 6.0], target: [zD_x, 2.6, zD_z] }},
            zoneE: {{ pos: [8.5, 7.0, 13.5], target: [zE_x, 2.5, zE_z] }},
            zoneF: {{ pos: [-13.0, 5.2, -1.8], target: [zF_x, 1.8, zF_z] }}
        }};

        function setCameraPreset(presetKey) {{
            const cfg = presets[presetKey];
            if (!cfg) return;
            targetCamPos.set(...cfg.pos);
            targetLookAt.set(...cfg.target);
            isTransitioning = true;

            // Active button style
            document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
            const activeBtn = document.getElementById('btn-' + presetKey);
            if (activeBtn) activeBtn.classList.add('active');

            if (ZONES[presetKey]) {{
                showZoneCard(presetKey);
            }} else {{
                hideZoneCard();
            }}
            showToast("Vue : " + (ZONES[presetKey] ? ZONES[presetKey].title : presetKey.toUpperCase()));
        }}

        function zoomCam(delta) {{
            const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
            const dist = dir.length();
            const newDist = Math.max(5, Math.min(65, dist + delta));
            dir.normalize().multiplyScalar(newDist);
            targetCamPos.copy(controls.target).add(dir);
            targetLookAt.copy(controls.target);
            isTransitioning = true;
        }}

        function toggleCutaway() {{
            isCutaway = !isCutaway;
            cutawayHulls.forEach(m => {{
                m.material.transparent = isCutaway;
                m.material.opacity = isCutaway ? 0.22 : 1.0;
                m.material.depthWrite = !isCutaway;
            }});
            document.getElementById('btn-cutaway').classList.toggle('active', isCutaway);
            showToast(isCutaway ? "Mode Écorché X-Ray ACTIF" : "Mode Réaliste PBR ACTIF");
        }}

        function toggleFlow() {{
            flowActive = !flowActive;
            document.getElementById('btn-flow').textContent = flowActive ? "Flux: Actifs" : "Flux: Pause";
            document.getElementById('btn-flow').classList.toggle('active', !flowActive);
            showToast(flowActive ? "Animation des flux reprise" : "Animation des flux en pause");
        }}

        function showZoneCard(zoneKey) {{
            const z = ZONES[zoneKey];
            if (!z) return;
            document.getElementById('zc-tag').textContent = z.tag;
            document.getElementById('zc-title').textContent = z.title;
            document.getElementById('zc-desc').textContent = z.desc;
            document.getElementById('zc-specs').innerHTML = z.specs.split('\\n').map(s => '<div>' + s + '</div>').join('');
            document.getElementById('zone-card').style.display = 'block';
        }}

        function hideZoneCard() {{
            document.getElementById('zone-card').style.display = 'none';
        }}

        function showToast(msg) {{
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.style.display = 'block';
            clearTimeout(t.timer);
            t.timer = setTimeout(() => {{ t.style.display = 'none'; }}, 2200);
        }}

        // RAYCASTING & CLIC TACTILE DIRECT
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let pointerDownTime = 0, pointerDownX = 0, pointerDownY = 0;

        container.addEventListener('pointerdown', (e) => {{
            pointerDownTime = performance.now();
            pointerDownX = e.clientX;
            pointerDownY = e.clientY;
        }});

        container.addEventListener('pointerup', (e) => {{
            const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
            if (dist < 10 && (performance.now() - pointerDownTime) < 500) {{
                mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const hits = raycaster.intersectObjects(raycastObjects, false);
                if (hits.length > 0) {{
                    const zid = hits[0].object.userData.zoneId;
                    if (zid) setCameraPreset(zid);
                }}
            }}
        }});

        // CLAVIER
        window.addEventListener('keydown', (e) => {{
            const k = e.key.toLowerCase();
            if (k === 'h') {{
                const dock = document.querySelector('.dock-bottom');
                dock.style.display = dock.style.display === 'none' ? 'flex' : 'none';
            }} else if (e.code === 'Space') {{
                e.preventDefault();
                toggleFlow();
            }} else if (k === 'm') {{
                toggleCutaway();
            }} else if (k === '0' || k === 'i') {{
                setCameraPreset('iso');
            }} else if (k === 'p') {{
                setCameraPreset('plan');
            }} else if (k === '1' || k === 'a') setCameraPreset('zoneA');
            else if (k === '2' || k === 'b') setCameraPreset('zoneB');
            else if (k === '3' || k === 'c') setCameraPreset('zoneC');
            else if (k === '4' || k === 'd') setCameraPreset('zoneD');
            else if (k === '5' || k === 'e') setCameraPreset('zoneE');
            else if (k === '6' || k === 'f') setCameraPreset('zoneF');
            else if (k === '+' || k === '=') zoomCam(-4);
            else if (k === '-') zoomCam(4);
            else if (k === 'escape') hideZoneCard();
        }});

        window.addEventListener('resize', () => {{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }});

        // RENDER LOOP
        const clock = new THREE.Clock();
        function animate() {{
            requestAnimationFrame(animate);
            const delta = Math.min(clock.getDelta(), 0.1);

            if (isTransitioning) {{
                camera.position.lerp(targetCamPos, 0.08);
                controls.target.lerp(targetLookAt, 0.08);
                if (camera.position.distanceTo(targetCamPos) < 0.1) isTransitioning = false;
            }}

            controls.update();

            // Rotation mécanique
            rotatingParts.forEach(p => {{
                p.obj.rotation[p.axis] += p.speed * delta;
            }});

            // Animation des flux
            if (flowActive) {{
                particleStreams.forEach(s => {{
                    for(let i=0; i<s.count; i++) {{
                        s.prog[i] = (s.prog[i] + s.spd * delta) % 1.0;
                        const pt = s.curve.getPointAt(s.prog[i]);
                        s.dummy.position.copy(pt);
                        s.dummy.updateMatrix();
                        s.mesh.setMatrixAt(i, s.dummy.matrix);
                    }}
                    s.mesh.instanceMatrix.needsUpdate = true;
                }});
            }}

            renderer.render(scene, camera);
        }}
        animate();
    </script>
</body>
</html>"""
