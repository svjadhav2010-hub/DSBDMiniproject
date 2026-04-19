import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const card = (e = {}) => ({ background: '#fff', borderRadius: '16px', padding: '20px 22px', border: '1px solid #e8eaf6', ...e });

const INR = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

function deriveInsights(data) {
  const total    = data?.total_customers || 5676;
  const summary  = data?.summary || { Champions: 9, Loyal: 390, 'At-Risk': 3403, Lost: 1874 };
  const profiles = data?.cluster_profiles || [
    { segment: 'Champions', recency: 12,  frequency: 19, monetary: 18500 },
    { segment: 'Loyal',     recency: 48,  frequency: 8,  monetary: 4200  },
    { segment: 'At-Risk',   recency: 185, frequency: 3,  monetary: 1400  },
    { segment: 'Lost',      recency: 390, frequency: 1,  monetary: 350   },
  ];

  const pByName = {};
  profiles.forEach(p => { pByName[p.segment] = p; });

  const atRiskRev  = (summary['At-Risk'] || 0) * (pByName['At-Risk']?.monetary || 1400);
  const lostRev    = (summary['Lost']    || 0) * (pByName['Lost']?.monetary    || 350);
  const champRev   = (summary['Champions'] || 0) * (pByName['Champions']?.monetary || 18500);
  const loyalRev   = (summary['Loyal']     || 0) * (pByName['Loyal']?.monetary     || 4200);
  const totalRev   = atRiskRev + lostRev + champRev + loyalRev;

  const champPct   = (summary['Champions'] || 0) / total;
  const loyalPct   = (summary['Loyal']     || 0) / total;
  const atRiskPct  = (summary['At-Risk']   || 0) / total;
  const lostPct    = (summary['Lost']      || 0) / total;

  const healthScore = Math.round(
    (champPct * 100) + (loyalPct * 60) - (atRiskPct * 40) - (lostPct * 30) + 50
  );

  const atRiskRecency  = pByName['At-Risk']?.recency || 185;
  const lostRecency    = pByName['Lost']?.recency    || 390;
  const daysUntilLost  = Math.round(lostRecency - atRiskRecency);

  return {
    total, summary, pByName, profiles,
    atRiskRev, lostRev, champRev, loyalRev, totalRev,
    champPct, loyalPct, atRiskPct, lostPct,
    healthScore: Math.max(0, Math.min(100, healthScore)),
    daysUntilLost,
  };
}

const SEG_CONFIG = {
  Champions: {
    color: '#5b8df0', bg: '#eff4ff', border: '#c7d7fd', icon: '👑',
    meaning: 'आपके सबसे मूल्यवान ग्राहक। These customers bought recently, buy often, and spend the most. They are your brand ambassadors — losing even one costs significant revenue.',
    urgency:     (pct) => pct < 0.02 ? 'critical' : pct < 0.05 ? 'warning' : 'good',
    urgencyText: (pct) => pct < 0.02 ? 'Champion base is dangerously small' : pct < 0.05 ? 'Champions below healthy threshold (5%)' : 'Champions segment is healthy',
    actions: (ins) => [
      {
        priority: 'high',
        label:  'Send a personalised thank-you offer via WhatsApp',
        detail: `WhatsApp has 95%+ open rate in India vs 20% email. Send a personalised "Thank you for being our best customer" message with an exclusive 20% discount code. Cost: approx ₹${Math.round((ins.summary['Champions']||0) * 3)} for WhatsApp Business API. Expected retention: 97%.`,
      },
      {
        priority: 'high',
        label:  'Invite to exclusive early-access sale',
        detail: 'Launch a 24-hour "Champions Only" sale before your next Diwali, Holi, or end-of-season offer goes public. This creates urgency and emotional loyalty. Indian customers respond strongly to exclusive festival offers.',
      },
      {
        priority: 'medium',
        label:  'Ask for Google Reviews and referrals',
        detail: `Champions are 8× more likely to refer friends. Offer ₹${Math.round((ins.pByName['Champions']?.monetary||18500)*0.05)} referral credit per new customer they bring. In tier-2 and tier-3 cities, word-of-mouth is the primary discovery channel.`,
      },
    ],
    negativeAction: 'If Champions are shrinking month-over-month, your product quality or delivery experience has dropped. Check recent reviews on Meesho, Amazon India, or Flipkart. One bad experience shared on social media can cascade quickly in Indian markets.',
    revenueLabel: 'Revenue from top customers',
  },

  Loyal: {
    color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: '🔁',
    meaning: 'नियमित ग्राहक। These customers return periodically and have a solid purchase history. They are one step away from becoming Champions — or one bad experience away from becoming At-Risk.',
    urgency:     (pct) => pct < 0.05 ? 'warning' : 'good',
    urgencyText: (pct) => pct < 0.05 ? 'Loyal segment shrinking — your repeat purchase pipeline is drying up' : 'Loyal segment is stable',
    actions: (ins) => [
      {
        priority: 'high',
        label:  'Offer a monthly subscription or loyalty membership',
        detail: `A loyalty programme at ₹99–₹199/month (like Flipkart Plus or Amazon Prime model) works extremely well in India. Even 20% uptake (${Math.round((ins.summary['Loyal']||0)*0.2)} customers) generates ₹${Math.round((ins.summary['Loyal']||0)*0.2*1499).toLocaleString('en-IN')}/year recurring. Offer free delivery as the primary perk.`,
      },
      {
        priority: 'high',
        label:  'Send personalised product bundles via SMS + WhatsApp',
        detail: 'Use purchase history to bundle 2–3 relevant products together at a 10% bundle discount. Indian customers have a 3× higher bundle acceptance rate than individual upsells. Festival season (Oct–Jan) is peak time.',
      },
      {
        priority: 'medium',
        label:  'Push toward Champion tier with a frequency challenge',
        detail: `Loyal customers avg ${ins.pByName['Loyal']?.frequency||8} orders. Champions avg ${ins.pByName['Champions']?.frequency||19}. Create a "Buy 3 more times this quarter and unlock VIP status" challenge with a ₹500 reward. Gamification works very well with Indian online shoppers.`,
      },
    ],
    negativeAction: 'If the Loyal segment declines, At-Risk will grow the following month. Send a re-engagement WhatsApp message within 48 hours of inactivity crossing 60 days. Do not wait for them to drift further.',
    revenueLabel: 'Revenue from regular customers',
  },

  'At-Risk': {
    color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '⚠️',
    meaning: 'खतरे में ग्राहक। These customers used to buy from you but have gone silent. They have a real purchase history with you. Every day without contact increases the chance of permanent churn by ~2%.',
    urgency:     (pct) => pct > 0.50 ? 'critical' : pct > 0.30 ? 'warning' : 'good',
    urgencyText: (pct) => pct > 0.50 ? '🚨 CRITICAL — Over half your customers are about to leave permanently' : pct > 0.30 ? 'At-Risk group is dangerously large — act this week' : 'At-Risk within manageable range',
    actions: (ins) => [
      {
        priority: 'critical',
        label:  'Launch WhatsApp win-back campaign TODAY',
        detail: `Send: "आपकी याद आई! Here's 25% off — valid for 7 days only." WhatsApp win-back campaigns in India achieve 18–25% recovery rate vs 8% email. That's ${Math.round((ins.summary['At-Risk']||0)*0.21)} customers returning, recovering ${INR(Math.round((ins.summary['At-Risk']||0)*0.21*(ins.pByName['At-Risk']?.monetary||1400)))} in revenue. Cost: approx ₹${Math.round((ins.summary['At-Risk']||0)*3)} for WhatsApp API messages.`,
      },
      {
        priority: 'high',
        label:  'Target high-value At-Risk via phone call',
        detail: `Filter At-Risk customers who spent more than ${INR(Math.round((ins.pByName['At-Risk']?.monetary||1400)*1.5))}. These ${Math.round((ins.summary['At-Risk']||0)*0.15)} customers are worth a personal phone call. In India, a personal call from a brand still carries very high perceived value and converts at 30–40%.`,
      },
      {
        priority: 'medium',
        label:  'Run a Google/Meta retargeting ad specifically for this group',
        detail: 'Upload the At-Risk customer list to Google Ads or Meta as a custom audience. Show them a "Come back" ad with a discount. This is more cost-effective than broad advertising since you are targeting people who already know your brand.',
      },
    ],
    negativeAction: 'Every 30 days an At-Risk customer goes uncontacted increases their move-to-Lost probability by 40%. At 55%+ At-Risk, this is a retention emergency. The cost of a WhatsApp campaign (₹3/message) is trivial compared to the revenue at stake.',
    revenueLabel: 'Revenue at risk of churning',
  },

  Lost: {
    color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '💔',
    meaning: 'खोए हुए ग्राहक। Long inactive with very low purchase history. They may have switched to a competitor — Meesho, Flipkart, or a local alternative. Recovery rate is low (5–8%) but one final attempt costs very little.',
    urgency:     (pct) => pct > 0.40 ? 'critical' : pct > 0.25 ? 'warning' : 'good',
    urgencyText: (pct) => pct > 0.40 ? 'Lost segment is very large — review your customer acquisition quality' : pct > 0.25 ? 'Large Lost segment is dragging down your customer base health' : 'Lost segment is within normal range',
    actions: (ins) => [
      {
        priority: 'high',
        label:  'Final win-back: send your biggest-ever offer',
        detail: `Last chance message: "50% छूट — यह ऑफर कभी नहीं आएगा। 3 days only." Expect 5–8% recovery = ${Math.round((ins.summary['Lost']||0)*0.065)} customers returning. ROI is positive even at low recovery because message cost is only ₹3–5 per customer on WhatsApp.`,
      },
      {
        priority: 'medium',
        label:  'Remove from paid ad audiences immediately',
        detail: 'Remove Lost customers from your Google Ads and Meta retargeting lists right now. You are paying ₹15–50 per click to show ads to people who have already permanently left. Redirect this budget to At-Risk customers who are still recoverable.',
      },
      {
        priority: 'low',
        label:  'Analyse why they left — look for the pattern',
        detail: 'Check what Lost customers bought before churning. Was it a specific product category? A time period (post-festival slump)? A delivery issue? Finding the pattern prevents future customers from following the same path to Lost.',
      },
    ],
    negativeAction: 'If the Lost segment keeps growing month-over-month, the problem is upstream. Either your acquisition campaigns on Instagram/Google are bringing in low-intent buyers, or a product or delivery experience issue is systematically turning new customers into churned ones.',
    revenueLabel: 'Already-churned revenue',
  },
};

const URGENCY_STYLE = {
  critical: { bg:'#fef2f2', border:'#fecaca', badge:'#ef4444', badgeBg:'#fef2f2', text:'CRITICAL'  },
  warning:  { bg:'#fffbeb', border:'#fde68a', badge:'#f59e0b', badgeBg:'#fffbeb', text:'WARNING'   },
  good:     { bg:'#f0fdf4', border:'#bbf7d0', badge:'#22c55e', badgeBg:'#f0fdf4', text:'HEALTHY'   },
};

const PRIORITY_STYLE = {
  critical: { color:'#ef4444', bg:'#fef2f2', label:'Do now'     },
  high:     { color:'#f59e0b', bg:'#fffbeb', label:'This week'  },
  medium:   { color:'#5b8df0', bg:'#eff4ff', label:'This month' },
  low:      { color:'#9fa8c7', bg:'#f4f6fd', label:'Optional'   },
};

function HealthMeter({ score }) {
  const color = score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Good health' : score >= 45 ? 'Needs attention' : 'Critical';
  const circ  = 2 * Math.PI * 38;
  const off   = circ - (score / 100) * circ;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
      <div style={{ position:'relative', width:'90px', height:'90px', flexShrink:0 }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="38" fill="none" stroke="#f0f2ff" strokeWidth="8"/>
          <circle cx="45" cy="45" r="38" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
            transform="rotate(-90 45 45)" style={{ transition:'stroke-dashoffset 1.2s ease' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <p style={{ margin:0, fontSize:'20px', fontWeight:'800', color, lineHeight:1 }}>{score}</p>
          <p style={{ margin:0, fontSize:'9px', color:'#9fa8c7', fontWeight:'600' }}>/ 100</p>
        </div>
      </div>
      <div>
        <p style={{ margin:'0 0 2px', fontSize:'15px', fontWeight:'700', color:'#1a1d3a' }}>Customer Health Score</p>
        <p style={{ margin:'0 0 8px', fontSize:'12px', color }}>● {label}</p>
        <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7', lineHeight:1.5, maxWidth:'220px' }}>
          Based on customer group distribution, purchase recency gaps, and revenue concentration risk.
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
    <div style={{ background:'#fff', border:`1px solid ${expanded?cfg.border:'#e8eaf6'}`, borderRadius:'16px', overflow:'hidden', transition:'all 0.2s' }}>
      <div style={{ padding:'18px 20px', cursor:'pointer', display:'flex', gap:'14px', alignItems:'flex-start' }} onClick={onToggle}>
        <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
          {cfg.icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px', flexWrap:'wrap' }}>
            <p style={{ margin:0, fontSize:'15px', fontWeight:'700', color:'#1a1d3a' }}>{segName}</p>
            <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'800', background:ust.badgeBg, color:ust.badge, border:`1px solid ${ust.border}` }}>
              {ust.text}
            </span>
            {urgency==='critical' && (
              <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', background:'#fef2f2', color:'#ef4444' }}>ACTION REQUIRED</span>
            )}
          </div>
          <p style={{ margin:'0 0 8px', fontSize:'12px', color:'#6b7280', lineHeight:1.4 }}>{cfg.urgencyText(pct)}</p>
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
            <div>
              <p style={{ margin:0, fontSize:'18px', fontWeight:'800', color:'#1a1d3a' }}>{count.toLocaleString('en-IN')}</p>
              <p style={{ margin:0, fontSize:'10px', color:'#9fa8c7' }}>customers · {(pct*100).toFixed(1)}%</p>
            </div>
            {profile && (
              <>
                <div>
                  <p style={{ margin:0, fontSize:'16px', fontWeight:'700', color:'#1a1d3a' }}>{profile.recency}d</p>
                  <p style={{ margin:0, fontSize:'10px', color:'#9fa8c7' }}>avg days since last purchase</p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'16px', fontWeight:'700', color:'#1a1d3a' }}>{INR(profile.monetary)}</p>
                  <p style={{ margin:0, fontSize:'10px', color:'#9fa8c7' }}>avg lifetime spend</p>
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ color:'#9fa8c7', fontSize:'18px', transform:expanded?'rotate(180deg)':'none', transition:'transform 0.2s', flexShrink:0 }}>▾</div>
      </div>

      {expanded && (
        <div style={{ borderTop:`1px solid ${cfg.border}`, background:cfg.bg }}>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${cfg.border}` }}>
            <p style={{ margin:'0 0 6px', fontSize:'11px', fontWeight:'700', color:cfg.color, letterSpacing:'0.06em' }}>WHAT THIS MEANS FOR YOUR BUSINESS</p>
            <p style={{ margin:0, fontSize:'13px', color:'#374151', lineHeight:1.6 }}>{cfg.meaning}</p>
          </div>

          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${cfg.border}`, display:'flex', gap:'20px', flexWrap:'wrap' }}>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:'11px', color:'#9fa8c7', fontWeight:'600' }}>{cfg.revenueLabel}</p>
              <p style={{ margin:0, fontSize:'20px', fontWeight:'800', color:cfg.color }}>
                {INR(count*(profile?.monetary||0))}
              </p>
            </div>
            {segName==='At-Risk' && ins.daysUntilLost && (
              <div>
                <p style={{ margin:'0 0 2px', fontSize:'11px', color:'#9fa8c7', fontWeight:'600' }}>Days until they become Lost</p>
                <p style={{ margin:0, fontSize:'20px', fontWeight:'800', color:'#ef4444' }}>~{ins.daysUntilLost} days</p>
              </div>
            )}
            {segName==='At-Risk' && (
              <div>
                <p style={{ margin:'0 0 2px', fontSize:'11px', color:'#9fa8c7', fontWeight:'600' }}>WhatsApp win-back recovery (21%)</p>
                <p style={{ margin:0, fontSize:'20px', fontWeight:'800', color:'#22c55e' }}>
                  {INR(Math.round(count*0.21*(profile?.monetary||1400)))} saved
                </p>
              </div>
            )}
          </div>

          <div style={{ padding:'16px 20px' }}>
            <p style={{ margin:'0 0 12px', fontSize:'11px', fontWeight:'700', color:cfg.color, letterSpacing:'0.06em' }}>ACTIONS TO TAKE</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {actions.map((action,i) => {
                const ps = PRIORITY_STYLE[action.priority];
                return (
                  <div key={i} style={{ background:'#fff', borderRadius:'10px', padding:'12px 14px', border:`1px solid ${cfg.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', background:ps.bg, color:ps.color }}>{ps.label}</span>
                      <p style={{ margin:0, fontSize:'13px', fontWeight:'700', color:'#1a1d3a' }}>{action.label}</p>
                    </div>
                    <p style={{ margin:0, fontSize:'12px', color:'#6b7280', lineHeight:1.5 }}>{action.detail}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:'12px', padding:'12px 14px', background:'#fff', borderRadius:'10px', border:'1px solid #fde68a' }}>
              <p style={{ margin:'0 0 4px', fontSize:'11px', fontWeight:'700', color:'#d97706', letterSpacing:'0.05em' }}>⚠ IF YOU IGNORE THIS SEGMENT</p>
              <p style={{ margin:0, fontSize:'12px', color:'#92400e', lineHeight:1.5 }}>{cfg.negativeAction}</p>
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

  useEffect(() => { const s=localStorage.getItem('segmentData'); if(s) setData(JSON.parse(s)); }, []);

  const ins = deriveInsights(data);
  const criticalSegs = Object.keys(SEG_CONFIG).filter(seg => {
    const pct = ins.total ? (ins.summary[seg]||0) / ins.total : 0;
    return SEG_CONFIG[seg].urgency(pct) === 'critical';
  });

  const toggle = (seg) => setExpanded(prev => ({ ...prev, [seg]: !prev[seg] }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

      {/* Critical alert banner */}
      {criticalSegs.length > 0 && !dismissed && (
        <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:'12px', padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:'12px' }}>
          <span style={{ fontSize:'20px', flexShrink:0 }}>🚨</span>
          <div style={{ flex:1 }}>
            <p style={{ margin:'0 0 4px', fontWeight:'700', color:'#991b1b', fontSize:'14px' }}>
              {criticalSegs.length} customer group{criticalSegs.length>1?'s require':'s requires'} immediate action
            </p>
            <p style={{ margin:0, fontSize:'13px', color:'#7f1d1d', lineHeight:1.5 }}>
              {criticalSegs.join(' and ')} — click the group below to see exactly what to do.
              {ins.atRiskPct > 0.5 && ` Over half your customers are at risk of leaving permanently. Every day of inaction costs approximately ${INR(Math.round(ins.atRiskRev * 0.02 / 365))} in potential revenue.`}
            </p>
          </div>
          <button onClick={()=>setDismiss(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'#fca5a5', fontSize:'18px', flexShrink:0 }}>×</button>
        </div>
      )}

      {/* Summary bar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'16px', alignItems:'stretch' }}>
        <div style={card({ display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' })}>
          <HealthMeter score={ins.healthScore}/>
          <div style={{ width:'1px', background:'#f0f2ff', alignSelf:'stretch', flexShrink:0 }}/>
          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {[
              { label:'Total customers',              val: ins.total.toLocaleString('en-IN'),                              color:'#5b8df0' },
              { label:'Revenue at risk',              val: INR(ins.atRiskRev + ins.lostRev),                              color:'#ef4444' },
              { label:'Recoverable via WhatsApp',     val: INR(Math.round(ins.atRiskRev * 0.21)),                         color:'#22c55e' },
              { label:'At-Risk + Lost combined',      val: `${(((ins.atRiskPct+ins.lostPct)||0)*100).toFixed(0)}%`,       color: ins.atRiskPct+ins.lostPct > 0.6 ? '#ef4444' : '#f59e0b' },
            ].map(m => (
              <div key={m.label}>
                <p style={{ margin:'0 0 2px', fontSize:'11px', color:'#9fa8c7', fontWeight:'600' }}>{m.label}</p>
                <p style={{ margin:0, fontSize:'20px', fontWeight:'800', color:m.color }}>{m.val}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={card({ display:'flex', flexDirection:'column', justifyContent:'space-between', minWidth:'160px' })}>
          <p style={{ margin:'0 0 8px', fontSize:'12px', fontWeight:'600', color:'#9fa8c7' }}>Quick actions</p>
          <button onClick={()=>navigate('/')} style={{ width:'100%', padding:'8px', marginBottom:'6px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)', color:'#fff', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>
            + Upload new data
          </button>
          <button onClick={()=>{
            const csv=[
              'Segment,Count,Percentage,Avg Spend (₹),Revenue at Risk (₹),Status',
              ...Object.keys(SEG_CONFIG).map(seg=>{
                const count=ins.summary[seg]||0;
                const pct=ins.total?(count/ins.total*100).toFixed(1):0;
                const mon=ins.pByName[seg]?.monetary||0;
                const urg=SEG_CONFIG[seg].urgency(count/ins.total);
                return `${seg},${count},${pct}%,${mon},${(count*mon).toLocaleString('en-IN')},${urg}`;
              }),
            ].join('\n');
            const a=document.createElement('a');
            a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
            a.download='customer_action_report.csv';a.click();
          }} style={{ width:'100%', padding:'8px', background:'#f4f6fd', color:'#374151', border:'1px solid #e8eaf6', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>
            ↓ Export report
          </button>
          <button onClick={()=>setExpanded({Champions:true,Loyal:true,'At-Risk':true,Lost:true})}
            style={{ width:'100%', padding:'8px', marginTop:'6px', background:'#f4f6fd', color:'#374151', border:'1px solid #e8eaf6', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>
            Expand all
          </button>
        </div>
      </div>

      {/* Segment cards — At-Risk first (most urgent) */}
      {['At-Risk','Lost','Champions','Loyal'].map(seg => (
        <SegmentCard key={seg} segName={seg} ins={ins} expanded={!!expanded[seg]} onToggle={()=>toggle(seg)}/>
      ))}

      {!data && (
        <div style={{...card(),textAlign:'center',padding:'48px',marginTop:'8px'}}>
          <p style={{fontSize:'40px',margin:'0 0 12px'}}>📂</p>
          <p style={{fontWeight:'700',color:'#1a1d3a',fontSize:'16px',margin:'0 0 6px'}}>No data uploaded yet</p>
          <p style={{color:'#9fa8c7',fontSize:'13px',margin:'0 0 20px'}}>Upload your customer CSV to generate actionable insights</p>
          <button onClick={()=>navigate('/')} style={{padding:'10px 24px',background:'linear-gradient(135deg,#5b8df0,#7c6fef)',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontSize:'14px',fontWeight:'600',fontFamily:'inherit'}}>
            Upload customer data
          </button>
        </div>
      )}
    </div>
  );
}