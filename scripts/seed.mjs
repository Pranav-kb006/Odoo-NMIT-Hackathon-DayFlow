-- Dayflow seed — demo company "Acme" + 6 users + 2 weeks of attendance
-- Run: pnpm db:seed   (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
-- Passwords for all seeded users: Dayflow#2026  (change before any real demo)

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
  // company (idempotent by code)
  let { data: company } = await db.from("companies").select("*").eq("code", COMPANY.code).maybeSingle();
  if (!company) {
    ({ data: company } = await db.from("companies").insert(COMPANY).select().single());
    console.log("created company", COMPANY.name);
  }

  for (const person of PEOPLE) {
    const { data: authData, error } = await db.auth.admin.createUser({
      email: person.email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) {
      console.warn(`skip ${person.email}: ${error.message}`);
      continue;
    }
    await db.from("profiles").insert({
      id: authData.user.id,
      company_id: company.id,
      full_name: person.name,
      role: person.role,
      department: person.dept,
      designation: person.desig,
      joined_on: "2025-06-02",
      status: "active",
    });
    console.log("seeded", person.email);
  }

  console.log("\nDone. Login with any seeded email /", PASSWORD);
}

main();
