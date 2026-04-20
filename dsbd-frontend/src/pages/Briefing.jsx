import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INR = (v) => `₹${Number(Math.round(v)).toLocaleString('en-IN')}`;

const now = new Date();
const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
const dayName  = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });

function deriveData(raw) {
  if (!raw) return null;
  const total    = raw.total_customers || 0;
  const summary  = raw.summary || {};
  const profiles = raw.cluster_profiles || [];
  const pByName  = {};
  profiles.forEach(p => { pByName[p.segment] = p; });

  const atRisk   = summary['At-Risk'] || 0;
  const lost     = summary['Lost']    || 0;
  const champs   = summary['Champions'] || 0;
  const loyal    = summary['Loyal']     || 0;

  const atRiskMon  = pByName['At-Risk']?.monetary  || 1400;
  const lostMon    = pByName['Lost']?.monetary     || 350;
  const champMon   = pByName['Champions']?.monetary || 18500;

  const atRiskRev  = atRisk * atRiskMon;
  const lostRev    = lost   * lostMon;
  const recoverRev = Math.round(atRiskRev * 0.21);

  const health = Math.max(0, Math.min(100, Math.round(
    (champs/total*100) + (loyal/total*60) - (atRisk/total*40) - (lost/total*30) + 50
  )));

  const lastUpload = localStorage.getItem('lastUploadDate') || 'Unknown';

  return { total, summary, pByName, atRisk, lost, champs, loyal,
           atRiskRev, lostRev, recoverRev, champMon, health, lastUpload };
}

function TaskCard({ rank, urgent, title, what, action, money, moneyLabel, color, bg, border, onClick, done, onDone }) {
  return (
    <div style={{
      background: done ? '#fafafa' : bg,
      border: `1.5px solid ${done ? '#e5e7eb' : border}`,
      borderRadius: '16px', padding: '20px 22px',
      opacity: done ? 0.6 : 1, transition: 'all 0.3s',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'28px', height:'28px', borderRadius:'8px', background: done ? '#e5e7eb' : color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'13px', fontWeight:'800', flexShrink:0 }}>
            {done ? '✓' : rank}
          </div>
          <div>
            {urgent && !done && (
              <span style={{ display:'inline-block', fontSize:'10px', fontWeight:'700', background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', borderRadius:'20px', padding:'1px 8px', marginBottom:'4px' }}>
                DO TODAY
              </span>
            )}
            <p style={{ margin:0, fontSize:'15px', fontWeight:'700', color: done ? '#9ca3af' : '#1a1d3a' }}>{title}</p>
          </div>
        </div>
        {!done && (
          <div style={{ textAlign:'right', flexShrink:0, marginLeft:'12px' }}>
            <p style={{ margin:0, fontSize:'18px', fontWeight:'800', color }}>{money}</p>
            <p style={{ margin:0, fontSize:'10px', color:'#9fa8c7' }}>{moneyLabel}</p>
          </div>
        )}
      </div>

      <p style={{ margin:'0 0 14px', fontSize:'13px', color: done ? '#9ca3af' : '#4b5563', lineHeight:1.6 }}>{what}</p>

      <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
        {!done ? (
          <>
            <button onClick={onClick} style={{
              flex:1, padding:'10px 16px',
              background: color,
              color:'#fff', border:'none', borderRadius:'10px',
              fontSize:'13px', fontWeight:'700', cursor:'pointer',
              fontFamily:'"Plus Jakarta Sans",sans-serif',
            }}>
              {action} →
            </button>
            <button onClick={onDone} style={{
              padding:'10px 14px', background:'transparent',
              border:'1px solid #e5e7eb', borderRadius:'10px',
              fontSize:'12px', color:'#9fa8c7', cursor:'pointer',
              fontFamily:'"Plus Jakarta Sans",sans-serif', whiteSpace:'nowrap',
            }}>
              Mark done
            </button>
          </>
        ) : (
          <p style={{ margin:0, fontSize:'12px', color:'#9ca3af' }}>Completed ✓ — well done!</p>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'10px', padding:'12px 16px', textAlign:'center' }}>
      <p style={{ margin:'0 0 3px', fontSize:'20px', fontWeight:'800', color: color || '#1a1d3a' }}>{value}</p>
      <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7', lineHeight:1.3 }}>{label}</p>
    </div>
  );
}

export default function Briefing() {
  const [raw, setRaw]   = useState(null);
  const [done, setDone] = useState({});
  const navigate        = useNavigate();
  const user            = localStorage.getItem('segiq_user') || 'there';

  useEffect(() => {
    const s = localStorage.getItem('segmentData');
    if (s) setRaw(JSON.parse(s));
    const d = localStorage.getItem('briefingDone');
    if (d) setDone(JSON.parse(d));
  }, []);

  const markDone = (key) => {
    const next = { ...done, [key]: true };
    setDone(next);
    localStorage.setItem('briefingDone', JSON.stringify(next));
  };

  const d = deriveData(raw);

  if (!raw) return (
    <div style={{ maxWidth:'600px', margin:'60px auto', padding:'0 24px', textAlign:'center' }}>
      <div style={{ width:'72px', height:'72px', borderRadius:'20px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', margin:'0 auto 20px' }}>
        📦
      </div>
      <h1 style={{ fontSize:'24px', fontWeight:'800', color:'#1a1d3a', margin:'0 0 10px', letterSpacing:'-0.5px' }}>
        {greeting}, {user}!
      </h1>
      <p style={{ fontSize:'15px', color:'#6b7280', margin:'0 0 8px', lineHeight:1.6 }}>
        Welcome to SegmentIQ — your customer intelligence tool.
      </p>
      <p style={{ fontSize:'14px', color:'#9fa8c7', margin:'0 0 28px', lineHeight:1.6 }}>
        Upload your customer transaction file and we will tell you exactly which customers need your attention today, how much revenue is at risk, and what to do about it — in plain language.
      </p>
      <div style={{ background:'#f8f9ff', border:'1px solid #e0e7ff', borderRadius:'14px', padding:'20px', marginBottom:'24px', textAlign:'left' }}>
        <p style={{ margin:'0 0 10px', fontSize:'13px', fontWeight:'700', color:'#5b8df0' }}>What you need:</p>
        {[
          'A CSV file exported from your store (Shopify, WooCommerce, Meesho, etc.)',
          'Columns needed: Customer ID, Order Date, Order Amount',
          'Works best with at least 3 months of transaction data',
        ].map((t,i) => (
          <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'6px' }}>
            <span style={{ color:'#22c55e', fontWeight:'700', flexShrink:0 }}>✓</span>
            <span style={{ fontSize:'13px', color:'#4b5563' }}>{t}</span>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/upload')} style={{
        width:'100%', padding:'14px',
        background:'linear-gradient(135deg,#5b8df0,#7c6fef)',
        color:'#fff', border:'none', borderRadius:'12px',
        fontSize:'15px', fontWeight:'700', cursor:'pointer',
        fontFamily:'"Plus Jakarta Sans",sans-serif',
      }}>
        Upload your customer data →
      </button>
    </div>
  );

  const atRiskPct = d.total ? (d.atRisk / d.total * 100) : 0;
  const tasks = [
    {
      key: 'winback',
      rank: '1', urgent: true,
      title: `Send a "We miss you" message to ${d.atRisk.toLocaleString('en-IN')} customers`,
      what: `${d.atRisk.toLocaleString('en-IN')} customers haven't bought from you in over 3 months. They remember your brand. A WhatsApp message with a 25% discount today can bring back around ${Math.round(d.atRisk*0.21).toLocaleString('en-IN')} of them — that's ${INR(d.recoverRev)} in recovered sales.`,
      action: 'Create WhatsApp campaign',
      money: INR(d.recoverRev),
      moneyLabel: 'recoverable this week',
      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
      onClick: () => navigate('/campaigns'),
    },
    {
      key: 'champions',
      rank: '2', urgent: false,
      title: `Reward your ${d.champs} best customers before they go quiet`,
      what: `Your ${d.champs} Champion customers each spend ${INR(d.champMon)} on average. Send them an exclusive early-access offer or a personalised thank-you. Keeping one Champion active is worth more than acquiring 20 new customers.`,
      action: 'Create loyalty campaign',
      money: INR(d.champs * d.champMon * 0.3),
      moneyLabel: 'protected revenue',
      color: '#5b8df0', bg: '#eff4ff', border: '#c7d7fd',
      onClick: () => navigate('/campaigns'),
    },
    {
      key: 'export',
      rank: '3', urgent: false,
      title: 'Download this week\'s customer report',
      what: `Export your full customer list with group labels (Champions, Loyal, At-Risk, Lost) as a spreadsheet. Share it with your team or use it to set up ad campaigns on Google/Meta targeting specific groups.`,
      action: 'Download report',
      money: `${d.total.toLocaleString('en-IN')}`,
      moneyLabel: 'customers in report',
      color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0',
      onClick: () => {
        const segData = JSON.parse(localStorage.getItem('segmentData') || '{}');
        const customers = segData.all_customers || segData.sample_customers || [];
        const csv = [
          'Customer ID,Days Since Last Purchase,Total Orders,Total Spend (₹),Customer Group,Status',
          ...customers.map(c => `${c.customer_id},${c.recency},${c.frequency},${Math.round(c.monetary)},${c.segment},${c.recency<90?'Active':c.recency<200?'Cooling off':'Inactive'}`)
        ].join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
        a.download = `customer_report_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
      },
    },
  ];

  const doneTasks    = tasks.filter(t => done[t.key]).length;
  const pendingTasks = tasks.filter(t => !done[t.key]).length;

  return (
    <div style={{ maxWidth:'860px', margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:'28px' }}>
        <p style={{ margin:'0 0 4px', fontSize:'13px', color:'#9fa8c7' }}>{dayName}</p>
        <h1 style={{ margin:'0 0 6px', fontSize:'28px', fontWeight:'800', color:'#1a1d3a', letterSpacing:'-0.5px' }}>
          {greeting}, {user} 👋
        </h1>
        <p style={{ margin:0, fontSize:'15px', color:'#6b7280' }}>
          {pendingTasks > 0
            ? `You have ${pendingTasks} thing${pendingTasks>1?'s':''} that need your attention today.`
            : "You're all caught up for today! Check back after your next data upload."}
        </p>
      </div>

      {/* Health strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', marginBottom:'28px' }}>
        <StatPill label="Total customers"    value={d.total.toLocaleString('en-IN')}         />
        <StatPill label="Active buyers"      value={d.loyal.toLocaleString('en-IN')}          color="#22c55e" />
        <StatPill label="Need a message"     value={d.atRisk.toLocaleString('en-IN')}         color="#f59e0b" />
        <StatPill label="Revenue at risk"    value={INR(d.atRiskRev)}                          color="#ef4444" />
        <StatPill label="Business health"    value={`${d.health}/100`}                         color={d.health>=70?'#22c55e':d.health>=45?'#f59e0b':'#ef4444'} />
      </div>

      {/* Alert if critical */}
      {atRiskPct > 45 && !done['winback'] && (
        <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:'12px', padding:'14px 18px', marginBottom:'20px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
          <span style={{ fontSize:'20px', flexShrink:0 }}>🚨</span>
          <div>
            <p style={{ margin:'0 0 3px', fontWeight:'700', color:'#991b1b', fontSize:'14px' }}>
              {Math.round(atRiskPct)}% of your customers need urgent attention
            </p>
            <p style={{ margin:0, fontSize:'13px', color:'#7f1d1d', lineHeight:1.5 }}>
              Over {Math.round(atRiskPct)}% of your customer base hasn't bought in 3+ months.
              Send the win-back campaign below before they switch to a competitor permanently.
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {doneTasks > 0 && (
        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'center' }}>
          <span style={{ fontSize:'18px' }}>🎉</span>
          <p style={{ margin:0, fontSize:'13px', color:'#166534', fontWeight:'500' }}>
            {doneTasks} of {tasks.length} tasks completed today. Great work!
          </p>
          {doneTasks === tasks.length && (
            <button onClick={() => { setDone({}); localStorage.removeItem('briefingDone'); }}
              style={{ marginLeft:'auto', fontSize:'11px', color:'#16a34a', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
              Reset for next week
            </button>
          )}
        </div>
      )}

      {/* Task cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'32px' }}>
        {tasks.map(t => (
          <TaskCard key={t.key} {...t}
            done={!!done[t.key]}
            onDone={() => markDone(t.key)}
          />
        ))}
      </div>

      {/* Quick links */}
      <div style={{ borderTop:'1px solid #f0f2ff', paddingTop:'20px' }}>
        <p style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:'600', color:'#9fa8c7' }}>QUICK LINKS</p>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          {[
            { label:'View all customers', path:'/customers' },
            { label:'Check a customer',   path:'/predict'   },
            { label:'View reports',        path:'/reports'   },
            { label:'Upload new data',     path:'/upload'    },
          ].map(l => (
            <button key={l.label} onClick={() => navigate(l.path)} style={{
              padding:'8px 16px', background:'#fff', border:'1px solid #e8eaf6',
              borderRadius:'8px', fontSize:'13px', color:'#374151',
              cursor:'pointer', fontFamily:'inherit', fontWeight:'500',
            }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}