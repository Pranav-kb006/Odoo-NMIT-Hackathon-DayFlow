#!/usr/bin/env python3
"""Focused post-FK checks: admin company list w/ profile embed, approvals PAGE render, checkout."""
import json, base64, urllib.parse, urllib.request, urllib.error

APP = "http://localhost:4100"; REF = "iorhdmosupqmithgzkag"
env = {l.split("=",1)[0].strip(): l.split("=",1)[1].strip() for l in open(".env.local") if "=" in l and not l.startswith("#")}
ANON = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]; URL = f"https://{REF}.supabase.co"

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
        with o.open(req) as r: return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

ravi_ck, ack = login("ravi@acme.test"), login("admin@acme.test")

# 0. fresh pending leave from ravi (so admin queue has something)
st, raw = call("/api/leave-requests", cookie=ravi_ck, method="POST",
               body={"startDate": "2026-09-07", "endDate": "2026-09-08", "reason": "Post-FK admin flow verification"})
leave = json.loads(raw).get("leaveRequest", {})
print(f"[apply fresh leave]   HTTP {st} id={leave.get('id')}")

# 1. admin company-scoped list WITH profile embed
st, raw = call("/api/leave-requests?scope=company&status=pending", cookie=ack)
data = json.loads(raw)
rows = data.get("leaveRequests", [])
ours = next((r for r in rows if r.get("id") == leave.get("id")), None)
embed_ok = bool(ours and ours.get("profiles", {}).get("full_name"))
print(f"[admin scope=company] HTTP {st} rows={len(rows)} our_leave={ours is not None} profiles_embed={'OK: ' + str(ours['profiles'].get('full_name')) if embed_ok else 'MISSING'}")

# 2. approvals PAGE renders with the requester's name embedded
st, html = call("/dashboard/approvals", cookie=ack)
name_in_page = "Ravi Kumar" in html
empty_state = "Nothing pending" in html
print(f"[approvals page]      HTTP {st} len={len(html)} shows_requester_name={name_in_page} shows_empty_state={empty_state}")

# 3. checkout flow for ravi
st, raw = call("/api/attendance/checkout", cookie=ravi_ck, method="POST")
d = json.loads(raw)
co = d.get("attendance", {}).get("check_out")
dur = d.get("attendance", {}).get("duration_minutes")
print(f"[checkout]            HTTP {st} check_out={str(co)[:19]} duration_minutes={dur}")

# 4. cleanup: reject the fresh leave so demo data stays tidy
if leave.get("id"):
    st, raw = call(f"/api/leave-requests/{leave['id']}/review", cookie=ack, method="PATCH", body={"status": "rejected"})
    print(f"[cleanup reject]      HTTP {st}")

# 5. security: ravi (employee) tries the admin review endpoint -> expect 403
st, raw = call(f"/api/leave-requests/{leave.get('id','x')}/review", cookie=ravi_ck, method="PATCH", body={"status": "approved"})
print(f"[employee tries PATCH] HTTP {st} (expect 403): {raw[:80]}")
