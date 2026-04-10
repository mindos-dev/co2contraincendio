/**
 * Translations EN — CO2 Contra Incêndio + OPERIS.eng
 * English version (activated by flag click)
 */
import type { Translations } from "./pt";

export const en: Translations = {
  // ── Global Navigation ─────────────────────────────────────────
  nav: {
    home: "Home",
    about: "About Us",
    services: "Services",
    projects: "Projects",
    partners: "Partners",
    blog: "Blog",
    contact: "Contact",
    plans: "Plans & Pricing",
    requestQuote: "Request Quote",
    accessPlatform: "OPERIS IA — Access Platform",
    chooseLanguage: "Choose language",
  },

  // ── Homepage ──────────────────────────────────────────────────
  home: {
    hero: {
      badge1: "NBR 12615 · NFPA 12 · UL Listed",
      title1: "Intelligent Fire\nPrevention and\nSuppression Systems",
      sub1: "Custom-engineered CO₂ suppression, wet chemical, hydrant, and alarm systems. ABNT, NFPA, and Fire Department compliant. Serving Belo Horizonte and all of Brazil.",
      cta1: "Request Quote",
      cta2: "View CO₂ System",
    },
    services: "Our Services",
    viewAll: "View all services",
    about: "About Us",
    certifications: "Certifications & Standards",
    contact: "Get in Touch",
  },

  // ── OPERIS Platform ───────────────────────────────────────────
  platform: {
    dashboard: "Dashboard",
    equipment: "Equipment",
    maintenance: "Maintenance",
    reports: "Reports",
    alerts: "Alerts",
    documents: "Documents",
    clients: "Clients",
    orders: "Work Orders",
    financial: "Financial",
    settings: "Settings",
    profile: "Profile",
    notifications: "Notifications",
    qrcodes: "QR Codes",
    scanner: "Scanner",
    inspections: "Inspections",
    proposals: "Proposals",
    logout: "Sign Out",
    loading: "Loading...",
    error: "Error loading data",
    noData: "No data found",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    back: "Back",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    add: "Add",
    new: "New",
    submit: "Submit",
    confirm: "Confirm",
    close: "Close",
    status: {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      completed: "Completed",
      cancelled: "Cancelled",
      overdue: "Overdue",
    },
  },

  // ── LGPD / Legal ──────────────────────────────────────────────
  legal: {
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    cookiePolicy: "Cookie Policy",
    cookieBanner: "We use essential cookies for platform functionality and, with your consent, analytics cookies to improve your experience.",
    acceptAll: "Accept all",
    configure: "Configure",
    learnMore: "Learn more",
    lgpdCompliant: "LGPD Compliant",
  },

  // ── Errors ────────────────────────────────────────────────────
  errors: {
    notFound: "Page not found",
    serverError: "Internal server error",
    unauthorized: "Unauthorized access",
    forbidden: "Access denied",
    networkError: "Connection error. Check your internet.",
    tryAgain: "Try again",
  },
} as const;
