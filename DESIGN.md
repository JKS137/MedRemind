# MedRemind — Full App Development Guide

> Medication Reminder + Refill Alert App · Solo Developer Blueprint · March 2026

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Market Opportunity](#2-market-opportunity)
3. [MVP Feature List](#3-mvp-feature-list)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Database Schema](#6-database-schema)
7. [Core Code — Notification Engine](#7-core-code--notification-engine)
8. [Core Code — Medication Storage](#8-core-medication-storage)
9. [Core Code — Refill Countdown](#9-core-code--refill-countdown)
10. [Screens & Navigation Map](#10-screens--navigation-map)
11. [Monetization & RevenueCat Setup](#11-monetization--revenuecat-setup)
12. [Freemium Feature Gates](#12-freemium-feature-gates)
13. [Revenue Projections](#13-revenue-projections)
14. [6-Week Build Timeline](#14-6-week-build-timeline)
15. [App Store Setup](#15-app-store-setup)
16. [Launch Strategy](#16-launch-strategy)
17. [Post-Launch Growth](#17-post-launch-growth)
18. [Google Stitch UI Prompt](#18-google-stitch-ui-prompt)

---

## 1. Product Overview

**App name:** MedRemind  
**Tagline:** Never miss a dose. Never run out.  
**Platform:** iOS + Android (React Native / Expo)  
**Target users:** Patients on daily medications, caregivers managing medications for family members  
**Core problem:** 50% of patients with chronic conditions skip or forget doses. There is no simple, beautiful, affordable tool that combines reminders + refill tracking + caregiver mode in one app.

### One-line pitch
> "The water reminder app makes millions — medication adherence is 10x more critical and the gap is wide open."

---

## 2. Market Opportunity

| Signal | Data |
|--------|------|
| Non-adherence cost globally | $500B+ per year |
| Patients skipping daily meds | ~50% |
| Medication reminder app market | $1.2B by 2027 |
| Pakistan chronic illness patients | 30M+ (diabetes, hypertension, thyroid) |
| Caregiver app willingness to pay | High — emotional purchase |

**Why now:** Existing apps (Medisafe, MyTherapy) are overloaded with clinical features. A clean, fast, $2.99/mo app wins on simplicity.

---

## 3. MVP Feature List

### Phase 1 — Ship in Week 1–3 (No backend required)

- [ ] Add medication (name, dosage, frequency, times per day)
- [ ] Scheduled push notification reminders (local, on-device)
- [ ] Mark as Taken / Skipped from notification or home screen
- [ ] Refill countdown (enter pill count → days remaining alert)
- [ ] Today dashboard (doses + statuses at a glance)
- [ ] Adherence streak counter

### Phase 2 — Week 4–6 (Adds paywall features)

- [ ] Family / caregiver mode (track meds for parent or child)
- [ ] Cloud sync via Supabase (multi-device)
- [ ] Adherence history — weekly and monthly charts
- [ ] PDF health report export (for doctor visits)
- [ ] Drug interaction warning (OpenFDA API)

### Phase 3 — Month 3+ (Growth & revenue)

- [ ] Pharmacy refill integration (affiliate revenue)
- [ ] Doctor appointment reminders
- [ ] B2B clinic edition ($99/mo)
- [ ] WhatsApp caregiver alerts (Twilio)
- [ ] Urdu / Arabic language support

---

## 4. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React Native + Expo | One codebase → iOS + Android |
| Notifications | Expo Notifications | Free, local scheduling, no server needed for MVP |
| Local storage | AsyncStorage / MMKV | Zero backend cost for MVP |
| Backend (Phase 2) | Supabase | Free tier, Postgres, auth, real-time sync |
| Subscriptions | RevenueCat | Handles App Store + Play Store billing, free to $2.5k MRR |
| Drug data | OpenFDA API | Free, no rate limit for low usage |
| Analytics | PostHog | Free up to 1M events/month |
| PDF generation | react-native-pdf-lib | Generate doctor-ready reports |
| Error tracking | Sentry | Free tier, crash reports |
| Navigation | React Navigation v6 | Stack + Tab navigator |

**Total infrastructure cost for MVP: $0/month**

---

## 5. Project Structure

```
medremind/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home / Today dashboard
│   │   ├── schedule.tsx       # Full schedule view
│   │   ├── family.tsx         # Caregiver mode (premium)
│   │   └── profile.tsx        # Settings, subscription
│   ├── medication/
│   │   ├── add.tsx            # Add new medication
│   │   ├── edit.tsx           # Edit existing medication
│   │   └── detail.tsx         # Med detail + history
│   └── onboarding/
│       ├── welcome.tsx
│       └── permissions.tsx    # Notification permission request
├── components/
│   ├── DoseCard.tsx           # Today's dose card component
│   ├── ProgressRing.tsx       # Adherence progress ring
│   ├── RefillAlert.tsx        # Low refill warning strip
│   └── PremiumGate.tsx        # Paywall modal wrapper
├── lib/
│   ├── notifications.ts       # Schedule / cancel notifications
│   ├── storage.ts             # AsyncStorage CRUD helpers
│   ├── refill.ts              # Refill countdown logic
│   ├── adherence.ts           # Streak + history calculations
│   └── pdf.ts                 # PDF export helper
├── store/
│   └── medications.ts         # Zustand state store
├── hooks/
│   ├── useMedications.ts
│   └── useAdherence.ts
├── constants/
│   ├── colors.ts
│   └── config.ts
└── app.json
```

---

## 6. Database Schema

### Local (AsyncStorage) — MVP

```typescript
// Key: "medications"
type Medication = {
  id: string;                    // uuid
  name: string;                  // "Metformin"
  dosage: string;                // "500mg"
  form: "tablet" | "capsule" | "liquid" | "injection";
  times: string[];               // ["08:00", "20:00"]
  withFood: boolean;
  startDate: string;             // ISO date
  active: boolean;
  refillCount: number;           // current pill count
  refillThreshold: number;       // alert when <= this many pills
  color: string;                 // card accent color
  notes?: string;
};

// Key: "doses:{YYYY-MM-DD}"
type DoseLog = {
  medicationId: string;
  scheduledTime: string;         // "08:00"
  status: "taken" | "skipped" | "pending";
  takenAt?: string;              // ISO timestamp
};

// Key: "settings"
type Settings = {
  userName: string;
  notificationsEnabled: boolean;
  snoozeMinutes: number;         // default 10
  isPremium: boolean;
  premiumExpiresAt?: string;
};
```

### Cloud (Supabase) — Phase 2

```sql
-- users (managed by Supabase Auth)

create table medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  dosage text,
  form text,
  times text[],
  with_food boolean default false,
  start_date date,
  active boolean default true,
  refill_count integer default 0,
  refill_threshold integer default 7,
  color text,
  notes text,
  created_at timestamptz default now()
);

create table dose_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications not null,
  user_id uuid references auth.users not null,
  scheduled_time text,
  scheduled_date date,
  status text check (status in ('taken', 'skipped', 'pending')),
  taken_at timestamptz,
  created_at timestamptz default now()
);

-- Row-level security
alter table medications enable row level security;
create policy "Users see own meds" on medications
  for all using (auth.uid() = user_id);

alter table dose_logs enable row level security;
create policy "Users see own logs" on dose_logs
  for all using (auth.uid() = user_id);
```

---

## 7. Core Code — Notification Engine

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import { Medication } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMedicationReminders(med: Medication): Promise<void> {
  // Cancel existing notifications for this medication first
  await cancelMedicationReminders(med.id);

  for (const time of med.times) {
    const [hours, minutes] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier: `${med.id}-${time}`,
      content: {
        title: `Time for ${med.name}`,
        body: `${med.dosage}${med.withFood ? ' · take with food' : ''}`,
        data: { medicationId: med.id, scheduledTime: time },
        sound: true,
        badge: 1,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }
}

export async function cancelMedicationReminders(medicationId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(n => n.identifier.startsWith(medicationId));
  await Promise.all(toCancel.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function scheduleRefillAlert(med: Medication): Promise<void> {
  if (med.refillCount <= med.refillThreshold) {
    await Notifications.scheduleNotificationAsync({
      identifier: `refill-${med.id}`,
      content: {
        title: `Refill ${med.name} soon`,
        body: `Only ${med.refillCount} ${med.form}s remaining`,
        data: { type: 'refill', medicationId: med.id },
      },
      trigger: null, // fire immediately
    });
  }
}
```

---

## 8. Core Medication Storage

```typescript
// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, DoseLog } from '../types';
import { scheduleMedicationReminders, cancelMedicationReminders } from './notifications';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const MEDS_KEY = 'medications';
const dose_key = (date: string) => `doses:${date}`;

export async function getMedications(): Promise<Medication[]> {
  const raw = await AsyncStorage.getItem(MEDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addMedication(data: Omit<Medication, 'id'>): Promise<Medication> {
  const meds = await getMedications();
  const newMed: Medication = { ...data, id: uuidv4() };
  await AsyncStorage.setItem(MEDS_KEY, JSON.stringify([...meds, newMed]));
  await scheduleMedicationReminders(newMed);
  return newMed;
}

export async function updateMedication(updated: Medication): Promise<void> {
  const meds = await getMedications();
  const next = meds.map(m => m.id === updated.id ? updated : m);
  await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(next));
  await scheduleMedicationReminders(updated); // reschedule with new times
}

export async function deleteMedication(id: string): Promise<void> {
  const meds = await getMedications();
  await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(meds.filter(m => m.id !== id)));
  await cancelMedicationReminders(id);
}

export async function getDosesForDate(date: string): Promise<DoseLog[]> {
  const raw = await AsyncStorage.getItem(dose_key(date));
  return raw ? JSON.parse(raw) : [];
}

export async function markDose(
  medicationId: string,
  scheduledTime: string,
  date: string,
  status: 'taken' | 'skipped'
): Promise<void> {
  const doses = await getDosesForDate(date);
  const existing = doses.findIndex(
    d => d.medicationId === medicationId && d.scheduledTime === scheduledTime
  );
  const log: DoseLog = {
    medicationId,
    scheduledTime,
    status,
    takenAt: status === 'taken' ? new Date().toISOString() : undefined,
  };
  if (existing >= 0) doses[existing] = log;
  else doses.push(log);
  await AsyncStorage.setItem(dose_key(date), JSON.stringify(doses));
}
```

---

## 9. Core Code — Refill Countdown

```typescript
// lib/refill.ts
import { Medication } from '../types';
import { getMedications, updateMedication } from './storage';
import { scheduleRefillAlert } from './notifications';

export function daysRemaining(med: Medication): number {
  const dosesPerDay = med.times.length;
  if (dosesPerDay === 0) return Infinity;
  return Math.floor(med.refillCount / dosesPerDay);
}

export function isRefillUrgent(med: Medication): boolean {
  return daysRemaining(med) <= med.refillThreshold;
}

// Call this every time a dose is marked "taken"
export async function decrementRefill(medicationId: string): Promise<void> {
  const meds = await getMedications();
  const med = meds.find(m => m.id === medicationId);
  if (!med || med.refillCount <= 0) return;

  const updated = { ...med, refillCount: med.refillCount - 1 };
  await updateMedication(updated);

  if (isRefillUrgent(updated)) {
    await scheduleRefillAlert(updated);
  }
}

export async function refillMedication(medicationId: string, count: number): Promise<void> {
  const meds = await getMedications();
  const med = meds.find(m => m.id === medicationId);
  if (!med) return;
  await updateMedication({ ...med, refillCount: med.refillCount + count });
}
```

---

## 10. Screens & Navigation Map

```
App
├── Onboarding Stack (first launch only)
│   ├── WelcomeScreen
│   └── NotificationPermissionScreen
│
└── Main Tab Navigator
    ├── Tab: Home (TodayScreen)
    │   ├── Today's dose cards (pending / taken / skipped)
    │   ├── Progress ring (adherence %)
    │   ├── Refill alert strip (if any med is low)
    │   └── → Tap dose card → DoseDetailScreen
    │
    ├── Tab: Schedule (ScheduleScreen)
    │   ├── Weekly calendar strip
    │   ├── All doses by time of day
    │   └── → Tap medication → MedicationDetailScreen
    │
    ├── Tab: + (Add FAB)
    │   └── AddMedicationScreen (modal)
    │       ├── Name, dosage, form
    │       ├── Frequency (daily / twice daily / custom)
    │       ├── Time picker(s)
    │       ├── Refill count input
    │       └── Color picker
    │
    ├── Tab: Family (FamilyScreen) [PREMIUM]
    │   ├── Profile switcher (Self / Add member)
    │   ├── Each member's today dashboard
    │   └── → AddFamilyMemberScreen
    │
    └── Tab: Profile (ProfileScreen)
        ├── Adherence stats (weekly / monthly)
        ├── PDF export [PREMIUM]
        ├── Subscription management
        └── Settings (notifications, snooze, language)
```

---

## 11. Monetization & RevenueCat Setup

### Install

```bash
npx expo install react-native-purchases
```

### Initialize

```typescript
// App.tsx
import Purchases from 'react-native-purchases';

const API_KEY_IOS = 'appl_xxxxxxxxxxxx';
const API_KEY_ANDROID = 'goog_xxxxxxxxxxxx';

Purchases.configure({
  apiKey: Platform.OS === 'ios' ? API_KEY_IOS : API_KEY_ANDROID,
});
```

### Subscription products to create in App Store Connect + Google Play

| Product ID | Type | Price | Description |
|-----------|------|-------|-------------|
| `medremind_monthly` | Auto-renewing | $2.99/mo | MedRemind Premium |
| `medremind_yearly` | Auto-renewing | $24.99/yr | MedRemind Premium (Annual) |
| `medremind_family` | Auto-renewing | $5.99/mo | Family Plan (3 profiles) |

### Purchase flow

```typescript
// lib/purchases.ts
import Purchases, { PurchasesPackage } from 'react-native-purchases';

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (e: any) {
    if (!e.userCancelled) throw e;
    return false;
  }
}

export async function checkPremium(): Promise<boolean> {
  const info = await Purchases.getCustomerInfo();
  return info.entitlements.active['premium'] !== undefined;
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return info.entitlements.active['premium'] !== undefined;
}
```

---

## 12. Freemium Feature Gates

```typescript
// components/PremiumGate.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { checkPremium } from '../lib/purchases';
import { router } from 'expo-router';

type Props = {
  feature: string;
  children: React.ReactNode;
};

export function PremiumGate({ feature, children }: Props) {
  const [isPremium, setIsPremium] = React.useState(false);

  React.useEffect(() => {
    checkPremium().then(setIsPremium);
  }, []);

  if (isPremium) return <>{children}</>;

  return (
    <View style={{ padding: 24, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
        Premium Feature
      </Text>
      <Text style={{ color: '#888', textAlign: 'center', marginBottom: 20 }}>
        {feature} is available on MedRemind Premium
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/profile/upgrade')}
        style={{ backgroundColor: '#2C6E49', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Upgrade — $2.99/mo</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Feature gate map

| Feature | Free | Premium ($2.99/mo) | Family ($5.99/mo) |
|---------|------|--------------------|-------------------|
| Medications | Up to 3 | Unlimited | Unlimited |
| Reminders | ✅ | ✅ | ✅ |
| Refill countdown | ✅ | ✅ | ✅ |
| Adherence history | 7 days | Unlimited | Unlimited |
| PDF export | ❌ | ✅ | ✅ |
| Drug interaction check | ❌ | ✅ | ✅ |
| Family profiles | ❌ | ❌ | Up to 5 |
| Cloud sync | ❌ | ✅ | ✅ |

---

## 13. Revenue Projections

| Scenario | Monthly Downloads | Conversion | Subscribers | MRR | Take-home* |
|----------|------------------|-----------|-------------|-----|-----------|
| Conservative | 500 | 4% | 83 | $248 | $174 |
| Realistic | 2,000 | 5% | 500 | $1,497 | $1,048 |
| Growth | 5,000 | 7% | 1,167 | $3,490 | $2,443 |
| Breakout | 15,000 | 8% | 4,000 | $11,960 | $8,372 |

*After 30% App Store cut. At steady state (new paid / churn rate).

**Additional revenue streams:**
- Pharmacy referral: $3–8 per refill order placed through app
- Family plan upsell: $5.99/mo from caregivers (2x ARPU)
- Annual plan: $24.99/yr offered at checkout (reduces churn)
- B2B clinic licenses: $99/mo per clinic (cold email to GPs)

---

## 14. Six-Week Build Timeline

### Week 1 — Foundation
- [ ] `npx create-expo-app medremind --template expo-template-blank-typescript`
- [ ] Install dependencies: `expo-notifications`, `@react-native-async-storage/async-storage`, `react-navigation`, `zustand`
- [ ] Build navigation skeleton (Tab + Stack)
- [ ] Add Medication form (basic)
- [ ] AsyncStorage read/write helpers

### Week 2 — Core reminder engine
- [ ] Notification permission request on first launch
- [ ] `scheduleMedicationReminders()` function
- [ ] Today dashboard screen with dose cards
- [ ] Mark taken / skipped (from screen + notification action)
- [ ] Refill countdown display

### Week 3 — Polish + paywall
- [ ] RevenueCat setup (create products in App Store Connect)
- [ ] PremiumGate component
- [ ] Adherence streak counter
- [ ] Onboarding flow (welcome + permission request)
- [ ] App icon, splash screen, theme colors

### Week 4 — Submission prep
- [ ] Privacy Policy page (required for App Store)
- [ ] App Store screenshots (6.7", 5.5", iPad)
- [ ] App Store description + keywords
- [ ] Submit to Apple review + Google Play review
- [ ] Fix any review rejection issues

### Week 5 — Soft launch
- [ ] Share with 30–50 beta users (friends, family)
- [ ] Post in 3 Facebook health groups
- [ ] Post on Reddit (r/diabetes, r/ChronicPain)
- [ ] Collect first 10 App Store reviews
- [ ] Monitor Sentry for crashes

### Week 6 — Growth push
- [ ] ASO keyword optimization based on Search Ads data
- [ ] Record a 30-second TikTok / Reels demo video
- [ ] Cold email 5 local GPs about patient recommendation
- [ ] PostHog funnel review — where are users dropping off?
- [ ] Build Supabase backend for cloud sync (Phase 2 begins)

---

## 15. App Store Setup

### App Store Connect (iOS)

1. Bundle ID: `com.yourname.medremind`
2. Category: Medical (primary), Health & Fitness (secondary)
3. Age rating: 4+
4. Required capabilities: Push Notifications, Background App Refresh

### App Store keywords (100 char limit)

```
medication,reminder,pill,refill,alert,tracker,dose,medicine,caregiver,health
```

### App Store description (first 255 chars shown — make these count)

```
Never miss a dose. Never run out of medication.

MedRemind sends smart reminders for every medication in your schedule — and 
alerts you before you run out, so you can refill in time.

Perfect for daily medications, caregivers managing a loved one's health, and 
anyone who wants a simple, beautiful health companion.

FEATURES:
• Smart reminders at your exact times
• Refill countdown with low-stock alerts  
• Today dashboard — see all doses at a glance
• Family mode — track medications for parents or children (Premium)
• Adherence history and weekly reports (Premium)
• PDF health report for doctor visits (Premium)
• Drug interaction checker (Premium)

No account needed to get started.
```

### Privacy Policy (required — minimum content)

Host a simple page at `yourwebsite.com/privacy` stating:
- Data stored locally on device
- No data sold to third parties
- Analytics collected anonymously via PostHog
- Contact email for data deletion requests

---

## 16. Launch Strategy

### Target audiences ranked by conversion

1. **Caregivers** — Adults managing medications for elderly parents. Highest emotional motivation. Find in Facebook groups: "Caring for elderly parents Pakistan", "Caregiver support".
2. **Chronic illness patients** — Diabetes, hypertension, thyroid. On daily meds for life. Target: Diabetes Pakistan Facebook groups, Instagram health pages.
3. **Post-surgical recovery** — Short-term but high intent. Leave detailed reviews. Word-of-mouth expanders.
4. **Young urban professionals** — Managing their own daily supplements or medications. Instagram + TikTok.

### Zero-budget marketing playbook

**Week 1 after launch:**
- Post in 5 Facebook health groups (Pakistani + international)
- Submit to Product Hunt
- Post on r/diabetes, r/ChronicPain, r/Parenting with genuine story

**Week 2–4:**
- Record a 60-second TikTok: "I built this app after my dad missed his heart meds for 3 days"
- Reach out to 10 health Instagram accounts for a free mention (offer free premium)
- Cold email 10 local GPs and cardiologists — offer free "clinic recommendation cards"

**Month 2:**
- ASO A/B test two different screenshots
- Launch a simple landing page (medremind.app) with email capture
- Start collecting doctor testimonials

### Viral mechanics built into the app

- **Sharing a dose streak** — "I've taken my medications 30 days in a row" share card
- **Caregiver invite** — "Track with me" family invite link (brings in two users)
- **Refill reminder** — Forward to family member who picks up meds

---

## 17. Post-Launch Growth

### Month 3–6 milestones

| Milestone | Target |
|-----------|--------|
| Total downloads | 5,000 |
| Paying subscribers | 250 |
| MRR | $750 |
| App Store rating | 4.5+ |
| Reviews | 100+ |

### Pharmacy integration (Phase 3)

Partner with a local online pharmacy. When user taps "Order Refill":
1. Pre-fill order with medication name + quantity
2. Redirect to pharmacy checkout with affiliate tracking link
3. Earn $3–8 per completed order

Target partners: Dawaai.pk, Dvago, Sehat.com.pk

### B2B clinic edition

After 500 consumer users, cold-email local clinics:
- **Offer:** "Your patients will be more adherent — here's a free trial for your clinic"
- **Pricing:** $99/mo per clinic — unlimited patients
- **Value:** Clinic can send reminders to patients, see aggregate adherence data
- **Acquisition:** One doctor recommending the app to their 100+ patients = 5–15 new paying users

---

## 18. Google Stitch UI Prompt

Copy the prompt below exactly into [Google Stitch](https://stitch.withgoogle.com) to generate a complete, production-quality UI for MedRemind.

---

```
Design a complete mobile app UI for a medication reminder app called MedRemind. 
The aesthetic is warm, calm, and trustworthy — NOT clinical or sterile. 

COLOR PALETTE:
- Primary: Deep forest green #2C6E49
- Background: Warm off-white #F5F3EF  
- Surface cards: Pure white #FFFFFF
- Accent/urgent: Warm amber #C97A2E
- Text: Near-black #1A1A1A
- Muted text: Warm gray #8A7F72

TYPOGRAPHY:
- Headings: DM Serif Display (serif, elegant)
- Body and UI: DM Sans (clean, modern)

SCREENS TO DESIGN (design all 6):

1. HOME / TODAY DASHBOARD
- Status bar at top
- Greeting: "Good morning, Ahmad" in serif font
- Progress card (dark green background): Shows "2/3 doses taken today" with a horizontal progress bar
- Section: "Today's Doses" with 3 medication cards:
  * Card 1 (completed): Green check, "Metformin 500mg", "Taken at 8:12 AM"
  * Card 2 (completed): Green check, "Lisinopril 10mg", "Taken at 8:15 AM"  
  * Card 3 (pending/urgent): Amber warning icon, "Atorvastatin 20mg", "Due at 9:00 PM", amber border
- Refill alert strip at bottom: amber background, "Metformin running low — 6 days remaining"
- Bottom tab bar: Home (active, green dot), Schedule, Add (+), Family, Profile

2. ADD MEDICATION SCREEN
- Full-screen modal with back arrow
- Title: "Add Medication" in serif font
- Form fields (styled as soft floating labels):
  * Medication name (text input)
  * Dosage (e.g. "500mg")
  * Form: pill buttons for Tablet / Capsule / Liquid / Injection
  * Frequency: pill buttons for Once daily / Twice daily / Three times / Custom
  * Time pickers (show 2 time wheels: "08:00 AM" and "08:00 PM")
  * With food toggle (green toggle switch)
  * Starting pill count (number input with +/- stepper)
  * Refill alert threshold (slider: "Alert when X days remain")
  * Color picker (6 color dots: green, blue, amber, red, purple, pink)
- Large green "Save Medication" button at bottom

3. MEDICATION DETAIL + HISTORY
- Back navigation
- Medication header card: color accent on left border, large name, dosage badge
- 30-day adherence calendar (green = taken, amber = skipped, gray = future)
- Adherence stat: "87% this month" with circular progress indicator
- Recent dose log list (date + time + status)
- "Edit Medication" and "Delete" buttons at bottom

4. FAMILY / CAREGIVER MODE (Premium screen)
- Title: "Family Dashboard"
- Profile tabs at top: "Ahmad (You)" + "Father" + "+ Add"
- Each profile shows a mini today-dashboard card:
  * Profile avatar (initials circle in green)
  * Name + relationship
  * Today's adherence progress bar
  * Next due dose with time
- "Invite family member" button with share icon

5. ADHERENCE REPORT / STATS SCREEN
- Title: "Your Progress"
- 4 metric cards in a 2x2 grid:
  * "This Week" — 91% adherence
  * "This Month" — 87% adherence  
  * "Current Streak" — 14 days
  * "Total Doses Taken" — 342
- Bar chart: last 7 days adherence (green bars)
- "Export PDF Report" button (amber/premium accent)

6. UPGRADE / PAYWALL SCREEN
- Soft overlay modal on blurred background
- Crown icon at top
- Title: "Unlock MedRemind Premium"
- 3 feature rows with checkmarks:
  * Family mode — track medications for loved ones
  * PDF health reports — share with your doctor
  * Drug interaction checker
  * Unlimited medications
- Pricing toggle: Monthly ($2.99) / Annual ($24.99 — "Save 30%")
- Large green CTA button: "Start Free Trial — 7 Days"
- Small "Restore Purchases" link below
- Subtle "No commitment, cancel anytime" text

DESIGN PRINCIPLES:
- Warm paper-like backgrounds, never stark white
- Cards use very subtle drop shadows (not flat)
- Green checkmarks for completed actions
- Amber/orange for warnings and urgency
- Generous padding and breathing room
- The app should feel like a trusted health companion, not a medical tool
- Rounded corners everywhere (16-20px radius on cards)
- Serif font only for headings and key numbers — everything else DM Sans

OUTPUT: High-fidelity mobile mockups at 390x844px (iPhone 14 Pro size), 
all 6 screens, connected with a simple user flow diagram.
```

---

*Document generated: March 2026 · MedRemind Development Guide v1.0*