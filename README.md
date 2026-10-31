# ECOFARM CIRCULAR — 3D Industrial Engineering & Digital Twin

> **Industrial Engineering & Circular Architecture Showcase**  
> An intelligent agricultural biomass valorization pilot plant integrating continuous pyrolysis, a high-temperature hybrid sand thermal energy storage battery, automated convective drying, and AI-assisted enthalpy dispatch.

---

## Table of Contents
- [1. Executive Overview](#1-executive-overview)
- [2. The 6 Engineered Functional Zones](#2-the-6-engineered-functional-zones)
- [3. Process Flow & Safety Interlock Logic](#3-process-flow--safety-interlock-logic)
- [4. 3D Visualization & Cutaway Modes](#4-3d-visualization--cutaway-modes)
- [5. Interactive Controls & Keybindings](#5-interactive-controls--keybindings)
- [6. Technical Architecture](#6-technical-architecture)
- [7. Installation & Deployment Guide](#7-installation--deployment-guide)
- [8. Thermodynamic Simulation & AI Copilot](#8-thermodynamic-simulation--ai-copilot)

---

## 1. Executive Overview

**ECOFARM CIRCULAR** is an advanced circular bioeconomy engineering model designed to transform heterogeneous agricultural residues (olive pomace, vineyard prunings, straw, nut shells) into clean thermal energy and **high-purity biochar** (> 82% fixed carbon, delivering permanent negative net $\text{CO}_2$ emissions).

The core technical innovation couples a **high-temperature solid quartz silica thermal battery (Sand Battery)** with three hybrid energy vectors:
1. **Evacuated Tube Solar Thermal Array** (closed glycol circuit up to $180^\circ\text{C}$).
2. **Pyrolysis Flue Gas Recovery** via a flameless thermal oxidizer ($350^\circ\text{C}$, eliminating raw syngas venting).
3. **Dynamic Photovoltaic Surplus Conversion** via submerged high-power electrical immersion heaters.

Stored thermal energy is discharged on demand to power an **automated continuous tray dryer**, ensuring optimal infeed conditions before thermochemical conversion in the pyrolysis retort.

---

## 2. The 6 Engineered Functional Zones

| Zone | Designation | Engineering Role & Key Equipment |
| :--- | :--- | :--- |
| **Zone A** | **Biomass Reception & Preparation** | Inground reinforced concrete receiving bunker with safety grating, 15-ton hydraulic tipping ramp, high-torque dual-shaft shredder and fine hammer mill (7.5 kW), over-belt neodymium permanent magnetic separator, 18° inclined troughed belt conveyor, and loss-in-weight surge metering hopper with calibrated load cells. |
| **Zone B** | **Automated Continuous Tray Dryer** | Modular insulated stainless steel drying tunnel (100 mm mineral wool), triple perforated agitated conveyor trays, copper-aluminum finned tube liquid-to-air heat exchanger, centrifugal hot air circulation blower ($4,500\,\text{m}^3/\text{h}$), in-line capacitive moisture sensors and PT100 RTD transmitters, and moisture exhaust stack with demister column. |
| **Zone C** | **Industrial Pyrolysis Unit** | Continuous double-walled Inconel retort tube with internal ribbon auger screw ($450 - 550^\circ\text{C}$), segmented ceramic band electric heaters, high-efficiency multi-cone cyclone particulate separator, controlled syngas flameless thermal oxidizer (*zero uncombusted atmospheric emissions*), flue-gas shell-and-tube heat exchanger to sand battery, water-cooled biochar discharge screw, and hermetic nitrogen-purged ($\text{N}_2$) collection drum station. |
| **Zone D** | **Hybrid Sand Thermal Battery** | Cylindrical insulated steel vessel ($\varnothing\,3.8\,\text{m} \times H\,4.8\,\text{m}$, 45 metric tons of refractory quartz silica sand, $1.25\,\text{MWh}_{\text{th}}$ storage capacity up to $500^\circ\text{C}$), flanged Incoloy 800 electrical immersion heaters (75 kW total for PV surplus), internal spiral 316L stainless steel heat exchanger tube bundles, 12-point vertical thermal stratification thermocouple tree, redundant thermal fluid circulation skid, and expansion tank with safety relief valves. |
| **Zone E** | **Renewable Solar Integration** | Structural steel canopy supporting 16 bifacial monocrystalline PV panels ($50\,\text{kWp}$), evacuated glass tube solar thermal collectors ($40\,\text{m}^2$ aperture area), centralized IP66 3-phase hybrid inverter ($60\,\text{kVA}$), auxiliary $60\,\text{kWh}$ Lithium Iron Phosphate (LFP) battery rack, and thyristor power controllers for rapid immersion heater throttling. |
| **Zone F** | **SCADA Automation & AI Control Room** | Prefabricated climate-controlled control cabin with panoramic safety glazing, Rittal IP55 industrial electrical cabinets with redundant PLCs (Siemens S7-1500 / Modicon M580), triple-monitor operator workstation running real-time SCADA HMI synoptics, 3-color industrial signal stack light tower, and Gemini AI edge optimization gateway. |

---

## 3. Process Flow & Safety Interlock Logic

### Material Flow Pipeline
$$\text{Raw Agricultural Residues} \longrightarrow \text{Shredder} \longrightarrow \text{Inclined Conveyor} \longrightarrow \text{Tray Dryer (Zone B)} \longrightarrow \text{Pyrolysis Retort (Zone C)} \longrightarrow \text{Biochar Carbon Sink}$$

### Color-Coded Energy Circuits
- **Amber / Yellow**: Closed-loop solar thermal glycol circuit ($180^\circ\text{C}$) $\to$ Sand Battery.
- **Red**: Recovered syngas combustion flue gas loop ($350^\circ\text{C}$) $\to$ Sand Battery.
- **Golden / Electric**: Dynamic surplus photovoltaic generation $\to$ Incoloy immersion heaters.
- **Cyan / Light Blue**: Clean hot thermal fluid discharge loop ($130^\circ\text{C}$) $\to$ Biomass dryer heat exchanger.
- **Deep Blue**: Cooled return fluid ($70^\circ\text{C}$) $\to$ Sand Battery.
- **Green**: Raw and prepared granular biomass handling line.
- **Anthracite**: Stabilized biochar discharge line.

### Automated Dryer Safety Interlock
> **Critical Operational Constraint**: The biomass drying convective loop requires a minimum thermal threshold in the Sand Battery of $\ge 180^\circ\text{C}$ (SOC $\ge 35\%$). When the core drops below this threshold, the safety PLC triggers an automatic interlock (**INHIBITED**), safely idling the dryer conveyor to prevent thermal deficit until storage enthalpy is replenished.

---

## 4. 3D Visualization & Cutaway Modes

1. **Realistic PBR Industrial Mode**: Physically based rendering featuring realistic industrial materials (galvanized structural steel, polished stainless steel, non-slip textured concrete slabs, safety warning striping, optical canopy glass, and thermal insulation lagging).
2. **Cutaway (X-Ray) Mode**: Outer vessel walls and machine hulls become semi-transparent, revealing:
   - The glowing internal refractory quartz sand bed.
   - Submerged Incoloy immersion heating elements.
   - Internal spiral heat exchanger tube circuits.
   - The internal helical ribbon auger of the pyrolysis retort.
   - Agitated perforated drying conveyor trays.
3. **Thermal Heatmap Mode**: Color-maps components according to operational temperatures ($25^\circ\text{C}$ ambient blue $\to 85^\circ\text{C}$ drying $\to 445^\circ\text{C}$ sand battery $\to 520^\circ\text{C}$ glowing red pyrolysis retort).

---

## 5. Interactive Controls & Keybindings

Full multi-modal control via keyboard, mouse, and multi-touch gestures:

| Key / Control | Function | Category |
| :--- | :--- | :--- |
| **`H`** | Show / Hide Bottom Control Dock (*Zen Mode*) | Interface |
| **`Space`** | Pause / Resume Process Streamlines Animation | Animation |
| **`M`** | Toggle Render Mode (*Realistic $\to$ Cutaway $\to$ Thermal*) | 3D Render |
| **`0` or `I`** | Reset to Isometric $\frac{3}{4}$ Overview | Camera |
| **`P`** | BIM Orthogonal Top-Down Plan View | Camera |
| **`1` or `A`** | Focus Camera on Zone A (Biomass Intake) | Zone |
| **`2` or `B`** | Focus Camera on Zone B (Convective Dryer) | Zone |
| **`3` or `C`** | Focus Camera on Zone C (Pyrolysis Retort) | Zone |
| **`4` or `D`** | Focus Camera on Zone D (Sand Thermal Battery) | Zone |
| **`5` or `E`** | Focus Camera on Zone E (Solar PV & Thermal) | Zone |
| **`6` or `F`** | Focus Camera on Zone F (SCADA Control Room) | Zone |
| **`+` / `-`** *(or `Z`/`X`)* | Zoom In / Zoom Out | Navigation |
| **`Esc`** | Close open modal dialogues and inspector panels | Interface |
| **`?` or `K`** | Open Keyboard & Touch Navigation Guide | Help |
| **Click / Tap 3D** | Inspect any machine directly in the 3D viewport | P&ID Inspector |

---

## 6. Technical Architecture

- **Web Frontend**: Next.js 15+ (App Router, Server Components & Client Leaf Nodes)
- **3D Graphics Engine**: Three.js (r187) with WebGL2, automatic Software WebGL fallback, ACESFilmic tone mapping, and 100% self-contained procedural textures (zero external 404 dependencies).
- **Streamlit Cloud Layer**: `app.py` + `lib/streamlit_3d.py` with embedded autonomous Three.js WebGL component (resolves Google 403 iframe errors on Streamlit Cloud).
- **Styles**: Tailwind CSS v4, Lucide React icons, and `motion` transitions.
- **Thermodynamic Engine**: First-principles physical calculations (mass conservation, water vaporization enthalpy, syngas generation, biochar fixed carbon yield, and net $\text{CO}_2$ sequestration).
- **AI Optimization**: `@google/genai` TypeScript SDK (`gemini-2.5-flash` model) deployed via secure Next.js API route (`/api/gemini/optimize`) for real-time dispatch recommendations.

---

## 7. Installation & Deployment Guide

### Prerequisites
- Node.js 18+ or 20+
- Python 3.10+ (for Streamlit Cloud or local Streamlit deployment)
- Optional Gemini API Key (`GEMINI_API_KEY`)

### Local Web App (Next.js)

```bash
# 1. Clone repository
git clone https://github.com/your-username/ecofarm-circular.git
cd ecofarm-circular

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env.local
# Set GEMINI_API_KEY="your_api_key_here" in .env.local

# 4. Start development server
npm run dev

# 5. Open browser at http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

### Streamlit Cloud Deployment

1. Set **Main file path** to `app.py`.
2. Ensure `requirements.txt` is present at the repository root.
3. Configure optional secrets in Streamlit Cloud Dashboard (`Settings` $\to$ `Secrets`):
   ```toml
   GEMINI_API_KEY = "your_gemini_api_key"
   GITHUB_TOKEN = "your_github_token"
   ```

### Automated GitHub Synchronization Script

A standalone Python script is included in `scripts/github_sync.py` (zero external dependencies, uses Python 3 standard library):

```bash
# Interactive mode (prompts for token and repository name):
python scripts/github_sync.py

# Non-interactive command-line execution:
python scripts/github_sync.py --repo ecofarm-circular --token ghp_YOUR_TOKEN

# Additional options:
# --private    : Create the GitHub repository in private mode (default: public)
# --message    : Custom commit message
# --org        : Deploy to a GitHub organization instead of a personal account
```

---

## 8. Thermodynamic Simulation & AI Copilot

In the **"Thermodynamic Sim"** tab of the bottom dock (or sidebar in Streamlit), operators can adjust in real time:
- **Solar Irradiance ($0 - 1,000\,\text{W/m}^2$)**: Drives PV generation and evacuated solar thermal output.
- **Biomass Infeed Rate ($20 - 200\,\text{kg/h}$)**: Modulates shredder load, moisture evaporation duty, and biochar output.
- **Sand Battery SOC ($10 - 100\%$)**: Dynamically engages or disengages the convective dryer interlock.
- **Pyrolysis Retort Temp ($400 - 650^\circ\text{C}$)**: Dictates combustible syngas yield versus biochar fixed carbon ratio.

Clicking **"AI Energy Dispatch"** queries the Gemini copilot with live telemetry vectors to receive prioritized PLC setpoints and enthalpy optimization directives.

---

*ECOFARM CIRCULAR — Engineered for industrial sustainability and circular bioeconomy excellence.*
