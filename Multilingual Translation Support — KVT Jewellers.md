Below is a **comprehensive Translation PRD (Product Requirements Document)** for adding multilingual support — starting with **Malay (Bahasa Melayu)** — to **KVT Jewellers (kvt.arwindpianist.com)**.

This PRD is structured for **engineering, product, and QA teams** to execute efficiently and in phases by language.

---

# 📄 Product Requirements Document

## Multilingual Translation Support — KVT Jewellers

### Project Vision

Enable customer-facing pages of **KVT Jewellers** website to support **multiple languages**, starting with **Malay (Bahasa Melayu)**, in a scalable, maintainable way that enhances usability, engagement, and accessibility for non-English speaking customers.

---

## 1. 🎯 Objectives

### Primary Goals

1. Provide **accurate Malay translations** of all customer-facing text.
2. Ensure a **seamless language switcher** UX across public pages.
3. Maintain **English as default** for staff/admin interfaces and internal operations.
4. Support future languages (Hindi, Tamil, Bengali, etc.) with minimal overhead.

---

## 2. 📌 Scope

### In Scope

* Customer-facing pages (public site)
* Navigation elements
* Hero sections
* Services & product descriptions
* Buttons/CTAs
* Banners and promotions
* Footers
* Error pages (404/500)
* Forms and form labels
* Accessibility text (ARIA labels where applicable)

### Out of Scope (Phase 1 – Malay)

* Staff/Admin pages (dashboard, backend tools)
* Marketing campaign content
* Legal text that must remain English (privacy policy/legal terms)
* Dynamic user-generated content

---

## 3. 📍 Approach

### Translation Method

**Phase 1 — Malay:**

* Manual review and adjustments for accuracy and cultural relevance.
* Prefer custom translation over automated translation APIs.
* Use i18n token-based text replacement in code (not hardcoded strings).

### Implementation Strategy

* Use a library-based approach (e.g., **next-intl** / **react-i18next**).
* Store language strings in JSON dictionary files.
* Render based on user language selection.
* Persist user choice with **cookie/localStorage**.

---

## 4. 🛠 Technical Specification

### 4.1 i18n Library

* **Primary:** `next-intl` (Next.js native internationalization support)
* Custom fallback to English if Malay token missing.

### 4.2 File Structure (Illustrative Example)

```
/app
  /(public)
    page.tsx
    products/page.tsx
/messages
  en.json
  ms.json
```

### 4.3 Language Files

* `en.json` – English
* `ms.json` – Malay

Each JSON contains hierarchical tokens:

Example:

```json
// en.json
{
  "nav": {
    "home": "Home",
    "products": "Products"
  }
}
```

```json
// ms.json
{
  "nav": {
    "home": "Laman Utama",
    "products": "Produk"
  }
}
```

---

## 5. 🧭 User Experience (UX)

### 5.1 Language Selector

* Placed in a consistent, visible location (top navigation and footer)
* Icon + label (e.g., 🌐 Bahasa Melayu / English)
* Persist preference via cookie

### 5.2 Page Behavior

* All public pages update content instantly on language change
* Users stay on the same route
* No full page reload unless required by routing method

### 5.3 Fallback Language

* If Malay translation missing, fallback to English text
* Show console warning during development for missing tokens

---

## 6. 📊 Acceptance Criteria

### Functional

1. Users can switch between **English ↔ Malay**
2. All visible text is replaced (no missing tokens)
3. Navigation and contact forms are fully translated
4. Language selection persists across sessions
5. Malay content presents correct grammar and culturally appropriate phrasing

### Non-Functional

1. No performance slowdown due to translation implementation
2. SEO meta titles & descriptions can be provided in Malay (optional but recommended)
3. Accessibility (ARIA, alt text) respected per language

### QA Tests

* Toggle language back and forth across site pages
* Refresh page and confirm state persistence
* Inspect translated text for accuracy
* Verify fallback behavior

---

## 7. 📑 Label & Translation List (Initial for Malay)

| Token Key       | English                           | Malay (Bahasa Melayu)                      |
| --------------- | --------------------------------- | ------------------------------------------ |
| `nav.home`      | Home                              | Laman Utama                                |
| `nav.products`  | Products                          | Produk                                     |
| `nav.contact`   | Contact Us                        | Hubungi Kami                               |
| `hero.title`    | Fine Jewellery for Every Occasion | Barang Kemas Berkualiti untuk Setiap Acara |
| `hero.subtitle` | Crafted with Perfection           | Direka dengan Kesempurnaan                 |
| `cta.shopNow`   | Shop Now                          | Beli Sekarang                              |
| `cta.contact`   | Contact Us                        | Hubungi Kami                               |
| `footer.copy`   | © 2026 KVT Jewellers              | © 2026 KVT Jewellers                       |
| `form.name`     | Your Name                         | Nama Anda                                  |
| `form.email`    | Email Address                     | Alamat Emel                                |
| `form.submit`   | Submit                            | Hantar                                     |

> Note: This list will expand sitewide as part of development.

---

## 8. 📊 SEO & Metadata (Optional but Recommended)

Malay meta titles & descriptions improve search visibility.

Example:

| Page     | English Title                  | Malay Title                             |
| -------- | ------------------------------ | --------------------------------------- |
| Homepage | KVT Jewellers – Fine Jewellery | KVT Jewellers – Barang Kemas Berkualiti |
| Products | Shop Elegant Jewellery         | Beli Barang Kemas Elegan                |

---

## 9. 📅 Roadmap & Phases

### Phase 1 — Malay (Bahasa Melayu)

* Establish i18n system
* Translate core UI
* QA / user review
* Launch

### Phase 2 — Optional Additional Languages

* **Tamil**
* **Hindi**
* **Bangla**

*Repeat translation process per language with proper token files.*

---

## 10. 🚦 Risks & Mitigation

| Risk                            | Mitigation                                               |
| ------------------------------- | -------------------------------------------------------- |
| Incorrect automated translation | Use manual revision by native speakers                   |
| Missing tokens                  | Build tooling + dev script to list unused/missing tokens |
| UI overflow text                | Design responsive layouts that adapt for longer text     |

---

## 11. 🧩 Future Enhancements

* Flag icons vs language names
* Auto language detection (browser locale)
* SEO multi-regional pages (`/ms/`, `/ta/`)
* Language toggle in footer and sticky header

---