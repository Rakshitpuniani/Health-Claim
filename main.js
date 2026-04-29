import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// We pass ChartDataLabels per-chart via plugins:[] to guarantee it works

/* Coxswain palette */
const C = {
  navy: '#011c39', electric: '#4A00FF', bright: '#4d65ff', brightLight: '#8b9dff',
  teal: '#0d9488', amber: '#d97706', red: '#c0392b', emerald: '#059669',
  orange: '#e67e22', slate: '#546e7a',
};
const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

let DATA = null;

/* Scroll progress */
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if (h > 0) document.getElementById('progress-bar').style.width = ((window.scrollY / h) * 100) + '%';
});

/* Chart defaults */
Chart.defaults.color = '#3d5068';
Chart.defaults.borderColor = '#dde2ec';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
Chart.defaults.plugins.legend.labels.padding = 14;
Chart.defaults.plugins.tooltip.backgroundColor = '#011c39';
Chart.defaults.plugins.tooltip.titleColor = '#fff';
Chart.defaults.plugins.tooltip.bodyColor = '#cdd6e4';
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 12;

/* Load data */
fetch('/dashboard_data.json')
  .then(r => r.json())
  .then(d => { DATA = d; render(); })
  .catch(e => console.error('Data load failed', e));

function render() {
  renderKPIs();
  renderStatusChart();
  renderMonthlyVolume();
  renderTATDist();
  renderChannelVol();
  renderChannelTAT();
  renderHeatmap();
  renderTypeTAT();
  renderTypeReject();
  renderTypeCards();
  renderAgentScatter();
  renderSlowAgents();
  renderAgentTable();
  renderCommentary();
}

/* ═══ KPIs ═══ */
function renderKPIs() {
  const k = DATA.kpis;
  const cards = [
    { l: 'Total Claims', v: fmt(k.totalClaims), s: 'Jan – Nov 2021', c: 'kpi-navy' },
    { l: 'Resolution Rate', v: k.resolvedPct + '%', s: `${fmt(k.paidCount)} Paid · ${fmt(k.rejectedCount)} Rejected`, c: 'kpi-teal' },
    { l: 'Mean TAT', v: k.meanTAT + 'd', s: `Median ${k.medianTAT}d · P95 ${k.p95TAT}d`, c: 'kpi-amber' },
    { l: 'Same-Day', v: k.sameDayPct + '%', s: `${fmt(k.sameDayCount)} claims in 0 days`, c: 'kpi-bright' },
    { l: 'Rejection Rate', v: k.rejectedPct + '%', s: `${fmt(k.rejectedCount)} claims rejected`, c: 'kpi-red' },
  ];
  document.getElementById('kpi-strip').innerHTML = cards.map(c =>
    `<div class="kpi-card ${c.c}"><div class="kpi-label">${c.l}</div><div class="kpi-value">${c.v}</div><div class="kpi-sub">${c.s}</div></div>`
  ).join('');
}

/* ═══ Status Donut ═══ */
function renderStatusChart() {
  const sb = DATA.statusBreakdown;
  const percentPlugin = {
    id: 'donutLabels',
    afterDraw(chart) {
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      meta.data.forEach((arc, i) => {
        if (sb[i].pct < 1) return;
        const cx = (chart.chartArea.left + chart.chartArea.right) / 2;
        const cy = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        const mid = (arc.startAngle + arc.endAngle) / 2;
        const r = arc.outerRadius + 22;
        ctx.save();
        ctx.fillStyle = C.navy;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sb[i].pct + '%', cx + Math.cos(mid) * r, cy + Math.sin(mid) * r);
        ctx.restore();
      });
    }
  };
  new Chart(document.getElementById('chart-status'), {
    type: 'doughnut',
    data: {
      labels: sb.map(s => s.status + ' (' + s.pct + '%)'),
      datasets: [{ data: sb.map(s => s.count), backgroundColor: [C.emerald, C.red, C.amber, C.electric], borderWidth: 2, borderColor: '#fff', hoverOffset: 10 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%', layout: { padding: 30 },
      plugins: { legend: { position: 'bottom' },
        tooltip: { callbacks: { label: ctx => `${sb[ctx.dataIndex].status}: ${ctx.raw.toLocaleString()} (${sb[ctx.dataIndex].pct}%)` } } }
    },
    plugins: [percentPlugin]
  });
}

/* ═══ Monthly Volume ═══ */
function renderMonthlyVolume() {
  const mt = DATA.monthlyTrend;
  new Chart(document.getElementById('chart-monthly-vol'), {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: mt.map(m => m.month.replace('2021-', '')),
      datasets: [{ label: 'Claims', data: mt.map(m => m.count), backgroundColor: C.electric, barThickness: 28 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => fmt(v) } },
        x: { title: { display: true, text: '2021' }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          display: ctx => ctx.dataset.data[ctx.dataIndex] > 500,
          anchor: 'end', align: 'top', offset: 2,
          color: C.navy, font: { weight: '700', size: 10 },
          formatter: v => fmt(v)
        }
      }
    }
  });
}

/* ═══ TAT Distribution ═══ */
function renderTATDist() {
  const td = DATA.tatDistribution;
  const colors = [C.emerald, C.emerald, C.teal, C.bright, C.bright, C.amber, C.amber, C.orange, C.red, C.red];
  new Chart(document.getElementById('chart-tat-dist'), {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: td.map(t => t.label),
      datasets: [{ label: 'Claims', data: td.map(t => t.count), backgroundColor: colors }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => fmt(v) }, title: { display: true, text: 'Number of Claims' } },
        x: { grid: { display: false }, title: { display: true, text: 'Processing Time' } }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end', align: 'top', offset: 2,
          color: C.navy, font: { weight: '600', size: 10 },
          formatter: (v, ctx) => td[ctx.dataIndex].pct + '%'
        }
      }
    }
  });
}

/* ═══ Channel Volume ═══ */
function renderChannelVol() {
  const ch = DATA.channels;
  new Chart(document.getElementById('chart-channel-vol'), {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: ch.map(c => c.channel),
      datasets: [{ label: 'Volume', data: ch.map(c => c.count), backgroundColor: [C.electric, C.bright, C.red, C.teal, C.brightLight, C.slate, C.amber], barPercentage: 0.7 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      scales: { x: { beginAtZero: true, ticks: { callback: v => fmt(v) } }, y: { grid: { display: false } } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end', align: 'right', offset: 4,
          color: C.navy, font: { weight: '700', size: 10 },
          formatter: (v, ctx) => fmt(v) + ' (' + ch[ctx.dataIndex].pct + '%)'
        }
      }
    }
  });
}

/* ═══ Channel TAT ═══ */
function renderChannelTAT() {
  const ch = DATA.channels;
  new Chart(document.getElementById('chart-channel-tat'), {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: ch.map(c => c.channel),
      datasets: [{ label: 'Mean TAT (days)', data: ch.map(c => c.meanTAT), backgroundColor: ch.map(c => c.meanTAT > 10 ? C.red : c.meanTAT > 4 ? C.amber : C.emerald), barPercentage: 0.7 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      scales: { x: { beginAtZero: true, title: { display: true, text: 'Days' } }, y: { grid: { display: false } } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end', align: 'right', offset: 4,
          color: C.navy, font: { weight: '700', size: 10 },
          formatter: v => v + 'd'
        }
      }
    }
  });
}

/* ═══ Heatmap ═══ */
function renderHeatmap() {
  const hm = DATA.heatmap;
  const channels = [...new Set(hm.map(h => h.channel))];
  const types = ['Ancillary', 'Hospital', 'Medical'];
  const lookup = {};
  hm.forEach(h => { lookup[h.channel + '|' + h.claimType] = h; });
  const maxPct = Math.max(...hm.map(h => h.pctTotalTime || 0));
  const getStyle = pct => {
    if (!pct || pct === 0) return 'background:#f3f4f8; color:#9ca3af';
    const r = pct / maxPct;
    if (r > 0.6) return `background: rgba(192,57,43,${0.15 + r * 0.3}); color:#7f1d1d`;
    if (r > 0.25) return `background: rgba(217,119,6,${0.12 + r * 0.22}); color:#78350f`;
    return `background: rgba(5,150,105,${0.1 + r * 0.18}); color:#065f46`;
  };
  let html = `<table class="heatmap-table"><thead><tr><th></th>${types.map(t => `<th>${t}</th>`).join('')}</tr></thead><tbody>`;
  channels.forEach(ch => {
    html += `<tr><td class="row-label">${ch}</td>`;
    types.forEach(t => {
      const cell = lookup[ch + '|' + t];
      if (cell && cell.volume > 0) {
        html += `<td style="${getStyle(cell.pctTotalTime)}">${cell.pctTotalTime}%<span class="heatmap-cell-sub">${cell.volume.toLocaleString()} claims · ${cell.meanTAT}d avg</span></td>`;
      } else {
        html += `<td style="background:#f3f4f8; color:#c5cad4">—</td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  document.getElementById('heatmap-container').innerHTML = html;
}

/* ═══ Type TAT ═══ */
function renderTypeTAT() {
  const ct = DATA.claimTypes;
  new Chart(document.getElementById('chart-type-tat'), {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: ct.map(c => c.type),
      datasets: [
        { label: 'Mean', data: ct.map(c => c.meanTAT), backgroundColor: C.electric },
        { label: 'Median', data: ct.map(c => c.medianTAT), backgroundColor: C.teal },
        { label: 'P95', data: ct.map(c => c.p95TAT), backgroundColor: C.red },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Days' } }, x: { grid: { display: false } } },
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          anchor: 'end', align: 'top', offset: 2,
          color: C.navy, font: { weight: '600', size: 10 },
          formatter: v => v + 'd'
        }
      }
    }
  });
}

/* ═══ Type Rejection ═══ */
function renderTypeReject() {
  const ct = DATA.claimTypes;
  new Chart(document.getElementById('chart-type-reject'), {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: ct.map(c => c.type),
      datasets: [
        { label: 'Paid %', data: ct.map(c => c.paidPct), backgroundColor: C.emerald },
        { label: 'Rejected %', data: ct.map(c => c.rejectedPct), backgroundColor: C.red },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, max: 100, ticks: { callback: v => v + '%' } } },
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          display: ctx => ctx.dataset.data[ctx.dataIndex] > 10,
          color: '#fff', font: { weight: '700', size: 11 },
          formatter: v => v + '%'
        }
      }
    }
  });
}

/* ═══ Type Cards ═══ */
function renderTypeCards() {
  const ct = DATA.claimTypes;
  const colors = [C.electric, C.bright, C.navy];
  document.getElementById('type-cards').innerHTML = ct.map((c, i) => {
    const tc = c.meanTAT > 8 ? 'bad' : c.meanTAT > 4 ? 'warn' : 'good';
    const rc = c.rejectedPct > 30 ? 'bad' : c.rejectedPct > 20 ? 'warn' : 'good';
    return `<div class="type-card">
      <h4><span class="type-dot" style="background:${colors[i]}"></span>${c.type}</h4>
      <div class="stat-row"><span class="stat-label">Volume</span><span class="stat-val">${c.count.toLocaleString()} (${c.pct}%)</span></div>
      <div class="stat-row"><span class="stat-label">Mean TAT</span><span class="stat-val ${tc}">${c.meanTAT}d</span></div>
      <div class="stat-row"><span class="stat-label">Median TAT</span><span class="stat-val">${c.medianTAT}d</span></div>
      <div class="stat-row"><span class="stat-label">P95 TAT</span><span class="stat-val">${c.p95TAT}d</span></div>
      <div class="stat-row"><span class="stat-label">Paid Rate</span><span class="stat-val good">${c.paidPct}%</span></div>
      <div class="stat-row"><span class="stat-label">Rejected</span><span class="stat-val ${rc}">${c.rejectedPct}%</span></div>
    </div>`;
  }).join('');
}

/* ═══ Agent Scatter ═══ */
function renderAgentScatter() {
  const agents = DATA.agents;
  new Chart(document.getElementById('chart-agent-scatter'), {
    type: 'bubble',
    plugins: [ChartDataLabels],
    data: {
      datasets: [{
        label: 'Agent',
        data: agents.map(a => ({ x: a.count, y: a.meanTAT, r: Math.max(5, Math.sqrt(a.count) / 1.8), label: a.userId })),
        backgroundColor: agents.map(a => a.meanTAT > 10 ? 'rgba(192,57,43,0.55)' : a.meanTAT > 5 ? 'rgba(217,119,6,0.55)' : 'rgba(5,150,105,0.55)'),
        borderColor: agents.map(a => a.meanTAT > 10 ? C.red : a.meanTAT > 5 ? C.amber : C.emerald),
        borderWidth: 1.5,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { x: { title: { display: true, text: 'Claim Volume' } }, y: { title: { display: true, text: 'Mean TAT (days)' }, beginAtZero: true } },
      plugins: {
        legend: { display: false },
        datalabels: {
          display: ctx => ctx.dataset.data[ctx.dataIndex].y > 10,
          color: C.navy, font: { weight: '700', size: 9 },
          formatter: (v, ctx) => ctx.dataset.data[ctx.dataIndex].label,
          anchor: 'end', align: 'top', offset: 2,
        },
        tooltip: { callbacks: { title: ctx => 'Agent ' + ctx[0].raw.label, label: ctx => `Volume: ${ctx.raw.x} · TAT: ${ctx.raw.y.toFixed(1)}d` } }
      }
    }
  });
}

/* ═══ Slow Agents ═══ */
function renderSlowAgents() {
  const slow = DATA.slowAgents;
  new Chart(document.getElementById('chart-slow-agents'), {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: slow.map(a => a.userId),
      datasets: [{ label: 'Mean TAT (days)', data: slow.map(a => a.meanTAT), backgroundColor: slow.map(a => a.meanTAT > 30 ? C.red : C.amber), barPercentage: 0.7 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      scales: { x: { beginAtZero: true, title: { display: true, text: 'Mean TAT (days)' } }, y: { grid: { display: false } } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end', align: 'right', offset: 4,
          color: C.navy, font: { weight: '700', size: 10 },
          formatter: v => v + 'd'
        },
        tooltip: { callbacks: { label: ctx => `TAT: ${slow[ctx.dataIndex].meanTAT}d · Vol: ${slow[ctx.dataIndex].count} · ${slow[ctx.dataIndex].primaryChannel}` } }
      }
    }
  });
}

/* ═══ Agent Table — sorted by TAT desc, expandable ═══ */
function renderAgentTable() {
  // Sort by meanTAT descending (most problematic first)
  const sorted = [...DATA.agents].sort((a, b) => b.meanTAT - a.meanTAT);
  const INITIAL = 10;
  let expanded = false;

  function buildTable(list) {
    let html = `<table class="data-table"><thead><tr><th>#</th><th>Agent</th><th>Volume</th><th>Mean TAT</th><th>Median</th><th>P95</th><th>Channel</th><th>Claim Mix</th></tr></thead><tbody>`;
    list.forEach((a, i) => {
      const m = a.claimMix || {};
      const bar = `<div class="mix-bar">${m.Ancillary ? `<span style="width:${m.Ancillary}%;background:${C.electric}"></span>` : ''}${m.Hospital ? `<span style="width:${m.Hospital}%;background:${C.bright}"></span>` : ''}${m.Medical ? `<span style="width:${m.Medical}%;background:${C.navy}"></span>` : ''}</div>`;
      const cls = a.meanTAT > 10 ? ` style="color:${C.red};font-weight:700"` : a.meanTAT > 5 ? ` style="color:${C.amber}"` : '';
      html += `<tr><td style="color:${C.slate};font-size:0.75rem">${i + 1}</td><td class="agent-id">${a.userId}</td><td>${a.count.toLocaleString()}</td><td${cls}>${a.meanTAT}d</td><td>${a.medianTAT}d</td><td>${a.p95TAT}d</td><td>${a.primaryChannel}</td><td>${bar}</td></tr>`;
    });
    html += '</tbody></table>';
    const remaining = sorted.length - INITIAL;
    if (!expanded && remaining > 0) {
      html += `<button id="expand-agents" class="expand-btn">Show all ${sorted.length} agents ↓</button>`;
    } else if (expanded) {
      html += `<button id="collapse-agents" class="expand-btn">Show top ${INITIAL} only ↑</button>`;
    }
    return html;
  }

  const container = document.getElementById('agent-table-container');
  container.innerHTML = buildTable(sorted.slice(0, INITIAL));

  container.addEventListener('click', e => {
    if (e.target.id === 'expand-agents') {
      expanded = true;
      container.innerHTML = buildTable(sorted);
    } else if (e.target.id === 'collapse-agents') {
      expanded = false;
      container.innerHTML = buildTable(sorted.slice(0, INITIAL));
    }
  });
}

/* ═══ Commentary ═══ */
function renderCommentary() {
  document.getElementById('commentary').innerHTML = `
    <h3>Key Finding</h3>
    <p>The claims operation achieves a <strong>99.96% resolution rate</strong>, but the <strong>mean turnaround time of 5.95 days masks extreme variance</strong>: while the median is just 3 days, the 95th percentile is 26 days and some claims take over 250 days. This right-skewed distribution is driven almost entirely by <strong>two bottleneck combinations — Medical claims via Scanning (21.5-day average TAT, 30.3% of all processing time) and Hospital claims via ECLIPSE (8.1-day TAT, 24.8% of total time)</strong>.</p>
    <div class="comm-callout comm-info"><strong>Together, these two combinations consume 55.1% of total processing capacity</strong> despite representing only 15.5% of claim volume. This is the single highest-leverage finding in the data.</div>

    <h3>Areas of Greatest Concern</h3>
    <p><strong>1. Scanning Channel — The Primary Bottleneck.</strong> The Scanning channel processes 17.6% of claims (20,326) yet has a mean TAT of <strong>16.1 days</strong> — more than 5× the next-slowest channel (ECLIPSE at 6.8 days) and 23× the fastest high-volume channel (Claims Portal at 0.7 days). Scanning's P95 TAT is 55 days.</p>
    <div class="comm-callout comm-warn">The Scanning channel contributes <strong>47.6%</strong> of all processing days despite handling only 17.6% of volume.</div>

    <p><strong>2. Medical Claims — High Rejection, High Variance.</strong> Medical claims carry a <strong>40.6% rejection rate</strong>, nearly double Ancillary (21.3%) and 2.5× Hospital (15.9%). The mean TAT of 9.1 days has extreme variance (std dev 15.8), driven by Medical×Scanning at 21.5 days average.</p>

    <p><strong>3. Agent Workload Imbalance.</strong> The top 10 agents by volume almost exclusively handle single claim types — 7 of 10 handle only Ancillary claims (≈3-day TAT). Agents HDR (42.1-day mean TAT, 1,031 claims) and MDD (37.8 days, 964 claims) are significant outliers warranting investigation.</p>

    <h3>Data Quality & Assumptions</h3>
    <ul>
      <li><strong>Processing days verified:</strong> Independently derived from ReceivedDate/ProcessDate — confirmed consistent with the provided field.</li>
      <li><strong>Expired claims (n=27):</strong> All exactly 95 processing days, exclusively Medical. Auto-expired at a policy threshold. Included in volume but flagged in TAT analysis.</li>
      <li><strong>Suspended claims (n=17):</strong> Retained — 0.01% of total.</li>
      <li><strong>Outlier treatment:</strong> 14.8% of claims exceed IQR upper fence (11 days). Retained as genuine operational volume. Median and P95 reported alongside means.</li>
      <li><strong>Zero-day claims (n=24,000, 20.8%):</strong> Concentrated in Claims Portal (63%) and ECLIPSE (21%) — likely auto-adjudicated. Included in all analyses.</li>
      <li><strong>Date range:</strong> Jan–Nov 2021. 94% of volume in Sep–Oct 2021. Earlier months likely reflect system ramp-up.</li>
      <li><strong>Duplicate Client_IDs (45,904 rows):</strong> Expected — members submit multiple claims. No deduplication performed.</li>
    </ul>

    <h3>Methodology Notes</h3>
    <ul>
      <li><strong>Processing days:</strong> ProcessDate − ReceivedDate in calendar days. Verified against provided field.</li>
      <li><strong>Resolution classification:</strong> Paid and Rejected = "resolved"; Expired and Suspended = "unresolved".</li>
      <li><strong>Heatmap metric:</strong> % of total processing time = sum of processing days per channel×type ÷ 687,634 total days.</li>
      <li><strong>Agent performance:</strong> Shown with claim-type mix and primary channel to enable fair comparison accounting for case complexity.</li>
    </ul>`;
}
