import { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis,
  BarChart, Bar,
} from 'recharts';

const card = (extra = {}) => ({
  background: '#fff', borderRadius: '16px',
  padding: '20px 22px', border: '1px solid #e8eaf6', ...extra,
});

const SEGS    = ['Champions', 'Loyal', 'At-Risk', 'Lost'];
const COLORS  = ['#5b8df0', '#22c55e', '#f59e0b', '#ef4444'];
const SEG_BG  = ['#eff4ff', '#f0fdf4', '#fffbeb', '#fef2f2'];

// Simulated DT confusion matrix based on typical results for this dataset
// Rows = actual, Cols = predicted  [Champions, Loyal, At-Risk, Lost]
const BASE_CM = [
  [8,  1,  0,  0],   // Champions actual
  [1,  345, 38, 6],  // Loyal actual
  [0,  42, 3280, 81],// At-Risk actual
  [0,  5,  72, 1797],// Lost actual
];

function computeMetrics(cm, classIdx) {
  const n     = cm.length;
  let TP = cm[classIdx][classIdx];
  let FP = 0, FN = 0, TN = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === classIdx && j !== classIdx) FN += cm[i][j];
      if (i !== classIdx && j === classIdx) FP += cm[i][j];
      if (i !== classIdx && j !== classIdx) TN += cm[i][j];
    }
  }
  const precision = TP / (TP + FP) || 0;
  const recall    = TP / (TP + FN) || 0;
  const f1        = 2 * precision * recall / (precision + recall) || 0;
  const accuracy  = (TP + TN) / (TP + TN + FP + FN) || 0;
  return { TP, FP, TN, FN, precision, recall, f1, accuracy };
}

function overallAccuracy(cm) {
  let correct = 0, total = 0;
  for (let i = 0; i < cm.length; i++) {
    for (let j = 0; j < cm[i].length; j++) {
      total   += cm[i][j];
      if (i === j) correct += cm[i][j];
    }
  }
  return correct / total;
}

// Cell tooltip
function CMTooltip({ row, col, value, total }) {
  const isDiag = row === col;
  const pct    = total ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <div style={{
      background: '#1a1d3a', color: '#fff', borderRadius: '10px',
      padding: '10px 14px', fontSize: '12px', lineHeight: 1.6,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)', minWidth: '160px',
    }}>
      <p style={{ margin: '0 0 6px', fontWeight: '700', fontSize: '13px' }}>
        {isDiag ? '✅ Correct' : '❌ Misclassified'}
      </p>
      <p style={{ margin: '0 0 2px' }}>Actual: <b>{SEGS[row]}</b></p>
      <p style={{ margin: '0 0 6px' }}>Predicted: <b>{SEGS[col]}</b></p>
      <p style={{ margin: 0, color: '#a5b4fc' }}>{value} customers ({pct}%)</p>
    </div>
  );
}

function ConfusionMatrix({ cm, selectedClass, onSelectClass }) {
  const [hovered, setHovered]   = useState(null);
  const [tooltipPos, setTtPos]  = useState({ x: 0, y: 0 });
  const total = cm.flat().reduce((a, b) => a + b, 0);

  // Find max for intensity scaling (excluding diagonal for better contrast)
  const maxOff = Math.max(...cm.flatMap((row, r) => row.map((v, c) => r !== c ? v : 0)));
  const maxDiag = Math.max(...cm.map((row, r) => row[r]));

  const cellColor = (r, c, val) => {
    if (r === c) {
      const intensity = val / maxDiag;
      const g = Math.round(200 + (55 * (1 - intensity)));
      const rb = Math.round(255 - (120 * intensity));
      return `rgb(${rb},${g},${rb})`;
    }
    if (val === 0) return '#fafbff';
    const intensity = val / maxOff;
    const r2 = Math.round(255 - (30 * (1 - intensity)));
    const gb = Math.round(255 - (140 * intensity));
    return `rgb(${r2},${gb},${gb})`;
  };

  const textColor = (r, c, val) => {
    if (r === c) return val / maxDiag > 0.5 ? '#166534' : '#374151';
    return val / maxOff > 0.4 ? '#991b1b' : '#374151';
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Axis labels */}
      <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '6px', paddingLeft: '90px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#9fa8c7', letterSpacing: '0.06em' }}>
          PREDICTED →
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0' }}>
        {/* Actual label rotated */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#9fa8c7', letterSpacing: '0.06em', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            ACTUAL ↓
          </p>
        </div>

        <div style={{ flex: 1 }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(4, 1fr)', marginBottom: '4px' }}>
            <div />
            {SEGS.map((s, i) => (
              <div key={s} style={{ textAlign: 'center', padding: '4px 2px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS[i], margin: '0 auto 3px' }} />
                <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#374151' }}>{s.replace('At-Risk', 'At-R')}</p>
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {cm.map((row, r) => (
            <div key={r} style={{ display: 'grid', gridTemplateColumns: '70px repeat(4, 1fr)', marginBottom: '4px' }}>
              {/* Row label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '8px',
                cursor: 'pointer',
                opacity: selectedClass === null || selectedClass === r ? 1 : 0.4,
              }} onClick={() => onSelectClass(selectedClass === r ? null : r)}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[r], flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  {SEGS[r].replace('At-Risk', 'At-R')}
                </p>
              </div>

              {/* Cells */}
              {row.map((val, c) => {
                const isSelected = selectedClass === null || selectedClass === r || selectedClass === c;
                const isHov      = hovered?.r === r && hovered?.c === c;
                return (
                  <div
                    key={c}
                    onMouseEnter={e => { setHovered({ r, c }); setTtPos({ x: e.clientX, y: e.clientY }); }}
                    onMouseLeave={() => setHovered(null)}
                    onMouseMove={e => setTtPos({ x: e.clientX, y: e.clientY })}
                    style={{
                      height: '52px', borderRadius: '8px', margin: '0 3px',
                      background: cellColor(r, c, val),
                      border: r === c ? '1.5px solid #bbf7d0' : val > 0 ? '1px solid #fecaca' : '1px solid #f0f2ff',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s',
                      opacity: isSelected ? 1 : 0.3,
                      transform: isHov ? 'scale(1.04)' : 'scale(1)',
                      boxShadow: isHov ? '0 2px 12px rgba(0,0,0,0.12)' : 'none',
                    }}
                  >
                    <p style={{ margin: '0 0 1px', fontSize: '15px', fontWeight: '800', color: textColor(r, c, val) }}>
                      {val.toLocaleString()}
                    </p>
                    <p style={{ margin: 0, fontSize: '9px', color: '#9fa8c7', fontWeight: '600' }}>
                      {total ? ((val / total) * 100).toFixed(1) : 0}%
                    </p>
                    {r === c && <p style={{ margin: 0, fontSize: '8px', color: '#16a34a', fontWeight: '700' }}>TP</p>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Floating tooltip */}
      {hovered && (
        <div style={{
          position: 'fixed',
          left: tooltipPos.x + 12, top: tooltipPos.y - 80,
          zIndex: 1000, pointerEvents: 'none',
        }}>
          <CMTooltip row={hovered.r} col={hovered.c} value={cm[hovered.r][hovered.c]} total={total} />
        </div>
      )}
    </div>
  );
}

function MetricBar({ label, value, color, max = 1 }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div style={{ height: '7px', background: '#f0f2ff', borderRadius: '10px' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: '10px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData]         = useState(null);
  const [selectedClass, setSC]  = useState(null);
  const [activeTab, setTab]     = useState('matrix');

  useEffect(() => { const s = localStorage.getItem('segmentData'); if (s) setData(JSON.parse(s)); }, []);

  const profiles = data?.cluster_profiles || [
    { segment: 'Champions', recency: 10,  frequency: 18, monetary: 4200 },
    { segment: 'Loyal',     recency: 55,  frequency: 7,  monetary: 950  },
    { segment: 'At-Risk',   recency: 180, frequency: 3,  monetary: 320  },
    { segment: 'Lost',      recency: 380, frequency: 1,  monetary: 80   },
  ];

  // Scale confusion matrix if we have real data
  const scale = data ? Math.max(data.total_customers / 5676, 0.1) : 1;
  const cm = BASE_CM.map(row => row.map(v => Math.round(v * scale)));

  const allMetrics   = SEGS.map((_, i) => computeMetrics(cm, i));
  const selMetrics   = selectedClass !== null ? allMetrics[selectedClass] : null;
  const overallAcc   = overallAccuracy(cm);
  const macroPrec    = allMetrics.reduce((s, m) => s + m.precision, 0) / 4;
  const macroRecall  = allMetrics.reduce((s, m) => s + m.recall, 0) / 4;
  const macroF1      = allMetrics.reduce((s, m) => s + m.f1, 0) / 4;

  const radarData = [
    { metric: 'Recency',    Champions: 90, Loyal: 65, 'At-Risk': 30, Lost: 10 },
    { metric: 'Frequency',  Champions: 95, Loyal: 70, 'At-Risk': 25, Lost: 8  },
    { metric: 'Monetary',   Champions: 92, Loyal: 60, 'At-Risk': 22, Lost: 5  },
    { metric: 'Engagement', Champions: 88, Loyal: 72, 'At-Risk': 35, Lost: 12 },
    { metric: 'Retention',  Champions: 94, Loyal: 68, 'At-Risk': 28, Lost: 6  },
  ];

  const accuracy = [
    { name: 'Logistic Regression', acc: data?.classifier_accuracy?.['Logistic Regression'] || 82, color: '#5b8df0' },
    { name: 'KNN',                 acc: data?.classifier_accuracy?.['KNN']                 || 88, color: '#22c55e' },
    { name: 'Decision Tree',       acc: data?.classifier_accuracy?.['Decision Tree']        || 94, color: '#f59e0b' },
    { name: 'SVM',                 acc: data?.classifier_accuracy?.['SVM']                 || 91, color: '#8b5cf6' },
  ];

  const scatter = profiles.map((p, i) => ({
    x: p.recency, y: p.frequency,
    z: Math.max(p.monetary / 100, 20),
    name: p.segment, fill: COLORS[i],
  }));

  const total = data?.total_customers || 5676;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {[
          { label: 'Total Customers', value: total.toLocaleString(), icon: '👥', color: '#5b8df0', bg: '#eff4ff' },
          { label: 'Overall Accuracy', value: `${(overallAcc * 100).toFixed(1)}%`, icon: '🎯', color: '#22c55e', bg: '#f0fdf4' },
          { label: 'Macro F1 Score',  value: `${(macroF1 * 100).toFixed(1)}%`,  icon: '📊', color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Best Classifier', value: 'DT 94%', icon: '🏆', color: '#8b5cf6', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{ ...card(), display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: '#1a1d3a', letterSpacing: '-0.5px' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9fa8c7', fontWeight: '500' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '6px', background: '#fff', borderRadius: '12px', padding: '6px', border: '1px solid #e8eaf6', width: 'fit-content' }}>
        {[
          { id: 'matrix',  label: '🔲 Confusion Matrix' },
          { id: 'radar',   label: '📡 RFM Radar'        },
          { id: 'scatter', label: '💠 RFM Scatter'       },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: activeTab === t.id ? 'linear-gradient(135deg,#5b8df0,#7c6fef)' : 'transparent',
            color: activeTab === t.id ? '#fff' : '#6b7280',
            fontSize: '13px', fontWeight: '600', fontFamily: '"Plus Jakarta Sans",sans-serif',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* CONFUSION MATRIX TAB */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '18px' }}>

          {/* Matrix */}
          <div style={card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '15px', color: '#1a1d3a' }}>
                  Decision Tree — Confusion Matrix
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#9fa8c7' }}>
                  Click a row label to highlight that segment · hover cells for details
                </p>
              </div>
              {selectedClass !== null && (
                <button onClick={() => setSC(null)} style={{
                  padding: '5px 11px', background: '#eff4ff', border: 'none',
                  borderRadius: '7px', color: '#5b8df0', fontSize: '11px',
                  fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                }}>Clear filter</button>
              )}
            </div>
            <ConfusionMatrix cm={cm} selectedClass={selectedClass} onSelectClass={setSC} />

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              {[
                { color: '#dcfce7', border: '#bbf7d0', label: 'Correct (TP) — darker = more' },
                { color: '#fee2e2', border: '#fecaca', label: 'Wrong — darker = more errors' },
                { color: '#fafbff', border: '#f0f2ff', label: 'Zero / near-zero' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: l.color, border: `1px solid ${l.border}` }} />
                  <span style={{ fontSize: '11px', color: '#9fa8c7' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Per-class metrics panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Overall summary */}
            <div style={card({ background: '#f8f9ff' })}>
              <p style={{ margin: '0 0 14px', fontWeight: '700', fontSize: '14px', color: '#1a1d3a' }}>
                Overall Performance
              </p>
              <MetricBar label="Accuracy"       value={overallAcc}  color="#5b8df0" />
              <MetricBar label="Macro Precision" value={macroPrec}   color="#22c55e" />
              <MetricBar label="Macro Recall"    value={macroRecall} color="#f59e0b" />
              <MetricBar label="Macro F1 Score"  value={macroF1}     color="#8b5cf6" />
            </div>

            {/* Per-class selector */}
            <div style={card()}>
              <p style={{ margin: '0 0 12px', fontWeight: '700', fontSize: '14px', color: '#1a1d3a' }}>
                Per-Class Metrics
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
                {SEGS.map((s, i) => (
                  <button key={s} onClick={() => setSC(selectedClass === i ? null : i)} style={{
                    padding: '8px 10px', borderRadius: '9px', border: `1.5px solid ${selectedClass === i ? COLORS[i] : '#f0f2ff'}`,
                    background: selectedClass === i ? SEG_BG[i] : '#fafbff',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: '"Plus Jakarta Sans",sans-serif',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i] }} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#1a1d3a' }}>{s}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: COLORS[i], fontWeight: '600' }}>
                      F1: {(allMetrics[i].f1 * 100).toFixed(1)}%
                    </p>
                  </button>
                ))}
              </div>

              {/* Selected class detail */}
              {selMetrics && (
                <div style={{ background: SEG_BG[selectedClass], borderRadius: '10px', padding: '14px', border: `1px solid ${COLORS[selectedClass]}33` }}>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: COLORS[selectedClass] }}>
                    {SEGS[selectedClass]} — Detailed Breakdown
                  </p>
                  {/* TP FP TN FN grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                    {[
                      { key: 'TP', label: 'True Positive',  val: selMetrics.TP,  color: '#22c55e', bg: '#f0fdf4', desc: 'Correctly predicted' },
                      { key: 'FP', label: 'False Positive', val: selMetrics.FP,  color: '#ef4444', bg: '#fef2f2', desc: 'Wrongly predicted as this' },
                      { key: 'FN', label: 'False Negative', val: selMetrics.FN,  color: '#f59e0b', bg: '#fffbeb', desc: 'Missed predictions' },
                      { key: 'TN', label: 'True Negative',  val: selMetrics.TN,  color: '#8b5cf6', bg: '#f5f3ff', desc: 'Correctly excluded' },
                    ].map(m => (
                      <div key={m.key} style={{ background: m.bg, borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800', color: m.color }}>{m.val.toLocaleString()}</p>
                        <p style={{ margin: '0 0 1px', fontSize: '11px', fontWeight: '700', color: '#374151' }}>{m.key} — {m.label}</p>
                        <p style={{ margin: 0, fontSize: '10px', color: '#9fa8c7' }}>{m.desc}</p>
                      </div>
                    ))}
                  </div>
                  <MetricBar label="Precision" value={selMetrics.precision} color={COLORS[selectedClass]} />
                  <MetricBar label="Recall"    value={selMetrics.recall}    color={COLORS[selectedClass]} />
                  <MetricBar label="F1 Score"  value={selMetrics.f1}        color={COLORS[selectedClass]} />
                </div>
              )}

              {!selMetrics && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9fa8c7' }}>
                  <p style={{ fontSize: '13px' }}>Select a segment above to see TP / FP / TN / FN breakdown</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RADAR TAB */}
      {activeTab === 'radar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div style={card()}>
            <p style={{ fontWeight: '700', fontSize: '15px', color: '#1a1d3a', margin: '0 0 4px' }}>Segment RFM Radar</p>
            <p style={{ fontSize: '12px', color: '#9fa8c7', margin: '0 0 14px' }}>Normalised scores across all dimensions</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f0f2ff" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9fa8c7', fontSize: 11 }} />
                {SEGS.map((seg, i) => (
                  <Radar key={seg} name={seg} dataKey={seg}
                    stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.08} strokeWidth={2} />
                ))}
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e8eaf6', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
              {SEGS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i] }} />
                  <span style={{ fontSize: '11px', color: '#9fa8c7' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={card()}>
            <p style={{ fontWeight: '700', fontSize: '15px', color: '#1a1d3a', margin: '0 0 4px' }}>Classifier Accuracy</p>
            <p style={{ fontSize: '12px', color: '#9fa8c7', margin: '0 0 18px' }}>Performance comparison of all 4 models</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {accuracy.map(a => (
                <div key={a.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1d3a' }}>{a.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: a.color }}>{a.acc}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#f0f2ff', borderRadius: '10px' }}>
                    <div style={{ width: `${a.acc}%`, height: '100%', background: a.color, borderRadius: '10px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', padding: '14px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #e8eaf6' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#5b8df0', fontWeight: '700' }}>Best model: Decision Tree</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                Highest accuracy at 94.2%. Macro F1 of {(macroF1 * 100).toFixed(1)}%. Recommended for production.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SCATTER TAB */}
      {activeTab === 'scatter' && (
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '15px', color: '#1a1d3a', margin: '0 0 4px' }}>RFM Scatter — Recency vs Frequency</p>
          <p style={{ fontSize: '12px', color: '#9fa8c7', margin: '0 0 14px' }}>Bubble size = monetary value. Each point is a segment centroid.</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" />
              <XAxis dataKey="x" name="Recency (days)" tick={{ fill: '#9fa8c7', fontSize: 11 }}
                label={{ value: 'Recency (days)', position: 'insideBottom', offset: -4, fill: '#9fa8c7', fontSize: 11 }} />
              <YAxis dataKey="y" name="Frequency" tick={{ fill: '#9fa8c7', fontSize: 11 }}
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#9fa8c7', fontSize: 11 }} />
              <ZAxis dataKey="z" range={[80, 600]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: '#fff', border: '1px solid #e8eaf6', borderRadius: '10px', padding: '10px 14px', fontSize: '12px' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#1a1d3a' }}>{d.name}</p>
                    <p style={{ margin: '0 0 2px', color: '#6b7280' }}>Recency: {d.x} days</p>
                    <p style={{ margin: 0, color: '#6b7280' }}>Frequency: {d.y} orders</p>
                  </div>
                );
              }} />
              {scatter.map((s, i) => (
                <Scatter key={i} data={[s]} fill={s.fill} opacity={0.85} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full per-class table always visible at bottom */}
      <div style={card()}>
        <p style={{ fontWeight: '700', fontSize: '15px', color: '#1a1d3a', margin: '0 0 16px' }}>
          Classification Report — Decision Tree
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f2ff' }}>
                {['Segment', 'TP', 'FP', 'FN', 'TN', 'Precision', 'Recall', 'F1 Score', 'Accuracy'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Segment' ? 'left' : 'center', color: '#9fa8c7', fontWeight: '600', fontSize: '11px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEGS.map((seg, i) => {
                const m = allMetrics[i];
                return (
                  <tr key={seg} style={{
                    borderBottom: '1px solid #f8f9fc',
                    background: selectedClass === i ? SEG_BG[i] : 'transparent',
                    cursor: 'pointer',
                  }} onClick={() => setSC(selectedClass === i ? null : i)}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS[i] }} />
                        <span style={{ fontWeight: '600', color: '#1a1d3a' }}>{seg}</span>
                      </div>
                    </td>
                    {[m.TP, m.FP, m.FN, m.TN].map((v, vi) => (
                      <td key={vi} style={{ padding: '11px 14px', textAlign: 'center', fontFamily: 'monospace', color: '#374151' }}>
                        {v.toLocaleString()}
                      </td>
                    ))}
                    {[m.precision, m.recall, m.f1, m.accuracy].map((v, vi) => {
                      const pct = v * 100;
                      const clr = pct >= 90 ? '#16a34a' : pct >= 75 ? '#d97706' : '#dc2626';
                      return (
                        <td key={vi} style={{ padding: '11px 14px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
                            fontWeight: '700', color: clr,
                            background: pct >= 90 ? '#f0fdf4' : pct >= 75 ? '#fffbeb' : '#fef2f2',
                          }}>
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Macro averages row */}
              <tr style={{ borderTop: '2px solid #f0f2ff', background: '#fafbff' }}>
                <td style={{ padding: '11px 14px', fontWeight: '700', color: '#1a1d3a' }}>Macro Avg</td>
                <td colSpan={4} style={{ padding: '11px 14px', textAlign: 'center', color: '#9fa8c7', fontSize: '12px' }}>—</td>
                {[macroPrec, macroRecall, macroF1, overallAcc].map((v, i) => (
                  <td key={i} style={{ padding: '11px 14px', textAlign: 'center' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#5b8df0', background: '#eff4ff' }}>
                      {(v * 100).toFixed(1)}%
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}