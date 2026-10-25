import { BlogPost } from './blog.model';

export const BASELINE_POSTS: BlogPost[] = [
  {
    id: 'post-dotnet8-enterprise',
    tenantId: 'default',
    title: 'Architecting High-Throughput Clinical Trial Systems with .NET 8, C#, and Azure',
    description: 'A deep dive into distributed systems engineering for enterprise healthcare: CQRS with MediatR, event-driven messaging on Azure Service Bus, and resilient data partitioning.',
    body: `## Architectural Overview

Building mission-critical enterprise systems in regulated healthcare and clinical trials demands uncompromising reliability, strict auditing, and sub-second query latency across millions of subject records. In this article, I examine the architecture we developed utilizing .NET 8, C#, MediatR CQRS, and Microsoft Azure cloud primitives.

### The Challenge: High-Concurrence Data Capture

Clinical research databases ingest real-time laboratory panels, vitals telemetry, and regulatory adverse event reports from global study sites. The architectural requirements mandated:
1. Zero data loss during regional cloud network partitions.
2. Complete audit traceability complying with 21 CFR Part 11 and HIPAA.
3. Sub-200ms p99 response times for site investigators submitting subject visits.

\`\`\`csharp
public class RecordSubjectVisitCommand : IRequest<Result<Guid>>
{
    public Guid StudyId { get; init; }
    public Guid SubjectId { get; init; }
    public DateTime VisitDate { get; init; }
    public Dictionary<string, decimal> Biomarkers { get; init; } = new();
}
\`\`\`

### CQRS and Pipeline Behaviors with MediatR

To decouple write mutations from analytical queries, we instituted Command Query Responsibility Segregation (CQRS). Each incoming command passes through an immutable pipeline of validation, security authorization, and structured audit telemetry:

\`\`\`csharp
public class AuditLoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IAuditLogger _auditLogger;
    private readonly ICurrentUserService _currentUser;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var correlationId = Guid.NewGuid();
        var startTime = Stopwatch.GetTimestamp();

        var response = await next();

        var elapsed = Stopwatch.GetElapsedTime(startTime);
        await _auditLogger.RecordAsync(new AuditEntry(
            CorrelationId: correlationId,
            User: _currentUser.UserId,
            Command: typeof(TRequest).Name,
            DurationMs: elapsed.TotalMilliseconds,
            Timestamp: DateTime.UtcNow
        ), ct);

        return response;
    }
}
\`\`\`

### Asynchronous Event Ingestion via Azure Service Bus

Instead of direct synchronous database writes from client devices, mutations are enqueued onto Azure Service Bus topics partitioned by StudyId. Worker microservices consume from duplicate-detection-enabled subscriptions, ensuring idempotent processing even under network retry storms.

### Optimistic Concurrency and Read Replicas

For read-heavy dashboards (study monitoring, enrollment curves), queries are dispatched to read-only replicas using Entity Framework Core's \`AsNoTrackingWithIdentityResolution()\`. Optimistic concurrency tokens (\`RowVersion\` / \`xmin\`) prevent race conditions during concurrent coordinator reviews.

### Conclusion

By combining .NET 8's native AOT capabilities, clean architectural boundaries via CQRS, and resilient cloud queueing on Azure, enterprise SaaS platforms achieve both statutory compliance and blistering performance.`,
    content: `## Architectural Overview

Building mission-critical enterprise systems in regulated healthcare and clinical trials demands uncompromising reliability, strict auditing, and sub-second query latency across millions of subject records. In this article, I examine the architecture we developed utilizing .NET 8, C#, MediatR CQRS, and Microsoft Azure cloud primitives.

### The Challenge: High-Concurrence Data Capture

Clinical research databases ingest real-time laboratory panels, vitals telemetry, and regulatory adverse event reports from global study sites. The architectural requirements mandated:
1. Zero data loss during regional cloud network partitions.
2. Complete audit traceability complying with 21 CFR Part 11 and HIPAA.
3. Sub-200ms p99 response times for site investigators submitting subject visits.

\`\`\`csharp
public class RecordSubjectVisitCommand : IRequest<Result<Guid>>
{
    public Guid StudyId { get; init; }
    public Guid SubjectId { get; init; }
    public DateTime VisitDate { get; init; }
    public Dictionary<string, decimal> Biomarkers { get; init; } = new();
}
\`\`\`

### CQRS and Pipeline Behaviors with MediatR

To decouple write mutations from analytical queries, we instituted Command Query Responsibility Segregation (CQRS). Each incoming command passes through an immutable pipeline of validation, security authorization, and structured audit telemetry:

\`\`\`csharp
public class AuditLoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IAuditLogger _auditLogger;
    private readonly ICurrentUserService _currentUser;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var correlationId = Guid.NewGuid();
        var startTime = Stopwatch.GetTimestamp();

        var response = await next();

        var elapsed = Stopwatch.GetElapsedTime(startTime);
        await _auditLogger.RecordAsync(new AuditEntry(
            CorrelationId: correlationId,
            User: _currentUser.UserId,
            Command: typeof(TRequest).Name,
            DurationMs: elapsed.TotalMilliseconds,
            Timestamp: DateTime.UtcNow
        ), ct);

        return response;
    }
}
\`\`\`

### Asynchronous Event Ingestion via Azure Service Bus

Instead of direct synchronous database writes from client devices, mutations are enqueued onto Azure Service Bus topics partitioned by StudyId. Worker microservices consume from duplicate-detection-enabled subscriptions, ensuring idempotent processing even under network retry storms.

### Optimistic Concurrency and Read Replicas

For read-heavy dashboards (study monitoring, enrollment curves), queries are dispatched to read-only replicas using Entity Framework Core's \`AsNoTrackingWithIdentityResolution()\`. Optimistic concurrency tokens (\`RowVersion\` / \`xmin\`) prevent race conditions during concurrent coordinator reviews.

### Conclusion

By combining .NET 8's native AOT capabilities, clean architectural boundaries via CQRS, and resilient cloud queueing on Azure, enterprise SaaS platforms achieve both statutory compliance and blistering performance.`,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    status: 'public',
    showAds: true,
    upvotesCount: 24,
    downvotesCount: 1,
    score: 23,
    commentsCount: 3,
    authorId: 'author-bhakti',
    authorName: 'Bhakti Pokhrel',
    authorEmail: 'bhaktipokhrel2004@gmail.com',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
    sourceLinks: [
      { title: 'Microsoft Learn: CQRS Pattern', url: 'https://learn.microsoft.com/azure/architecture/patterns/cqrs' },
      { title: 'MediatR Documentation', url: 'https://github.com/jbogard/MediatR' }
    ],
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/bhaktipokhrel' }
    ]
  },
  {
    id: 'post-angular-zoneless-signals',
    tenantId: 'default',
    title: 'Modern Angular in Enterprise: Zoneless Change Detection and Reactive Signals',
    description: 'Examining the performance paradigms of Angular 18+ signals, computed dependency graphs, and migrating large multi-tenant financial data grids away from Zone.js.',
    body: `## The Evolution of Angular Reactivity

For over a decade, Angular relied on \`zone.js\` to monkey-patch asynchronous browser APIs (\`setTimeout\`, \`fetch\`, DOM events) and trigger top-down dirty checking across the entire component tree. In large enterprise single-page applications rendering thousands of dynamic table rows, this global cycle introduced micro-stutters and non-deterministic overhead.

### Why Signals Change Everything

Angular Signals introduce fine-grained reactive primitives. Instead of guessing when state changes, Angular tracks an explicit Directed Acyclic Graph (DAG) of dependencies:

\`\`\`typescript
@Component({
  selector: 'app-subject-metrics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="metrics-card">
      <h3>Active Cohort: {{ cohortName() }}</h3>
      <p>Completion Rate: {{ completionRate() | percent:'1.1-2' }}</p>
      <span [class.alert]="isThresholdExceeded()">
        Threshold Status: {{ isThresholdExceeded() ? 'Critical' : 'Normal' }}
      </span>
    </div>
  \`
})
export class SubjectMetricsComponent {
  readonly cohortName = input.required<string>();
  readonly completedVisits = signal<number>(142);
  readonly totalTargetVisits = signal<number>(150);

  // Computed signal re-evaluates strictly when inputs change
  readonly completionRate = computed(() => {
    const total = this.totalTargetVisits();
    return total > 0 ? this.completedVisits() / total : 0;
  });

  readonly isThresholdExceeded = computed(() => this.completionRate() < 0.85);
}
\`\`\`

### Migrating to Zoneless Performance

By bootstrapping without \`provideZoneChangeDetection()\` and using \`provideExperimentalZonelessChangeDetection()\`, the JavaScript bundle shrinks by over 30KB minified, and change detection CPU execution drops by up to 80% during rapid websocket streams.

### Key Architectural Guidelines
1. **Purity in Signals**: Never mutate signals in place; use \`.set()\` or \`.update()\` with pure reducer functions.
2. **OnPush Everywhere**: Enforce \`ChangeDetectionStrategy.OnPush\` across all shared and domain components.
3. **Template Declarations**: Leverage modern native control flow (\`@if\`, \`@for\`, \`@defer\`) to enable lazy hydration and smart code splitting.`,
    content: `## The Evolution of Angular Reactivity

For over a decade, Angular relied on \`zone.js\` to monkey-patch asynchronous browser APIs (\`setTimeout\`, \`fetch\`, DOM events) and trigger top-down dirty checking across the entire component tree. In large enterprise single-page applications rendering thousands of dynamic table rows, this global cycle introduced micro-stutters and non-deterministic overhead.

### Why Signals Change Everything

Angular Signals introduce fine-grained reactive primitives. Instead of guessing when state changes, Angular tracks an explicit Directed Acyclic Graph (DAG) of dependencies:

\`\`\`typescript
@Component({
  selector: 'app-subject-metrics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="metrics-card">
      <h3>Active Cohort: {{ cohortName() }}</h3>
      <p>Completion Rate: {{ completionRate() | percent:'1.1-2' }}</p>
      <span [class.alert]="isThresholdExceeded()">
        Threshold Status: {{ isThresholdExceeded() ? 'Critical' : 'Normal' }}
      </span>
    </div>
  \`
})
export class SubjectMetricsComponent {
  readonly cohortName = input.required<string>();
  readonly completedVisits = signal<number>(142);
  readonly totalTargetVisits = signal<number>(150);

  // Computed signal re-evaluates strictly when inputs change
  readonly completionRate = computed(() => {
    const total = this.totalTargetVisits();
    return total > 0 ? this.completedVisits() / total : 0;
  });

  readonly isThresholdExceeded = computed(() => this.completionRate() < 0.85);
}
\`\`\`

### Migrating to Zoneless Performance

By bootstrapping without \`provideZoneChangeDetection()\` and using \`provideExperimentalZonelessChangeDetection()\`, the JavaScript bundle shrinks by over 30KB minified, and change detection CPU execution drops by up to 80% during rapid websocket streams.

### Key Architectural Guidelines
1. **Purity in Signals**: Never mutate signals in place; use \`.set()\` or \`.update()\` with pure reducer functions.
2. **OnPush Everywhere**: Enforce \`ChangeDetectionStrategy.OnPush\` across all shared and domain components.
3. **Template Declarations**: Leverage modern native control flow (\`@if\`, \`@for\`, \`@defer\`) to enable lazy hydration and smart code splitting.`,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    status: 'public',
    showAds: true,
    upvotesCount: 38,
    downvotesCount: 2,
    score: 36,
    commentsCount: 5,
    authorId: 'author-bhakti',
    authorName: 'Bhakti Pokhrel',
    authorEmail: 'bhaktipokhrel2004@gmail.com',
    createdAt: '2026-09-22T14:30:00.000Z',
    updatedAt: '2026-09-22T14:30:00.000Z',
    sourceLinks: [
      { title: 'Angular Signals Official Guide', url: 'https://angular.dev/guide/signals' }
    ],
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/bhaktipokhrel' }
    ]
  },
  {
    id: 'post-sqlserver-indexing-saas',
    tenantId: 'default',
    title: 'High-Performance SQL Server Indexing & Query Tuning for Multi-Tenant SaaS',
    description: 'Practical execution plan optimization, covering indexes, parameter sniffing mitigation, and partition switching for multi-million row relational databases.',
    body: `## Relational Databases at Scale

In multi-tenant SaaS applications, relational databases like Microsoft SQL Server frequently serve as the foundational source of truth. As data volumes scale past tens of millions of rows, naive LINQ expressions and unindexed foreign keys degrade throughput.

### 1. The Power of Covering Indexes (INCLUDE Clauses)

A clustered index determines the physical order of data on disk. When queries select multiple columns that are not part of the search predicate, the query engine incurs costly \`Key Lookup\` operators.

\`\`\`sql
-- Inefficient: Causes Key Lookup for every matching PatientId
CREATE NONCLUSTERED INDEX IX_Visits_Subject ON Visits (SubjectId);

-- Optimized: Covering Index with included columns satisfies query directly from index pages
CREATE NONCLUSTERED INDEX IX_Visits_Subject_Covering 
ON Visits (SubjectId, VisitDate)
INCLUDE (VisitStatus, InvestigatorNotes, BloodPressureSystolic, BloodPressureDiastolic);
\`\`\`

By appending frequently projected non-key attributes to the \`INCLUDE\` clause, the SQL Server query optimizer reads exclusively from the leaf level of the nonclustered index without touching the base table, reducing logical reads by up to 95%.

### 2. Eliminating Parameter Sniffing in Stored Procedures

When stored procedures compile, SQL Server caches an execution plan optimized for the parameter values passed during initial execution. If the initial parameter targets an atypical tenant with 5 rows while subsequent calls target a tenant with 2,000,000 rows, severe plan sub-optimality occurs.

\`\`\`sql
-- Solution: Optimize for typical or unknown distribution, or force recompile on dynamic predicates
CREATE OR ALTER PROCEDURE dbo.GetTenantTelemetry
    @TenantId INT,
    @StartDate DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MetricId, Timestamp, MetricValue
    FROM dbo.TelemetryLogs WITH (READCOMMITTEDLOCK)
    WHERE TenantId = @TenantId
      AND Timestamp >= @StartDate
    OPTION (OPTIMIZE FOR (@TenantId UNKNOWN));
END;
\`\`\`

### 3. Partition Switching for Fast Archival

Rather than executing slow, transactional \`DELETE FROM LargeTable WHERE CreatedAt < @Threshold\` which bloats transaction logs and causes lock escalation, we leverage table partitioning and partition switching:
1. Create an identical empty staging table.
2. Issue \`ALTER TABLE Source SWITCH PARTITION 1 TO StagingTable\`.
3. Drop or truncate the staging table in metadata in under 5 milliseconds.

### Conclusion

Relational database tuning in high-throughput environments requires disciplined index architecture, continuous index fragmentation maintenance, and deep profiling using Extended Events and Query Store.`,
    content: `## Relational Databases at Scale

In multi-tenant SaaS applications, relational databases like Microsoft SQL Server frequently serve as the foundational source of truth. As data volumes scale past tens of millions of rows, naive LINQ expressions and unindexed foreign keys degrade throughput.

### 1. The Power of Covering Indexes (INCLUDE Clauses)

A clustered index determines the physical order of data on disk. When queries select multiple columns that are not part of the search predicate, the query engine incurs costly \`Key Lookup\` operators.

\`\`\`sql
-- Inefficient: Causes Key Lookup for every matching PatientId
CREATE NONCLUSTERED INDEX IX_Visits_Subject ON Visits (SubjectId);

-- Optimized: Covering Index with included columns satisfies query directly from index pages
CREATE NONCLUSTERED INDEX IX_Visits_Subject_Covering 
ON Visits (SubjectId, VisitDate)
INCLUDE (VisitStatus, InvestigatorNotes, BloodPressureSystolic, BloodPressureDiastolic);
\`\`\`

By appending frequently projected non-key attributes to the \`INCLUDE\` clause, the SQL Server query optimizer reads exclusively from the leaf level of the nonclustered index without touching the base table, reducing logical reads by up to 95%.

### 2. Eliminating Parameter Sniffing in Stored Procedures

When stored procedures compile, SQL Server caches an execution plan optimized for the parameter values passed during initial execution. If the initial parameter targets an atypical tenant with 5 rows while subsequent calls target a tenant with 2,000,000 rows, severe plan sub-optimality occurs.

\`\`\`sql
-- Solution: Optimize for typical or unknown distribution, or force recompile on dynamic predicates
CREATE OR ALTER PROCEDURE dbo.GetTenantTelemetry
    @TenantId INT,
    @StartDate DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MetricId, Timestamp, MetricValue
    FROM dbo.TelemetryLogs WITH (READCOMMITTEDLOCK)
    WHERE TenantId = @TenantId
      AND Timestamp >= @StartDate
    OPTION (OPTIMIZE FOR (@TenantId UNKNOWN));
END;
\`\`\`

### 3. Partition Switching for Fast Archival

Rather than executing slow, transactional \`DELETE FROM LargeTable WHERE CreatedAt < @Threshold\` which bloats transaction logs and causes lock escalation, we leverage table partitioning and partition switching:
1. Create an identical empty staging table.
2. Issue \`ALTER TABLE Source SWITCH PARTITION 1 TO StagingTable\`.
3. Drop or truncate the staging table in metadata in under 5 milliseconds.

### Conclusion

Relational database tuning in high-throughput environments requires disciplined index architecture, continuous index fragmentation maintenance, and deep profiling using Extended Events and Query Store.`,
    imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
    status: 'public',
    showAds: true,
    upvotesCount: 19,
    downvotesCount: 0,
    score: 19,
    commentsCount: 2,
    authorId: 'author-bhakti',
    authorName: 'Bhakti Pokhrel',
    authorEmail: 'bhaktipokhrel2004@gmail.com',
    createdAt: '2026-09-29T16:00:00.000Z',
    updatedAt: '2026-09-29T16:00:00.000Z',
    sourceLinks: [
      { title: 'Microsoft Docs: SQL Server Index Architecture', url: 'https://learn.microsoft.com/sql/relational-databases/sql-server-index-design-guide' }
    ],
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/bhaktipokhrel' }
    ]
  }
];

export const BASELINE_COMMENTS: Record<string, import('./blog.model').ArticleComment[]> = {
  'post-dotnet8-enterprise': [
    {
      id: 'comm-101',
      postId: 'post-dotnet8-enterprise',
      authorId: 'usr-sarah-m',
      authorName: 'Sarah Miller',
      content: 'Fantastic breakdown of CQRS with MediatR. How do you handle distributed transactions across multiple bounded contexts when Azure Service Bus delivers commands out of order?',
      createdAt: '2026-09-16T14:22:00.000Z'
    },
    {
      id: 'comm-102',
      postId: 'post-dotnet8-enterprise',
      authorId: 'author-bhakti',
      authorName: 'Bhakti Pokhrel',
      content: 'Great question Sarah! We use Azure Service Bus Sessions partitioned by AggregateId (e.g., StudyId or PatientId) to guarantee FIFO ordering per stream, paired with idempotency tokens in our command handlers.',
      createdAt: '2026-09-16T16:05:00.000Z'
    },
    {
      id: 'comm-103',
      postId: 'post-dotnet8-enterprise',
      authorId: 'usr-marcus-k',
      authorName: 'Marcus Krause',
      content: 'The 21 CFR Part 11 audit logging behavior is such a clean pattern. MediatR pipeline behaviors make cross-cutting compliance concerns so maintainable.',
      createdAt: '2026-09-17T09:12:00.000Z'
    }
  ],
  'post-angular-zoneless-signals': [
    {
      id: 'comm-201',
      postId: 'post-angular-zoneless-signals',
      authorId: 'usr-david-chen',
      authorName: 'David Chen',
      content: 'Zoneless change detection combined with signal graphs made a night-and-day difference in our data grid latency. Truly the future of enterprise Angular.',
      createdAt: '2026-09-23T11:40:00.000Z'
    },
    {
      id: 'comm-202',
      postId: 'post-angular-zoneless-signals',
      authorId: 'usr-elena-v',
      authorName: 'Elena Vasquez',
      content: 'Did you notice any quirks when interfacing with third-party libraries that rely on zone.js event dispatching?',
      createdAt: '2026-09-24T08:15:00.000Z'
    }
  ],
  'post-sqlserver-indexing-saas': [
    {
      id: 'comm-301',
      postId: 'post-sqlserver-indexing-saas',
      authorId: 'usr-raj-patel',
      authorName: 'Raj Patel',
      content: 'Covering indexes with INCLUDE are so often overlooked! We cut our production logical reads in half just by applying this to our heaviest patient search queries.',
      createdAt: '2026-09-30T10:14:00.000Z'
    }
  ]
};
