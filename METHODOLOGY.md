# Methodology & Data Dictionary
## Health Insurer Claims Operations Analysis

**Version:** 1.0  
**Prepared by:** Rakshit Puniani  
**Data Period:** January - November 2021  
**Dataset:** 115,529 claim records  

---

## 1. Data Source & Scope

### 1.1 Source Dataset
- **File:** `Health Insurer Claims Data Set copy (1).xlsx`
- **Records:** 115,529 rows (one row per claim)
- **Date Range:** ReceivedDate from 2021-01-04 to 2021-11-30; ProcessDate from 2021-01-04 to 2021-12-08
- **Temporal Note:** 94% of claim volume (108,961 claims) is concentrated in September-October 2021. Earlier months (January-August) contain significantly lower volumes and may represent system ramp-up, pilot testing, or migration artefacts

### 1.2 Fields Used

| Field | Type | Description |
|-------|------|-------------|
| `Claim_No` | String | Unique claim identifier |
| `Client_ID` | String | Member/policyholder identifier (not unique - members submit multiple claims) |
| `ReceivedDate` | Date | Date claim was received by the insurer |
| `ProcessDate` | Date | Date claim processing was completed |
| `Processing days` | Integer | Days between ReceivedDate and ProcessDate (provided in source) |
| `Channel` | Categorical | Submission channel (7 values) |
| `Claim_Type` | Categorical | Claim category (3 values) |
| `Claim_Status` | Categorical | Resolution status (4 values) |
| `User_ID` | String | Processing agent identifier (anonymised) |

---

## 2. Data Processing Pipeline

### 2.1 Processing Days Calculation
```
Processing Days = ProcessDate − ReceivedDate (in calendar days)
```

**Verification:** The independently calculated field was cross-referenced against the source-provided `Processing days` column. Results were consistent across all 115,529 records. The source field was used for all downstream analysis.

### 2.2 Data Quality Checks

| Check | Result | Action |
|-------|--------|--------|
| Missing values | No nulls in any analysis field | N/A |
| Negative processing days | 0 records | N/A |
| Duplicate Claim_No | 0 duplicates | N/A |
| Duplicate Client_ID | 45,904 rows share Client_IDs | Expected - members file multiple claims. No deduplication performed |
| Date range validity | All dates within 2021 | Confirmed |

### 2.3 No Data Exclusions
All 115,529 records are included in every analysis. No records were removed as outliers, errors, or edge cases. This decision ensures:
- Volume counts are accurate
- TAT distributions reflect true operational reality
- Extreme values (which represent genuine operational bottlenecks) are not suppressed

---

## 3. Metric Definitions

### 3.1 Core KPIs

| Metric | Definition | Formula |
|--------|------------|---------|
| **Total Claims** | Count of all claim records | `COUNT(Claim_No)` |
| **Resolution Rate** | % of claims with a final outcome | `(Paid + Rejected) / Total × 100` |
| **Rejection Rate** | % of claims rejected | `Rejected / Total × 100` |
| **Mean TAT** | Average processing time | `MEAN(Processing days)` |
| **Median TAT** | Middle value of processing time | `MEDIAN(Processing days)` |
| **P95 TAT** | 95th percentile processing time | `PERCENTILE(Processing days, 0.95)` |
| **Same-Day Rate** | % of claims processed in 0 days | `COUNT(Processing days = 0) / Total × 100` |

### 3.2 Status Classification

| Status | Classification | Count | Description |
|--------|---------------|-------|-------------|
| Paid | Resolved | 87,059 | Claim approved and payment processed |
| Rejected | Resolved | 28,426 | Claim denied (various reasons) |
| Expired | Unresolved | 27 | Claim auto-closed after 95-day threshold |
| Suspended | Unresolved | 17 | Claim paused pending additional information |

**Note on Expired Claims:** All 27 expired claims are Medical type with exactly 95 processing days. This uniformity strongly suggests an automated expiry policy rather than manual disposition. These claims are included in all volume and TAT calculations.

### 3.3 Channel Definitions

| Channel | Likely Intake Method | Volume |
|---------|---------------------|--------|
| Mobile App | Digital - mobile application | 34,080 |
| ECLIPSE | System - internal processing platform | 29,411 |
| Scanning | Manual - document scanning/digitisation | 20,326 |
| Claims Portal | Digital - web portal (provider-facing) | 15,935 |
| Member Portal | Digital - web portal (member-facing) | 15,385 |
| NSW Ambulance | Automated - state ambulance feed | 335 |
| CA Dental | Automated - dental network feed | 57 |

### 3.4 Claim Type Definitions

| Claim Type | Volume | Typical Coverage |
|------------|--------|-----------------|
| Ancillary | 56,279 | Extras/general treatment (dental, optical, physio, pharmacy) |
| Hospital | 30,851 | Hospital admission, surgical procedures |
| Medical | 28,399 | GP visits, specialist consultations, pathology, radiology |

---

## 4. Analytical Methods

### 4.1 TAT Distribution Bucketing
Processing days are bucketed into 10 bins chosen to balance granularity at the fast end (where most claims fall) with practical grouping at the slow end:

| Bucket | Range | Rationale |
|--------|-------|-----------|
| Same day | 0 days | Likely auto-adjudicated |
| 1 day | 1 day | Near-instant manual processing |
| 2 days | 2 days | Standard fast processing |
| 3-4 days | 3-4 days | Typical SLA window |
| 5-6 days | 5-6 days | Extended standard processing |
| 7-13 days | 7-13 days | Slow - first week+ |
| 14-29 days | 14-29 days | Slow - multi-week |
| 30-59 days | 30-59 days | Very slow - monthly+ |
| 60-99 days | 60-99 days | Extreme outlier territory |
| 100+ days | ≥100 days | Exceptional cases |

### 4.2 Heatmap: % of Total Processing Time

The heatmap metric quantifies each Channel × Claim Type combination's contribution to total operational processing burden:

```
% Total Processing Time = SUM(Processing days for Channel×Type) / SUM(All Processing days) × 100

Total Processing Days across all claims = 687,634
```

This metric is superior to simple volume or mean TAT because it captures the **compound effect** of both volume and latency. A high-volume, fast combination may consume less total time than a low-volume, slow combination.

### 4.3 Outlier Analysis
- **IQR Method:** Q1 = 1, Q3 = 5, IQR = 4. Upper fence = Q3 + 1.5 × IQR = 11 days
- **Claims exceeding upper fence:** 17,091 (14.8%)
- **Decision:** Retained in all analyses. These claims are not measurement errors - they represent the operational bottleneck under investigation. Removing them would eliminate the signal the analysis is designed to detect.

### 4.4 Agent Performance Ranking
Agents are ranked by **Mean TAT (descending)** to surface the most problematic (slowest) first. This ranking must be interpreted in context:
- Agents handling Medical × Scanning claims will inherently have higher TATs
- Volume thresholds should be considered (low-volume agents may have unreliable means)
- The "Slowest Agents" chart filters to agents with ≥100 claims to ensure statistical stability

---

## 5. Visualisation Design

### 5.1 Technology Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Build Tool | Vite | 5.4.x |
| Charts | Chart.js | 3.9.1 |
| Data Labels | chartjs-plugin-datalabels | 2.x |
| Fonts | Google Fonts (Inter, Playfair Display) | - |
| Hosting | Vercel | - |

### 5.2 Colour System
Colours are drawn from the Coxswain Alliance brand palette with functional extensions:

| Colour | Hex | Usage |
|--------|-----|-------|
| Navy | `#011c39` | Primary text, headers, brand anchor |
| Electric Violet | `#4A00FF` | Primary accent, key data points |
| Bright Blue | `#4d65ff` | Secondary accent |
| Emerald | `#059669` | Positive/fast indicators |
| Amber | `#d97706` | Warning/moderate indicators |
| Red | `#c0392b` | Danger/slow indicators |
| Teal | `#0d9488` | Supplementary positive |

### 5.3 Chart Design Decisions
1. **No borderRadius on bar charts:** Removed to ensure cross-browser rendering compatibility with Chart.js v3
2. **Data labels on all charts:** Applied via per-chart plugin registration to display values directly on chart elements
3. **Conditional colouring:** Bar colours change based on performance thresholds (e.g., TAT > 10d = red, > 4d = amber, ≤ 4d = green)
4. **Percentage labels outside donut:** Custom afterDraw plugin positions labels at `outerRadius + 22px` from centre

---

## 6. Data Pipeline: From Excel to Dashboard

```
Excel Dataset (.xlsx)
        │
        ▼
Python/Pandas Processing Script
  - Read Excel, validate fields
  - Calculate KPIs, distributions, aggregations
  - Group by Channel, Claim_Type, User_ID
  - Generate heatmap cross-tabulation
  - Export to JSON
        │
        ▼
dashboard_data.json (static file)
        │
        ▼
Vite + Chart.js Dashboard
  - Fetches JSON at page load
  - Renders 10+ interactive visualisations
  - Scrollytelling narrative layout
        │
        ▼
Vercel Deployment
  - Auto-deploys on git push
  - CDN-distributed globally
```

---

## 7. Reproducibility

To reproduce this analysis:

1. **Source data:** Use the provided Excel file (115,529 rows, no modifications)
2. **Processing:** Run the Python script to generate `dashboard_data.json`
3. **Dashboard:** `npm install && npm run dev` for local development
4. **Verification:** All derived metrics (mean, median, P95, percentages) can be independently verified against the source Excel using standard pivot table analysis

### 7.1 Key Formulas for Verification

```python
# Total claims
len(df)  # = 115,529

# Resolution rate
(df['Claim_Status'].isin(['Paid','Rejected']).sum()) / len(df) * 100  # = 99.96%

# Mean TAT
df['Processing days'].mean()  # = 5.95

# Scanning channel TAT
df[df['Channel']=='Scanning']['Processing days'].mean()  # = 16.11

# Medical rejection rate
df[df['Claim_Type']=='Medical']['Claim_Status'].eq('Rejected').mean() * 100  # = 40.59%

# Heatmap: Medical × Scanning % of total time
scanning_medical = df[(df['Channel']=='Scanning') & (df['Claim_Type']=='Medical')]
scanning_medical['Processing days'].sum() / df['Processing days'].sum() * 100  # ≈ 30.3%
```

---

*This methodology document accompanies the Claims Operations Analytics Dashboard and the Analytical Commentary. All three artefacts form a complete analytical package suitable for stakeholder review.*
