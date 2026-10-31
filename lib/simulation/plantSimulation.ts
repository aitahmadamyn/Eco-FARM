import { PlantTelemetry, ZoneSpecification, ZoneId } from '../types/plant';

export const ZONES_DATA: Record<ZoneId, ZoneSpecification> = {
  zoneA: {
    id: 'zoneA',
    tag: 'ZONE A',
    name: 'Biomass Reception & Preparation',
    subtitle: 'Agricultural Residue Intake, Sorting & Size Reduction',
    description:
      'High-throughput reception bunker receiving heterogeneous agricultural residues (olive pomace, orchard prunings, corn stover, nut shells). Includes hydraulic unloading ramp, heavy-duty hammer-mill shredder with magnetic particulate separator, and an inclined troughed belt conveyor.',
    equipmentList: [
      'Raw Biomass Inground Bunker with Safety Grate',
      'Hydraulic Tipping Ramp (Max 15t payload)',
      'High-Torque Dual-Shaft Shredder & Fine Hammer Mill',
      'Over-Belt Permanent Neodymium Magnetic Separator',
      'Enclosed Troughed Belt Conveyor (18° incline, 30m/min)',
      'Prepared Biomass Metering Surge Hopper with Weight Sensors'
    ],
    operationalParameters: [
      { label: 'Feed Processing Capacity', value: '120.0', unit: 'kg/h', nominal: '50 - 200 kg/h' },
      { label: 'Infeed Moisture Content', value: '45.0', unit: '% wet basis', nominal: '30 - 60%' },
      { label: 'Target Particle Size', value: '8 - 15', unit: 'mm', nominal: '< 20 mm' },
      { label: 'Shredder Power Draw', value: '7.5', unit: 'kW', nominal: '5.0 - 11.0 kW' }
    ],
    keyEngineeringSpecs: [
      { title: 'Material Handling', detail: 'EP400 3-ply rubber belt with molded cleats and dust skirt containment' },
      { title: 'Safety Certification', detail: 'ATEX Zone 22 compliant explosion-proof drive motors (IP65)' },
      { title: 'Continuous Metering', detail: 'Loss-in-weight screw feeder with variable frequency drive' }
    ],
    safetyAndInterlocks: [
      'Conveyor pull-wire emergency stop switches along walkway',
      'Chute choke level sensor interlocked to shredder motor',
      'Spark detection & automatic water-mist suppression nozzle'
    ],
    connections: [
      { from: 'Reception Bunker', to: 'Shredder', media: 'Raw Agricultural Biomass', color: '#4ade80' },
      { from: 'Shredder', to: 'Zone B Dryer Hopper', media: 'Uniform Granular Biomass (10mm)', color: '#22c55e' }
    ]
  },
  zoneB: {
    id: 'zoneB',
    tag: 'ZONE B',
    name: 'Biomass Drying System',
    subtitle: 'Automated Continuous Chamber with Waste-Heat Recovery',
    description:
      'Multi-pass continuous industrial drying chamber. Employs a low-temperature clean-air convection loop powered exclusively by thermal energy discharged from the Hybrid Sand Thermal Battery via a high-efficiency liquid-to-air heat exchanger. Automatically interlocked to Sand Battery thermal charge level.',
    equipmentList: [
      'Insulated Modular Stainless Steel Drying Enclosure (100mm mineral wool)',
      'Triple Perforated Stainless Steel Agitated Conveyor Trays',
      'Finned Tube Cross-Flow Liquid-to-Air Heat Exchanger (Cu-Al)',
      'Variable Speed Industrial Centrifugal Circulation Blower (4,500 m³/h)',
      'Exhaust Moisture Condenser & Demister Column',
      'Calibrated In-Line Capacitive Moisture & PT100 Temperature Transmitters'
    ],
    operationalParameters: [
      { label: 'Drying Chamber Temp', value: '85.0', unit: '°C', nominal: '75 - 95 °C' },
      { label: 'Dried Biomass Moisture', value: '10.5', unit: '% target', nominal: '8 - 12%' },
      { label: 'Air Circulation Flow', value: '4,200', unit: 'Nm³/h', nominal: '3,000 - 5,000 Nm³/h' },
      { label: 'Thermal Duty Required', value: '48.5', unit: 'kW_th', nominal: '30 - 75 kW_th' }
    ],
    keyEngineeringSpecs: [
      { title: 'Thermal Supply', detail: 'Water/Glycol closed loop supplied from Sand Thermal Battery at 130°C' },
      { title: 'Heat Recovery', detail: 'Latent heat pre-condenser recovers 22% of sensible exhaust heat' },
      { title: 'Airlock Sealing', detail: 'Rotary airlock valves prevent ambient air ingress at feed and discharge' }
    ],
    safetyAndInterlocks: [
      'AUTOMATIC INTERLOCK: Dryer motor inhibited if Sand Battery SOC < 35% (Temp < 180°C)',
      'High exhaust temperature automatic thermal dump damper',
      'Continuous differential pressure monitoring across tray mesh'
    ],
    connections: [
      { from: 'Zone D Sand Battery', to: 'Dryer Heat Exchanger', media: 'Thermal Fluid (Supply 130°C / Return 70°C)', color: '#38bdf8' },
      { from: 'Dryer Discharge', to: 'Zone C Pyrolysis Feed', media: 'Dried Biomass (< 12% Moisture)', color: '#f59e0b' }
    ]
  },
  zoneC: {
    id: 'zoneC',
    tag: 'ZONE C',
    name: 'Industrial Pyrolysis Unit',
    subtitle: 'Oxygen-Free Thermochemical Retort & Biochar Carbon Valorization',
    description:
      'Continuous auger pyrolysis reactor designed for intermediate and slow thermochemical conversion at 450°C - 550°C in an oxygen-free nitrogen-inerted atmosphere. Volatile pyrolysis gases (syngas) are cleaned in a high-efficiency cyclone, then combusted in a flameless thermal oxidizer whose clean flue energy is captured and transferred to the Sand Battery.',
    equipmentList: [
      'Horizontal Double-Walled Inconel Retort Tube with Internal Ribbon Auger',
      'Segmented Ceramic Band Electric Heaters (Startup & Control)',
      'High-Temperature Multi-Cone Cyclone Particulate Separator',
      'Controlled Syngas Thermal Oxidizer Combustion Chamber with Low-NOx Burner',
      'Shell-and-Tube Flue Gas Heat Recovery Exchanger (to Sand Battery)',
      'Water-Cooled Biochar Discharge Auger Screw & Hermetic Nitrogen-Purged Drum Station'
    ],
    operationalParameters: [
      { label: 'Pyrolysis Bed Temp', value: '520.0', unit: '°C', nominal: '450 - 580 °C' },
      { label: 'Reactor Gauge Pressure', value: '+15.0', unit: 'mbar (sealed)', nominal: '+5 to +25 mbar' },
      { label: 'Recovered Syngas Heat', value: '62.0', unit: 'kW_th', nominal: '40 - 90 kW_th' },
      { label: 'High-Purity Biochar Yield', value: '38.5', unit: 'kg/h', nominal: '25 - 60 kg/h' }
    ],
    keyEngineeringSpecs: [
      { title: 'Carbon Sequestration', detail: 'Biochar with > 82% fixed carbon (certified EBC/IBI bio-fertilizer quality)' },
      { title: 'Zero Atmospheric Venting', detail: '100% of combustible syngas is routed through the thermal oxidizer' },
      { title: 'Heat Exchange', detail: 'Flue-gas to synthetic thermal oil heat exchanger rated for 650°C inlet' }
    ],
    safetyAndInterlocks: [
      'Inert N2 purging line with automatic double block & bleed solenoid valves',
      'High-temperature rupture disc (1.5 bar) with relief ducting to quench chamber',
      'Oxygen analyzer in reactor headspace: auto-shutdown if O2 > 0.5% vol'
    ],
    connections: [
      { from: 'Zone C Thermal Oxidizer', to: 'Zone D Sand Battery', media: 'Flue Heat Recovery Loop (350°C)', color: '#ef4444' },
      { from: 'Zone C Cooling Screw', to: 'Biochar Drum', media: 'Stabilized Biochar (C-Sink)', color: '#18181b' }
    ]
  },
  zoneD: {
    id: 'zoneD',
    tag: 'ZONE D',
    name: 'Hybrid Sand Thermal Battery',
    subtitle: 'High-Temperature Solid-Media Energy Storage (1.2 MWh_th)',
    description:
      'Cylindrical insulated thermal storage battery utilizing crushed refractory quartz silica sand as a high-density, low-cost thermal mass capable of reaching 500°C+. Charged by three distinct energy vectors: (1) Solar thermal array, (2) Recovered pyrolysis syngas combustion heat, and (3) Surplus PV electricity via submerged incoloy resistance immersion heater bundles. Controlled closed loop supplies clean heat on demand to Zone B Dryer.',
    equipmentList: [
      'Reinforced Cylindrical Steel Vessel (Ø 3.2m × H 4.8m) with Heavy Microporous Insulation',
      '45 Ton Refractory High-Purity Quartz Sand Bed (Bulk Density 1,600 kg/m³)',
      'Submerged Flanged High-Temp Incoloy 800 Electrical Immersion Heaters (75 kW total)',
      'Internal Spiral 316L Stainless Steel Heat Exchanger Tube Bundles',
      '12-Point 3D Stratification Thermocouple Tree (Bottom, Mid, Top Zones)',
      'Dual Redundant Hot Thermal Fluid Circulation Pumps with Expansion Tank'
    ],
    operationalParameters: [
      { label: 'Core Sand Temperature', value: '445.0', unit: '°C', nominal: '200 - 520 °C' },
      { label: 'State of Charge (SOC)', value: '78.5', unit: '%', nominal: '20 - 95%' },
      { label: 'Stored Thermal Capacity', value: '1.25', unit: 'MWh_th', nominal: 'Max 1.5 MWh_th' },
      { label: 'Net Thermal Discharge', value: '48.5', unit: 'kW_th to dryer', nominal: '0 - 100 kW_th' }
    ],
    keyEngineeringSpecs: [
      { title: 'Storage Medium', detail: 'Graded silica sand (SiO2 > 98%), specific heat capacity 1.05 kJ/(kg·K)' },
      { title: 'Thermal Efficiency', detail: 'Standing loss < 1.8% per 24 hours via multi-layer aerogel & ceramic wool' },
      { title: 'Discharge Interlock', detail: 'Minimum threshold for drying dispatch is set at 180°C / 35% SOC' }
    ],
    safetyAndInterlocks: [
      'Vessel over-temperature emergency nitrogen cooling purge',
      'Thermal oil expansion tank low-level and high-pressure interlocks',
      'Automatic electrical disconnection of immersion heaters at 530°C sand limit'
    ],
    connections: [
      { from: 'Zone E Solar Thermal', to: 'Sand Battery Inlets', media: 'Thermal Solar Glycol (180°C)', color: '#f59e0b' },
      { from: 'Zone C Pyrolysis Flue', to: 'Sand Battery Inlets', media: 'Flue Heat Recovery (350°C)', color: '#ef4444' },
      { from: 'Zone E PV Inverter', to: 'Sand Immersion Heaters', media: '400V 3-Phase Surplus Electricity', color: '#eab308' },
      { from: 'Sand Battery Discharge', to: 'Zone B Dryer', media: 'Heat Supply Circuit (130°C)', color: '#38bdf8' }
    ]
  },
  zoneE: {
    id: 'zoneE',
    tag: 'ZONE E',
    name: 'Renewable Energy Integration',
    subtitle: 'Photovoltaic Array, Solar Thermal & Dynamic Power Dispatch',
    description:
      'Co-located renewable harvest installation featuring high-efficiency bifacial solar photovoltaic panels mounted on the plant canopy structure, evacuated glass solar thermal tube collectors, an outdoor IP66 electrical switchboard, and a 60 kWh Lithium Iron Phosphate (LFP) auxiliary battery. AI algorithm automatically diverts PV power surplus to the sand battery immersion heaters.',
    equipmentList: [
      '50 kWp Bifacial Monocrystalline PV Array (Roof Canopy & Ground Racks)',
      'Evacuated Tube Solar Thermal Collectors (40 m² aperture area, heat pipe technology)',
      'Industrial Hybrid Solar Inverter (60 kVA, 3-Phase 400V/50Hz)',
      '60 kWh LFP Battery Energy Storage System (BESS) for Microgrid Resilience',
      'Solid-State Power Dispatcher (Thyristor Stepless Power Regulator for Sand Heaters)',
      'Weather Station (Class A Pyranometer, Ambient Temp, Anemometer)'
    ],
    operationalParameters: [
      { label: 'Solar Irradiance', value: '820.0', unit: 'W/m²', nominal: '0 - 1050 W/m²' },
      { label: 'Instantaneous PV Power', value: '41.2', unit: 'kW_e', nominal: '0 - 50 kW_e' },
      { label: 'Solar Thermal Heat', value: '28.4', unit: 'kW_th', nominal: '0 - 35 kW_th' },
      { label: 'PV Surplus to Sand Heaters', value: '26.8', unit: 'kW_e (diverted)', nominal: '0 - 45 kW_e' }
    ],
    keyEngineeringSpecs: [
      { title: 'Surplus Valorization', detail: 'Converts zero-marginal-cost renewable electricity into high-grade heat' },
      { title: 'Grid Independence', detail: 'Zero curtailment design: 100% of generated solar electrons are valorized' },
      { title: 'Solar Thermal Pipes', detail: 'Insulated stainless steel flexible corrugated pipes with UV-resistant EPDM' }
    ],
    safetyAndInterlocks: [
      'DC Arc-fault detection and rapid module shutdown compliance (NEC 690.12)',
      'BESS aerosol fire suppression system with BMS cell-level disconnect',
      'Solar thermal stagnation pressure relief valve (6 bar) with catch tank'
    ],
    connections: [
      { from: 'PV Array', to: 'Zone D Immersion Heaters', media: 'Surplus AC Power Bus', color: '#eab308' },
      { from: 'Solar Thermal Collectors', to: 'Zone D Sand Battery', media: 'Pressurized Solar Loop', color: '#f59e0b' }
    ]
  },
  zoneF: {
    id: 'zoneF',
    tag: 'ZONE F',
    name: 'Automation & AI Control Center',
    subtitle: 'Industrial PLC, Synoptic SCADA & AI-Assisted Energy Optimization',
    description:
      'Climate-controlled operator control room and automation station. Houses the main industrial Programmable Logic Controller (PLC) cabinet, safety relays, distributed I/O modules, an operator multi-screen HMI console with real-time P&ID graphics, and an edge computing workstation running the AI-assisted energy management system powered by Gemini.',
    equipmentList: [
      'Double-Door Industrial Electrical Cabinet (Rittal IP55) with Fan-Filter Cooling',
      'Redundant Industrial PLC CPU (Siemens S7-1500 / Schneider Modicon M580)',
      'Distributed Fieldbus Remote I/O Racks (Modbus TCP & PROFINET over Fiber Optic)',
      'Triple-Monitor Operator Workstation with Industrial SCADA Software',
      'Edge Industrial Computer for AI Dispatch & Predictive Thermodynamic Modeling',
      'External Warning Stack Light (Green/Yellow/Red Beacon with Audible Siren)'
    ],
    operationalParameters: [
      { label: 'Active IoT Telemetry Nodes', value: '48', unit: 'transmitters', nominal: '48 / 48 online' },
      { label: 'Plant Automation Scan Rate', value: '20', unit: 'ms', nominal: '< 50 ms' },
      { label: 'AI Optimization Factor', value: '94.2', unit: '% efficiency', nominal: '85 - 98%' },
      { label: 'Net Thermal COP', value: '3.8', unit: 'ratio', nominal: '3.2 - 4.5' }
    ],
    keyEngineeringSpecs: [
      { title: 'AI Assistant Integration', detail: 'Gemini-assisted predictive scheduling of biomass infeed vs. weather forecasts' },
      { title: 'Cybersecurity', detail: 'IEC 62443 industrial network segmentation with hardware firewall' },
      { title: 'Automated Interlock Engine', detail: 'Hardware safety relay circuit guaranteeing safe plant state upon any fault' }
    ],
    safetyAndInterlocks: [
      'Master Emergency Plant Trip (E-Stop) hardwired into safety loop',
      'UPS battery backup sustaining PLC and safety instrumentation for > 4 hours',
      'Continuous automated watchdog timer rebooting non-responsive field loops'
    ],
    connections: [
      { from: 'Sensor Array (All Zones)', to: 'PLC Cabinet', media: 'Ethernet / 4-20mA HART Signals', color: '#a855f7' },
      { from: 'PLC Output Cards', to: 'Motor Starters & Control Valves', media: '24VDC Control Wiring', color: '#6366f1' }
    ]
  }
};

export interface PlantSimulationInputs {
  solarIrradianceWm2: number; // 0 to 1000 W/m2
  biomassInfeedKgH: number; // 20 to 200 kg/h
  biomassMoisturePercent: number; // 20 to 65%
  sandBatterySocTargetPercent: number; // 10 to 100%
  pyrolysisTempC: number; // 400 to 650 °C
}

export function calculatePlantTelemetry(inputs: PlantSimulationInputs): PlantTelemetry {
  const { solarIrradianceWm2, biomassInfeedKgH, biomassMoisturePercent, sandBatterySocTargetPercent, pyrolysisTempC } =
    inputs;

  // Renewable power generation
  const pvAreaM2 = 240; // 50 kWp equivalent
  const pvEfficiency = 0.20;
  const pvPowerOutputKw = Math.max(0, (solarIrradianceWm2 * pvAreaM2 * pvEfficiency) / 1000);

  // Solar thermal generation
  const solarThermalAreaM2 = 40;
  const solarThermalEfficiency = 0.68;
  const solarThermalOutputKw = Math.max(0, (solarIrradianceWm2 * solarThermalAreaM2 * solarThermalEfficiency) / 1000);

  // Plant base electrical consumption (fans, pumps, augers, electronics)
  const baseElectricalDemandKw = 9.5 + (biomassInfeedKgH / 200) * 4.5;
  const pvSurplusToSandKw = Math.max(0, pvPowerOutputKw - baseElectricalDemandKw);

  // Pyrolysis yields & energy balance
  // Yield of biochar decreases slightly with temperature (e.g. 35% at 450°C, 28% at 600°C)
  const biocharYieldRatio = Math.max(0.24, 0.42 - (pyrolysisTempC - 400) * 0.00065);
  // Yield is based on dried biomass infeed (moisture < 12%)
  const driedBiomassFeedKgH = biomassInfeedKgH * ((100 - biomassMoisturePercent) / (100 - 11));
  const biocharYieldKgH = Math.max(5, driedBiomassFeedKgH * biocharYieldRatio);

  // Pyrolysis syngas recovered heat (syngas LHV ~ 12-16 MJ/kg, thermal oxidizer efficiency 88%)
  const syngasYieldRatio = 0.35 + (pyrolysisTempC - 400) * 0.0005;
  const syngasKgH = driedBiomassFeedKgH * syngasYieldRatio;
  const syngasHeatRecoveryKw = Math.max(10, (syngasKgH * 14.5 * 1000 * 0.88) / 3600);

  // Sand Battery Temperature and State of Charge (SOC)
  const sandBatterySocPercent = Math.min(100, Math.max(5, sandBatterySocTargetPercent));
  const minSandTemp = 100;
  const maxSandTemp = 520;
  const sandCoreTempC = minSandTemp + (sandBatterySocPercent / 100) * (maxSandTemp - minSandTemp);
  const sandTopTempC = sandCoreTempC * 0.94;
  const sandBottomTempC = sandCoreTempC * 0.82;
  const storedThermalMwh = (sandBatterySocPercent / 100) * 1.5;

  // AUTOMATED INTERLOCK LOGIC:
  // Dryer requires minimum threshold of 35% SOC (or >= 180°C sand core temp)
  const dryerInterlockEngaged = sandBatterySocPercent < 35 || sandCoreTempC < 180;
  const dryerStatus = dryerInterlockEngaged ? 'INTERLOCKED_PAUSED' : 'RUNNING';

  // Biomass Dryer calculations
  // Water to evaporate = infeed water minus target outfeed water (11%)
  const waterInKgH = (biomassInfeedKgH * biomassMoisturePercent) / 100;
  const drySolidKgH = biomassInfeedKgH * (1 - biomassMoisturePercent / 100);
  const targetMoisture = 11;
  const waterOutAllowedKgH = drySolidKgH * (targetMoisture / (100 - targetMoisture));
  const waterEvaporationDemandKgH = Math.max(0, waterInKgH - waterOutAllowedKgH);

  // Latent heat of vaporization ~ 2260 kJ/kg, sensible heat ~ 400 kJ/kg = ~ 2660 kJ/kg water
  // Heat exchanger duty:
  const nominalDryerHeatDemandKw = (waterEvaporationDemandKgH * 2660) / 3600;
  const dryerHeatDemandKw = dryerInterlockEngaged ? 0 : nominalDryerHeatDemandKw;
  const thermalDischargeRateKw = dryerHeatDemandKw;

  const dryerAirTempC = dryerInterlockEngaged ? 28 : Math.min(92, 70 + (sandCoreTempC / 500) * 22);
  const dryerExhaustHumidityPercent = dryerInterlockEngaged ? 45 : Math.min(92, 55 + (waterEvaporationDemandKgH / 100) * 25);
  const biomassMoistureOutPercent = dryerInterlockEngaged ? biomassMoisturePercent : targetMoisture;

  // Carbon negative sequestration calculation
  // Biochar has ~ 80% fixed carbon. 1 kg C = 3.67 kg CO2 equivalent.
  const co2SequestrationKgPerDay = biocharYieldKgH * 0.80 * 3.67 * 24;

  // Overall thermal efficiency
  const totalHeatInputKw = solarThermalOutputKw + syngasHeatRecoveryKw + pvSurplusToSandKw;
  const netThermalEfficiencyPercent = Math.min(
    92,
    Math.max(65, 78 + (solarThermalOutputKw > 15 ? 4 : 0) + (pyrolysisTempC > 500 ? 5 : 0) - (dryerInterlockEngaged ? 14 : 0))
  );

  return {
    biomassFeedRateKgH: biomassInfeedKgH,
    biomassMoistureInPercent: biomassMoisturePercent,
    hopperLevelPercent: 78,
    shredderPowerKw: 7.2 + (biomassInfeedKgH / 200) * 3.0,

    dryerAirTempC,
    dryerExhaustHumidityPercent,
    biomassMoistureOutPercent,
    dryerHeatDemandKw,
    dryerStatus,

    pyrolysisBedTempC: pyrolysisTempC,
    pyrolysisPressureBar: 1.018,
    syngasHeatRecoveryKw,
    biocharYieldKgH,
    syngasCleanlinessPercent: 99.4,

    sandCoreTempC,
    sandTopTempC,
    sandBottomTempC,
    sandBatterySocPercent,
    storedThermalMwh,
    thermalDischargeRateKw,

    solarIrradianceWm2,
    solarThermalOutputKw,
    pvPowerOutputKw,
    pvSurplusToSandKw,
    batteryBessSocPercent: 92,

    netThermalEfficiencyPercent,
    co2SequestrationKgPerDay,
    aiOptimizationScore: dryerInterlockEngaged ? 58.4 : 94.6,
    dryerInterlockEngaged
  };
}
