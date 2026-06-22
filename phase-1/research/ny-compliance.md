# NY Homeschool Compliance Research

**Source:** 8 NYCRR § 100.10 (Commissioner's Regulations), NYC DOE, third-party guides.
**Last verified:** June 2026

---

## Annual compliance cycle (4 documents)

The school year runs **July 1 – June 30** for all NY homeschool purposes.

| Step | Deadline | To whom |
|------|----------|---------|
| 1. Letter of Intent (LOI) | By July 1, or within 14 days of starting mid-year | District superintendent |
| 2. Individualized Home Instruction Plan (IHIP) | Within 4 weeks of receiving IHIP form from district, or by Aug 15 (whichever is later) | District superintendent |
| 3. Quarterly Reports (×4) | On the dates *you* specify in the IHIP (commonly Nov 15, Jan 31, Apr 15, Jun 30) | District superintendent |
| 4. Annual Assessment | With the 4th quarterly report (by June 30) | District superintendent |

---

## 1. Letter of Intent (LOI)

Must include:
- child's name, age, grade level
- list of subjects to be taught
- educational plan or objectives

Send via certified mail with return receipt requested. Keep a copy.

---

## 2. IHIP — Individualized Home Instruction Plan

Core compliance document. Required **every year** for every child. One per child — no group filing.

### Must contain:
- Child's full legal name, age, grade level
- NYC Student ID (if previously enrolled in NYC)
- List of syllabi, curriculum materials, textbooks, or plan of instruction **for each required subject**
- Four specific calendar dates for quarterly report submission (evenly spaced in logical periods)
- Names of all individuals providing instruction (parents, tutors, co-op facilitators)

### Required subjects by grade band:

**Grades 1–6:** arithmetic, reading, spelling, writing, English language arts, geography, US history, NY history, science, health education, music, visual arts, physical education

**All grades additionally require:** patriotism & citizenship, alcohol/drug/tobacco prevention, highway safety, fire safety

### District review timeline:
- IHIP submitted → district has **10 business days** to respond (compliance or deficiency notice)
- If deficient → parent has **15 days** to revise and resubmit
- Vague descriptions like "various resources" rejected — districts expect specific titles/programs

---

## 3. Quarterly Reports

Submitted on the exact dates stated in the IHIP. Miss a deadline and the district may initiate attendance enforcement.

### Each report must include:
1. **Number of instructional hours** during the quarter
2. **Description of material covered** in each subject listed in the IHIP
3. **Grade or written narrative** evaluating the child's progress in each subject
4. **Explanation** if less than 80% of planned material was covered in any subject

### Hour targets per quarter:
| Grade band | Annual min | Per quarter (approx) |
|------------|-----------|---------------------|
| 1–6 | 900 hours | 225 hours |
| 7–12 | 990 hours | 247 hours |

Also: substantial equivalent of **180 days** of instruction per year.

### Suggested due dates (per NYC DOE):
| Report | Due |
|--------|-----|
| Quarter 1 | November 15 |
| Quarter 2 | January 31 |
| Quarter 3 | April 15 |
| Quarter 4 | June 30 (+ annual assessment) |

---

## 4. Annual Assessment

Due with the 4th quarterly report. Format depends on grade:

| Grade band | Requirement |
|------------|-------------|
| K | No assessment required |
| 1–3 | Standardized test **OR** written narrative evaluation |
| 4–8 | Standardized test every other year; narrative in alternate years |
| 9–12 | Standardized test **every year** |

### Approved standardized tests:
- Iowa Test of Basic Skills (now "Iowa Assessments")
- California Achievement Test
- Stanford Achievement Test
- Comprehensive Test of Basic Skills
- Metropolitan Achievement Test
- PASS test (parent-administered at home)
- Any NYSED-approved test

### Passing threshold (either):
- Score at or above the **33rd percentile**
- At least **one academic year of growth** compared to prior year's score

### If score is inadequate:
- Program placed on **probation for up to 2 school years**
- Parent must submit a **remediation plan**
- District may require changes before accepting the plan

---

## Recordkeeping requirements

Parents must maintain and make available on request:
- Attendance records (days and hours log)
- Copies of all 4 quarterly reports
- Annual assessment results
- Copies of LOI and IHIP with proof of delivery
- Student work samples

---

## Probation rules (§ 100.10(i))

- If annual assessment fails to meet requirements → **probation for up to 2 school years**
- Parent must submit plan of remediation addressing deficiencies
- District may require changes prior to acceptance

---

## NYC-specific notes

- NYC DOE has its own **Office of Homeschooling** (homeschool@schools.nyc.gov)
- Issues a **Letter of Compliance (LOC)** after LOI + IHIP review — confirms program meets § 100.10
- NYC DOE is notoriously slow to acknowledge receipt — send with read receipts, keep dated copies
- Submit IHIP as **PDF** with subject line: `IHIP, [child's name], [NYC Student ID]`
- IHIPs reviewed in order received — do not send multiple emails

---

## Key legal references

- **8 NYCRR § 100.10** — full text at https://www.law.cornell.edu/regulations/new-york/8-NYCRR-100.10
- **NY Education Law § 3204(2)** — definition of substantially equivalent instruction
- **NY Education Law § 3205** — compulsory attendance
- **NY Education Law § 3210(2)(d)** — attendance records
- **NY Education Law § 3212(2)** — duties of parents

---

## Implications for Agent Academy compliance engine

- **IHIP generator** needs: per-child docs, curriculum material list per subject, user-specified quarterly dates, instructor names
- **Quarterly report generator** needs: hour counter, material-covered log, grade/narrative input, <80% explanation trigger
- **Annual assessment tracker** needs: test type selection, score entry, percentile/growth calculation, probation flag
- **Hour tracker** needs: daily log → quarterly/ yearly rollup, 900/990 hour target, 180-day target, per-subject distribution
- **Compliance calendar** needs: LOI due Jul 1 → IHIP due Aug 15 → Q1 Nov 15 → Q2 Jan 31 → Q3 Apr 15 → Q4+assessment Jun 30
- **Multi-child** support required (separate IHIP per child)
- **District differentiation** needed: NYC DOE has distinct process (email-based, LOC) vs. other NY districts
