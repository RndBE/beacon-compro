# Presentasi Hidrologi — Design Spec

**Tanggal:** 2026-05-29
**Status:** Disetujui (outline), build dimulai atas instruksi user ("gas kerjakan")

## Tujuan

Membuat deck presentasi baru khusus **hidrologi**, dengan tema/visual identik
dengan deck `infrastruktur-air` yang sudah ada, namun konten difokuskan pada
**sistem hidrologi sebagai satu kesatuan** dan **manfaatnya** — bukan katalog
produk per-alat.

- Audiens: sama seperti deck air (proposal Kementerian PU / BBWS-BWS / Dinas SDA),
  tone institusional.
- Panjang: setara deck air (~23 slide).
- Akses: `/presentasi/hidrologi`.

## Pendekatan

Fork mesin & tema deck air, re-author konten slide.

- **Dipertahankan verbatim:** `<head>` + CSS inline + seluruh komponen React
  (AWLRChart, RainfallBars, EWSPanel, JIATPanel, LiveDashboard, CommandCenter, dll.)
  + `deck-stage.js` (engine slide) + peta geojson.
- **Diganti:** hanya blok `<section>` slide (di antara `<deck-stage>` … `</deck-stage>`).
- Total slide tetap **23** agar penomoran bagian belakang tidak perlu digeser.

### Aset (di `static/presentasi/hidrologi/`)

- `deck-stage.js`, `logo_be.png`, `indonesia.geojson` — disalin dari folder air.
- URL geojson di kode React diubah: `/presentasi/infrastruktur-air/...`
  → `/presentasi/hidrologi/...`.

## Outline 23 slide

**Pembuka & konteks (1–6)** — struktur sama, teks diarahkan ke hidrologi
1. Cover — Transformasi Digital Sistem Hidrologi Indonesia
2. Executive Summary — pengelolaan air butuh data hidrologi, bukan asumsi
3. Konteks Nasional — data hidrologi fondasi pengelolaan SDA
4. Keterkaitan Strategis (Asta Cita) — air, pangan, kebencanaan, digitalisasi
5. Masalah Utama — pencatatan manual, pos rusak, gap data, keterlambatan

**Sistem secara keseluruhan (6–15)** — fokus sistem utuh, bukan produk
6. Visi Solusi — satu sistem hidrologi end-to-end: ukur → kirim → olah → putuskan
7. Jaringan Pemantauan Terintegrasi (live: dash-water)
8. Parameter yang Dipantau (grid: hujan, TMA, debit, klimatologi, air tanah, kualitas)
9. Telemetri & Akuisisi Data Real-time (live: awlr-chart)
10. Pusat Data & Dashboard Terintegrasi (command-center)
11. Early Warning Terpadu — banjir & kekeringan (live: ews-panel)
12. Pemodelan & Prakiraan Hidrologi (live: dash-water + narasi forecast)
13. AI Insight & Neraca Air (ai-card)
14. Validasi & Kualitas Data (QA/QC hidrologi)
15. Integrasi & Interoperabilitas (berbagi data antar-instansi)

**Arsitektur & manfaat (16–23)** — struktur sama, teks diarahkan ke hidrologi
16. Arsitektur Sistem — end-to-end stack
17. Manfaat untuk Pemerintah & Pengelola SDA (operasional/keselamatan/perencanaan/akuntabilitas)
18. Dampak Strategis — mitigasi banjir, ketahanan air & pangan
19. Paket Implementasi — Pilot / Scale Up / Integrated
20. Contoh Pilot — konfigurasi titik di satu DAS/WS
21. Kenapa Beacon Engineering
22. Roadmap Kerja Sama — 7 tahap
23. Closing — kontak

## Komponen interaktif yang dipakai ulang

`dash-water` (AWLR+rainfall), `awlr-chart`, `ews-panel`, `command-center`,
`live-dashboard` — semua relevan untuk hidrologi, hanya datanya ilustratif.
