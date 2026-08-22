// Dayflow seed — demo company "Acme" + 6 users + attendance + one pending leave
// Run: node scripts/seed.mjs   (requires .env.local with URL + SERVICE_ROLE key)
// Idempotent: wipes existing @acme.test auth users and recreates them.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const COMPANY = { name: "Acme Corp", code: "ACME" };
const PASSWORD = "Dayflow#2026";

const PEOPLE = [
  { name: "Asha Rao", email: "admin@acme.test", role: "admin", dept: "Management", desig: "HR Director" },
  { name: "Ravi Kumar", email: "ravi@acme.test", role: "employee", dept: "Engineering", desig: "Backend Dev" },
  { name: "Meera Nair", email: "meera@acme.test", role: "employee", dept: "Design", desig: "Product Designer" },
  { name: "John Dsouza", email: "john@acme.test", role: "employee", dept: "Engineering", desig: "Frontend Dev" },
  { name: "Sara Ali", email: "sara@acme.test", role: "employee", dept: "Sales", desig: "Account Exec" },
  { name: "Dev Patel", email: "dev@acme.test", role: "employee", dept: "Engineering", desig: "QA Engineer" },
];

async function main() {
  // 0. wipe any stale acme users (profiles cascade)
  let page = 1;
  for (;;) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const stale = data.users.filter((u) => u.email?.endsWith("@acme.test"));
    for (const u of stale) {
      const { error: delErr } = await db.auth.admin.deleteUser(u.id);
      console.log(delErr ? `delete failed ${u.email}: ${delErr.message}` : `deleted ${u.email}`);
    }
    if (data.users.length < 200) break;
    page++;
  }

  // 1. company
  let { data: company } = await db.from("companies").select("*").eq("code", COMPANY.code).maybeSingle();
  if (!company) {
    ({ data: company } = await db.from("companies").insert(COMPANY).select().single());
    console.log("created company", COMPANY.name);
  }

  // 2. users via ADMIN API (GoTrue-native rows, guaranteed login-able)
  const created = [];
  for (const p of PEOPLE) {
    const { data, error } = await db.auth.admin.createUser({
      email: p.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: p.name },
    });
    if (error) {
      console.error(`create failed ${p.email}: ${error.message}`);
      continue;
    }
    created.push({ ...p, id: data.user.id });
    console.log("created user", p.email);
  }

  // 3. profiles
  const { error: profErr } = await db.from("profiles").insert(
    created.map((p) => ({
      id: p.id,
      company_id: company.id,
      full_name: p.name,
      role: p.role,
      department: p.dept,
      designation: p.desig,
      joined_on: "2025-06-02",
      status: "active",
    }))
  );
  if (profErr) throw profErr;
  console.log("inserted profiles:", created.length);

  // 4. attendance: last 14 days, weekdays only, employees only
  const employees = created.filter((p) => p.role === "employee");
  const rows = [];
  for (let d = 14; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86400000);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const iso = date.toISOString().slice(0, 10);
    for (const p of employees) {
      rows.push({
        company_id: company.id,
        user_id: p.id,
        work_date: iso,
        check_in: `${iso}T09:${String(10 + (d % 15)).padStart(2, "0")}:00+00:00`,
        check_out: `${iso}T18:${String(4 + (d % 7)).padStart(2, "0")}:00+00:00`,
      });
    }
  }
  const { error: attErr } = await db.from("attendance").insert(rows);
  if (attErr) throw attErr;
  console.log("inserted attendance rows:", rows.length);

  // 5. one pending leave from Ravi (feeds the approvals queue)
  const ravi = created.find((p) => p.email === "ravi@acme.test");
  const start = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const end = new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10);
  const { error: lvErr } = await db.from("leave_requests").insert({
    company_id: company.id,
    user_id: ravi.id,
    start_date: start,
    end_date: end,
    reason: "Family function out of town",
    status: "pending",
  });
  if (lvErr && !lvErr.message.includes("duplicate")) throw lvErr;
  console.log("inserted pending leave for ravi");

  console.log("\nDone. Login: any seeded email / Dayflow#2026");
}

main();
