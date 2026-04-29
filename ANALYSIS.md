# Analytical Commentary
## Health Insurer Claims Operations - Where Does the Time Go?

**Prepared by:** Rakshit Puniani  
**Data Period:** January - November 2021  
**Population:** 115,529 claims  
**Date of Analysis:** April 2026

---

## Executive Summary

This analysis examines 115,529 health insurance claims processed between January and November 2021. The operation achieves a **99.96% resolution rate** - an outstanding headline metric. However, this masks a critical insight: **processing time is concentrated in two specific channel × claim type combinations** that consume 55.1% of all processing capacity while representing only 15.5% of claim volume. Addressing these two bottlenecks is the single highest-leverage operational improvement available.

---

## 1. The Resolution Picture

| Metric | Value |
|--------|-------|
| Total Claims | 115,529 |
| Paid | 87,059 (75.36%) |
| Rejected | 28,426 (24.61%) |
| Expired | 27 (0.02%) |
| Suspended | 17 (0.01%) |
| **Resolution Rate** | **99.96%** |

**Key Observations:**
- The operation resolves virtually all claims. Only 44 out of 115,529 remain unresolved (Expired or Suspended).
- The 24.61% rejection rate warrants separate investigation - particularly for Medical claims (40.6% rejection rate), which is nearly double the Ancillary rate (21.3%) and 2.5× the Hospital rate (15.9%).
- All 27 expired claims are Medical with exactly 95 processing days, suggesting an automated policy threshold.

---

## 2. The Speed Story - Mean vs. Reality

| Statistic | Value |
|-----------|-------|
| Mean TAT | 5.95 days |
| Median TAT | 3 days |
| P95 TAT | 26 days |
| Maximum TAT | 258 days |
| Same-Day Claims | 24,000 (20.77%) |

### 2.1 Distribution Analysis
The TAT distribution is **heavily right-skewed**. The gap between mean (5.95 days) and median (3 days) indicates that a small proportion of long-duration claims inflates the average.

- **Fast tier (0-2 days):** 53,448 claims (46.3%) - nearly half of all claims are processed within two days
- **Moderate tier (3-6 days):** 37,570 claims (32.5%)  
- **Slow tier (7-29 days):** 19,840 claims (17.2%)  
- **Very slow tier (30+ days):** 4,671 claims (4.0%) - these drive the mean upward

### 2.2 Statistical Interpretation
14.8% of claims exceed the IQR upper fence (11 days). These are not anomalies - they represent genuine operational volume concentrated in specific channels and claim types. Treating them as "outliers" to be excluded would mask the most important finding in the data.

---

## 3. The Bottleneck: Scanning Channel

### 3.1 Channel Performance Comparison

| Channel | Volume | Share | Mean TAT | Median TAT | P95 TAT |
|---------|--------|-------|----------|------------|---------|
| Mobile App | 34,080 | 29.5% | 2.99d | 3d | 5d |
| ECLIPSE | 29,411 | 25.5% | 6.79d | 2d | 28d |
| **Scanning** | **20,326** | **17.6%** | **16.11d** | **12d** | **55d** |
| Claims Portal | 15,935 | 13.8% | 0.70d | 0d | 0d |
| Member Portal | 15,385 | 13.3% | 3.02d | 3d | 5d |
| NSW Ambulance | 335 | 0.3% | 2.53d | 2d | 6d |
| CA Dental | 57 | 0.05% | 0.00d | 0d | 0d |

### 3.2 Critical Finding
**Scanning's mean TAT (16.1 days) is:**
- **5.3× slower** than the next-slowest channel (ECLIPSE at 6.8 days)
- **23× slower** than Claims Portal (0.7 days)
- **5.4× slower** than the system-wide average (3.0 days median)

Despite processing only 17.6% of claims, the Scanning channel consumes an estimated **47.6% of all processing days**. This single channel is the dominant driver of operational latency.

### 3.3 Likely Root Causes
The "Scanning" channel likely involves manual document intake - physical or emailed documents that require digitisation, manual data entry, and human routing. The inherent latency suggests:
1. Manual digitisation creates an intake bottleneck
2. Scanning-submitted claims may require additional verification
3. There may be batch processing rather than real-time handling
4. Medical claims via Scanning (21.5-day mean TAT) suggest complex clinical documents requiring specialist review

---

## 4. The Heatmap: Where Capacity Is Consumed

The most powerful analytical lens is the **Channel × Claim Type** cross-tabulation, measuring each combination's share of total processing time (687,634 total processing days across all claims).

### 4.1 The Two Cells That Tell the Story

| Combination | Volume | Mean TAT | % of Total Processing Time |
|-------------|--------|----------|---------------------------|
| **Medical × Scanning** | ~6,000 | 21.5d | **30.3%** |
| **Hospital × ECLIPSE** | 21,220 | 8.05d | **24.8%** |
| **Combined** | ~27,000 (15.5%) | - | **55.1%** |

These two combinations consume **more than half of all operational capacity** while representing just 15.5% of claim volume. This is the single most important insight in the data.

### 4.2 Efficiency Frontier
In contrast:
- **Claims Portal × Ancillary:** 12,037 claims processed at 0.08-day mean TAT - consuming just 0.15% of total processing time
- **Mobile App × Ancillary:** High volume, fast TAT - the operational gold standard
- **Member Portal:** Consistent 3-day TAT across claim types - well-automated

---

## 5. Claim Type Analysis

### 5.1 Performance by Claim Type

| Claim Type | Volume | Share | Mean TAT | Median | P95 | Rejection Rate |
|------------|--------|-------|----------|--------|-----|----------------|
| Ancillary | 56,279 | 48.7% | 2.58d | 3d | 5d | 21.3% |
| Hospital | 30,851 | 26.7% | 9.19d | 5d | 32d | 15.9% |
| Medical | 28,399 | 24.6% | 9.11d | 2d | 47d | **40.6%** |

### 5.2 Medical Claims: A Dual Problem
Medical claims present two simultaneous challenges:
1. **Highest rejection rate (40.6%)** - nearly double the next category
2. **Highest variance** - despite a median of just 2 days, the P95 is 47 days and max is 258 days

The high rejection rate combined with high TAT variance suggests that Medical claims require more complex assessment, likely involving clinical coding review, provider verification, or benefit eligibility checks that are prone to failure.

### 5.3 Hospital Claims: Volume × Latency
Hospital claims have a lower rejection rate (15.9%) but the highest absolute mean TAT (9.19 days). Combined with their routing through ECLIPSE (24.8% of processing time), they represent a significant capacity drain even though individual claim handling is relatively straightforward.

---

## 6. Agent Performance

### 6.1 Workload Distribution
242 agents process claims across the operation. The top 10 by volume handle predominantly Ancillary claims via Mobile App - the fastest channel/type combination - resulting in low mean TATs that may not reflect superior performance but rather favourable case assignment.

### 6.2 Outlier Agents

| Agent | Mean TAT | Volume | Primary Channel | Primary Type |
|-------|----------|--------|-----------------|-------------|
| HDR | 42.1d | 1,031 | Scanning | Medical |
| MDD | 37.8d | 964 | Scanning | Medical |

These agents handle the most complex workload (Medical × Scanning) and their high TATs likely reflect case complexity rather than underperformance. **Fair performance comparison requires normalising for claim type and channel assignment.**

### 6.3 Specialisation Pattern
7 of the top 10 agents by volume exclusively handle Ancillary claims. This specialisation may drive efficiency but creates vulnerability:
- No cross-training capacity for surge scenarios
- Agent performance metrics are not comparable across specialisations
- Knowledge silos may impede process improvement

---

## 7. Strategic Recommendations

### 7.1 Immediate Actions (0-3 months)
1. **Scanning Channel Audit:** Conduct a process mapping exercise on the Scanning channel to identify specific points of delay - intake, digitisation, routing, or review
2. **Medical × Scanning Deep Dive:** The 21.5-day mean TAT and 30.3% processing time share demand root-cause analysis. Are these claims inherently complex, or are they experiencing queueing delays?
3. **Rejection Rate Review:** The 40.6% Medical rejection rate should be analysed at the claim-level to distinguish between legitimate rejections and process failures

### 7.2 Medium-Term Improvements (3-6 months)
4. **Channel Migration Strategy:** Can claims currently entering via Scanning be redirected to digital channels (Claims Portal, Member Portal, Mobile App)?
5. **Agent Performance Framework:** Implement normalised performance metrics that account for channel and claim type assignment
6. **Batch Processing Elimination:** If Scanning operates on batch cycles, move to continuous processing

### 7.3 Long-Term Transformation (6-12 months)
7. **Digital-First Intake:** Invest in OCR/AI-assisted document processing for the Scanning channel
8. **Auto-Adjudication Expansion:** Claims Portal already achieves near-zero TAT - extend its rules engine to other channels
9. **Predictive Triage:** Route likely-complex claims to specialist teams at intake rather than after delays

---

## 8. Limitations & Caveats

1. **No cost data:** Processing time is a proxy for cost. Actual cost-per-claim may differ based on labour rates across channels.
2. **No quality metrics:** Speed and rejection rates don't capture claim accuracy. Faster processing is not inherently better if it reduces accuracy.
3. **Seasonal concentration:** 94% of volume falls in September-October 2021. Earlier months may reflect system ramp-up rather than typical operations.
4. **Agent ID is anonymised:** We cannot correlate agent performance with tenure, training, or team assignment.
5. **Single time period:** No year-over-year comparison is possible. Trends cannot be established from a single observation period.

---

*This analysis was prepared using Python (Pandas) for data processing and Chart.js for visualisation. All figures are derived from the source dataset of 115,529 claims with no imputation or synthetic data. See the Methodology document for detailed technical notes.*
