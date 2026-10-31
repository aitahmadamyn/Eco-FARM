export type ZoneId = 'zoneA' | 'zoneB' | 'zoneC' | 'zoneD' | 'zoneE' | 'zoneF';

export interface ZoneSpecification {
  id: ZoneId;
  name: string;
  tag: string;
  subtitle: string;
  description: string;
  equipmentList: string[];
  operationalParameters: {
    label: string;
    value: string;
    unit: string;
    nominal: string;
  }[];
  keyEngineeringSpecs: {
    title: string;
    detail: string;
  }[];
  safetyAndInterlocks: string[];
  connections: {
    from: string;
    to: string;
    media: string;
    color: string;
  }[];
}

export interface PlantTelemetry {
  // Zone A - Reception
  biomassFeedRateKgH: number;
  biomassMoistureInPercent: number;
  hopperLevelPercent: number;
  shredderPowerKw: number;

  // Zone B - Drying
  dryerAirTempC: number;
  dryerExhaustHumidityPercent: number;
  biomassMoistureOutPercent: number;
  dryerHeatDemandKw: number;
  dryerStatus: 'RUNNING' | 'INTERLOCKED_PAUSED' | 'IDLE';

  // Zone C - Pyrolysis
  pyrolysisBedTempC: number;
  pyrolysisPressureBar: number;
  syngasHeatRecoveryKw: number;
  biocharYieldKgH: number;
  syngasCleanlinessPercent: number;

  // Zone D - Sand Battery
  sandCoreTempC: number;
  sandTopTempC: number;
  sandBottomTempC: number;
  sandBatterySocPercent: number;
  storedThermalMwh: number;
  thermalDischargeRateKw: number;

  // Zone E - Renewable Energy
  solarIrradianceWm2: number;
  solarThermalOutputKw: number;
  pvPowerOutputKw: number;
  pvSurplusToSandKw: number;
  batteryBessSocPercent: number;

  // Overall Pilot Metrics
  netThermalEfficiencyPercent: number;
  co2SequestrationKgPerDay: number;
  aiOptimizationScore: number;
  dryerInterlockEngaged: boolean;
}

export type DisplayMode = 'realistic' | 'cutaway' | 'thermal';

export type CameraPreset =
  | 'isometric'
  | 'plan'
  | 'zoneA'
  | 'zoneB'
  | 'zoneC'
  | 'zoneD'
  | 'zoneE'
  | 'zoneF';
