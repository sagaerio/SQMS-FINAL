import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/make-server-587beb74/health", (c) => {
  return c.json({ status: "ok" });
});

// ─── Data Seed / Sync ────────────────────────────────────────────────────────
// POST /make-server-587beb74/sync-data
// Upserts all industries, services, and branches into the Supabase database.
// Uses service-role key so it bypasses RLS.
app.post("/make-server-587beb74/sync-data", async (c) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ── Industries ──────────────────────────────────────────────────────────────
  const industriesData = [
    { id: "banking",    name: "Banking & Finance",    icon: "Landmark",     color: "from-blue-600 to-blue-700",   description: "Account services, loans, investments" },
    { id: "corporate",  name: "Corporate Office",      icon: "Briefcase",    color: "from-slate-600 to-slate-700", description: "HR, IT support, facilities management" },
    { id: "education",  name: "Education",             icon: "GraduationCap",color: "from-orange-600 to-orange-700",description: "Admissions, counseling, registration" },
    { id: "government", name: "Government Services",   icon: "Building2",    color: "from-teal-600 to-teal-700",   description: "Public services, permits, documentation" },
    { id: "healthcare", name: "Healthcare",            icon: "Heart",        color: "from-red-600 to-pink-600",    description: "Medical appointments, consultations" },
    { id: "retail",     name: "Retail",                icon: "ShoppingBag",  color: "from-purple-600 to-purple-700",description: "Customer service, returns, support" },
  ];

  const { error: indErr } = await supabase
    .from("industries")
    .upsert(industriesData, { onConflict: "id" });
  if (indErr) return c.json({ error: "industries: " + indErr.message }, 500);

  // ── Services ────────────────────────────────────────────────────────────────
  const servicesData = [
    // Banking
    { id: "banking-account-opening",    industry_id: "banking",    name: "Account Opening",     description: "Open a new savings or checking account",       estimated_time: 30, is_active: true },
    { id: "banking-card-services",      industry_id: "banking",    name: "Card Services",        description: "Credit and debit card applications",            estimated_time: 20, is_active: true },
    { id: "banking-customer-service",   industry_id: "banking",    name: "Customer Service",     description: "General banking enquiries and assistance",      estimated_time: 10, is_active: true },
    { id: "banking-loan-consultation",  industry_id: "banking",    name: "Loan Consultation",    description: "Personal and business loan consultation",       estimated_time: 45, is_active: true },
    { id: "banking-teller-services",    industry_id: "banking",    name: "Teller Services",      description: "Cash deposits, withdrawals and transfers",      estimated_time: 10, is_active: true },
    // Corporate
    { id: "corporate-facilities",       industry_id: "corporate",  name: "Facilities",           description: "Building maintenance and facilities requests",  estimated_time: 10, is_active: true },
    { id: "corporate-hr-services",      industry_id: "corporate",  name: "HR Services",          description: "HR inquiries and employee services",            estimated_time: 20, is_active: true },
    { id: "corporate-it-support",       industry_id: "corporate",  name: "IT Support",           description: "Technical support for hardware and software",   estimated_time: 15, is_active: true },
    { id: "corporate-reception",        industry_id: "corporate",  name: "Reception",            description: "Visitor registration and general reception",    estimated_time: 5,  is_active: true },
    // Education
    { id: "education-admissions",       industry_id: "education",  name: "Admissions",           description: "New student enrollment consultation",           estimated_time: 20, is_active: true },
    { id: "education-financial-aid",    industry_id: "education",  name: "Financial Aid",        description: "Student financial aid consultation",             estimated_time: 30, is_active: true },
    { id: "education-library-services", industry_id: "education",  name: "Library Services",     description: "Library access, books and resources",           estimated_time: 5,  is_active: true },
    { id: "education-registrar",        industry_id: "education",  name: "Registrar",            description: "Course registration and academic records",      estimated_time: 15, is_active: true },
    // Government
    { id: "government-doc-processing",  industry_id: "government", name: "Document Processing",  description: "Processing of official documents and forms",    estimated_time: 40, is_active: true },
    { id: "government-general-inquiry", industry_id: "government", name: "General Inquiries",    description: "General questions about public services",       estimated_time: 15, is_active: true },
    { id: "government-id-renewal",      industry_id: "government", name: "ID / Passport Renewal",description: "Renew national ID or passport",                estimated_time: 45, is_active: true },
    { id: "government-permits",         industry_id: "government", name: "Permits & Licenses",   description: "Apply for business or building permits",        estimated_time: 35, is_active: true },
    // Healthcare
    { id: "healthcare-blood-test",      industry_id: "healthcare", name: "Blood Test / Lab",     description: "Blood tests and diagnostic lab services",       estimated_time: 20, is_active: true },
    { id: "healthcare-dental",          industry_id: "healthcare", name: "Dental",               description: "Dental checkup and treatment",                  estimated_time: 25, is_active: true },
    { id: "healthcare-gp",              industry_id: "healthcare", name: "General Practitioner", description: "Routine consultation with a GP",                estimated_time: 30, is_active: true },
    { id: "healthcare-pharmacy",        industry_id: "healthcare", name: "Pharmacy Pickup",      description: "Prescription collection and dispensing",        estimated_time: 5,  is_active: true },
    { id: "healthcare-specialist",      industry_id: "healthcare", name: "Specialist Consult",   description: "Consultation with a medical specialist",        estimated_time: 40, is_active: true },
    // Retail
    { id: "retail-click-collect",       industry_id: "retail",     name: "Click & Collect",      description: "Collect your online order in-store",            estimated_time: 5,  is_active: true },
    { id: "retail-customer-service",    industry_id: "retail",     name: "Customer Service",     description: "General customer service and enquiries",        estimated_time: 8,  is_active: true },
    { id: "retail-returns",             industry_id: "retail",     name: "Returns & Exchanges",  description: "Return or exchange purchased items",            estimated_time: 12, is_active: true },
    { id: "retail-tech-support",        industry_id: "retail",     name: "Tech Support",         description: "Technical help with electronics and devices",   estimated_time: 25, is_active: true },
  ];

  const { error: svcErr } = await supabase
    .from("services")
    .upsert(servicesData, { onConflict: "id" });
  if (svcErr) return c.json({ error: "services: " + svcErr.message }, 500);

  // ── Branches / Businesses ───────────────────────────────────────────────────
  const businessesData = [
    // Banking
    { id: "banking-brooklyn",    industry_id: "banking",    name: "Brooklyn Service Hub",       address: "456 Atlantic Ave, Brooklyn",       phone: "+1 (718) 555-0100", hours: "9:00 AM – 5:00 PM", status: "active" },
    { id: "banking-manhattan",   industry_id: "banking",    name: "Manhattan Financial Center",  address: "123 Wall St, New York",            phone: "+1 (212) 555-0200", hours: "9:00 AM – 6:00 PM", status: "active" },
    { id: "banking-queens",      industry_id: "banking",    name: "Queens Branch",               address: "789 Queens Blvd, Queens",          phone: "+1 (718) 555-0300", hours: "9:00 AM – 5:00 PM", status: "active" },
    // Corporate
    { id: "corporate-east",      industry_id: "corporate",  name: "East Hub",                    address: "88 East Business Park",            phone: "+1 (212) 555-6100", hours: "8:00 AM – 6:00 PM", status: "active" },
    { id: "corporate-hq",        industry_id: "corporate",  name: "HQ Tower A – Floor 12",       address: "1 Corporate Blvd, CBD",            phone: "+1 (212) 555-6200", hours: "9:00 AM – 6:00 PM", status: "active" },
    { id: "corporate-west",      industry_id: "corporate",  name: "West Office Park",            address: "33 Business Park, West",           phone: "+1 (212) 555-6300", hours: "9:00 AM – 5:00 PM", status: "active" },
    // Education
    { id: "education-city",      industry_id: "education",  name: "City Learning Centre",        address: "12 City Rd, Downtown",             phone: "+1 (212) 555-5100", hours: "8:00 AM – 6:00 PM", status: "active" },
    { id: "education-east",      industry_id: "education",  name: "East Campus",                 address: "East Wing, Campus B",              phone: "+1 (212) 555-5200", hours: "8:00 AM – 5:00 PM", status: "active" },
    { id: "education-main",      industry_id: "education",  name: "Main Campus – Admin Block",   address: "Building A, Main Campus",          phone: "+1 (212) 555-5300", hours: "9:00 AM – 5:00 PM", status: "active" },
    // Government
    { id: "government-cityhall", industry_id: "government", name: "City Hall – Main Office",     address: "1 Civic Square, Downtown",         phone: "+1 (212) 555-2100", hours: "9:00 AM – 5:00 PM", status: "active" },
    { id: "government-north",    industry_id: "government", name: "North District Office",       address: "44 North Ave, Northgate",          phone: "+1 (212) 555-2200", hours: "8:30 AM – 4:30 PM", status: "active" },
    { id: "government-south",    industry_id: "government", name: "South Service Centre",        address: "77 South Rd, Southville",          phone: "+1 (212) 555-2300", hours: "9:00 AM – 5:00 PM", status: "active" },
    // Healthcare
    { id: "healthcare-eastside", industry_id: "healthcare", name: "Eastside Medical Center",     address: "88 Eastside Rd, East",             phone: "+1 (212) 555-1100", hours: "7:00 AM – 8:00 PM", status: "active" },
    { id: "healthcare-main",     industry_id: "healthcare", name: "Main Hospital – Downtown",    address: "10 Medical Blvd, Downtown",        phone: "+1 (212) 555-1200", hours: "24/7",               status: "active" },
    { id: "healthcare-north",    industry_id: "healthcare", name: "Northside Clinic",            address: "22 Health Ave, Northside",         phone: "+1 (212) 555-1300", hours: "8:00 AM – 6:00 PM", status: "active" },
    // Retail
    { id: "retail-flagship",     industry_id: "retail",     name: "Flagship Store – Downtown",   address: "1 Retail Plaza, Downtown",         phone: "+1 (212) 555-4100", hours: "10:00 AM – 9:00 PM", status: "active" },
    { id: "retail-mall",         industry_id: "retail",     name: "Mall Branch",                 address: "Level 2, Central Mall",            phone: "+1 (212) 555-4200", hours: "10:00 AM – 8:00 PM", status: "active" },
    { id: "retail-westside",     industry_id: "retail",     name: "Westside Outlet",             address: "55 West Rd, Westside",             phone: "+1 (212) 555-4300", hours: "9:00 AM – 9:00 PM",  status: "active" },
  ];

  const { error: bizErr } = await supabase
    .from("businesses")
    .upsert(businessesData, { onConflict: "id" });
  if (bizErr) return c.json({ error: "businesses: " + bizErr.message }, 500);

  return c.json({
    success: true,
    synced: {
      industries: industriesData.length,
      services: servicesData.length,
      branches: businessesData.length,
    },
  });
});

Deno.serve(app.fetch);
