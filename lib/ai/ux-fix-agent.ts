/**
 * UX Fix Recommendation Agent — Fly2Any
 * Turns user pain into shipped improvements.
 */

import { generateEventId } from './data-schema';
import { type UXIssue, type UXSignal, getPrioritizedIssues } from './ux-intelligence';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type IssueType = 'ui_bug' | 'ux_friction' | 'copy_confusion' | 'performance' | 'api_mismatch' | 'trust_blocker';
export type FixSafety = 'safe' | 'moderate' | 'risky';

export interface FixRecommendation {
  fix_id: string;
  issue_id: string;
  title: string;
  severity: 1 | 2 | 3 | 4 | 5;
  issue_type: IssueType;
  impact: { revenue: number; trust: number; conversion: number; ux: number };
  affected: { pages: string[]; components: string[] };
  root_cause: { why: string; when: string; who_impacted: string };
  recommended_fix: {
    type: 'ux_adjustment' | 'ui_change' | 'copy_tweak' | 'logic_fix' | 'performance';
    description: string;
    effort: 'small' | 'medium' | 'large';
    safety: FixSafety;
  };
  code_guidance: {
    files: string[];
    components: string[];
    snippet?: string;
    design_tokens?: string[];
  };
  expected_result: {
    conversion_uplift: string;
    dropoff_reduction: string;
    ux_improvement: string;
  };
  feature_flag?: string;
  created_at: number;
  status: 'proposed' | 'approved' | 'in_progress' | 'shipped' | 'rejected';
}

export interface PRRecommendation {
  pr_id: string;
  fix_id: string;
  title: string;
  branch_name: string;
  files_changed: string[];
  description: string;
  test_plan: string[];
  rollback_plan: string;
  created_at: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  recommendations: [] as FixRecommendation[],
  prs: [] as PRRecommendation[],
};

// ═══════════════════════════════════════════════════════════════════════════
// FIX GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze issue and generate fix recommendation
 */
export function generateFixRecommendation(issue: UXIssue): FixRecommendation {
  const issueType = classifyIssueType(issue);
  const rootCause = analyzeRootCause(issue);
  const fix = determineFix(issue, issueType);
  const codeGuidance = generateCodeGuidance(issue, fix);
  const expected = estimateResults(issue, fix);

  const recommendation: FixRecommendation = {
    fix_id: generateEventId(),
    issue_id: issue.issue_id,
    title: generateFixTitle(issue, fix),
    severity: Math.round(issue.severity_avg) as 1 | 2 | 3 | 4 | 5,
    issue_type: issueType,
    impact: {
      revenue: issue.revenue_impact,
      trust: issue.trust_risk,
      conversion: issue.frequency * issue.severity_avg,
      ux: issue.severity_avg * 20,
    },
    affected: { pages: [issue.page], components: issue.component ? [issue.component] : [] },
    root_cause: rootCause,
    recommended_fix: fix,
    code_guidance: codeGuidance,
    expected_result: expected,
    feature_flag: fix.safety === 'risky' ? `ff_fix_${issue.issue_id.slice(-8)}` : undefined,
    created_at: Date.now(),
    status: 'proposed',
  };

  state.recommendations.unshift(recommendation);
  if (state.recommendations.length > 100) state.recommendations = state.recommendations.slice(0, 100);

  return recommendation;
}

function classifyIssueType(issue: UXIssue): IssueType {
  if (issue.category === 'error') {
    if (issue.description.includes('api') || issue.description.includes('API')) return 'api_mismatch';
    if (issue.description.includes('slow') || issue.description.includes('latency')) return 'performance';
    return 'ui_bug';
  }
  if (issue.category === 'confusion') return 'copy_confusion';
  if (issue.category === 'trust_concern') return 'trust_blocker';
  if (issue.category === 'friction') return 'ux_friction';
  return 'ux_friction';
}

function analyzeRootCause(issue: UXIssue): FixRecommendation['root_cause'] {
  const causes: Record<string, { why: string; when: string; who: string }> = {
    ui_bug: {
      why: 'Component rendering or interaction error',
      when: 'During user interaction with affected element',
      who: 'All users encountering this component',
    },
    ux_friction: {
      why: 'User flow creates unnecessary steps or confusion',
      when: 'At specific funnel step',
      who: 'Users attempting to complete this action',
    },
    copy_confusion: {
      why: 'Text or labels unclear or misleading',
      when: 'When user reads or interprets content',
      who: 'Users unfamiliar with terminology',
    },
    performance: {
      why: 'Slow response time or heavy computation',
      when: 'During page load or data fetch',
      who: 'Users on slower connections or devices',
    },
    api_mismatch: {
      why: 'Backend response does not match frontend expectations',
      when: 'During data fetch or form submission',
      who: 'Users triggering affected API calls',
    },
    trust_blocker: {
      why: 'User perceives risk or uncertainty',
      when: 'At decision points (payment, booking)',
      who: 'Price-sensitive or first-time users',
    },
  };

  const type = classifyIssueType(issue);
  return {
    why: issue.root_cause || causes[type].why,
    when: causes[type].when,
    who_impacted: causes[type].who,
  };
}

function determineFix(issue: UXIssue, type: IssueType): FixRecommendation['recommended_fix'] {
  const fixes: Record<IssueType, FixRecommendation['recommended_fix']> = {
    ui_bug: {
      type: 'ui_change',
      description: 'Fix component rendering or interaction handler',
      effort: 'small',
      safety: 'safe',
    },
    ux_friction: {
      type: 'ux_adjustment',
      description: 'Simplify user flow, reduce steps, improve feedback',
      effort: 'medium',
      safety: 'moderate',
    },
    copy_confusion: {
      type: 'copy_tweak',
      description: 'Rewrite unclear text, add tooltips or help text',
      effort: 'small',
      safety: 'safe',
    },
    performance: {
      type: 'performance',
      description: 'Optimize loading, add caching, lazy load components',
      effort: 'medium',
      safety: 'moderate',
    },
    api_mismatch: {
      type: 'logic_fix',
      description: 'Align frontend expectations with API response structure',
      effort: 'medium',
      safety: 'moderate',
    },
    trust_blocker: {
      type: 'ux_adjustment',
      description: 'Add trust signals, clarify pricing, show guarantees',
      effort: 'small',
      safety: 'safe',
    },
  };

  return issue.recommended_fix
    ? { ...fixes[type], description: issue.recommended_fix }
    : fixes[type];
}

function generateCodeGuidance(issue: UXIssue, fix: FixRecommendation['recommended_fix']): FixRecommendation['code_guidance'] {
  const page = issue.page.replace(/\//g, '-').replace(/^-/, '');
  const component = issue.component || 'Unknown';

  const guidance: FixRecommendation['code_guidance'] = {
    files: [`app/${page}/page.tsx`],
    components: [component],
    design_tokens: ['--fly2any-red', '--layer-1', '--shadow-md'],
  };

  // Generate snippet based on fix type
  switch (fix.type) {
    case 'copy_tweak':
      guidance.snippet = `// Update unclear text\n<p className="text-sm text-gray-600">\n  {/* Clearer explanation here */}\n</p>`;
      break;
    case 'ui_change':
      guidance.snippet = `// Add loading state\n{isLoading ? <Spinner /> : <Content />}`;
      guidance.files.push(`components/${component}.tsx`);
      break;
    case 'ux_adjustment':
      guidance.snippet = `// Add visual feedback\n<button disabled={!isValid} className="...">\n  {submitting ? 'Processing...' : 'Continue'}\n</button>`;
      break;
    case 'performance':
      guidance.snippet = `// Lazy load component\nconst Component = dynamic(() => import('./Component'), { loading: () => <Skeleton /> })`;
      break;
  }

  return guidance;
}

function estimateResults(issue: UXIssue, fix: FixRecommendation['recommended_fix']): FixRecommendation['expected_result'] {
  const base = issue.severity_avg;
  return {
    conversion_uplift: issue.expected_uplift || `${(base * 0.5).toFixed(1)}-${(base * 1.5).toFixed(1)}%`,
    dropoff_reduction: `${(base * 2).toFixed(0)}-${(base * 4).toFixed(0)}%`,
    ux_improvement: fix.safety === 'safe' ? 'High confidence' : 'Medium confidence',
  };
}

function generateFixTitle(issue: UXIssue, fix: FixRecommendation['recommended_fix']): string {
  const action = {
    copy_tweak: 'Improve',
    ui_change: 'Fix',
    ux_adjustment: 'Optimize',
    logic_fix: 'Correct',
    performance: 'Speed up',
  }[fix.type];

  return `${action} ${issue.component || issue.page} - ${issue.description.slice(0, 50)}`;
}

/**
 * Generate PR recommendation from fix
 */
export function generatePRRecommendation(fix: FixRecommendation): PRRecommendation {
  const pr: PRRecommendation = {
    pr_id: generateEventId(),
    fix_id: fix.fix_id,
    title: `fix: ${fix.title}`,
    branch_name: `fix/${fix.fix_id.slice(-12)}`,
    files_changed: fix.code_guidance.files,
    description: `## Summary\n${fix.recommended_fix.description}\n\n## Root Cause\n${fix.root_cause.why}\n\n## Expected Impact\n- Conversion: ${fix.expected_result.conversion_uplift}\n- Drop-off: ${fix.expected_result.dropoff_reduction}`,
    test_plan: [
      'Verify fix resolves the reported issue',
      'Test on mobile and desktop',
      'Check no regressions in related flows',
      fix.feature_flag ? `Test with feature flag enabled/disabled` : 'N/A',
    ],
    rollback_plan: fix.feature_flag
      ? `Disable feature flag: ${fix.feature_flag}`
      : 'Revert commit and redeploy',
    created_at: Date.now(),
  };

  state.prs.unshift(pr);
  return pr;
}

/**
 * Auto-generate fixes for top issues
 */
export function autoGenerateFixes(limit = 5): FixRecommendation[] {
  const issues = getPrioritizedIssues(limit);
  return issues.map(issue => generateFixRecommendation(issue));
}

// ═══════════════════════════════════════════════════════════════════════════
// RETRIEVAL
// ═══════════════════════════════════════════════════════════════════════════

export function getRecommendations(status?: FixRecommendation['status'], limit = 20): FixRecommendation[] {
  const filtered = status
    ? state.recommendations.filter(r => r.status === status)
    : state.recommendations;
  return filtered.slice(0, limit);
}

export function getPRRecommendations(limit = 10): PRRecommendation[] {
  return state.prs.slice(0, limit);
}

export function updateFixStatus(fixId: string, status: FixRecommendation['status']): boolean {
  const fix = state.recommendations.find(r => r.fix_id === fixId);
  if (fix) {
    fix.status = status;
    return true;
  }
  return false;
}
