# Analytical Commentary
## Medical via Scanning and Hospital via ECLIPSE - consume 55.1% of all processing time while representing just 15.5% of claim volume.
##
## Health Insurer Claims Operations
**Rakshit Puniani | Data Period: Jan-Nov 2021 | 115,529 Claims**

---

## Key Finding

The claims operation resolves 99.96% of its volume, but this headline metric conceals a severe capacity concentration problem: **two channel-claim type combinations - Medical via Scanning and Hospital via ECLIPSE - consume 55.1% of all processing time while representing just 15.5% of claim volume.** The Scanning channel alone, handling 17.6% of claims (20,326), accounts for 47.6% of total processing days at a mean turnaround of 16.1 days - 23 times slower than Claims Portal (0.7 days) and 5.4 times slower than the system-wide median of 3 days.

This is not a speed problem across the board. It is a **structural bottleneck localised to one channel** that distorts the entire operation's performance profile.

---

## Areas of Greatest Concern

### 1. The Scanning Channel Is the Dominant Bottleneck

Scanning's 16.1-day mean TAT is 5.3 times the next-slowest channel (ECLIPSE at 6.8 days). Its P95 of 55 days means one in twenty Scanning claims takes nearly two months. The median of 12 days (versus 0-3 days for digital channels) confirms this is not driven by a few extreme outliers - the entire distribution is shifted.

Within Scanning, Medical claims are the worst subset: 21.5-day mean TAT, contributing 30.3% of all 687,634 processing days across the operation. For context, Claims Portal processes 12,037 Ancillary claims at 0.08-day mean TAT, consuming just 0.15% of total processing time. The contrast is roughly **200:1 in processing intensity per claim** between the slowest and fastest channel-type combinations.

The likely root cause is manual document intake - physical or emailed documents requiring digitisation, data entry, and human routing - but the data alone cannot confirm this. A process-mapping exercise on Scanning intake is the highest-leverage diagnostic action available.

### 2. Medical Claims: High Rejection, High Variance

Medical claims carry a **40.6% rejection rate** - 2.5 times Hospital (15.9%) and nearly double Ancillary (21.3%). This is the single highest rejection rate in the dataset and applies across 28,399 claims.

The TAT profile compounds the problem: Medical's mean of 9.1 days masks extreme variance, with a median of just 2 days but a P95 of 47 days and a maximum of 258 days. This bimodal pattern suggests two populations within Medical claims - one auto-adjudicated quickly, one requiring extended manual review. The 40.6% rejection rate raises a separate question: are claims being rejected because they are genuinely ineligible, or because the assessment process introduces errors? The data cannot answer this, but the combination of slow processing and high rejection warrants a claim-level audit.

### 3. Agent Performance Reflects Assignment, Not Skill

242 agents process claims, but performance comparison is misleading without controlling for case assignment. The top 10 agents by volume (3,200-3,700 claims each) almost exclusively handle Ancillary claims via Mobile App - the fastest combination at approximately 3-day mean TAT. Meanwhile, agents HDR (42.1-day mean TAT, 1,031 claims) and MDD (37.8 days, 964 claims) handle Medical claims through Scanning - the slowest combination.

Seven of the top ten agents by volume handle a single claim type. This specialisation drives efficiency but creates fragility: no cross-training capacity exists for volume surges, and performance metrics are incomparable across specialisations. Any agent performance framework must normalise for channel and claim type assignment before drawing conclusions about individual capability.

---

## Data Quality, Assumptions, and Exclusions

**No records were excluded.** All 115,529 claims are retained in every calculation. This is a deliberate choice: the long-tail claims that inflate the mean TAT are not measurement errors - they are the operational bottleneck under investigation. Removing them would suppress the primary signal.

**Specific observations:**

- **Processing days verified independently.** I calculated ProcessDate minus ReceivedDate for all records and confirmed consistency with the source-provided Processing Days field across all 115,529 rows. No discrepancies were found.

- **Expired claims (n=27):** All 27 are Medical type with exactly 95 processing days, strongly suggesting an automated policy expiry threshold rather than manual disposition. Retained in analysis; flagged where TAT distributions are discussed.

- **Suspended claims (n=17):** 0.01% of total volume. Retained. No meaningful impact on any metric.

- **Duplicate Client_IDs (45,904 rows):** Expected - members submit multiple claims. No deduplication was performed; each row represents a distinct claim event.

- **Temporal concentration:** 94% of volume falls in September-October 2021. January-August volumes are substantially lower and may represent system ramp-up or migration rather than typical operations. All months are included, but trend analysis should be interpreted cautiously given this non-uniform distribution.

- **Zero-day claims (n=24,000, 20.8%):** Concentrated in Claims Portal (63%) and ECLIPSE (21%). These likely represent auto-adjudicated claims. Included in all analyses as they reflect genuine operational throughput.

- **Outlier threshold:** Using the IQR method (Q1=1, Q3=5, IQR=4), the upper fence is 11 days. 17,091 claims (14.8%) exceed this threshold. These are retained as they represent the capacity consumption pattern central to this analysis.

---

*All figures are derived directly from the source dataset. No imputation, interpolation, or synthetic data generation was performed. Every claim in this commentary is traceable to specific aggregations documented in the accompanying dashboard and methodology notes.*
