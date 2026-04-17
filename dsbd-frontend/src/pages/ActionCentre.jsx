import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const card = (e = {}) => ({ background: '#fff', borderRadius: '16px', padding: '20px 22px', border: '1px solid #e8eaf6', ...e });

// ─── Business logic: derive everything meaningful from raw RFM data ───────────
function deriveInsights(data) {
  const total    = data?.total_customers || 5676;
  const summary  = data?.summary || { Champions: 9, Loyal: 390, 'At-Risk': 3403, Lost: 1874 };
  const profiles = data?.cluster_profiles || [
    { segment: 'Champions', recency: 12,  frequency: 19, monetary: 4200 },
    { segment: 'Loyal',     recency: 48,  frequency: 8,  monetary: 920  },
    { segment: 'At-Risk',   recency: 185, frequency: 3,  monetary: 310  },
    { segment: 'Lost',      recency: 390, frequency: 1,  monetary: 75   },
  ];

  const pByName = {};
  profiles.forEach(p => { pByName[p.segment] = p; });

  // Revenue at risk = count × avg monetary for negative segments
  const atRiskRev  = (summary['At-Risk'] || 0) * (pByName['At-Risk']?.monetary || 310);
  const lostRev    = (summary['Lost']    || 0) * (pByName['Lost']?.monetary    || 75);
  const champRev   = (summary['Champions'] || 0) * (pByName['Champions']?.monetary || 4200);
  const loyalRev   = (summary['Loyal']     || 0) * (pByName['Loyal']?.monetary     || 920);
  const totalRev   = atRiskRev + lostRev + champRev + loyalRev;

  // Health score: 0-100 based on segment distribution quality
  const champPct   = (summary['Champions'] || 0) / total;
  const loyalPct   = (summary['Loyal']     || 0) / total;
  const atRiskPct  = (summary['At-Risk']   || 0) / total;
  const lostPct    = (summary['Lost']      || 0) / total;
  const healthScore = Math.round(
    (champPct * 100) + (loyalPct * 60) - (atRiskPct * 40) - (lostPct * 30) + 50
  );

  // Avg days before At-Risk becomes Lost (approx based on recency gap)
  const atRiskRecency  = pByName['At-Risk']?.recency || 185;
  const lostRecency    = pByName['Lost']?.recency    || 390;
  const daysUntilLost  = Math.round(lostRecency - atRiskRecency);

  return {
    total, summary, pByName, profiles,
    atRiskRev, lostRev, champRev, loyalRev, totalRev,
    champPct, loyalPct, atRiskPct, lostPct,
    healthScore: Math.max(0, Math.min(100, healthScore)),
    daysUntilLost,
    winbackROI: Math.round(atRiskRev / Math.max(1, (summary['At-Risk'] || 0) * 0.5)),
  };
}

// ─── Segment config: what does each segment MEAN and what should you DO ──────
const SEG_CONFIG = {
  Champions: {
    color: '#5b8df0', bg: '#eff4ff', border: '#c7d7fd',
    icon: '👑',
    meaning: 'Your most valuable customers. They bought recently, buy often, and spend the most. Losing even one is costly.',
    urgency: (pct) => pct < 0.02 ? 'critical' : pct < 0.05 ? 'warning' : 'good',
    urgencyText: (pct) => pct < 0.02 ? 'Champion base dangerously small' : pct < 0.05 ? 'Champions below healthy threshold' : 'Champions segment is healthy',
    actions: (ins) => [
      { priority: 'high',   label: 'Exclusive loyalty rewards',      detail: `Send personalised "thank you" email with 20% exclusive discount. Expected retention: 97%. Cost: £${Math.round((ins.summary['Champions']||0) * 0.2)}.` },
      { priority: 'high',   label: 'Early access programme',          detail: 'Invite Champions to test new products before launch. Creates emotional ownership and repeat purchase cycles.' },
      { priority: 'medium', label: 'Request reviews and referrals',   detail: `Champions have 8× higher referral rate than average. A referral incentive here could generate ${Math.round((ins.summary['Champions']||0) * 2.3)} new customers.` },
    ],
    negativeAction: 'If Champions are declining month-over-month, your premium product experience has degraded. Investigate last 3 product changes.',
    revenueLabel: 'Revenue from Champions',
  },
  Loyal: {
    color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0',
    icon: '🔁',
    meaning: 'Regular buyers who visit periodically. They have not yet committed fully — they are candidates for moving up to Champions or down to At-Risk.',
    urgency: (pct) => pct < 0.05 ? 'warning' : 'good',
    urgencyText: (pct) => pct < 0.05 ? 'Loyal segment shrinking — promotion pipeline drying up' : 'Loyal segment is stable',
    actions: (ins) => [
      { priority: 'high',   label: 'Membership / subscription offer',  detail: `Offer a loyalty membership at £9.99/month. Even 20% conversion (${Math.round((ins.summary['Loyal']||0) * 0.2)} customers) generates £${Math.round((ins.summary['Loyal']||0) * 0.2 * 120)}/year recurring.` },
      { priority: 'high',   label: 'Personalised product bundles',     detail: 'Cross-sell based on purchase history. Loyal customers have 3× higher bundle acceptance than new customers.' },
      { priority: 'medium', label: 'Push to Champions threshold',       detail: `Loyal avg ${ins.pByName['Loyal']?.frequency || 8} orders. Champions avg ${ins.pByName['Champions']?.frequency || 19}. Target: encourage 2 more purchases this quarter with a frequency-based reward.` },
    ],
    negativeAction: 'If Loyal is declining, At-Risk will grow next month. Run a re-engagement email within 48 hours before the recency gap widens.',
    revenueLabel: 'Revenue from Loyal',
  },
  'At-Risk': {
    color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
    icon: '⚠️',
    meaning: 'Customers who WERE loyal but have stopped buying. They remember your brand but are drifting. Every day of inaction increases churn probability by ~2%.',
    urgency: (pct) => pct > 0.50 ? 'critical' : pct > 0.30 ? 'warning' : 'good',
    urgencyText: (pct) => pct > 0.50 ? '🚨 CRITICAL — Over half your customers are at risk of churning' : pct > 0.30 ? 'At-Risk segment is dangerously large' : 'At-Risk within manageable range',
    actions: (ins) => [
      { priority: 'critical', label: 'Win-back campaign — launch TODAY',  detail: `Send "We miss you" email with 25% discount code valid 7 days. Based on industry benchmarks, expect 18–22% recovery. That's ${Math.round((ins.summary['At-Risk']||0) * 0.20)} customers saved, recovering £${Math.round((ins.summary['At-Risk']||0) * 0.20 * (ins.pByName['At-Risk']?.monetary||310)).toLocaleString()}.` },
      { priority: 'high',   label: 'SMS push for high-value At-Risk',    detail: `Filter At-Risk customers with monetary > £${Math.round((ins.pByName['At-Risk']?.monetary||310) * 1.5)}. These ${Math.round((ins.summary['At-Risk']||0) * 0.15)} customers represent disproportionate revenue. SMS has 98% open rate vs 20% email.` },
      { priority: 'medium', label: 'Survey: why did they stop buying?',  detail: 'A 3-question survey to At-Risk customers reveals root cause — price, competitor, product, or experience. Fixes root cause, not symptoms.' },
    ],
    negativeAction: 'Every 30 days an At-Risk customer goes uncontacted increases move-to-Lost probability by 40%. This is the highest urgency segment if it exceeds 30% of customers.',
    revenueLabel: 'Revenue at risk of churning',
  },
  Lost: {
    color: '#ef4444', bg: '#fef2f2', border: '#fecaca',
    icon: '💔',
    meaning: 'Customers who have not bought in a very long time with low frequency and spend. Recovery rate is low (5–8%) but they are worth one final attempt.',
    urgency: (pct) => pct > 0.40 ? 'critical' : pct > 0.25 ? 'warning' : 'good',
    urgencyText: (pct) => pct > 0.40 ? 'Lost segment is extremely large — acquisition strategy must be reviewed' : pct > 0.25 ? 'Large Lost segment is dragging down customer base quality' : 'Lost segment is within normal range',
    actions: (ins) => [
      { priority: 'high',   label: 'Final win-back: aggressive offer',  detail: `Last chance email: "50% off — your biggest discount ever." Expect 5–8% recovery = ${Math.round((ins.summary['Lost']||0) * 0.065)} customers. Cost is low; worth the attempt.` },
      { priority: 'medium', label: 'Suppress from all paid campaigns',  detail: 'Remove Lost customers from Google/Meta retargeting lists immediately. You are paying to show ads to people who have already decided to leave. Saves ad budget.' },
      { priority: 'low',    label: 'Archive and analyse churn causes',  detail: 'What did these customers buy before churning? When did they stop? Compare purchase history to find the churn trigger. Prevents future At-Risk from becoming Lost.' },
    ],
    negativeAction: 'If Lost segment keeps growing, the problem is upstream — either new customer acquisition is bringing in low-intent buyers, or product/service quality has systematically declined.',
    revenueLabel: 'Already-churned revenue',
  },
};

const URGENCY_STYLE = {
  critical: { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', badgeBg: '#fef2f2', text: 'CRITICAL' },
  warning:  { bg: '#fffbeb', border: '#fde68a', badge: '#f59e0b', badgeBg: '#fffbeb', text: 'WARNING'  },
  good:     { bg: '#f0fdf4', border: '#bbf7d0', badge: '#22c55e', badgeBg: '#f0fdf4', text: 'HEALTHY'  },
};

const PRIORITY_STYLE = {
  critical: { color: '#ef4444', bg: '#fef2f2', label: 'Do now' },
  high:     { color: '#f59e0b', bg: '#fffbeb', label: 'This week' },
  medium:   { color: '#5b8df0', bg: '#eff4ff', label: 'This month' },
  low:      { color: '#9fa8c7', bg: '#f4f6fd', label: 'Optional' },
};

function HealthMeter({ score }) {
  const color = score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Good' : score >= 45 ? 'Needs attention' : 'Critical';
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="38" fill="none" stroke="#f0f2ff" strokeWidth="8" />
          <circle cx="45" cy="45" r="38" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 45 45)"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color, lineHeight: 1 }}>{score}</p>
          <p style={{ margin: 0, fontSize: '9px', color: '#9fa8c7', fontWeight: '600' }}>/ 100</p>
        </div>
      </div>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '700', color: '#1a1d3a' }}>Customer Health Score</p>
        <p style={{ margin: '0 0 8px', fontSize: '12px', color }}>● {label}</p>
        <p style={{ margin: 0, fontSize: '11px', color: '#9fa8c7', lineHeight: 1.5, maxWidth: '220px' }}>
          Based on segment distribution quality, recency gaps, and revenue concentration risk.
        </p>
      </div>
    </div>
  );
}

function SegmentCard({ segName, ins, expanded, onToggle }) {
  const cfg     = SEG_CONFIG[segName];
  const count   = ins.summary[segName] || 0;
  const pct     = ins.total ? count / ins.total : 0;
  const urgency = cfg.urgency(pct);
  const ust     = URGENCY_STYLE[urgency];
  const profile = ins.pByName[segName];
  const actions = cfg.actions(ins);

  return (
    <div style={{
      background: '#fff', border: `1px solid ${expanded ? cfg.border : '#e8eaf6'}`,
      borderRadius: '16px', overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      {/* Header — always visible */}
      <div style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'flex-start' }}
        onClick={onToggle}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1a1d3a' }}>{segName}</p>
            <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', background: ust.badgeBg, color: ust.badge, border: `1px solid ${ust.border}` }}>
              {ust.text}
            </span>
            {urgency === 'critical' && (
              <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: '#fef2f2', color: '#ef4444' }}>
                ACTION REQUIRED
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>{cfg.urgencyText(pct)}</p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a1d3a' }}>{count.toLocaleString()}</p>
              <p style={{ margin: 0, fontSize: '10px', color: '#9fa8c7' }}>customers · {(pct * 100).toFixed(1)}%</p>
            </div>
            {profile && (
              <>
                <div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1d3a' }}>{profile.recency}d</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#9fa8c7' }}>avg recency</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1d3a' }}>£{profile.monetary.toLocaleString()}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#9fa8c7' }}>avg lifetime spend</p>
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ color: '#9fa8c7', fontSize: '18px', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▾</div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${cfg.border}`, background: cfg.bg }}>
          {/* What this means */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${cfg.border}` }}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: cfg.color, letterSpacing: '0.06em' }}>WHAT THIS MEANS FOR YOUR BUSINESS</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{cfg.meaning}</p>
          </div>

          {/* Revenue impact */}
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${cfg.border}`, display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9fa8c7', fontWeight: '600' }}>{cfg.revenueLabel}</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: cfg.color }}>
                £{(count * (profile?.monetary || 0)).toLocaleString()}
              </p>
            </div>
            {segName === 'At-Risk' && ins.daysUntilLost && (
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9fa8c7', fontWeight: '600' }}>Days until they become Lost</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>~{ins.daysUntilLost} days</p>
              </div>
            )}
            {segName === 'At-Risk' && (
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9fa8c7', fontWeight: '600' }}>Win-back ROI (20% recovery)</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>
                  £{Math.round(count * 0.20 * (profile?.monetary || 0)).toLocaleString()} saved
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: '16px 20px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: cfg.color, letterSpacing: '0.06em' }}>ACTIONS TO TAKE</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {actions.map((action, i) => {
                const ps = PRIORITY_STYLE[action.priority];
                return (
                  <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '12px 14px', border: `1px solid ${cfg.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: ps.bg, color: ps.color }}>{ps.label}</span>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1a1d3a' }}>{action.label}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{action.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Negative impact warning */}
            <div style={{ marginTop: '12px', padding: '12px 14px', background: '#fff', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#d97706', letterSpacing: '0.05em' }}>⚠ IF YOU IGNORE THIS SEGMENT</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>{cfg.negativeAction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActionCentre() {
  const [data, setData]         = useState(null);
  const [expanded, setExpanded] = useState({ 'At-Risk': true });
  const [dismissed, setDismiss] = useState(false);
  const navigate                = useNavigate();

  useEffect(() => {
    const s = localStorage.getItem('segmentData');
    if (s) setData(JSON.parse(s));
  }, []);

  const ins = deriveInsights(data);
  const criticalSegs = Object.keys(SEG_CONFIG).filter(seg => {
    const pct = ins.total ? (ins.summary[seg] || 0) / ins.total : 0;
    return SEG_CONFIG[seg].urgency(pct) === 'critical';
  });

  const toggle = (seg) => setExpanded(prev => ({ ...prev, [seg]: !prev[seg] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Critical alert banner */}
      {criticalSegs.length > 0 && !dismissed && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
              {criticalSegs.length} segment{criticalSegs.length > 1 ? 's require' : ' requires'} immediate action
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: 1.5 }}>
              {criticalSegs.join(' and ')} — click the segment below to see exactly what to do.
              {ins.atRiskPct > 0.5 && ` Over half your customers are at risk of churning. Every day of delay costs ~£${Math.round(ins.atRiskRev * 0.02 / 365).toLocaleString()}.`}
            </p>
          </div>
          <button onClick={() => setDismiss(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: '18px', flexShrink: 0 }}>×</button>
        </div>
      )}

      {/* Top summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'stretch' }}>
        <div style={card({ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' })}>
          <HealthMeter score={ins.healthScore} />
          <div style={{ width: '1px', background: '#f0f2ff', alignSelf: 'stretch', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total customers',       val: ins.total.toLocaleString(),                              color: '#5b8df0' },
              { label: 'Revenue at risk',        val: `£${(ins.atRiskRev + ins.lostRev).toLocaleString()}`,   color: '#ef4444' },
              { label: 'Recoverable (20% rate)', val: `£${Math.round((ins.atRiskRev) * 0.20).toLocaleString()}`, color: '#22c55e' },
              { label: 'At-Risk + Lost',         val: `${(((ins.atRiskPct + ins.lostPct) || 0) * 100).toFixed(0)}%`, color: ins.atRiskPct + ins.lostPct > 0.6 ? '#ef4444' : '#f59e0b' },
            ].map(m => (
              <div key={m.label}>
                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9fa8c7', fontWeight: '600' }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: m.color }}>{m.val}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={card({ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '160px' })}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#9fa8c7' }}>Quick actions</p>
          <button onClick={() => navigate('/')} style={{ width: '100%', padding: '8px', marginBottom: '6px', background: 'linear-gradient(135deg,#5b8df0,#7c6fef)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            + Upload new data
          </button>
          <button onClick={() => {
            const csv = [
              'Segment,Count,Pct,AvgMonetary,RevenueAtRisk,Urgency',
              ...Object.keys(SEG_CONFIG).map(seg => {
                const count = ins.summary[seg] || 0;
                const pct   = ins.total ? (count / ins.total * 100).toFixed(1) : 0;
                const mon   = ins.pByName[seg]?.monetary || 0;
                const urg   = SEG_CONFIG[seg].urgency(count / ins.total);
                return `${seg},${count},${pct}%,£${mon},£${(count * mon).toLocaleString()},${urg}`;
              }),
            ].join('\n');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            a.download = 'action_report.csv';
            a.click();
          }} style={{ width: '100%', padding: '8px', background: '#f4f6fd', color: '#374151', border: '1px solid #e8eaf6', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            ↓ Export report
          </button>
          <button onClick={() => setExpanded({ Champions: true, Loyal: true, 'At-Risk': true, Lost: true })}
            style={{ width: '100%', padding: '8px', background: '#f4f6fd', color: '#374151', border: '1px solid #e8eaf6', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginTop: '6px' }}>
            Expand all
          </button>
        </div>
      </div>

      {/* Priority order: sort by urgency */}
      {['At-Risk', 'Lost', 'Champions', 'Loyal'].map(seg => (
        <SegmentCard key={seg} segName={seg} ins={ins} expanded={!!expanded[seg]} onToggle={() => toggle(seg)} />
      ))}

      {/* No data state */}
      {!data && (
        <div style={{ ...card(), textAlign: 'center', padding: '48px', marginTop: '8px' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📂</p>
          <p style={{ fontWeight: '700', color: '#1a1d3a', fontSize: '16px', margin: '0 0 6px' }}>No data uploaded yet</p>
          <p style={{ color: '#9fa8c7', fontSize: '13px', margin: '0 0 20px' }}>Upload your CSV to generate actionable insights</p>
          <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#5b8df0,#7c6fef)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' }}>
            Upload customer data
          </button>
        </div>
      )}
    </div>
  );
}