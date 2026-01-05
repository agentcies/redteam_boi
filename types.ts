
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

// Added GeoPoint interface for MapVisualizer
export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
  intensity: 'high' | 'medium' | 'low';
}

export interface RedTeamReport {
  target: string;
  status: string;
  recon: {
    endpoints: string[];
    technology_stack: string[];
    manifest_secrets_detected: string[];
  };
  vulnerabilities: Array<{
    type: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    cve_id?: string;
    description: string;
    reconstruction_logic: string;
    bypass_vector: string;
  }>;
  active_payloads: Array<{
    name: string;
    type: string;
    payload: string;
    execution_context: string;
  }>;
  // Added sources to store search grounding URLs as required by Gemini API guidelines
  sources?: GroundingChunk[];
}

export enum ToolMode {
  RECON = 'RECON',
  INFRA = 'INFRA',
  VULN = 'VULN',
  EVASION = 'EVASION',
  PAYLOAD = 'PAYLOAD',
  BREACH = 'BREACH',
  REPORT = 'REPORT'
}

export interface TerminalLine {
  text: string;
  type: 'info' | 'error' | 'success' | 'cmd';
}

export interface ToolConfigItem {
  icon: any;
  label: string;
  sub: string;
  prompt: string;
  search: boolean;
}
