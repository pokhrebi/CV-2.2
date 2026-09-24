import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import * as d3 from 'd3';

export interface SkillItem {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Cloud' | 'Data';
  score: number; // 0-100
  years: string;
  highlight: string;
}

@Component({
  selector: 'app-skills-chart',
  template: `
    <div class="skills-chart-container reveal">
      <div class="chart-header">
        <div>
          <span class="eyebrow">Technical Competencies</span>
          <h2 class="chart-heading">Full-stack Proficiency &amp; Depth</h2>
          <p class="chart-sub">Interactive D3 visualization across core engineering disciplines.</p>
        </div>

        <!-- Controls: View Mode & Category Filters -->
        <div class="chart-controls">
          <div class="view-toggle" role="group" aria-label="Visualization Mode">
            <button
              type="button"
              class="toggle-btn"
              [class.active]="viewMode === 'radar'"
              (click)="setViewMode('radar')"
              aria-label="Radar Chart View">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <line x1="2" y1="8.5" x2="22" y2="15.5"></line>
                <line x1="2" y1="15.5" x2="22" y2="8.5"></line>
              </svg>
              <span>Radar View</span>
            </button>
            <button
              type="button"
              class="toggle-btn"
              [class.active]="viewMode === 'bar'"
              (click)="setViewMode('bar')"
              aria-label="Bar Chart View">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="16" y2="12"></line>
                <line x1="3" y1="18" x2="19" y2="18"></line>
              </svg>
              <span>Bar View</span>
            </button>
          </div>

          <div class="category-filters">
            <button
              type="button"
              *ngFor="let cat of categories"
              class="filter-chip"
              [class.active]="selectedCategory === cat"
              (click)="setCategory(cat)">
              {{ cat }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Chart Stage -->
      <div class="chart-stage-wrap">
        <div class="svg-wrapper" #chartContainer></div>

        <!-- Detail Inspector Pill -->
        <div class="detail-card" [class.active]="hoveredSkill !== null">
          <div *ngIf="hoveredSkill; else promptTpl" class="detail-content">
            <div class="detail-top">
              <span class="detail-badge">{{ hoveredSkill.category }}</span>
              <span class="detail-score">{{ hoveredSkill.score }}% Proficiency</span>
              <span class="detail-years">{{ hoveredSkill.years }}</span>
            </div>
            <h4 class="detail-title">{{ hoveredSkill.name }}</h4>
            <p class="detail-desc">{{ hoveredSkill.highlight }}</p>
          </div>
          <ng-template #promptTpl>
            <div class="detail-prompt">
              <span class="prompt-icon">✦</span>
              <span>Hover or click any node to inspect proficiency, years of experience, and production application context.</span>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skills-chart-container {
      margin-top: 4rem;
      padding: 2.5rem;
      background: var(--bg-alt);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      transition: border-color 0.3s ease;
    }

    .skills-chart-container:hover {
      border-color: rgba(0,0,0,0.14);
    }

    :host-context([data-theme="dark"]) .skills-chart-container:hover {
      border-color: rgba(255,255,255,0.18);
    }

    .chart-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--line);
    }

    .chart-heading {
      font-size: clamp(1.4rem, 2.5vw, 1.85rem);
      margin: 0.25rem 0 0.5rem;
      font-weight: 500;
    }

    .chart-sub {
      font-size: 0.92rem;
      color: var(--text-muted);
      margin: 0;
    }

    .chart-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }

    .view-toggle {
      display: inline-flex;
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 3px;
      gap: 2px;
    }

    .toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.76rem;
      font-weight: 500;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      color: var(--text-muted);
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      color: var(--text);
    }

    .toggle-btn.active {
      background: var(--accent);
      color: var(--bg);
      font-weight: 600;
    }

    .category-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .filter-chip {
      font-size: 0.72rem;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--bg);
      color: var(--text-muted);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .filter-chip:hover {
      border-color: var(--text);
      color: var(--text);
    }

    .filter-chip.active {
      background: var(--accent-soft);
      border-color: var(--accent);
      color: var(--text);
      font-weight: 600;
    }

    .chart-stage-wrap {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      align-items: center;
    }

    .svg-wrapper {
      width: 100%;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .svg-wrapper ::ng-deep svg {
      width: 100%;
      max-width: 680px;
      height: auto;
      display: block;
      margin: 0 auto;
      overflow: visible;
    }

    /* SVG internal styles */
    .svg-wrapper ::ng-deep .radar-axis-line {
      stroke: var(--line);
      stroke-width: 1px;
      stroke-dasharray: 2, 2;
    }

    .svg-wrapper ::ng-deep .radar-grid-poly {
      fill: none;
      stroke: var(--line);
      stroke-width: 1px;
    }

    .svg-wrapper ::ng-deep .radar-grid-label {
      font-size: 10px;
      fill: var(--text-muted);
      font-family: var(--font-sans);
    }

    .svg-wrapper ::ng-deep .radar-polygon {
      fill: var(--text);
      fill-opacity: 0.12;
      stroke: var(--text);
      stroke-width: 2.2px;
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .svg-wrapper ::ng-deep .radar-polygon {
      fill-opacity: 0.2;
    }

    .svg-wrapper ::ng-deep .radar-node-point {
      fill: var(--bg);
      stroke: var(--accent);
      stroke-width: 2.5px;
      cursor: pointer;
      transition: r 0.25s cubic-bezier(0.2, 0.7, 0.2, 1), stroke-width 0.25s ease;
    }

    .svg-wrapper ::ng-deep .radar-node-point:hover,
    .svg-wrapper ::ng-deep .radar-node-point.active {
      r: 7px;
      fill: var(--accent);
      stroke-width: 3.5px;
    }

    .svg-wrapper ::ng-deep .radar-axis-label {
      font-family: var(--font-sans);
      font-size: 11.5px;
      font-weight: 500;
      fill: var(--text);
      cursor: pointer;
      transition: font-weight 0.2s ease, fill 0.2s ease;
    }

    .svg-wrapper ::ng-deep .radar-axis-label:hover,
    .svg-wrapper ::ng-deep .radar-axis-label.active {
      font-weight: 700;
      fill: var(--accent);
    }

    /* Bar Chart SVG styles */
    .svg-wrapper ::ng-deep .bar-rect {
      fill: var(--accent);
      fill-opacity: 0.85;
      rx: 3px;
      transition: fill-opacity 0.2s ease;
      cursor: pointer;
    }

    .svg-wrapper ::ng-deep .bar-rect:hover,
    .svg-wrapper ::ng-deep .bar-rect.active {
      fill-opacity: 1;
    }

    .svg-wrapper ::ng-deep .bar-bg-rect {
      fill: var(--bg);
      stroke: var(--line);
      stroke-width: 1px;
      rx: 3px;
    }

    .svg-wrapper ::ng-deep .bar-label {
      font-family: var(--font-sans);
      font-size: 12px;
      font-weight: 500;
      fill: var(--text);
      cursor: pointer;
    }

    .svg-wrapper ::ng-deep .bar-value-label {
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 600;
      fill: var(--text-muted);
    }

    /* Detail Card */
    .detail-card {
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      min-height: 80px;
      display: flex;
      align-items: center;
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
    }

    .detail-card.active {
      border-color: var(--accent);
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }

    .detail-content {
      width: 100%;
    }

    .detail-top {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.35rem;
      flex-wrap: wrap;
    }

    .detail-badge {
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.2rem 0.55rem;
      background: var(--accent-soft);
      color: var(--text);
      border-radius: var(--radius);
    }

    .detail-score {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent);
    }

    .detail-years {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .detail-title {
      font-family: var(--font-serif);
      font-size: 1.15rem;
      font-weight: 500;
      margin: 0.15rem 0 0.35rem;
      color: var(--text);
    }

    .detail-desc {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.55;
    }

    .detail-prompt {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .prompt-icon {
      color: var(--accent);
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .skills-chart-container {
        padding: 1.25rem 0.85rem;
        margin-top: 2.5rem;
      }
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
      }
      .chart-controls {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .view-toggle {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      .toggle-btn {
        justify-content: center;
        padding: 0.5rem;
      }
      .category-filters {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        flex-wrap: nowrap;
        padding-bottom: 4px;
      }
      .category-filters::-webkit-scrollbar {
        display: none;
      }
      .filter-chip {
        flex-shrink: 0;
        white-space: nowrap;
        padding: 0.35rem 0.85rem;
      }
      .svg-wrapper {
        min-height: 300px;
        touch-action: pan-y;
      }
      .detail-card {
        padding: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  viewMode: 'radar' | 'bar' = 'radar';
  selectedCategory: string = 'All';
  hoveredSkill: SkillItem | null = null;

  readonly categories: string[] = ['All', 'Frontend', 'Backend', 'Cloud', 'Data'];

  readonly allSkills: SkillItem[] = [
    {
      id: 'angular',
      name: 'Angular (v14–v19)',
      category: 'Frontend',
      score: 95,
      years: '4+ Years',
      highlight: 'Zoneless architecture, Signals reactivity, micro-frontends, component libraries, and custom RxJS pipelines.'
    },
    {
      id: 'dotnet',
      name: 'C# / .NET (8 & 9)',
      category: 'Backend',
      score: 92,
      years: '4+ Years',
      highlight: 'High-throughput ASP.NET Core Web APIs, Minimal APIs, asynchronous service layers, and clean enterprise patterns.'
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      category: 'Cloud',
      score: 88,
      years: '3+ Years',
      highlight: 'AZ-900 & DP-900 certified. App Services, Azure Functions, Blob Storage, Cosmos DB, and Azure AD B2C integration.'
    },
    {
      id: 'sql',
      name: 'SQL Server & T-SQL',
      category: 'Data',
      score: 86,
      years: '4+ Years',
      highlight: 'Schema normalization, stored procedures, indexed views, execution plan analysis, and query optimization.'
    },
    {
      id: 'typescript',
      name: 'TypeScript & JavaScript',
      category: 'Frontend',
      score: 94,
      years: '4+ Years',
      highlight: 'Strict typing paradigms, dynamic generics, AST generation, AST manipulations, and modern ECMAScript standards.'
    },
    {
      id: 'microservices',
      name: 'Microservices & REST',
      category: 'Backend',
      score: 90,
      years: '3+ Years',
      highlight: 'Decoupled domain architectures, event-driven messaging, resilient retry policies (Polly), and API gateways.'
    },
    {
      id: 'devops',
      name: 'Azure DevOps & CI/CD',
      category: 'Cloud',
      score: 85,
      years: '3+ Years',
      highlight: 'Multi-stage YAML build/release pipelines, automated unit test suites, gated deployments, and artifacts.'
    },
    {
      id: 'efcore',
      name: 'Entity Framework Core',
      category: 'Data',
      score: 88,
      years: '3+ Years',
      highlight: 'Code-first migrations, projection queries, eager/lazy loading tuning, and compiled query caching.'
    }
  ];

  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.renderChart();

    if (typeof ResizeObserver !== 'undefined' && this.chartContainer) {
      this.resizeObserver = new ResizeObserver(() => {
        this.renderChart();
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }

    // Observe theme switch ([data-theme="dark"]) to redraw colors cleanly
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => {
        this.renderChart();
      });
      this.mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
      });
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.renderChart();
  }

  setViewMode(mode: 'radar' | 'bar'): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.renderChart();
    this.cdr.markForCheck();
  }

  setCategory(cat: string): void {
    if (this.selectedCategory === cat) return;
    this.selectedCategory = cat;
    this.renderChart();
    this.cdr.markForCheck();
  }

  private getFilteredSkills(): SkillItem[] {
    if (this.selectedCategory === 'All') {
      return this.allSkills;
    }
    return this.allSkills.filter(s => s.category === this.selectedCategory);
  }

  private renderChart(): void {
    if (!this.chartContainer?.nativeElement) return;
    const container = this.chartContainer.nativeElement;
    d3.select(container).selectAll('*').remove();

    const skills = this.getFilteredSkills();
    if (skills.length === 0) return;

    if (this.viewMode === 'radar') {
      this.renderRadarChart(container, skills);
    } else {
      this.renderBarChart(container, skills);
    }
  }

  // ==========================================
  // D3 RADAR / SPIDER WEB CHART IMPLEMENTATION
  // ==========================================
  private renderRadarChart(container: HTMLElement, data: SkillItem[]): void {
    const width = 540;
    const height = 480;
    const margin = 70;
    const radius = Math.min(width, height) / 2 - margin;
    const totalAxes = data.length;
    const angleSlice = (Math.PI * 2) / totalAxes;
    const levels = 4; // concentric polygons: 25%, 50%, 75%, 100%

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'Radar Chart of Skills');

    // Central group translated to center
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Scale for radius (0 to 100 score)
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, 100]);

    // Draw concentric polygonal grid levels
    for (let level = 1; level <= levels; level++) {
      const levelFactor = radius * (level / levels);
      const levelPoints: [number, number][] = [];

      for (let i = 0; i < totalAxes; i++) {
        const x = levelFactor * Math.cos(angleSlice * i - Math.PI / 2);
        const y = levelFactor * Math.sin(angleSlice * i - Math.PI / 2);
        levelPoints.push([x, y]);
      }

      g.append('polygon')
        .attr('class', 'radar-grid-poly')
        .attr('points', levelPoints.map(p => p.join(',')).join(' '));

      // Level percentage labels along 12 o'clock axis
      g.append('text')
        .attr('class', 'radar-grid-label')
        .attr('x', 6)
        .attr('y', -levelFactor + 4)
        .text(`${level * 25}%`);
    }

    // Draw radial axis lines from center to perimeter
    const axis = g.selectAll('.axis')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axis.append('line')
      .attr('class', 'radar-axis-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2));

    // Outer Axis Labels
    axis.append('text')
      .attr('class', 'radar-axis-label')
      .attr('text-anchor', (d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const cos = Math.cos(angle);
        if (Math.abs(cos) < 0.15) return 'middle';
        return cos > 0 ? 'start' : 'end';
      })
      .attr('dy', (d, i) => {
        const sin = Math.sin(angleSlice * i - Math.PI / 2);
        return sin > 0.5 ? '1em' : sin < -0.5 ? '-0.3em' : '0.35em';
      })
      .attr('x', (d, i) => (radius + 24) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => (radius + 24) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d.name)
      .on('mouseenter', (event, d) => {
        this.hoveredSkill = d;
        this.cdr.markForCheck();
      })
      .on('mouseleave', () => {
        // keep selected or reset
      });

    // Radial line generator for skill polygon
    const radarLine = d3.lineRadial<SkillItem>()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.score))
      .angle((d, i) => i * angleSlice);

    // Initial collapsed path for smooth entrance transition
    const collapsedLine = d3.lineRadial<SkillItem>()
      .curve(d3.curveLinearClosed)
      .radius(() => 0)
      .angle((d, i) => i * angleSlice);

    // Draw the skill data polygon
    const polygon = g.append('path')
      .datum(data)
      .attr('class', 'radar-polygon')
      .attr('d', collapsedLine)
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr('d', radarLine);

    // Draw coordinate dots on vertices
    const dots = g.selectAll('.radar-node-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'radar-node-point')
      .attr('r', 0)
      .attr('cx', (d, i) => rScale(d.score) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.score) * Math.sin(angleSlice * i - Math.PI / 2))
      .on('mouseenter', (event: MouseEvent, d: SkillItem) => {
        d3.select(event.currentTarget as SVGElement).classed('active', true);
        this.hoveredSkill = d;
        this.cdr.markForCheck();
      })
      .on('mouseleave', (event: MouseEvent) => {
        d3.select(event.currentTarget as SVGElement).classed('active', false);
      })
      .on('click', (event: MouseEvent, d: SkillItem) => {
        this.hoveredSkill = d;
        this.cdr.markForCheck();
      });

    dots.transition()
      .duration(750)
      .delay((d, i) => 200 + i * 40)
      .ease(d3.easeBackOut.overshoot(1.5))
      .attr('r', 5);
  }

  // ==========================================
  // D3 HORIZONTAL BAR CHART IMPLEMENTATION
  // ==========================================
  private renderBarChart(container: HTMLElement, data: SkillItem[]): void {
    // Sort descending by score
    const sorted = [...data].sort((a, b) => b.score - a.score);

    const margin = { top: 20, right: 60, bottom: 25, left: 160 };
    const width = 640;
    const barHeight = 36;
    const height = sorted.length * barHeight + margin.top + margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'Bar Chart of Skills');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(sorted.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.35);

    // Background track bars
    g.selectAll('.bar-bg-rect')
      .data(sorted)
      .enter()
      .append('rect')
      .attr('class', 'bar-bg-rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.name) || 0)
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth());

    // Animated fill bars
    const bars = g.selectAll('.bar-rect')
      .data(sorted)
      .enter()
      .append('rect')
      .attr('class', 'bar-rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.name) || 0)
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .on('mouseenter', (event: MouseEvent, d: SkillItem) => {
        d3.select(event.currentTarget as SVGElement).classed('active', true);
        this.hoveredSkill = d;
        this.cdr.markForCheck();
      })
      .on('mouseleave', (event: MouseEvent) => {
        d3.select(event.currentTarget as SVGElement).classed('active', false);
      })
      .on('click', (event: MouseEvent, d: SkillItem) => {
        this.hoveredSkill = d;
        this.cdr.markForCheck();
      });

    bars.transition()
      .duration(700)
      .delay((d, i) => i * 45)
      .ease(d3.easeCubicOut)
      .attr('width', d => xScale(d.score));

    // Category / Skill Name labels (left)
    g.selectAll('.bar-label')
      .data(sorted)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', -12)
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(d => d.name)
      .on('mouseenter', (event, d) => {
        this.hoveredSkill = d;
        this.cdr.markForCheck();
      });

    // Score percentage labels (right of bar)
    g.selectAll('.bar-value-label')
      .data(sorted)
      .enter()
      .append('text')
      .attr('class', 'bar-value-label')
      .attr('x', d => xScale(d.score) + 8)
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('opacity', 0)
      .text(d => `${d.score}%`)
      .transition()
      .duration(700)
      .delay((d, i) => 200 + i * 45)
      .attr('opacity', 1);
  }
}
