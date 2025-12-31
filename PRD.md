# Product Requirements Document (PRD)

## Project Title

**KVT Jewellers – Website & Web App Refresh**

## 1. Background & Context

The current KVT Jewellers website ([http://www.kvtjewellers.com/](http://www.kvtjewellers.com/)) suffers from:

* Outdated and low-credibility design
* Poor mobile experience
* Direct public exposure of AWS endpoints used for fetching gold prices
* Tight coupling between frontend and sensitive pricing logic

As a luxury jewelry brand, this negatively impacts customer trust, brand perception, and security posture.

This project aims to **clone existing functionality** while **significantly improving design, security, performance, and maintainability**, using a modern Next.js + Vercel stack with PWA support.

---

## 2. Goals & Objectives

### Primary Goals

* Replace the existing website with a modern, secure alternative
* Eliminate all exposed infrastructure endpoints
* Improve visual credibility and UX to match a premium jewelry brand
* Enable staff to manage prices and content safely

### Secondary Goals

* Enable PWA installation for customers and staff
* Lay groundwork for future expansion (e‑commerce, POS, mobile app)

---

## 3. Target Users

### 3.1 Customers (Public Website)

* View daily gold prices
* Browse jewelry collections
* Learn about the brand
* Make enquiries (no checkout initially)

### 3.2 Staff (Web App)

* Manage gold pricing
* Update product/catalog information
* Control what prices are published publicly
* Access system securely from shop tablets or phones

---

## 4. In‑Scope Features

### 4.1 Public Website (Customer‑Facing)

* Homepage (brand, promotions, highlights)
* Live gold price display (read‑only)
* Jewelry catalog & collections
* Product detail pages
* Contact / enquiry forms
* Store location & contact info
* PWA support (installable, offline fallback)

### 4.2 Staff Web App (Protected)

* Secure login (staff only)
* Gold price management

  * View fetched price
  * Manual override
  * Publish/unpublish
* Product & catalog management
* Basic role separation (admin vs staff)
* PWA support for tablet/phone usage

---

## 5. Out‑of‑Scope (Explicit Non‑Goals)

* Online payments or checkout
* Customer accounts or loyalty programs
* POS integration (future phase)
* Mobile native apps

---

## 6. Functional Requirements

### 6.1 Gold Price Handling (Critical)

* Gold prices MUST be fetched server‑side only
* No client‑side API calls to external providers
* External provider credentials stored only in Vercel environment variables
* Prices cached and revalidated at defined intervals
* Public site consumes prices via internal API only

### 6.2 Security Requirements

* No AWS or third‑party endpoints exposed to the browser
* All staff routes protected via authentication
* Role‑based access control for staff features
* Rate limiting on internal APIs

### 6.3 Performance & SEO

* Server Components by default
* Image optimization via Next.js Image
* SEO‑friendly metadata and structured content
* Fast TTFB via Vercel Edge where applicable

---

## 7. Non‑Functional Requirements

* **Framework:** Next.js (App Router)
* **Hosting:** Vercel
* **Styling:** Tailwind CSS + shadcn/ui
* **Auth:** Supabase Auth or Clerk (staff only)
* **Database:** Supabase Postgres (products, prices, staff)
* **PWA:** Offline fallback, install prompt, app icons

---

## 8. UX & Design Guidelines

* Premium, luxury‑oriented visual language
* Minimalistic layouts with strong typography
* Mobile‑first design
* Avoid generic SaaS visuals
* Jewelry imagery must be high quality and well lit

---

## 9. Deployment & Environments

* Production: Vercel (main branch)
* Preview deployments for review
* Environment variables per environment

---

## 10. Risks & Mitigations

| Risk                       | Mitigation                      |
| -------------------------- | ------------------------------- |
| Gold price source downtime | Cached prices + manual override |
| Staff misuse               | Role separation + auditability  |
| Scope creep                | PRD locked for Phase 1          |

---

## 11. Success Metrics

* No exposed infrastructure endpoints
* Improved Lighthouse scores (Performance, SEO, Best Practices)
* Faster page load times vs old site
* Positive stakeholder feedback on UI credibility

---

## 12. Phase Planning

### Phase 1 (This PRD)

* Public site refresh
* Staff web app
* Secure pricing pipeline

### Phase 2 (Future)

* E‑commerce
* POS integration
* Multi‑branch support
* Mobile apps
