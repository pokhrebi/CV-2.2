import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

export type ProjectFilter = 'all' | 'saas' | 'mobile';
export type TrackCmTab = 'analytics' | 'builder' | 'leads';
export type MetalType = 'gold' | 'silver' | 'platinum';
export type Timeframe = '1D' | '1W' | '1M' | '1Y';
export type ExpandedProjectKey = 'trackcm' | 'goldtracker' | null;

export type TechIconType =
  | 'angular'
  | 'dotnet'
  | 'csharp'
  | 'azure'
  | 'redis'
  | 'swift'
  | 'swiftui'
  | 'ts'
  | 'sql'
  | 'ios'
  | 'api'
  | 'cqrs';

export interface TechBadge {
  name: string;
  icon: TechIconType;
}

interface Tenant {
  id: string;
  name: string;
  plan: string;
  visitors: string;
  leads: number;
  rate: string;
  sparkline: string;
}

interface LeadItem {
  id: string;
  name: string;
  company: string;
  source: string;
  time: string;
  status: 'Qualified' | 'In Review' | 'New';
}

interface MetalData {
  name: string;
  symbol: string;
  priceOz: number;
  changePercent: number;
  isPositive: boolean;
  high: number;
  low: number;
  vol: string;
  charts: Record<Timeframe, { path: string; fill: string; returnText: string }>;
}

export interface ProjectDetailModal {
  key: 'trackcm' | 'goldtracker';
  title: string;
  category: string;
  tagline: string;
  role: string;
  duration: string;
  overview: string;
  problem: string;
  solution: string;
  achievements: {
    metric: string;
    label: string;
    description: string;
  }[];
  architectureHighlights: string[];
  techStack: TechBadge[];
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  host: {
    '(window:keydown.escape)': 'onEscapePressed()'
  }
})
export class ProjectsComponent implements OnInit {
  activeFilter: ProjectFilter = 'all';

  // --- Tech Badges with Language & Framework Icons ---
  trackCmTech: TechBadge[] = [
    { name: 'Angular 19', icon: 'angular' },
    { name: '.NET 8', icon: 'dotnet' },
    { name: 'C#', icon: 'csharp' },
    { name: 'TypeScript', icon: 'ts' },
    { name: 'Azure SQL (RLS)', icon: 'sql' },
    { name: 'Azure AD B2C', icon: 'azure' },
    { name: 'Redis Cache', icon: 'redis' },
    { name: 'MediatR CQRS', icon: 'cqrs' },
    { name: 'Azure App Service', icon: 'azure' }
  ];

  goldTrackerTech: TechBadge[] = [
    { name: 'Swift 5.10', icon: 'swift' },
    { name: 'SwiftUI', icon: 'swiftui' },
    { name: 'MVVM', icon: 'cqrs' },
    { name: 'Async / Await', icon: 'api' },
    { name: 'Combine', icon: 'api' },
    { name: 'REST API', icon: 'api' },
    { name: 'iOS SDK', icon: 'ios' }
  ];

  // --- Modal Expand State ---
  expandedProject: ExpandedProjectKey = null;

  projectModals: Record<'trackcm' | 'goldtracker', ProjectDetailModal> = {
    trackcm: {
      key: 'trackcm',
      title: 'TrackCM',
      category: 'Enterprise Multi-Tenant SaaS Platform',
      tagline: 'Sub-second conversion tracking, visual dynamic block page hydration, and multi-tenant RLS isolation.',
      role: 'Lead Full-Stack Software Engineer',
      duration: '2025 — 2026',
      overview: 'TrackCM is a specialized multi-tenant campaign attribution and landing page composition platform designed to bridge marketing agility with enterprise data security. It empowers growth teams to compose high-converting landing pages with dynamic block schemas while providing real-time attribution analytics across every visitor touchpoint.',
      problem: 'Traditional marketing CMS solutions either compromise data security by storing multi-tenant records without kernel-level database isolation, or rely on heavy iframe embeds that introduce render latency, cumulative layout shifts, and attribution blindspots across multi-step campaign funnels.',
      solution: 'Engineered a decoupled modern cloud architecture pairing an Angular 19 SPA client with an ASP.NET Core 8 Web API backend and Azure SQL Row-Level Security (RLS). When user requests arrive, verified JWT claims set SESSION_CONTEXT to guarantee complete cryptographic and logical tenant separation at the database engine level, while Angular signals hydrate dynamic layout blocks with zero iframe overhead.',
      achievements: [
        {
          metric: '< 48ms',
          label: 'P95 Ingestion Latency',
          description: 'Sub-50ms event ingestion throughput processing high-frequency conversion events with Redis distributed caching.'
        },
        {
          metric: '100%',
          label: 'Tenant Data Isolation',
          description: 'Zero data leakage across multi-tenant boundaries enforced by Azure SQL Row-Level Security predicates.'
        },
        {
          metric: '62%',
          label: 'Render Speedup',
          description: 'Reduced initial page load and block mutation latency by 62% using Angular 19 dynamic component outlets.'
        },
        {
          metric: '99.9%',
          label: 'Availability SLA',
          description: 'Containerized deployment to Azure App Service with automated GitHub Actions CI/CD and health-check slot swaps.'
        }
      ],
      architectureHighlights: [
        'Database-Enforced Multi-Tenancy: T-SQL security predicates dynamically evaluate SESSION_CONTEXT("TenantId") on every SELECT, UPDATE, and DELETE query.',
        'Dynamic Component Hydration: Angular 19 standalone signals drive atomic layout re-renders without full document tears or third-party iframe bottlenecks.',
        'Attribution Engine: Asynchronous event ingestion pipeline capturing UTM touchpoints, time-on-page, form views, and qualified leads.',
        'Enterprise Identity & Security: Azure Key Vault zero-secret codebase with Azure AD B2C OAuth 2.0 / OpenID Connect tokens.'
      ],
      techStack: [
        { name: 'Angular 19', icon: 'angular' },
        { name: 'TypeScript', icon: 'ts' },
        { name: '.NET 8', icon: 'dotnet' },
        { name: 'C#', icon: 'csharp' },
        { name: 'Azure SQL (RLS)', icon: 'sql' },
        { name: 'Redis Cache', icon: 'redis' },
        { name: 'MediatR CQRS', icon: 'cqrs' },
        { name: 'Azure App Service', icon: 'azure' }
      ]
    },
    goldtracker: {
      key: 'goldtracker',
      title: 'GoldTracker',
      category: 'Native iOS Application (SwiftUI)',
      tagline: 'Real-time precious metals spot monitoring, multi-timeframe sparkline telemetry, and offline resilience.',
      role: 'iOS Mobile Engineer & Designer',
      duration: '2026',
      overview: 'GoldTracker is a native iOS application engineered to provide commodity traders, jewelers, and retail investors with live spot rates for Gold (XAU), Silver (XAG), and Platinum (XPT). It pairs high-frequency REST updates with custom SwiftUI chart paths and instantaneous unit normalization.',
      problem: 'Existing precious metal tracking apps are often cluttered with advertisements, rely on sluggish webview wrappers, fail to maintain state during intermittent cell connectivity, and suffer from micro-stutters during time-series recalculations.',
      solution: 'Architected an Apple-first native client utilizing SwiftUI and Swift 5.10 concurrency (async/await and actors). Decoupled the time-series mathematical normalization into an isolated MVVM ViewModel, ensuring smooth 120Hz ProMotion animations during live quote updates and interactive timeframe pivots.',
      achievements: [
        {
          metric: '120 FPS',
          label: 'ProMotion Fidelity',
          description: 'Silky smooth gesture interactions and chart path interpolations powered by SwiftUI custom vector paths.'
        },
        {
          metric: '0 ms',
          label: 'Offline Stutter',
          description: 'Local snapshot caching guarantees zero cold-start delay even during total cellular connection drops.'
        },
        {
          metric: '3 Metals',
          label: 'Real-Time Feeds',
          description: 'Instantaneous price normalization across Troy Ounces and Grams with spread tracking.'
        },
        {
          metric: 'iOS 17+',
          label: 'Modern APIs',
          description: 'Utilizes Swift Concurrency, Combine pipelines, dynamic type sizing, and native SF Symbols 6.'
        }
      ],
      architectureHighlights: [
        'Unidirectional Data Flow: MVVM architecture ensures price updates never trigger unnecessary view hierarchy rebuilds.',
        'Vector Chart Engine: Custom SwiftUI Shape protocols render time-series curves mathematically without heavy third-party chart dependencies.',
        'Haptic & Visual Feedback: Integrated Apple UIImpactFeedbackGenerator triggers subtle tactile ticks on asset and timeframe switches.',
        'Dark & Light Parity: Native semantic color tokens adapt to ambient system illumination with high-contrast legibility.'
      ],
      techStack: [
        { name: 'Swift 5.10', icon: 'swift' },
        { name: 'SwiftUI', icon: 'swiftui' },
        { name: 'MVVM', icon: 'cqrs' },
        { name: 'Async / Await', icon: 'api' },
        { name: 'Combine', icon: 'api' },
        { name: 'REST API', icon: 'api' },
        { name: 'iOS SDK', icon: 'ios' }
      ]
    }
  };

  // --- TrackCM Interactive SaaS State ---
  trackCmTab: TrackCmTab = 'analytics';
  selectedTimeRange: '24h' | '7d' | '30d' = '24h';
  builderBlocks = {
    hero: true,
    features: true,
    form: true,
    pricing: false
  };
  liveLeadCountNotice: boolean = false;
  tenants: Tenant[] = [
    {
      id: '042',
      name: 'Acme Corp',
      plan: 'Pro',
      visitors: '12,408',
      leads: 284,
      rate: '2.29%',
      sparkline: 'M0,80 L40,65 L80,68 L120,48 L160,52 L200,32 L240,38 L280,18 L320,22'
    },
    {
      id: '089',
      name: 'Nordic Health',
      plan: 'Enterprise',
      visitors: '48,650',
      leads: 1420,
      rate: '3.18%',
      sparkline: 'M0,85 L40,55 L80,48 L120,38 L160,42 L200,20 L240,24 L280,10 L320,14'
    },
    {
      id: '104',
      name: 'Vanguard Media',
      plan: 'Team',
      visitors: '6,490',
      leads: 128,
      rate: '1.97%',
      sparkline: 'M0,75 L40,70 L80,60 L120,62 L160,50 L200,45 L240,30 L280,34 L320,28'
    }
  ];
  activeTenantIndex: number = 0;

  recentLeads: LeadItem[] = [
    { id: 'LD-902', name: 'Sophia Chen', company: 'Apex Cloud', source: 'Google Ads (Search)', time: 'Just now', status: 'Qualified' },
    { id: 'LD-901', name: 'Marcus Miller', company: 'HealthPulse Labs', source: 'LinkedIn InMail', time: '12m ago', status: 'New' },
    { id: 'LD-900', name: 'Elena Rostova', company: 'FinEdge Corp', source: 'Organic Direct', time: '44m ago', status: 'Qualified' },
    { id: 'LD-899', name: 'David K.', company: 'Aero Dynamics', source: 'Webinar Funnel', time: '2h ago', status: 'In Review' }
  ];

  // --- GoldTracker Native iOS State ---
  activeMetal: MetalType = 'gold';
  activeTimeframe: Timeframe = '1W';
  isGramUnit: boolean = false;
  isRefreshingPrice: boolean = false;
  lastUpdatedTime: string = 'Just now';

  metalsData: Record<MetalType, MetalData> = {
    gold: {
      name: 'Gold',
      symbol: 'XAU',
      priceOz: 2418.50,
      changePercent: 0.83,
      isPositive: true,
      high: 2432.00,
      low: 2396.00,
      vol: '128k',
      charts: {
        '1D': {
          path: 'M0,45 L20,40 L40,48 L60,35 L80,38 L100,28 L120,32 L140,22 L160,26 L180,18 L200,12',
          fill: 'M0,45 L20,40 L40,48 L60,35 L80,38 L100,28 L120,32 L140,22 L160,26 L180,18 L200,12 L200,70 L0,70 Z',
          returnText: '+0.83% Today'
        },
        '1W': {
          path: 'M0,50 L15,46 L30,52 L45,40 L60,44 L75,32 L90,36 L105,24 L120,28 L135,18 L150,22 L165,14 L180,16 L200,8',
          fill: 'M0,50 L15,46 L30,52 L45,40 L60,44 L75,32 L90,36 L105,24 L120,28 L135,18 L150,22 L165,14 L180,16 L200,8 L200,70 L0,70 Z',
          returnText: '+2.41% This Week'
        },
        '1M': {
          path: 'M0,58 L20,52 L40,45 L60,48 L80,35 L100,38 L120,25 L140,30 L160,18 L180,12 L200,6',
          fill: 'M0,58 L20,52 L40,45 L60,48 L80,35 L100,38 L120,25 L140,30 L160,18 L180,12 L200,6 L200,70 L0,70 Z',
          returnText: '+5.74% This Month'
        },
        '1Y': {
          path: 'M0,64 L20,60 L40,50 L60,54 L80,42 L100,36 L120,28 L140,22 L160,15 L180,10 L200,4',
          fill: 'M0,64 L20,60 L40,50 L60,54 L80,42 L100,36 L120,28 L140,22 L160,15 L180,10 L200,4 L200,70 L0,70 Z',
          returnText: '+18.9% 1 Year'
        }
      }
    },
    silver: {
      name: 'Silver',
      symbol: 'XAG',
      priceOz: 28.14,
      changePercent: -0.24,
      isPositive: false,
      high: 28.52,
      low: 27.98,
      vol: '42k',
      charts: {
        '1D': {
          path: 'M0,20 L20,25 L40,18 L60,30 L80,24 L100,35 L120,28 L140,40 L160,34 L180,44 L200,48',
          fill: 'M0,20 L20,25 L40,18 L60,30 L80,24 L100,35 L120,28 L140,40 L160,34 L180,44 L200,48 L200,70 L0,70 Z',
          returnText: '-0.24% Today'
        },
        '1W': {
          path: 'M0,18 L20,22 L40,16 L60,26 L80,20 L100,32 L120,26 L140,38 L160,30 L180,40 L200,45',
          fill: 'M0,18 L20,22 L40,16 L60,26 L80,20 L100,32 L120,26 L140,38 L160,30 L180,40 L200,45 L200,70 L0,70 Z',
          returnText: '+1.18% This Week'
        },
        '1M': {
          path: 'M0,35 L20,28 L40,32 L60,20 L80,24 L100,16 L120,22 L140,14 L160,18 L180,12 L200,10',
          fill: 'M0,35 L20,28 L40,32 L60,20 L80,24 L100,16 L120,22 L140,14 L160,18 L180,12 L200,10 L200,70 L0,70 Z',
          returnText: '+6.42% This Month'
        },
        '1Y': {
          path: 'M0,52 L20,44 L40,48 L60,36 L80,40 L100,28 L120,32 L140,22 L160,18 L180,14 L200,8',
          fill: 'M0,52 L20,44 L40,48 L60,36 L80,40 L100,28 L120,32 L140,22 L160,18 L180,14 L200,8 L200,70 L0,70 Z',
          returnText: '+24.5% 1 Year'
        }
      }
    },
    platinum: {
      name: 'Platinum',
      symbol: 'XPT',
      priceOz: 984.20,
      changePercent: 1.42,
      isPositive: true,
      high: 992.00,
      low: 973.00,
      vol: '19k',
      charts: {
        '1D': {
          path: 'M0,50 L20,44 L40,46 L60,38 L80,40 L100,30 L120,34 L140,24 L160,20 L180,18 L200,10',
          fill: 'M0,50 L20,44 L40,46 L60,38 L80,40 L100,30 L120,34 L140,24 L160,20 L180,18 L200,10 L200,70 L0,70 Z',
          returnText: '+1.42% Today'
        },
        '1W': {
          path: 'M0,54 L20,48 L40,52 L60,40 L80,44 L100,32 L120,36 L140,26 L160,22 L180,18 L200,14',
          fill: 'M0,54 L20,48 L40,52 L60,40 L80,44 L100,32 L120,36 L140,26 L160,22 L180,18 L200,14 L200,70 L0,70 Z',
          returnText: '+3.15% This Week'
        },
        '1M': {
          path: 'M0,60 L20,54 L40,48 L60,50 L80,38 L100,42 L120,30 L140,26 L160,22 L180,16 L200,12',
          fill: 'M0,60 L20,54 L40,48 L60,50 L80,38 L100,42 L120,30 L140,26 L160,22 L180,16 L200,12 L200,70 L0,70 Z',
          returnText: '+8.20% This Month'
        },
        '1Y': {
          path: 'M0,65 L20,58 L40,62 L60,48 L80,50 L100,38 L120,42 L140,30 L160,24 L180,18 L200,10',
          fill: 'M0,65 L20,58 L40,62 L60,48 L80,50 L100,38 L120,42 L140,30 L160,24 L180,18 L200,10 L200,70 L0,70 Z',
          returnText: '+14.1% 1 Year'
        }
      }
    }
  };

  constructor(private seo: SeoService) { }

  ngOnInit(): void {
    this.seo.update(
      'Selected Work & Software Projects — Bhakti Pokhrel | Software Engineer',
      'Explore interactive software engineering projects by Bhakti Pokhrel: TrackCM (multi-tenant SaaS campaign & conversion platform) and GoldTracker (native SwiftUI iOS app).',
      '/projects'
    );
  }

  setFilter(filter: ProjectFilter): void {
    this.activeFilter = filter;
  }

  // --- Modal Methods ---
  openProjectModal(key: 'trackcm' | 'goldtracker'): void {
    this.expandedProject = key;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeProjectModal(): void {
    this.expandedProject = null;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  onEscapePressed(): void {
    if (this.expandedProject) {
      this.closeProjectModal();
    }
  }

  // --- TrackCM Methods ---
  setTrackCmTab(tab: TrackCmTab): void {
    this.trackCmTab = tab;
  }

  setTimeRange(range: '24h' | '7d' | '30d'): void {
    this.selectedTimeRange = range;
  }

  switchTenant(index: number): void {
    this.activeTenantIndex = index;
  }

  toggleBlock(blockName: 'hero' | 'features' | 'form' | 'pricing'): void {
    this.builderBlocks[blockName] = !this.builderBlocks[blockName];
  }

  simulateLeadCapture(): void {
    const currentTenant = this.tenants[this.activeTenantIndex];
    currentTenant.leads += 1;
    this.liveLeadCountNotice = true;

    const names = ['Aria Stark', 'Jordan Lee', 'Nico Wright', 'Sarah Connor', 'Liam Patel'];
    const companies = ['Zenith AI', 'BioHealth Systems', 'CloudStream', 'Solarix Solar', 'Apex Bio'];
    const sources = ['Interactive Demo Form', 'Landing Page Hero CTA', 'Direct Campaign Ingest'];

    const newLead: LeadItem = {
      id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: names[Math.floor(Math.random() * names.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      time: 'Just now',
      status: 'Qualified'
    };

    this.recentLeads.unshift(newLead);
    if (this.recentLeads.length > 5) {
      this.recentLeads.pop();
    }

    setTimeout(() => {
      this.liveLeadCountNotice = false;
    }, 2800);
  }

  // --- GoldTracker Methods ---
  setMetal(metal: MetalType): void {
    this.activeMetal = metal;
  }

  setTimeframe(tf: Timeframe): void {
    this.activeTimeframe = tf;
  }

  toggleUnit(): void {
    this.isGramUnit = !this.isGramUnit;
  }

  refreshPrice(): void {
    this.isRefreshingPrice = true;
    setTimeout(() => {
      const metal = this.metalsData[this.activeMetal];
      const delta = (Math.random() * 2 - 0.95);
      metal.priceOz = Number((metal.priceOz + delta).toFixed(2));
      metal.high = Math.max(metal.high, metal.priceOz);
      metal.low = Math.min(metal.low, metal.priceOz);
      this.isRefreshingPrice = false;
      this.lastUpdatedTime = 'Updated just now';
    }, 450);
  }

  getDisplayPrice(priceOz: number): string {
    if (this.isGramUnit) {
      const priceGram = priceOz / 31.1034768;
      return `$${priceGram.toFixed(2)}`;
    }
    return `$${priceOz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // --- Parallax & 3D Tilt Hover State ---
  cardTilts = {
    trackcm: { rx: 0, ry: 0, glareX: 50, glareY: 50, active: false },
    goldtracker: { rx: 0, ry: 0, glareX: 50, glareY: 50, active: false }
  };

  onCardMouseMove(event: MouseEvent, cardKey: 'trackcm' | 'goldtracker'): void {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
      return;
    }
    const card = event.currentTarget as HTMLElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // Subtle tilt: max ±7 degrees
    const rx = Number(((0.5 - y) * 9).toFixed(2));
    const ry = Number(((x - 0.5) * 9).toFixed(2));
    const glareX = Number((x * 100).toFixed(1));
    const glareY = Number((y * 100).toFixed(1));

    this.cardTilts[cardKey] = { rx, ry, glareX, glareY, active: true };
  }

  onCardMouseLeave(cardKey: 'trackcm' | 'goldtracker'): void {
    this.cardTilts[cardKey] = { rx: 0, ry: 0, glareX: 50, glareY: 50, active: false };
  }
}
