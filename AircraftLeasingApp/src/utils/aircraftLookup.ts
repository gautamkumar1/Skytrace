interface AircraftInfo {
  aircraftType: string;
  manufacturer: string;
  category: string;
  engines: string[];
}

const AIRCRAFT_FAMILIES: Record<string, AircraftInfo> = {
  'A319':    { aircraftType: 'A319-100',    manufacturer: 'Airbus',  category: 'Narrowbody', engines: ['CFM56-5B', 'V2500'] },
  'A320':    { aircraftType: 'A320-200',    manufacturer: 'Airbus',  category: 'Narrowbody', engines: ['CFM56-5B', 'V2500'] },
  'A321':    { aircraftType: 'A321-200',    manufacturer: 'Airbus',  category: 'Narrowbody', engines: ['CFM56-5B', 'V2500'] },
  'A320NEO': { aircraftType: 'A320-200NEO', manufacturer: 'Airbus',  category: 'Narrowbody', engines: ['LEAP-1A', 'PW1100G'] },
  'A321NEO': { aircraftType: 'A321-200NEO', manufacturer: 'Airbus',  category: 'Narrowbody', engines: ['LEAP-1A', 'PW1100G'] },
  'A330':    { aircraftType: 'A330-200',    manufacturer: 'Airbus',  category: 'Widebody',   engines: ['CF6-80E1', 'Trent 700'] },
  'A350':    { aircraftType: 'A350-900',    manufacturer: 'Airbus',  category: 'Widebody',   engines: ['Trent XWB'] },
  'B737':    { aircraftType: 'B737-800',    manufacturer: 'Boeing',  category: 'Narrowbody', engines: ['CFM56-7B'] },
  '737':     { aircraftType: 'B737-800',    manufacturer: 'Boeing',  category: 'Narrowbody', engines: ['CFM56-7B'] },
  '737MAX':  { aircraftType: '737-MAX8',    manufacturer: 'Boeing',  category: 'Narrowbody', engines: ['LEAP-1B'] },
  'B777':    { aircraftType: 'B777-300ER',  manufacturer: 'Boeing',  category: 'Widebody',   engines: ['GE90-115B', 'Trent 800'] },
  'B787':    { aircraftType: 'B787-9',      manufacturer: 'Boeing',  category: 'Widebody',   engines: ['GEnx-1B', 'Trent 1000'] },
};

const SPECIFIC_AIRCRAFT: Record<string, AircraftInfo> = {
  'A319-100':  { aircraftType: 'A319-100',    manufacturer: 'Airbus',  category: 'Narrowbody', engines: ['CFM56-5B', 'V2500'] },
  'A320-200':  { aircraftType: 'A320-200',    manufacturer: 'Airbus',  category: 'Narrowbody', engines: ['CFM56-5B', 'V2500'] },
  'A321-200':  { aircraftType: 'A321-200',    manufacturer: 'Airbus',  category: 'Narrowbody', engines: ['CFM56-5B', 'V2500'] },
  'B737-700':  { aircraftType: 'B737-700',    manufacturer: 'Boeing',  category: 'Narrowbody', engines: ['CFM56-7B'] },
  'B737-800':  { aircraftType: 'B737-800',    manufacturer: 'Boeing',  category: 'Narrowbody', engines: ['CFM56-7B'] },
  '737-MAX8':  { aircraftType: '737-MAX8',    manufacturer: 'Boeing',  category: 'Narrowbody', engines: ['LEAP-1B'] },
  'A330-200':  { aircraftType: 'A330-200',    manufacturer: 'Airbus',  category: 'Widebody',   engines: ['CF6-80E1', 'Trent 700'] },
  'A350-900':  { aircraftType: 'A350-900',    manufacturer: 'Airbus',  category: 'Widebody',   engines: ['Trent XWB'] },
};

const ENGINE_PATTERNS = [
  'LEAP-1A', 'LEAP-1B', 'PW1100G', 'CFM56-5B', 'CFM56-5C', 'CFM56-7B',
  'V2500', 'CF6-80E1', 'CF6-80C2', 'GE90-115B', 'GEnx-1B',
  'Trent 700', 'Trent 800', 'Trent 1000', 'Trent XWB', 'RB211-524', 'PW4000',
];

export interface DetectedInfo {
  aircraftType: string | null;
  engineType: string | null;
  manufacturer: string | null;
  category: string | null;
  engineOptions: string[];
  confidence: 'high' | 'medium' | 'low' | 'none';
}

export function detectAircraftInfo(...sources: string[]): DetectedInfo {
  const combined = sources.join(' ').toUpperCase();
  const result: DetectedInfo = {
    aircraftType: null, engineType: null, manufacturer: null,
    category: null, engineOptions: [], confidence: 'none',
  };

  for (const [pattern, info] of Object.entries(SPECIFIC_AIRCRAFT)) {
    if (combined.includes(pattern.toUpperCase())) {
      Object.assign(result, { ...info, aircraftType: info.aircraftType, engineOptions: info.engines, confidence: 'high' });
      break;
    }
  }

  if (!result.aircraftType) {
    const sorted = Object.entries(AIRCRAFT_FAMILIES).sort((a, b) => b[0].length - a[0].length);
    for (const [pattern, info] of sorted) {
      if (combined.includes(pattern.toUpperCase())) {
        Object.assign(result, { ...info, aircraftType: info.aircraftType, engineOptions: info.engines, confidence: 'medium' });
        break;
      }
    }
  }

  for (const ep of ENGINE_PATTERNS) {
    if (combined.includes(ep.toUpperCase())) {
      result.engineType = ep;
      if (result.aircraftType) result.confidence = 'high';
      else result.confidence = 'low';
      break;
    }
  }

  if (result.aircraftType && !result.engineType && result.engineOptions.length > 0) {
    result.engineType = result.engineOptions[0];
  }

  return result;
}

export const ALL_AIRCRAFT_TYPES = [
  'A319-100','A320-200','A320-200NEO','A321-200','A321-200NEO',
  'A330-200','A330-300','A340-300','A350-900',
  'B737-700','B737-800','737-MAX8','B747-400','B777-300ER','B787-9',
];

export const ALL_ENGINE_TYPES = [
  'CFM56-5B','CFM56-5C','CFM56-7B','CF6-80C2','CF6-80E1',
  'GE90-115B','GEnx-1B','LEAP-1A','LEAP-1B','PW1100G',
  'PW4000','RB211-524','Trent 700','Trent 800','Trent 1000','Trent XWB','V2500',
];
