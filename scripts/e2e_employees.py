#!/usr/bin/env python3
"""Employees domain E2E: backfill emails, GET list, admin POST create, PATCH edit, 403 guard."""
import json, base64, urllib.parse, urllib.request, urllib.error

APP = "http://localhost:4100"; REF = "iorhdmosupqmithgzkag"
env = {l.split("=",1)[0].strip(): l.split("=",1)[1].strip() for l in open(".env.local") if "=" in l and not l.startswith("#")}
ANON, SRK = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"], env["SUPABASE_SERVICE_ROLE_KEY"]
URL = f"https://{REF}.supabase.co"
EMAILS = {
    "Asha Rao": "admin@acme.test", "Ravi Kumar": "ravi@acme.test",
    "Meera Nair": "meera@acme.test", "John Dsouza": "john@acme.test",
    "Sara Ali": "sara@acme.test", "Dev Patel": "dev@acme.test",
}

# 1. backfill emails via service role
req = urllib.request.Request(f"{URL}/rest/v1/profiles?select=id,full_name,email",
                             headers={"apikey": SRK, "Authorization": f"Bearer {SRK}"})
rows = json.loads(urllib.request.urlopen(req).read())
patched = 0
for r in rows:
    if not r.get("email") and r["full_name"] in EMAILS:
        pr = urllib.request.Request(f"{URL}/rest/v1/profiles?id=eq.{r['id']}", method="PATCH",
            data=json.dumps({"email": EMAILS[r["full_name"]]}).encode(),
            headers={"apikey": SRK, "Authorization": f"Bearer {SRK}", "Content-Type": "application/json", "Prefer": "return=minimal"})
        urllib.request.urlopen(pr); patched += 1
print(f"[backfill] patched {patched} of {len(rows)} profiles")

def login(email):
    r = urllib.request.Request(f"{URL}/auth/v1/token?grant_type=password",
        data=json.dumps({"email": email, "password": "Dayflow#2026"}).encode(),
        headers={"apikey": ANON, "Content-Type": "application/json"})
    d = json.loads(urllib.request.urlopen(r).read())
    payload = json.dumps({"access_token": d["access_token"], "refresh_token": d["refresh_token"],
                          "expires_in": 3600, "expires_at": d.get("expires_at", 0), "token_type": "bearer"}, separators=(",", ":"))
    enc = "base64-" + base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    return f"sb-{REF}-auth-token={urllib.parse.quote(enc, safe='')}"

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(s, req, fp, code, msg, headers, newurl): return None

def call(path, cookie=None, method="GET", body=None):
    o = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(APP + path, method=method)
    if cookie: req.add_header("Cookie", cookie)
    if body is not None:
        req.add_header("Content-Type", "application/json"); req.data = json.dumps(body).encode()
    try:
        with o.open(req) as r:
            raw = r.read().decode()
            try: return r.status, json.loads(raw), raw
            except Exception: return r.status, None, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try: return e.code, json.loads(raw), raw
        except Exception: return e.code, None, raw

ack, rck = login("admin@acme.test"), login("ravi@acme.test")

st, d, _ = call("/api/employees", cookie=ack)
emps = (d or {}).get("employees", [])
with_email = sum(1 for e in emps if e.get("email"))
print(f"[admin GET]      HTTP {st} count={len(emps)} with_email={with_email}")

st, d, _ = call("/api/employees", cookie=rck)
print(f"[employee GET]   HTTP {st} count={len((d or {}).get('employees', []))} (any member may read)")

st, d, _ = call("/api/employees", cookie=ack, method="POST",
    body={"fullName": "Test Newbie", "email": "newbie@acme.test", "department": "Engineering",
          "designation": "Intern", "role": "employee"})
emp = (d or {}).get("employee", {})
print(f"[admin CREATE]   HTTP {st} id={emp.get('id')} name={emp.get('full_name')}")

if emp.get("id"):
    st, d, _ = call(f"/api/employees/{emp['id']}", cookie=ack, method="PATCH",
                    body={"designation": "Junior Engineer"})
    print(f"[admin EDIT]     HTTP {st} designation={(d or {}).get('employee', {}).get('designation')}")

    st, d, raw = call(f"/api/employees/{emp['id']}", cookie=rck, method="PATCH", body={"role": "admin"})
    print(f"[employee EDIT]  HTTP {st} (expect 403): {(d or {}).get('error', '')[:50]}")

    st, d, _ = call("/api/employees", cookie=rck, method="POST",
                    body={"fullName": "Sneaky Ravi", "email": "sneak@acme.test", "department": "X"})
    print(f"[employee CREATE] HTTP {st} (expect 403): {(d or {}).get('error', '')[:50]}")

# login check for the brand-new user
try:
    login("newbie@acme.test")
    print("[newbie LOGIN]   OK (password default)")
except Exception as ex:
    print(f"[newbie LOGIN]   FAIL: {ex}")

# employees PAGE renders real rows?
st, _, html = call("/dashboard/employees", cookie=ack)
print(f"[employees PAGE] HTTP {st} len={len(html or '')} shows_ravi={'Ravi' in (html or '')} shows_error_text={'Could not load' in (html or '')}")

# cleanup test newbie via service role (auth cascade removes profile)
del_req = urllib.request.Request(f"{URL}/auth/v1/admin/users/{emp.get('id')}", method="DELETE") if False else None
pr = urllib.request.Request(f"{URL}/rest/v1/profiles?id=eq.{emp.get('id')}", method="DELETE",
    headers={"apikey": SRK, "Authorization": f"Bearer {SRK}"})
urllib.request.urlopen(pr)
import subprocess
subprocess.run(["curl", "-s", "-o", "/dev/null", "-X", "DELETE", f"{URL}/auth/v1/admin/users/{emp['id']}",
                "-H", f"apikey: {SRK}", "-H", f"Authorization: Bearer {SRK}"])
print("[cleanup]        test employee removed")