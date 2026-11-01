"""
ECOFARM CIRCULAR — 3D Industrial Engineering Digital Twin
Main entry point for Streamlit Cloud deployment.
"""

import os
import json
import sys
import importlib.util
import urllib.request
import urllib.error
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


# --------------------------------------------------
# STREAMLIT CONFIGURATION
# --------------------------------------------------

st.set_page_config(
    page_title="ECOFARM CIRCULAR — 3D Digital Twin",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="expanded"
)


# --------------------------------------------------
# LOAD THE THREE.JS 3D VIEWER
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
VIEWER_PATH = BASE_DIR / "lib" / "streamlit_3d.py"

if not VIEWER_PATH.is_file():
    st.error("❌ 3D viewer module not found.")
    st.code(
        "Expected file:\n"
        "lib/streamlit_3d.py\n\n"
        f"Resolved path:\n{VIEWER_PATH}"
    )
    st.stop()

try:
    spec = importlib.util.spec_from_file_location(
        "_ecofarm_streamlit_3d",
        VIEWER_PATH
    )

    if spec is None or spec.loader is None:
        raise ImportError("Unable to create the 3D viewer module loader.")

    viewer_module = importlib.util.module_from_spec(spec)

    # Register the module before executing it.
    sys.modules[spec.name] = viewer_module
    spec.loader.exec_module(viewer_module)

    get_3d_viewer_html = getattr(
        viewer_module,
        "get_3d_viewer_html"
    )

    if not callable(get_3d_viewer_html):
        raise TypeError(
            "get_3d_viewer_html is missing or is not a function."
        )

except Exception as error:
    st.error("❌ Unable to load the ECOFARM 3D viewer.")
    st.exception(error)
    st.stop()


# --------------------------------------------------
# YOUR ORIGINAL CODE CONTINUES BELOW
# --------------------------------------------------

# Secure secret retrieval (st.secrets with os.environ fallback)
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

# Language selector in sidebar
selected_lang = st.sidebar.selectbox(
    "🌐 Interface Language",
    ["English 🇬🇧", "Français 🇫🇷"],
    index=0
)
is_english = "English" in selected_lang

# Engineering specifications for the 6 functional zones (English & French)
ZONES_DATA_EN = {
    "zoneA": {
        "tag": "ZONE A",
        "name": "Biomass Reception & Preparation",
        "subtitle": "Raw residue bunker, dual-shaft shredder & inclined belt conveyor",
        "description": "Inground discharge hopper receiving heterogeneous agricultural residues (olive pomace, orchard prunings, corn stover, nut shells). Features a 15-ton hydraulic tipping ramp, high-torque shredder with neodymium magnetic separator, and an 18° inclined troughed belt conveyor.",
        "equipment": [
            "Inground Reception Bunker with Heavy Safety Grating",
            "Hydraulic Tipping Ramp (Max 15t payload)",
            "High-Torque Dual-Shaft Shredder & Fine Hammer Mill (7.5 kW)",
            "Over-Belt Permanent Neodymium Magnetic Separator",
            "Reinforced 3-Ply Rubber Belt Conveyor (18° incline, 30 m/min)",
            "Prepared Biomass Metering Surge Hopper with Load Cells"
        ],
        "params": [
            {"label": "Nominal Feed Rate", "val": "120 kg/h"},
            {"label": "Infeed Moisture Content", "val": "45 %"},
            {"label": "Target Particle Size", "val": "8 - 15 mm"},
            {"label": "Shredder Motor Power", "val": "7.5 kW"}
        ]
    },
    "zoneB": {
        "tag": "ZONE B",
        "name": "Automated Continuous Tray Dryer",
        "subtitle": "Low-temperature clean air convection drying with sand battery recovery",
        "description": "Multi-pass insulated stainless steel continuous drying enclosure (100mm mineral wool). Triple perforated agitated conveyor trays powered exclusively by clean air heat exchangers linked to the Sand Thermal Battery. Operation is automatically governed by the sand thermal charge level.",
        "equipment": [
            "Insulated Modular Stainless Steel Drying Enclosure (100mm mineral wool)",
            "Triple Perforated Stainless Steel Agitated Conveyor Trays",
            "Finned Tube Copper-Aluminum Liquid-to-Air Heat Exchanger",
            "Industrial Centrifugal Hot Air Circulation Blower (4,500 m³/h)",
            "Moisture Exhaust Demister Column & Condenser",
            "In-Line Capacitive Moisture Sensors & PT100 RTDs"
        ],
        "params": [
            {"label": "Drying Chamber Temp", "val": "85 °C"},
            {"label": "Target Output Moisture", "val": "10.5 %"},
            {"label": "Air Circulation Flow", "val": "4,200 m³/h"},
            {"label": "Required Thermal Duty", "val": "48.5 kW_th"}
        ]
    },
    "zoneC": {
        "tag": "ZONE C",
        "name": "Industrial Pyrolysis Unit",
        "subtitle": "Oxygen-free thermochemical retort at 520°C & syngas thermal oxidizer",
        "description": "Continuous double-walled Inconel retort with internal ribbon screw. Combustible syngas is dedusted via high-efficiency cyclone, then combusted in a flameless thermal oxidizer whose clean flue heat is captured to recharge the Sand Battery (zero raw syngas venting).",
        "equipment": [
            "Horizontal Double-Walled Inconel Retort Tube with Ribbon Screw",
            "Ceramic Band Electric Heaters (Startup & Precision Control)",
            "High-Efficiency Multi-Cone Cyclone Particulate Separator",
            "Flameless Syngas Thermal Oxidizer Combustion Chamber",
            "Flue Gas Shell-and-Tube Heat Exchanger to Sand Battery",
            "Water-Cooled Biochar Discharge Screw with Nitrogen Purge"
        ],
        "params": [
            {"label": "Pyrolysis Bed Temp", "val": "520 °C"},
            {"label": "Retort Gauge Pressure", "val": "+15 mbar"},
            {"label": "Recovered Syngas Heat", "val": "62.0 kW_th"},
            {"label": "High-Purity Biochar Yield", "val": "38.5 kg/h"}
        ]
    },
    "zoneD": {
        "tag": "ZONE D",
        "name": "Hybrid Sand Thermal Battery",
        "subtitle": "Solid quartz silica high-temperature energy storage (1.25 MWh_th)",
        "description": "Vertical cylindrical insulated steel vessel containing 45 metric tons of refractory quartz sand capable of reaching 500°C. Charged by three distinct vectors: solar thermal collectors, pyrolysis syngas combustion recovery, and PV surplus electrical immersion heaters.",
        "equipment": [
            "Heavily Insulated Steel Storage Vessel (Ø 3.8m × H 4.8m, 45t quartz sand)",
            "Incoloy 800 Submerged Electric Immersion Heaters (75 kW total for PV surplus)",
            "Spiral 316L Stainless Steel Heat Exchanger Tube Bundles",
            "12-Point Vertical Thermal Stratification Thermocouple Tree",
            "Dual Redundant Thermal Fluid Circulation Pumps with Expansion Tank",
            "High-Temperature Pressure Relief and Nitrogen Inerting Valves"
        ],
        "params": [
            {"label": "Sand Core Temperature", "val": "445 °C"},
            {"label": "State of Charge (SOC)", "val": "78 %"},
            {"label": "Stored Thermal Energy", "val": "1.25 MWh_th"},
            {"label": "Discharge Thermal Duty", "val": "48.5 kW_th"}
        ]
    },
    "zoneE": {
        "tag": "ZONE E",
        "name": "Renewable Energy Integration",
        "subtitle": "Photovoltaic canopy, solar thermal field & dynamic energy dispatch",
        "description": "Structural canopy supporting 16 bifacial monocrystalline PV panels (50 kWp), 40 m² evacuated tube solar thermal collectors, an IP66 electrical switchboard, and a 60 kWh LFP battery system. PV electricity surplus is dynamically diverted to the sand battery immersion heaters.",
        "equipment": [
            "Bifacial Monocrystalline Solar PV Array (50 kWp)",
            "Evacuated Tube Solar Thermal Collector Field (40 m² aperture)",
            "Industrial 3-Phase Hybrid Inverter 60 kVA (IP66)",
            "Auxiliary 60 kWh Lithium Iron Phosphate (LFP) Battery Rack",
            "Thyristor Power Controllers for Rapid Immersion Heater Throttling",
            "Precision Pyranometer and Weather Station Mast"
        ],
        "params": [
            {"label": "Solar Irradiance", "val": "820 W/m²"},
            {"label": "Solar PV Power", "val": "41.2 kW_e"},
            {"label": "Solar Thermal Output", "val": "28.4 kW_th"},
            {"label": "PV Surplus to Sand", "val": "26.8 kW_e"}
        ]
    },
    "zoneF": {
        "tag": "ZONE F",
        "name": "SCADA Automation & AI Control Room",
        "subtitle": "Redundant PLCs, SCADA supervision HMI and Gemini AI copilot",
        "description": "Climate-controlled control cabin housing redundant industrial PLCs, triple-screen operator workstation with real-time SCADA synoptic, and AI edge gateway running thermodynamic optimization models.",
        "equipment": [
            "Rittal Industrial Electrical Cabinets IP55 with Active Filtration",
            "Redundant Safety PLCs (Siemens S7-1500 / Modicon M580)",
            "Triple-Monitor Operator Workstation with Real-Time SCADA HMI",
            "Edge Industrial AI Compute Gateway for Enthalpy Dispatch",
            "Industrial 3-Color Signal Stack Light Tower"
        ],
        "params": [
            {"label": "Active IoT Sensor Nodes", "val": "48 nodes"},
            {"label": "PLC Scan Cycle", "val": "20 ms"},
            {"label": "AI Optimization Score", "val": "94.6 %"},
            {"label": "Net Thermal COP", "val": "3.8x"}
        ]
    }
}

ZONES_DATA_FR = {
    "zoneA": {
        "tag": "ZONE A",
        "name": "Réception & Préparation Biomasse",
        "subtitle": "Trémie de réception, broyeur fin à marteaux et convoyeur incliné",
        "description": "Fosse de déchargement inground pour résidus agricoles hétérogènes. Inclut une rampe basculante hydraulique (15 t), un broyeur bi-rotor avec séparateur magnétique néodyme et un convoyeur à bande auget inclinée à 18°.",
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
        "description": "Tunnel continu calorifugé en acier inoxydable. Trois étages de plateaux perforés agités chauffés par l'air chaud généré via l'échangeur alimenté par la Batterie à Sable.",
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
        "description": "Retort cylindrique horizontal en Inconel avec vis sans fin interne. Les gaz de pyrolyse (syngas) sont dépoussiérés par un cyclone puis brûlés dans un oxydateur thermique sans flamme.",
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
        "description": "Cuve verticale cylindrique isolée contenant 45 tonnes de sable de quartz réfractaire pouvant atteindre 500°C. Chargée par 3 sources : collecteurs solaires, syngas et surplus PV.",
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
        "description": "Canopée solaire intégrant 16 panneaux photovoltaïques bifaciaux monocristallins (50 kWp), 40 m² de capteurs solaires thermiques, armoire électrique IP66 et batterie LFP 60 kWh.",
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
        "description": "Cabine de contrôle climatisée abritant les armoires électriques PLC redondantes, le poste opérateur triple écran HMI avec synoptique temps réel et passerelle IA.",
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

ZONES_DATA = ZONES_DATA_EN if is_english else ZONES_DATA_FR

# Thermodynamic calculation engine
def compute_telemetry(solar_w, feed_kgh, moisture_pct, sand_soc_pct, pyro_temp_c):
    pv_area = 240
    pv_eff = 0.20
    pv_kw = max(0.0, (solar_w * pv_area * pv_eff) / 1000.0)
    
    st_area = 40
    st_eff = 0.68
    st_kw = max(0.0, (solar_w * st_area * st_eff) / 1000.0)
    
    base_elec_kw = 9.5 + (feed_kgh / 200.0) * 4.5
    pv_surplus_kw = max(0.0, pv_kw - base_elec_kw)
    
    dried_feed = feed_kgh * ((100.0 - moisture_pct) / (100.0 - 11.0))
    biochar_ratio = max(0.24, 0.42 - (pyro_temp_c - 400.0) * 0.00065)
    biochar_kgh = max(5.0, dried_feed * biochar_ratio)
    
    syngas_ratio = 0.35 + (pyro_temp_c - 400.0) * 0.0005
    syngas_kgh = dried_feed * syngas_ratio
    syngas_heat_kw = max(10.0, (syngas_kgh * 14.5 * 1000.0 * 0.88) / 3600.0)
    
    sand_soc = min(100.0, max(5.0, float(sand_soc_pct)))
    sand_core_c = 100.0 + (sand_soc / 100.0) * (520.0 - 100.0)
    stored_mwh = (sand_soc / 100.0) * 1.5
    
    dryer_interlocked = sand_soc < 35.0 or sand_core_c < 180.0
    
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

# ----------------- UI RENDERING -----------------

badge_text = "3D INDUSTRIAL PILOT" if is_english else "PILOTE INDUSTRIEL 3D"
subtitle_text = (
    "Agricultural biomass valorization • Hybrid sand thermal energy storage (1.2 MWh) • Automated continuous drying"
    if is_english
    else "Valorisation thermochimique de la biomasse • Batterie thermique à sable (1.2 MWh) • Séchage continu automatisé"
)

st.markdown(f"""
<div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 22px 28px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px;">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <h1 style="color: #f8fafc; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">ECOFARM CIRCULAR</h1>
                <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-family: monospace; font-weight: bold;">{badge_text}</span>
            </div>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">
                {subtitle_text}
            </p>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Sidebar: Simulation inputs
sidebar_header = "### ⚙️ Thermodynamic Simulation" if is_english else "### ⚙️ Simulation Thermodynamique"
st.sidebar.markdown(sidebar_header)

solar_label = "☀️ Solar Irradiance (W/m²)" if is_english else "☀️ Irradiation Solaire (W/m²)"
feed_label = "🪵 Biomass Infeed (kg/h)" if is_english else "🪵 Débit Biomasse (kg/h)"
moisture_label = "💧 Infeed Moisture Content (%)" if is_english else "💧 Humidité Entrante (%)"
sand_label = "🔋 Sand Battery SOC (%)" if is_english else "🔋 Charge Batterie Sable SOC (%)"
pyro_label = "🔥 Pyrolysis Retort Temp (°C)" if is_english else "🔥 Température Pyrolyse (°C)"

solar_input = st.sidebar.slider(solar_label, 0, 1000, 820, 25)
biomass_input = st.sidebar.slider(feed_label, 20, 200, 120, 10)
moisture_input = st.sidebar.slider(moisture_label, 20, 65, 45, 5)
sand_soc_input = st.sidebar.slider(sand_label, 10, 100, 78, 5)
pyro_temp_input = st.sidebar.slider(pyro_label, 400, 650, 520, 10)

telemetry = compute_telemetry(solar_input, biomass_input, moisture_input, sand_soc_input, pyro_temp_input)

# Safety interlock banner
if telemetry["dryer_interlocked"]:
    if is_english:
        st.error(f"""
        🚨 **DRYER SAFETY INTERLOCK ENGAGED (INHIBITED):**  
        The biomass dryer is automatically suspended. Thermal energy in the Sand Battery ({telemetry['sand_core_c']:.0f}°C / {telemetry['sand_soc']:.0f}% SOC) 
        is below the required safety threshold (180°C / 35% SOC).
        """)
    else:
        st.error(f"""
        🚨 **INTERVERROUILLAGE SÉCHOIR ENGAGÉ (INHIBITED) :**  
        Le séchoir est automatiquement suspendu. L'énergie thermique stockée dans la Batterie à Sable ({telemetry['sand_core_c']:.0f}°C / {telemetry['sand_soc']:.0f}% SOC) 
        est inférieure au seuil minimal de sécurité (180°C / 35% SOC).
        """)
else:
    if is_english:
        st.success(f"""
        ✅ **DRYER IN NORMAL OPERATION:**  
        Sand Battery operational ({telemetry['sand_core_c']:.0f}°C). Delivering clean thermal power to drying heat exchanger: **{telemetry['dryer_heat_kw']:.1f} kW_th**.
        """)
    else:
        st.success(f"""
        ✅ **SÉCHOIR EN FONCTIONNEMENT NORMAL :**  
        Batterie à Sable opérationnelle ({telemetry['sand_core_c']:.0f}°C). Débit thermique délivré à l'échangeur : **{telemetry['dryer_heat_kw']:.1f} kW_th**.
        """)

# KPIs
col1, col2, col3, col4, col5 = st.columns(5)
with col1:
    label = "🔥 Sand Core" if is_english else "🔥 Cœur de Sable"
    st.metric(label, f"{telemetry['sand_core_c']:.0f} °C", f"{telemetry['stored_mwh']:.2f} MWh")
with col2:
    label = "☀️ Solar (PV + Th)" if is_english else "☀️ Solaire (PV + Th)"
    st.metric(label, f"{telemetry['pv_kw'] + telemetry['st_kw']:.1f} kW", f"Surplus: {telemetry['pv_surplus_kw']:.1f} kW")
with col3:
    label = "♻️ Syngas Recovery" if is_english else "♻️ Récup. Syngas"
    sub = "Thermal Oxidizer" if is_english else "Oxydateur étanche"
    st.metric(label, f"{telemetry['syngas_heat_kw']:.1f} kW_th", sub)
with col4:
    label = "🌱 Fixed-C Biochar" if is_english else "🌱 Biochar C-Fixe"
    unit = "kg CO₂/day" if is_english else "kg CO₂/j"
    st.metric(label, f"{telemetry['biochar_kgh']:.1f} kg/h", f"{telemetry['co2_seq_day']:.0f} {unit}")
with col5:
    label = "⚡ Thermal COP" if is_english else "⚡ COP Thermique"
    sub = "Overall Plant COP" if is_english else "Efficacité globale"
    st.metric(label, f"{telemetry['cop']:.1f}x", sub)

# Tabs
tab_titles = [
    "🖥️ Interactive 3D Digital Twin",
    "📋 6 Functional Zones P&ID",
    "🤖 AI Energy Optimization (Gemini)",
    "🐙 GitHub Synchronization"
] if is_english else [
    "🖥️ Visualisation 3D Interactive",
    "📋 Spécifications des 6 Zones",
    "🤖 Optimisation Énergétique IA",
    "🐙 Synchronisation GitHub"
]

tab_viz, tab_zones, tab_ai, tab_github = st.tabs(tab_titles)

# TAB 1: 3D Visualization
with tab_viz:
    header = "#### 3D Digital Twin — Interactive Real-Time Engineering View" if is_english else "#### Jumeau Numérique 3D — Vue Interactive en Temps Réel"
    caption = "Inspect the complete industrial facility: 6 functional zones, sand thermal battery, and animated process streamlines." if is_english else "Inspectez l'ensemble de l'installation industrielle : 6 zones, batterie à sable, flux thermiques et de matière animés."
    st.markdown(header)
    st.caption(caption)
    
    # Autonomous native WebGL Three.js viewer (eliminates 403 Google error)
    html_content = get_3d_viewer_html(telemetry, lang="en" if is_english else "fr")
    components.html(html_content, height=680, scrolling=False)
    
    controls_hint = (
        "💡 **3D Controls:** Left-click to orbit • Mouse wheel / pinch to zoom • Right-click to pan. Use dock buttons below the viewport to change angles (Isometric, Pyrolysis, Dryer, Sand Battery) or toggle Cutaway (X-Ray) mode."
        if is_english
        else "💡 **Contrôles 3D :** Clic gauche pour orbiter • Molette pour zoomer • Clic droit pour déplacer. Utilisez les boutons sous la scène pour changer d'angle (Isométrique, Pyrolyse, Séchoir, Batterie Sable) ou activer le mode Écorché (X-Ray)."
    )
    st.info(controls_hint)

# TAB 2: Zones P&ID
with tab_zones:
    header = "#### Engineering Specifications & Datasheets for the 6 Zones" if is_english else "#### Fiches Techniques & Spécifications Industrielles des 6 Zones"
    select_prompt = "Select a zone to inspect:" if is_english else "Sélectionnez une zone à inspecter :"
    st.markdown(header)
    selected_zone = st.selectbox(
        select_prompt,
        options=list(ZONES_DATA.keys()),
        format_func=lambda z: f"{ZONES_DATA[z]['tag']} — {ZONES_DATA[z]['name']}"
    )
    
    zone_info = ZONES_DATA[selected_zone]
    st.markdown(f"### {zone_info['tag']} : {zone_info['name']}")
    st.markdown(f"*{zone_info['subtitle']}*")
    st.write(zone_info['description'])
    
    col_eq, col_params = st.columns(2)
    with col_eq:
        st.markdown("**Core Engineered Equipment:**" if is_english else "**Équipements Principaux :**")
        for eq in zone_info["equipment"]:
            st.markdown(f"- {eq}")
    with col_params:
        st.markdown("**Operational Parameters:**" if is_english else "**Paramètres Opérationnels :**")
        for p in zone_info["params"]:
            st.markdown(f"**{p['label']} :** `{p['val']}`")

# TAB 3: AI Gemini
with tab_ai:
    header = "#### AI Energy Management & Thermodynamic Copilot (Gemini)" if is_english else "#### Assistant IA d'Ingénierie & d'Optimisation des Enthalpies (Gemini)"
    desc = "Real-time enthalpy balance analysis and optimal PLC dispatch directives." if is_english else "Analyse en temps réel de la balance thermodynamique et recommandations de pilotage pour l'automate (PLC)."
    st.markdown(header)
    st.write(desc)
    
    if not GEMINI_API_KEY:
        warn = "⚠️ `GEMINI_API_KEY` not configured in `st.secrets` or environment variables. An autonomous expert engineering diagnostic report will be generated." if is_english else "⚠️ Clé `GEMINI_API_KEY` non configurée dans `st.secrets` ou variables d'environnement. Un rapport d'ingénierie expert autonome sera généré."
        st.warning(warn)
    
    prompt_label = "Custom optimization query (optional):" if is_english else "Requête d'optimisation (optionnel) :"
    placeholder = "e.g. How to maximize biochar quality while maintaining 85°C drying?" if is_english else "Ex: Comment optimiser le séchage tout en maximisant le rendement en biochar ?"
    user_query = st.text_input(prompt_label, placeholder=placeholder)
    
    btn_text = "🚀 Run AI Thermodynamic Analysis" if is_english else "🚀 Lancer l'Analyse Thermodynamique IA"
    if st.button(btn_text, use_container_width=True):
        spinner_msg = "Computing multi-vector enthalpy model and PLC dispatch directives..." if is_english else "Calcul du modèle thermodynamique et génération des consignes de délestage..."
        with st.spinner(spinner_msg):
            dryer_state_label = (
                ("INTERLOCKED (Paused)" if is_english else "INTERVERROUILLÉ (Arrêté)")
                if telemetry['dryer_interlocked']
                else (f"ARMED & RUNNING (Duty: {telemetry['dryer_heat_kw']:.1f} kW)" if is_english else f"EN SERVICE (Demande : {telemetry['dryer_heat_kw']:.1f} kW)")
            )

            telemetry_summary = f"""
            Plant Telemetry:
            - Solar Irradiance: {solar_input} W/m² (PV: {telemetry['pv_kw']:.1f} kW, Surplus: {telemetry['pv_surplus_kw']:.1f} kW, Solar Th: {telemetry['st_kw']:.1f} kW)
            - Pyrolysis: {pyro_temp_input}°C (Syngas Flue Recovery: {telemetry['syngas_heat_kw']:.1f} kW)
            - Sand Battery: {telemetry['sand_core_c']:.0f}°C (Charge: {telemetry['sand_soc']:.0f}%, Energy: {telemetry['stored_mwh']:.2f} MWh)
            - Biomass Dryer: {dryer_state_label}
            - Biochar Output: {telemetry['biochar_kgh']:.1f} kg/h (CO2 Sink: {telemetry['co2_seq_day']:.0f} kg CO2/day)
            """

            analysis_text = None
            if GEMINI_API_KEY:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
                    system_lang = "English" if is_english else "French"
                    payload = {
                        "contents": [{
                            "parts": [{
                                "text": f"You are the Lead Process & Energy Automation Engineer for the ECOFARM CIRCULAR pilot plant. Provide a concise, high-impact industrial engineering assessment with 3 priority PLC dispatch recommendations based on this telemetry (respond in {system_lang}):\n{telemetry_summary}\nOperator Query: {user_query or 'Global Enthalpy Optimization'}"
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
                except Exception:
                    pass

            if not analysis_text:
                if is_english:
                    status_msg = "INTERLOCK ACTIVE: Heat sand bed prior to restart" if telemetry['dryer_interlocked'] else "NOMINAL OPTIMAL OPERATION"
                    dryer_directive = (
                        "Inhibit biomass feed conveyor until sand core reaches >= 180°C threshold."
                        if telemetry['dryer_interlocked']
                        else "Maintain air circulation at 4,200 m³/h to stabilize output moisture at 10.5%."
                    )
                    analysis_text = f"""
                    ### 📊 ECOFARM CIRCULAR Thermodynamic Diagnostic ({status_msg})

                    **1. Hybrid Enthalpy Balance:**
                    - Cumulative hybrid thermal input: **{(telemetry['st_kw'] + telemetry['syngas_heat_kw'] + telemetry['pv_surplus_kw']):.1f} kW_th**
                    - Convective dryer discharge: **{telemetry['dryer_heat_kw']:.1f} kW_th**
                    - The 45-ton quartz sand thermal mass provides ample buffer inertia to smooth renewable fluctuations and ensure steady 24/7 valorization.

                    **2. Automated Dispatch Directives for PLC:**
                    1. {dryer_directive}
                    2. Continuously divert all available PV surplus ({telemetry['pv_surplus_kw']:.1f} kW) into the Incoloy immersion heaters.
                    3. Maintain pyrolysis retort temperature at {pyro_temp_input}°C to yield high fixed-carbon biochar (> 82%) for agricultural soil enrichment and verified carbon sink credit.
                    """
                else:
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

# TAB 4: GitHub Sync
with tab_github:
    header = "#### Secure GitHub Deployment & Continuous Synchronization" if is_english else "#### Synchronisation Sécurisée avec GitHub"
    caption = "Automated continuous integration and push to GitHub without interactive blocking." if is_english else "Gestion du déploiement continu et intégration automatique sans saisie bloquante."
    st.markdown(header)
    st.caption(caption)
    
    if GITHUB_TOKEN:
        msg = "✅ **GitHub Token configured** in secrets (`st.secrets['GITHUB_TOKEN']`)." if is_english else "✅ **Token GitHub configuré** dans les secrets (`st.secrets['GITHUB_TOKEN']`)."
        st.success(msg)
    else:
        msg = "ℹ️ No GitHub Token configured in `st.secrets`. The `scripts/github_sync.py` script can be run locally or via GitHub Actions." if is_english else "ℹ️ Aucun Token GitHub configuré dans `st.secrets`. Le script `scripts/github_sync.py` peut être exécuté en ligne de commande locale ou via GitHub Actions."
        st.info(msg)
    
    st.code("""
# Direct synchronization via Python script:
python scripts/github_sync.py --repo ecofarm-circular

# Or via npm script:
npm run github:push
    """, language="bash")
    
    if is_english:
        st.markdown("""
        **Streamlit Cloud Settings:**
        - **Repository:** Your GitHub repository (e.g. `your-username/ecofarm-circular`)
        - **Branch:** `main`
        - **Main file path:** `app.py`
        - **Python version:** `3.10` or `3.11`
        """)
    else:
        st.markdown("""
        **Configuration dans Streamlit Cloud :**
        - **Repository :** Votre dépôt GitHub (ex: `votre-nom/ecofarm-circular`)
        - **Branch :** `main`
        - **Main file path :** `app.py`
        - **Python version :** `3.10` ou `3.11`
        """)
