// Version management system
export const CURRENT_VERSION = '1.0.0';
export interface Version {
  version: string;
  name: string;
  status: 'stable' | 'development' | 'beta';
  route: string;
  description: string;
  features: string[];
}

export const AVAILABLE_VERSIONS: Version[] = [
  {
    version: '1.0.0',
    name: 'Interactive Terminal',
    status: 'stable',
    route: '/v1',
    description: 'Terminal-based portfolio with AI chat assistant',
    features: ['Interactive Terminal', 'AI Chat', '3D Fallback', 'Analytics']
  },
  {
    version: '2.0.0',
    name: 'JARVIS AI',
    status: 'development',
    route: '/v2',
    description: 'Advanced AI assistant with JARVIS-style interface',
    features: ['JARVIS AI', 'Voice-like Interactions', 'Portfolio Control', 'Holographic Effects']
  }
];

export function getVersionByRoute(route: string): Version | undefined {
  return AVAILABLE_VERSIONS.find(v => v.route === route);
}

export function getCurrentVersion(): Version {
  return AVAILABLE_VERSIONS.find(v => v.version === CURRENT_VERSION)!;
}

export function getLatestVersion(): Version {
  return AVAILABLE_VERSIONS[AVAILABLE_VERSIONS.length - 1];
}
