import { useEffect, useState } from 'react';

const INR = (v) => `₹${Number(Math.round(v)).toLocaleString('en-IN')}`;

const TEMPLATES = {
  'At-Risk': {
    color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '⚠️',
    title: 'Win-back campaign',
    goal: 'Bring back customers who haven\'t bought in 3+ months',
    whatsapp: (brand, discount, days) =>
`Namaste! 🙏

*${brand}* se aapko yaad kar rahe hain!

Kaafi time ho gaya aapka koi order nahi hua — isliye hum aapke liye kuch khaas laaye hain:

🎁 *${discount}% SPECIAL DISCOUNT*
Sirf aapke liye — ${days} din ke liye valid hai!

Abhi order karein aur save karein:
👉 [Your store link here]

Discount code: *WAPAS${discount}*

Koi sawaal ho toh reply karein — hum hamesha available hain! 😊`,
    sms: (brand, discount, days) =>
`${brand}: Aapko miss kar rahe hain! ${discount}% off sirf ${days} din ke liye. Code: WAPAS${discount}. Order karein: [link]`,
    expectedReturn: 0.21,
    tip: 'Send between 6–8 PM on weekdays. Avoid sending on Mondays. Festival season (Oct–Jan) gets 40% higher recovery.',
  },
  Champions: {
    color: '#5b8df0', bg: '#eff4ff', border: '#c7d7fd', icon: '👑',
    title: 'Loyalty reward',
    goal: 'Make your best customers feel special so they keep coming back',
    whatsapp: (brand, discount) =>
`Namaste! 🙏

Aap *${brand}* ke sabse khaas customer hain! 👑

Hamare loyal customers ke liye ek exclusive offer:

⭐ *${discount}% VIP DISCOUNT*
Yeh offer sirf aap jaise khaas customers ke liye hai!

Pehle access paayein humari nayi collection ka:
👉 [Your store link here]

Aapka support humara hausla badhata hai — shukriya! 🙏`,
    sms: (brand, discount) =>
`${brand}: Aap humare VIP customer hain! Exclusive ${discount}% off sirf aapke liye. Order: [link]`,
    expectedReturn: 0.92,
    tip: 'Champions respond to exclusivity, not price. Focus on "only for you" language. Early access to new products works better than discounts.',
  },
  Loyal: {
    color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: '🔁',
    title: 'Upgrade offer',
    goal: 'Encourage regular customers to buy more often',
    whatsapp: (brand, discount) =>
`Namaste! 🙏

*${brand}* ki taraf se aapke liye ek khaas offer! 🎉

Aap hamare regular customers mein se ek hain — isliye:

💚 *${discount}% LOYALTY DISCOUNT*
Plus FREE delivery on your next order!

Aaj hi order karein:
👉 [Your store link here]

Hum aapki khushi ke liye kaam karte hain! 😊`,
    sms: (brand, discount) =>
`${brand}: Loyalty reward! ${discount}% off + free delivery. Aapke liye hi hai. Order: [link]`,
    expectedReturn: 0.68,
    tip: 'Free delivery is more effective than discounts for Loyal customers in India. Add it as a bonus incentive.',
  },
  Lost: {
    color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '💔',
    title: 'Last chance offer',
    goal: 'One final attempt to bring back long-inactive customers',
    whatsapp: (brand, discount) =>
`Namaste! 🙏

*${brand}* se ek aakhri koshish aapke liye! 🙏

Humne bahut time se aapko nahi dekha — isliye aapke liye sabse bada offer:

🔥 *${discount}% MEGA DISCOUNT*
Yeh hamare sabse bada ever discount hai!
Sirf 3 din ke liye valid — aaj se!

Ek baar phir try karein:
👉 [Your store link here]

Code: *WAPAS${discount}*`,
    sms: (brand, discount) =>
`${brand}: Last chance! ${discount}% off — humare sabse bada offer. Sirf 3 din. Code: BACK${discount}. [link]`,
    expectedReturn: 0.065,
    tip: 'Don\'t over-invest in Lost customers. Send once, then stop. Move your budget to At-Risk customers who are more likely to return.',
  },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      padding:'8px 16px',
      background: copied ? '#22c55e' : '#fff',
      border: `1px solid ${copied ? '#22c55e' : '#e5e7eb'}`,
      borderRadius:'8px', fontSize:'12px', fontWeight:'600',
      cursor:'pointer', color: copied ? '#fff' : '#374151',
      fontFamily:'"Plus Jakarta Sans",sans-serif',
      transition:'all 0.2s', whiteSpace:'nowrap',
    }}>
      {copied ? '✓ Copied!' : 'Copy message'}
    </button>
  );
}

export default function Campaigns() {
  const [raw, setRaw]               = useState(null);
  const [selected, setSelected]     = useState('At-Risk');
  const [brand, setBrand]           = useState('Your Store');
  const [discount, setDiscount]     = useState(25);
  const [days, setDays]             = useState(7);
  const [msgType, setMsgType]       = useState('whatsapp');
  const [launched, setLaunched]     = useState({});

  useEffect(() => {
    const s = localStorage.getItem('segmentData');
    if (s) setRaw(JSON.parse(s));
    const b = localStorage.getItem('brandName');
    if (b) setBrand(b);
    const l = localStorage.getItem('campaignLaunched');
    if (l) setLaunched(JSON.parse(l));
  }, []);

  const saveBrand = (v) => {
    setBrand(v);
    localStorage.setItem('brandName', v);
  };

  const markLaunched = (seg) => {
    const next = { ...launched, [seg]: { date: new Date().toLocaleDateString('en-IN'), count: raw?.summary?.[seg] || 0 } };
    setLaunched(next);
    localStorage.setItem('campaignLaunched', JSON.stringify(next));
  };

  const summary  = raw?.summary || { Champions:9, Loyal:390, 'At-Risk':3403, Lost:1874 };
  const profiles = raw?.cluster_profiles || [];
  const pByName  = {};
  profiles.forEach(p => { pByName[p.segment] = p; });

  const t    = TEMPLATES[selected];
  const msg  = msgType === 'whatsapp'
    ? t.whatsapp(brand, discount, days)
    : t.sms(brand, discount, days);

  const count     = summary[selected] || 0;
  const monetary  = pByName[selected]?.monetary || 1000;
  const recovered = Math.round(count * t.expectedReturn);
  const revenue   = Math.round(recovered * monetary);

  return (
    <div style={{ maxWidth:'960px', margin:'0 auto', fontFamily:'"Plus Jakarta Sans",sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ margin:'0 0 6px', fontSize:'26px', fontWeight:'800', color:'#1a1d3a', letterSpacing:'-0.5px' }}>
          Send a Campaign
        </h1>
        <p style={{ margin:0, fontSize:'14px', color:'#6b7280' }}>
          Choose your customer group → customise the message → copy and send on WhatsApp or SMS
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'24px', alignItems:'start' }}>

        {/* Left: config panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* Step 1: brand name */}
          <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'14px', padding:'16px 18px' }}>
            <p style={{ margin:'0 0 10px', fontSize:'12px', fontWeight:'700', color:'#9fa8c7', letterSpacing:'0.05em' }}>STEP 1 — YOUR BRAND NAME</p>
            <input value={brand} onChange={e => saveBrand(e.target.value)}
              placeholder="e.g. Priya's Boutique"
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', color:'#1a1d3a', fontFamily:'inherit', boxSizing:'border-box', outline:'none' }}/>
          </div>

          {/* Step 2: choose group */}
          <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'14px', padding:'16px 18px' }}>
            <p style={{ margin:'0 0 10px', fontSize:'12px', fontWeight:'700', color:'#9fa8c7', letterSpacing:'0.05em' }}>STEP 2 — CUSTOMER GROUP</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {Object.entries(TEMPLATES).map(([seg, cfg]) => {
                const cnt = summary[seg] || 0;
                const isLaunched = !!launched[seg];
                return (
                  <button key={seg} onClick={() => setSelected(seg)} style={{
                    display:'flex', alignItems:'center', gap:'10px',
                    padding:'10px 12px', borderRadius:'10px', border:`1.5px solid ${selected===seg?cfg.color:'#f0f2ff'}`,
                    background: selected===seg ? cfg.bg : '#fafbff',
                    cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                  }}>
                    <span style={{ fontSize:'18px', flexShrink:0 }}>{cfg.icon}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:'0 0 1px', fontSize:'13px', fontWeight:'700', color:'#1a1d3a' }}>{seg}</p>
                      <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7' }}>{cnt.toLocaleString('en-IN')} customers</p>
                    </div>
                    {isLaunched && (
                      <span style={{ fontSize:'10px', fontWeight:'600', color:'#22c55e', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'20px', padding:'2px 7px', flexShrink:0 }}>Sent ✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: discount */}
          <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'14px', padding:'16px 18px' }}>
            <p style={{ margin:'0 0 10px', fontSize:'12px', fontWeight:'700', color:'#9fa8c7', letterSpacing:'0.05em' }}>STEP 3 — DISCOUNT AMOUNT</p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {[10,15,20,25,30,50].map(d => (
                <button key={d} onClick={() => setDiscount(d)} style={{
                  padding:'6px 14px', borderRadius:'8px', border:`1.5px solid ${discount===d?t.color:'#e5e7eb'}`,
                  background: discount===d?t.bg:'#fff', cursor:'pointer',
                  fontSize:'13px', fontWeight:'700', color: discount===d?t.color:'#374151',
                  fontFamily:'inherit',
                }}>{d}%</button>
              ))}
            </div>
          </div>

          {/* Step 4: channel */}
          <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'14px', padding:'16px 18px' }}>
            <p style={{ margin:'0 0 10px', fontSize:'12px', fontWeight:'700', color:'#9fa8c7', letterSpacing:'0.05em' }}>STEP 4 — CHANNEL</p>
            <div style={{ display:'flex', gap:'8px' }}>
              {[['whatsapp','💬 WhatsApp'],['sms','📱 SMS']].map(([val,label]) => (
                <button key={val} onClick={() => setMsgType(val)} style={{
                  flex:1, padding:'9px', borderRadius:'9px',
                  border:`1.5px solid ${msgType===val?t.color:'#e5e7eb'}`,
                  background: msgType===val?t.bg:'#fff', cursor:'pointer',
                  fontSize:'12px', fontWeight:'700', color: msgType===val?t.color:'#374151',
                  fontFamily:'inherit',
                }}>{label}</button>
              ))}
            </div>
            <p style={{ margin:'8px 0 0', fontSize:'11px', color:'#9fa8c7', lineHeight:1.4 }}>
              WhatsApp has 95% open rate in India. Recommended for all campaigns.
            </p>
          </div>

          {/* Expected results */}
          <div style={{ background: t.bg, border:`1px solid ${t.border}`, borderRadius:'14px', padding:'16px 18px' }}>
            <p style={{ margin:'0 0 10px', fontSize:'12px', fontWeight:'700', color:t.color, letterSpacing:'0.05em' }}>EXPECTED RESULTS</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {[
                { label:'Customers to reach', val: count.toLocaleString('en-IN') },
                { label:'Expected to respond', val: recovered.toLocaleString('en-IN') },
                { label:'Revenue recovered',   val: INR(revenue) },
                { label:'Cost (WhatsApp)',      val: INR(count*3) },
              ].map(m => (
                <div key={m.label} style={{ background:'rgba(255,255,255,0.7)', borderRadius:'8px', padding:'10px 12px' }}>
                  <p style={{ margin:'0 0 2px', fontSize:'15px', fontWeight:'800', color:'#1a1d3a' }}>{m.val}</p>
                  <p style={{ margin:0, fontSize:'10px', color:'#6b7280' }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: message preview */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* Campaign goal */}
          <div style={{ background: t.bg, border:`1px solid ${t.border}`, borderRadius:'14px', padding:'14px 18px', display:'flex', gap:'12px', alignItems:'center' }}>
            <span style={{ fontSize:'24px' }}>{t.icon}</span>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:'15px', fontWeight:'700', color:'#1a1d3a' }}>{t.title} — {selected}</p>
              <p style={{ margin:0, fontSize:'13px', color:'#6b7280' }}>{t.goal}</p>
            </div>
          </div>

          {/* Message preview */}
          <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'14px', overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #f0f2ff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ margin:'0 0 2px', fontSize:'14px', fontWeight:'700', color:'#1a1d3a' }}>
                  {msgType==='whatsapp'?'WhatsApp Message':'SMS Message'}
                </p>
                <p style={{ margin:0, fontSize:'12px', color:'#9fa8c7' }}>
                  Ready to copy and send to {count.toLocaleString('en-IN')} customers
                </p>
              </div>
              <CopyButton text={msg}/>
            </div>

            {/* WhatsApp preview mockup */}
            <div style={{ padding:'20px', background:'#e5ddd5' }}>
              <div style={{ background:'#fff', borderRadius:'0 12px 12px 12px', padding:'12px 14px', maxWidth:'80%', boxShadow:'0 1px 2px rgba(0,0,0,0.1)' }}>
                <p style={{ margin:0, fontSize:'13px', color:'#1a1d3a', lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:'sans-serif' }}>{msg}</p>
                <p style={{ margin:'8px 0 0', fontSize:'10px', color:'#9fa8c7', textAlign:'right' }}>
                  {new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})} ✓✓
                </p>
              </div>
            </div>
          </div>

          {/* Pro tip */}
          <div style={{ background:'#f8f9ff', border:'1px solid #e0e7ff', borderRadius:'12px', padding:'14px 18px', display:'flex', gap:'10px' }}>
            <span style={{ fontSize:'16px', flexShrink:0 }}>💡</span>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:'12px', fontWeight:'700', color:'#5b8df0' }}>Best practice for {selected}</p>
              <p style={{ margin:0, fontSize:'12px', color:'#4b5563', lineHeight:1.5 }}>{t.tip}</p>
            </div>
          </div>

          {/* How to send guide */}
          <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'14px', padding:'16px 18px' }}>
            <p style={{ margin:'0 0 12px', fontSize:'13px', fontWeight:'700', color:'#1a1d3a' }}>How to send this campaign</p>
            {[
              { n:'1', text:'Copy the message above using the "Copy message" button' },
              { n:'2', text:`Download the customer list for this group (${count.toLocaleString('en-IN')} contacts)` },
              { n:'3', text:'Open WhatsApp Business / your bulk SMS tool and paste the message' },
              { n:'4', text:'Replace [Your store link here] with your actual store or product link' },
              { n:'5', text:'Send! Then come back and mark this campaign as launched' },
            ].map(s => (
              <div key={s.n} style={{ display:'flex', gap:'10px', marginBottom:'8px', alignItems:'flex-start' }}>
                <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:t.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', flexShrink:0, marginTop:'1px' }}>{s.n}</div>
                <p style={{ margin:0, fontSize:'13px', color:'#4b5563', lineHeight:1.5 }}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={() => {
              const segData = JSON.parse(localStorage.getItem('segmentData') || '{}');
              const all = segData.all_customers || segData.sample_customers || [];
              const filtered = all.filter(c => c.segment === selected);
              const csv = ['Customer ID,Days Since Last Purchase,Total Orders,Total Spend (₹)',
                ...filtered.map(c => `${c.customer_id},${c.recency},${c.frequency},${Math.round(c.monetary)}`)
              ].join('\n');
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
              a.download = `${selected.replace(' ','-')}_customers.csv`;
              a.click();
            }} style={{
              flex:1, padding:'12px',
              background:'#fff', border:`1px solid ${t.color}`,
              borderRadius:'10px', fontSize:'13px', fontWeight:'600',
              cursor:'pointer', color:t.color, fontFamily:'inherit',
            }}>
              ↓ Download {selected} customer list
            </button>
            <button onClick={() => markLaunched(selected)} style={{
              flex:1, padding:'12px',
              background: launched[selected] ? '#22c55e' : t.color,
              border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:'700',
              cursor:'pointer', color:'#fff', fontFamily:'inherit',
            }}>
              {launched[selected] ? `✓ Sent on ${launched[selected].date}` : '✓ Mark as sent'}
            </button>
          </div>

          {launched[selected] && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'12px 16px' }}>
              <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:'700', color:'#166534' }}>
                ✓ Campaign sent on {launched[selected].date}
              </p>
              <p style={{ margin:0, fontSize:'12px', color:'#4ade80' }}>
                Sent to {(launched[selected].count||count).toLocaleString('en-IN')} customers.
                Check back in 7 days to see if your At-Risk group has shrunk after uploading new data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}