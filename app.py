"""
ECOFARM CIRCULAR — Jumeau Numérique & Visualisation Industrielle 3D
Point d'entrée principal pour le déploiement sur Streamlit Cloud (Main file path: app.py).
"""

import os
import json
import urllib.request
import urllib.error
import streamlit as st
import streamlit.components.v1 as components

# Import du moteur de rendu 3D WebGL natif (lib/streamlit_3d.py)
try:
    from lib.streamlit_3d import get_3d_viewer_html
except ImportError:
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent))
    from lib.streamlit_3d import get_3d_viewer_html

# Configuration de la page Streamlit
st.set_page_config(
    page_title="ECOFARM CIRCULAR — Jumeau Numérique",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Récupération sécurisée des clés (st.secrets avec fallback os.environ)
def get_secret(key_name: str, default: str = "") -> str:
    try:
        if hasattr(st, "secrets") and key_name in st.secrets:
            return str(st.secrets[key_name])
    except Exception:
        pass
    return os.environ.get(key_name, default)

GEMINI_API_KEY = get_secret("GEMINI_API_KEY")
GITHUB_TOKEN = get_secret("GITHUB_TOKEN")
APP_URL = get_secret("APP_URL", "")

# Données statiques d'ingénierie pour les 6 zones fonctionnelles
ZONES_DATA = {
    "zoneA": {
        "tag": "ZONE A",
        "name": "Réception & Préparation Biomasse",
        "subtitle": "Trémie de réception, broyeur fin à marteaux et convoyeur incliné",
        "description": "Fosse de déchargement inground pour résidus agricoles hétérogènes (grignons d'olive, paille, bois d'élagage). Inclut une rampe basculante hydraulique (15 t), un broyeur bi-rotor avec séparateur magnétique néodyme et un convoyeur à bande auget inclinée à 18°.",
        "equipment": [
            "Fosse inground avec caillebotis de sécurité",
            "Rampe basculante hydraulique 15 tonnes",
            "Broyeur bi-rotor à haut couple & broyeur fin à marteaux (7.5 kW)",
            "Séparateur magnétique over-belt en néodyme",
            "Convoyeur à bande caoutchouc 3 plis (incliné 18°, 30 m/min)",
            "Trémie doseuse de biomasse préparée avec pesons"
        ],
        "params": [
            {"label": "Capacité nominale", "val": "120 kg/h"},
            {"label": "Humidité entrante", "val": "45 %"},
            {"label": "Granulométrie cible", "val": "8 - 15 mm"},
            {"label": "Puissance broyeur", "val": "7.5 kW"}
        ]
    },
    "zoneB": {
        "tag": "ZONE B",
        "name": "Séchoir Continu Automatisé",
        "subtitle": "Chambre de séchage à convection douce et récupération thermique",
        "description": "Tunnel continu calorifugé en acier inoxydable (100 mm laine minérale). Trois étages de plateaux perforés agités chauffés par l'air chaud généré via l'échangeur alimenté par la Batterie à Sable. Le fonctionnement est automatiquement asservi au niveau de charge thermique du sable.",
        "equipment": [
            "Enceinte inox isolée 100 mm laine minérale",
            "3 étages de plateaux perforés oscillants",
            "Échangeur fluide-air à tubes ailetés cuivre-aluminium",
            "Ventilateur centrifuge d'air chaud (4 500 m³/h)",
            "Cheminée d'évacuation des buées avec dévésiculeur",
            "Transmetteurs capacitifs d'humidité et sondes PT100"
        ],
        "params": [
            {"label": "Température séchage", "val": "85 °C"},
            {"label": "Humidité sortie", "val": "10.5 %"},
            {"label": "Débit d'air", "val": "4 200 m³/h"},
            {"label": "Puissance thermique requise", "val": "48.5 kW_th"}
        ]
    },
    "zoneC": {
        "tag": "ZONE C",
        "name": "Unité de Pyrolyse & Biochar",
        "subtitle": "Réacteur thermochimique étanche à 520°C et combustion des gaz",
        "description": "Retort cylindrique horizontal en Inconel avec vis sans fin interne. Les gaz de pyrolyse (syngas) sont dépoussiérés par un cyclone puis brûlés dans un oxydateur thermique sans flamme. La chaleur des fumées est intégralement récupérée vers la batterie à sable (zéro émission de gaz non traité).",
        "equipment": [
            "Réacteur horizontal en Inconel avec vis ruban",
            "Colliers chauffants électriques céramiques pour préchauffage",
            "Cyclone séparateur de poussières à haute efficacité",
            "Oxydateur thermique / Chambre de combustion contrôlée",
            "Échangeur de récupération des fumées vers le sable",
            "Vis de refroidissement et fût hermétique sous azote (N₂)"
        ],
        "params": [
            {"label": "Température du lit", "val": "520 °C"},
            {"label": "Pression réacteur", "val": "+15 mbar"},
            {"label": "Chaleur syngas récupérée", "val": "62.0 kW_th"},
            {"label": "Rendement biochar", "val": "38.5 kg/h"}
        ]
    },
    "zoneD": {
        "tag": "ZONE D",
        "name": "Batterie Thermique Hybride à Sable",
        "subtitle": "Stockage thermique solide haute température (1.25 MWh_th)",
        "description": "Cuve verticale cylindrique isolée contenant 45 tonnes de sable de quartz réfractaire pouvant atteindre 500°C. Chargée par 3 sources : collecteurs solaires thermiques, récupération syngas et surplus PV par thermoplongeurs. Décharge contrôlée vers le séchoir.",
        "equipment": [
            "Cuve acier calorifugée (Ø 3.8m × H 4.8m, 45t sable quartz)",
            "Thermoplongeurs électriques Incoloy 800 (75 kW total pour surplus PV)",
            "Serpentins hélicoïdaux en acier inox 316L",
            "Arbre vertical de 12 thermocouples stratifiés",
            "Skid de double pompes de circulation d'huile thermique",
            "Vase d'expansion avec soupape de sécurité"
        ],
        "params": [
            {"label": "Température cœur", "val": "445 °C"},
            {"label": "État de charge (SOC)", "val": "78 %"},
            {"label": "Énergie stockée", "val": "1.25 MWh_th"},
            {"label": "Puissance déchargée", "val": "48.5 kW_th"}
        ]
    },
    "zoneE": {
        "tag": "ZONE E",
        "name": "Intégration Énergies Renouvelables",
        "subtitle": "Panneaux photovoltaïques, solaire thermique et délestage dynamique",
        "description": "Canopée solaire intégrant 16 panneaux photovoltaïques bifaciaux monocristallins (50 kWp), un champ de capteurs solaires à tubes sous vide (40 m²), une armoire électrique IP66 et un stockage batterie LFP de 60 kWh. Le surplus PV est directement dérouté vers les thermoplongeurs du sable.",
        "equipment": [
            "Champ photovoltaïque monocristallin bifacial (50 kWp)",
            "Collecteurs solaires à tubes sous vide (40 m²)",
            "Onduleur solaire triphasé 60 kVA (IP66)",
            "Batterie de stockage LFP 60 kWh pour micro-réseau",
            "Régulateur de puissance à thyristors pour thermoplongeurs",
            "Station météo (pyranomètre et thermomètre)"
        ],
        "params": [
            {"label": "Irradiation solaire", "val": "820 W/m²"},
            {"label": "Puissance PV produite", "val": "41.2 kW_e"},
            {"label": "Production solaire thermique", "val": "28.4 kW_th"},
            {"label": "Surplus PV vers le sable", "val": "26.8 kW_e"}
        ]
    },
    "zoneF": {
        "tag": "ZONE F",
        "name": "Automatisation & Contrôle IA",
        "subtitle": "Automates programmables (PLC), synoptique SCADA et agent IA",
        "description": "Cabine de contrôle climatisée abritant les armoires électriques PLC redondantes, le poste opérateur triple écran HMI avec synoptique temps réel, et la passerelle d'optimisation IA alimentée par Google Gemini.",
        "equipment": [
            "Armoires électriques Rittal IP55 avec filtrage",
            "Automates programmables redondants (PLC Siemens S7-1500)",
            "Poste opérateur triple écran avec supervision SCADA",
            "Passerelle Edge de calcul IA pour le dispatching",
            "Colonne lumineuse de signalisation industrielle 3 couleurs"
        ],
        "params": [
            {"label": "Nœuds IoT actifs", "val": "48 capteurs"},
            {"label": "Cycle automate", "val": "20 ms"},
            {"label": "Indice d'optimisation IA", "val": "94.6 %"},
            {"label": "COP thermique global", "val": "3.8x"}
        ]
    }
}

# Modèle thermodynamique de calcul
def compute_telemetry(solar_w, feed_kgh, moisture_pct, sand_soc_pct, pyro_temp_c):
    # Production renouvelable
    pv_area = 240
    pv_eff = 0.20
    pv_kw = max(0.0, (solar_w * pv_area * pv_eff) / 1000.0)
    
    st_area = 40
    st_eff = 0.68
    st_kw = max(0.0, (solar_w * st_area * st_eff) / 1000.0)
    
    base_elec_kw = 9.5 + (feed_kgh / 200.0) * 4.5
    pv_surplus_kw = max(0.0, pv_kw - base_elec_kw)
    
    # Pyrolyse & Biochar
    dried_feed = feed_kgh * ((100.0 - moisture_pct) / (100.0 - 11.0))
    biochar_ratio = max(0.24, 0.42 - (pyro_temp_c - 400.0) * 0.00065)
    biochar_kgh = max(5.0, dried_feed * biochar_ratio)
    
    syngas_ratio = 0.35 + (pyro_temp_c - 400.0) * 0.0005
    syngas_kgh = dried_feed * syngas_ratio
    syngas_heat_kw = max(10.0, (syngas_kgh * 14.5 * 1000.0 * 0.88) / 3600.0)
    
    # Batterie à sable
    sand_soc = min(100.0, max(5.0, float(sand_soc_pct)))
    sand_core_c = 100.0 + (sand_soc / 100.0) * (520.0 - 100.0)
    stored_mwh = (sand_soc / 100.0) * 1.5
    
    # Interverrouillage de sécurité automatique (Interlock)
    dryer_interlocked = sand_soc < 35.0 or sand_core_c < 180.0
    
    # Séchoir
    water_in = (feed_kgh * moisture_pct) / 100.0
    dry_solid = feed_kgh * (1.0 - moisture_pct / 100.0)
    target_moisture = 11.0
    water_out_allowed = dry_solid * (target_moisture / (100.0 - target_moisture))
    water_evap = max(0.0, water_in - water_out_allowed)
    dryer_heat_kw = 0.0 if dryer_interlocked else (water_evap * 2660.0) / 3600.0
    
    co2_seq_day = biochar_kgh * 0.80 * 3.67 * 24.0
    cop = max(1.5, 3.8 if not dryer_interlocked else 1.8)
    
    return {
        "pv_kw": pv_kw,
        "st_kw": st_kw,
        "pv_surplus_kw": pv_surplus_kw,
        "biochar_kgh": biochar_kgh,
        "syngas_heat_kw": syngas_heat_kw,
        "sand_core_c": sand_core_c,
        "sand_soc": sand_soc,
        "stored_mwh": stored_mwh,
        "dryer_heat_kw": dryer_heat_kw,
        "dryer_interlocked": dryer_interlocked,
        "co2_seq_day": co2_seq_day,
        "cop": cop
    }

# ----------------- INTERFACE STREAMLIT -----------------

# Titre & En-tête
st.markdown("""
<div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 22px 28px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px;">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <h1 style="color: #f8fafc; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">ECOFARM CIRCULAR</h1>
                <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-family: monospace; font-weight: bold;">PILOTE INDUSTRIEL 3D</span>
            </div>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">
                Valorisation thermochimique de la biomasse • Batterie thermique à sable (1.2 MWh) • Séchage continu automatisé
            </p>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Barre latérale : Paramètres de simulation
st.sidebar.markdown("### ⚙️ Simulation Thermodynamique")
solar_input = st.sidebar.slider("☀️ Irradiation Solaire (W/m²)", 0, 1000, 820, 25)
biomass_input = st.sidebar.slider("🪵 Débit Biomasse (kg/h)", 20, 200, 120, 10)
moisture_input = st.sidebar.slider("💧 Humidité Entrante (%)", 20, 65, 45, 5)
sand_soc_input = st.sidebar.slider("🔋 Charge Batterie Sable SOC (%)", 10, 100, 78, 5)
pyro_temp_input = st.sidebar.slider("🔥 Température Pyrolyse (°C)", 400, 650, 520, 10)

telemetry = compute_telemetry(solar_input, biomass_input, moisture_input, sand_soc_input, pyro_temp_input)

# Bannière d'interverrouillage de sécurité (Interlock)
if telemetry["dryer_interlocked"]:
    st.error(f"""
    🚨 **INTERVERROUILLAGE SÉCHOIR ENGAGÉ (INHIBITED) :**  
    Le séchoir est automatiquement suspendu. L'énergie thermique stockée dans la Batterie à Sable ({telemetry['sand_core_c']:.0f}°C / {telemetry['sand_soc']:.0f}% SOC) 
    est inférieure au seuil minimal de sécurité (180°C / 35% SOC).
    """)
else:
    st.success(f"""
    ✅ **SÉCHOIR EN FONCTIONNEMENT NORMAL :**  
    Batterie à Sable opérationnelle ({telemetry['sand_core_c']:.0f}°C). Débit thermique délivré à l'échangeur : **{telemetry['dryer_heat_kw']:.1f} kW_th**.
    """)

# Métriques clés (KPIs)
col1, col2, col3, col4, col5 = st.columns(5)
with col1:
    st.metric("🔥 Cœur de Sable", f"{telemetry['sand_core_c']:.0f} °C", f"{telemetry['stored_mwh']:.2f} MWh")
with col2:
    st.metric("☀️ Solaire (PV + Th)", f"{telemetry['pv_kw'] + telemetry['st_kw']:.1f} kW", f"Surplus: {telemetry['pv_surplus_kw']:.1f} kW")
with col3:
    st.metric("♻️ Récup. Syngas", f"{telemetry['syngas_heat_kw']:.1f} kW_th", "Oxydateur étanche")
with col4:
    st.metric("🌱 Biochar C-Fixe", f"{telemetry['biochar_kgh']:.1f} kg/h", f"{telemetry['co2_seq_day']:.0f} kg CO₂/j")
with col5:
    st.metric("⚡ COP Thermique", f"{telemetry['cop']:.1f}x", "Efficacité globale")

# Onglets principaux
tab_viz, tab_zones, tab_ai, tab_github = st.tabs([
    "🖥️ Visualisation 3D Interactive",
    "📋 Spécifications des 6 Zones",
    "🤖 Optimisation Énergétique IA",
    "🐙 Synchronisation GitHub"
])

# ONGLET 1 : Visualisation 3D
with tab_viz:
    st.markdown("#### Jumeau Numérique 3D — Vue Interactive en Temps Réel")
    st.caption("Inspectez l'ensemble de l'installation industrielle : 6 zones, batterie à sable, flux thermiques et de matière animés.")
    
    # Rendu 3D WebGL Three.js 100% natif et autonome (aucun serveur externe, élimine l'erreur 403 Google)
    if APP_URL and APP_URL.startswith("http"):
        viewer_mode = st.radio(
            "Mode d'affichage 3D :",
            ["🌟 Moteur 3D WebGL Intégré (Recommandé - Direct & Sécurisé)", "🌐 Serveur Web Externe (Iframe)"],
            horizontal=True,
            label_visibility="collapsed"
        )
        if "Intégré" in viewer_mode:
            html_content = get_3d_viewer_html(telemetry)
            components.html(html_content, height=680, scrolling=False)
        else:
            components.iframe(APP_URL, height=680, scrolling=False)
    else:
        # Affichage natif direct
        html_content = get_3d_viewer_html(telemetry)
        components.html(html_content, height=680, scrolling=False)
    
    st.info("💡 **Contrôles 3D :** Clic gauche pour orbiter • Molette pour zoomer • Clic droit pour déplacer. Utilisez les boutons sous la scène pour changer d'angle (Isométrique, Pyrolyse, Séchoir, Batterie Sable) ou activer le mode Écorché (X-Ray).")

# ONGLET 2 : Zones P&ID
with tab_zones:
    st.markdown("#### Fiches Techniques & Spécifications Industrielles des 6 Zones")
    selected_zone = st.selectbox(
        "Sélectionnez une zone à inspecter :",
        options=list(ZONES_DATA.keys()),
        format_func=lambda z: f"{ZONES_DATA[z]['tag']} — {ZONES_DATA[z]['name']}"
    )
    
    zone_info = ZONES_DATA[selected_zone]
    st.markdown(f"### {zone_info['tag']} : {zone_info['name']}")
    st.markdown(f"*{zone_info['subtitle']}*")
    st.write(zone_info['description'])
    
    col_eq, col_params = st.columns(2)
    with col_eq:
        st.markdown("**Équipements Principaux :**")
        for eq in zone_info["equipment"]:
            st.markdown(f"- {eq}")
    with col_params:
        st.markdown("**Paramètres Opérationnels :**")
        for p in zone_info["params"]:
            st.markdown(f"**{p['label']} :** `{p['val']}`")

# ONGLET 3 : IA Gemini
with tab_ai:
    st.markdown("#### Assistant IA d'Ingénierie & d'Optimisation des Enthalpies (Gemini)")
    st.write("Analyse en temps réel de la balance thermodynamique et recommandations de pilotage pour l'automate (PLC).")
    
    if not GEMINI_API_KEY:
        st.warning("⚠️ Clé `GEMINI_API_KEY` non configurée dans `st.secrets` ou variables d'environnement. Un rapport d'ingénierie expert autonome sera généré.")
    
    user_query = st.text_input("Requête d'optimisation (optionnel) :", placeholder="Ex: Comment optimiser le séchage tout en maximisant le rendement en biochar ?")
    
    if st.button("🚀 Lancer l'Analyse Thermodynamique IA", use_container_width=True):
        with st.spinner("Calcul du modèle thermodynamique et génération des consignes de délestage..."):
            dryer_state_label = (
                "INTERVERROUILLÉ (Arrêté)"
                if telemetry['dryer_interlocked']
                else f"EN SERVICE (Demande : {telemetry['dryer_heat_kw']:.1f} kW)"
            )

            telemetry_summary = f"""
            Télémétrie Pilote :
            - Irradiation Solaire : {solar_input} W/m² (PV : {telemetry['pv_kw']:.1f} kW, Surplus : {telemetry['pv_surplus_kw']:.1f} kW, Solaire Th : {telemetry['st_kw']:.1f} kW)
            - Pyrolyse : {pyro_temp_input}°C (Récupération Syngas : {telemetry['syngas_heat_kw']:.1f} kW)
            - Batterie à Sable : {telemetry['sand_core_c']:.0f}°C (Charge : {telemetry['sand_soc']:.0f}%, Énergie : {telemetry['stored_mwh']:.2f} MWh)
            - Séchoir Biomasse : {dryer_state_label}
            - Biochar produit : {telemetry['biochar_kgh']:.1f} kg/h (Séquestration : {telemetry['co2_seq_day']:.0f} kg CO2/j)
            """

            # Appel API Gemini
            analysis_text = None
            if GEMINI_API_KEY:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
                    payload = {
                        "contents": [{
                            "parts": [{
                                "text": f"Tu es l'ingénieur en chef du pilote ECOFARM CIRCULAR. Rédige un rapport technique concis avec 3 recommandations d'automatisation prioritaires en te basant sur ces données :\n{telemetry_summary}\nQuestion opérateur : {user_query or 'Optimisation globale'}"
                            }]
                        }]
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=12) as resp:
                        res_data = json.loads(resp.read().decode())
                        analysis_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                except Exception as e:
                    pass

            if not analysis_text:
                # Rapport expert autonome
                status_msg = "INTERVERROUILLAGE ACTIF : Réchauffer le sable avant redémarrage" if telemetry['dryer_interlocked'] else "RÉGIME NOMINAL OPTIMAL"
                dryer_directive = (
                    "Inhiber la vis d'extraction du séchoir jusqu'à ce que le sable atteigne 180°C."
                    if telemetry['dryer_interlocked']
                    else "Maintenir le débit d'air chaud à 4 200 m³/h pour stabiliser l'humidité de sortie à 10.5%."
                )
                analysis_text = f"""
                ### 📊 Diagnostic Énergétique ECOFARM CIRCULAR ({status_msg})

                **1. Bilan d'Enthalpie Hybride :**
                - Flux thermiques entrants cumulés : **{(telemetry['st_kw'] + telemetry['syngas_heat_kw'] + telemetry['pv_surplus_kw']):.1f} kW_th**
                - Décharge vers le séchoir : **{telemetry['dryer_heat_kw']:.1f} kW_th**
                - La stratification du massif de sable de quartz garantit un tampon d'inertie suffisant pour lisser les intermittences solaires.

                **2. Consignes Automatisées pour l'Automate (PLC) :**
                1. {dryer_directive}
                2. Dérouter en continu la totalité du surplus photovoltaïque ({telemetry['pv_surplus_kw']:.1f} kW) vers les thermoplongeurs Incoloy de la batterie à sable.
                3. Conserver une température de pyrolyse à {pyro_temp_input}°C pour garantir une pureté en carbone fixe > 82% propice à la valorisation biofertilisante.
                """

            st.markdown(analysis_text)

# ONGLET 4 : GitHub Sync
with tab_github:
    st.markdown("#### Synchronisation Sécurisée avec GitHub")
    st.caption("Gestion du déploiement continu et intégration automatique sans saisie bloquante.")
    
    if GITHUB_TOKEN:
        st.success("✅ **Token GitHub configuré** dans les secrets (`st.secrets['GITHUB_TOKEN']`).")
    else:
        st.info("ℹ️ Aucun Token GitHub configuré dans `st.secrets`. Le script `scripts/github_sync.py` peut être exécuté en ligne de commande locale ou via GitHub Actions.")
    
    st.code("""
# Déploiement direct avec le script Python :
python scripts/github_sync.py --repo ecofarm-circular

# Ou via npm :
npm run github:push
    """, language="bash")
    
    st.markdown("""
    **Configuration dans Streamlit Cloud :**
    - **Repository :** Votre dépôt GitHub (ex: `votre-nom/ecofarm-circular`)
    - **Branch :** `main`
    - **Main file path :** `app.py`
    - **Python version :** `3.10` ou `3.11`
    """)
