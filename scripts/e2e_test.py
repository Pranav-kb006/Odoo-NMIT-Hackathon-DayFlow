#!/usr/bin/env python3
"""Backend E2E against the local prod server + live Supabase.

Faithfully replicates @supabase/ssr session cookies (base64- prefix, base64url
payload, URI-encoded, chunked at 3180 chars as <name>.N) so middleware's
getUser() sees a real session — the same thing a browser would send.
"""
import json, base64, urllib.parse, urllib.request, urllib.error, http.cookiejar

APP = "http://localhost:4100"
REF = "iorhdmosupqmithgzkag"
MAX_CHUNK = 3180

def load_env():
    env = {}
    for line in open(".env.local"):
        line = line.strip()
        if line and line.startswith(("NEXT_PUBLIC_SUPABASE", "SUPABASE_SERVICE_ROLE")):
            k, v = line.split("=", 1)
            env[k] = v.strip()
    return env

env = load_env()
URL = f"https://{REF}.supabase.co"
ANON = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")

def session_cookies(sess: dict) -> str:
    """Build the Cookie header exactly like @supabase/ssr does."""
    payload = json.dumps(sess, separators=(",", ":"))
    encoded = "base64-" + b64url(payload.encode())
    # createChunks: URI-encode, split at max size
    uri = urllib.parse.quote(encoded, safe="")
    if len(uri) <= MAX_CHUNK:
        return f"sb-{REF}-auth-token={uri}"
    chunks = []
    while len(uri) > 0:
        head = uri[:MAX_CHUNK]
        # avoid splitting a %XX escape at the boundary
        if "%" in head and head.rfind("%") > MAX_CHUNK - 3:
            head = head[:head.rfind("%")]
        # strip a dangling '%' at the very end
        while head.endswith("%"):
            head = head[:-1]
        chunks.append(head)
        uri = uri[len(head):]
    return "; ".join(f"sb-{REF}-auth-token.{i}={c}" for i, c in enumerate(chunks))

def login(email, password="Dayflow#2026"):
    req = urllib.request.Request(
        f"{URL}/auth/v1/token?grant_type=password",
        data=json.dumps({"email": email, "password": password}).encode(),
        headers={"apikey": ANON, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as r:
        d = json.loads(r.read())
    return {
        "access_token": d["access_token"],
        "refresh_token": d["refresh_token"],
        "expires_in": 3600,
        "expires_at": d.get("expires_at", 0),
        "token_type": "bearer",
    }

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def api(method, path, cookie=None, body=None):
    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(f"{APP}{path}", method=method)
    req.add_header("Cookie", cookie) if cookie else None
    if body is not None:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(body).encode()
    try:
        with opener.open(req) as r:
            raw = r.read()
            return r.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        try:
            raw = e.read()
            return e.code, json.loads(raw) if raw else None
        except Exception:
            return e.code, None

# ---------- run ----------
print("### Anonymous (no session) on /api/attendance/today ###")
st, body = api("GET", "/api/attendance/today")
print(f"  -> HTTP {st} expected 401, got: {body if not isinstance(body, dict) else body.get('error','<json>')}")

print("\n### ravi logs in, full session flow ###")
ck = session_cookies(login("ravi@acme.test"))
print("  cookie header length:", len(ck.split(';')[0]) + len(ck.split(';'))*2, "bytes across", len(ck.split(';')), "chunks")

st, body = api("GET", "/api/attendance/today", cookie=ck)
print(f"  [today]        HTTP {st}: {json.dumps(body)[:150]}")

st, body = api("POST", "/api/attendance/checkin", cookie=ck)
print(f"  [checkin]      HTTP {st}: {json.dumps(body)[:170]}")

st, body = api("POST", "/api/attendance/checkin", cookie=ck)
print(f"  [checkin dup]  HTTP {st}: {json.dumps(body)[:170]}")

st, body = api("GET", "/api/attendance/history", cookie=ck)
rows = body if isinstance(body, list) else body.get("attendance", body) if isinstance(body, dict) else body
print(f"  [history]      HTTP {st}: {len(rows) if isinstance(rows,list) else body}")

st, body = api("GET", "/api/attendance/today", cookie=ck)
print(f"  [today again]  HTTP {st} (check_in now set): {json.dumps(body)[:200]}")

print("\n### ravi applies for leave ###")
st, body = api("POST", "/api/leave-requests", cookie=ck, body={"startDate": "2026-09-01", "endDate": "2026-09-02", "reason": "E2E backend test leave"})
print(f"  [leave apply]  HTTP {st}: {json.dumps(body)[:180]}")
leave_id = body.get("leaveRequest", {}).get("id") if isinstance(body, dict) else None
print(f"  [leave id]     {leave_id}")

print("\n### admin reviews it ###")
ack = session_cookies(login("admin@acme.test"))
st, body = api("GET", "/api/leave-requests", cookie=ack)
reqs = body.get("leaveRequests", []) if isinstance(body, dict) else body
the_leave = next((r for r in reqs if r.get("id") == leave_id), None)
print(f"  [admin list]   HTTP {st}: total {len(reqs)} reqs; our leave found={the_leave is not None} status={the_leave.get('status') if the_leave else '-'}")

if leave_id:
    st, body = api("PATCH", f"/api/leave-requests/{leave_id}/review", cookie=ack, body={"status": "approved"})
    print(f"  [admin approve] HTTP {st}: {json.dumps(body)[:160]}")

st, body = api("GET", "/api/leave-requests", cookie=ck)
reqs2 = body.get("leaveRequests", []) if isinstance(body, dict) else body
mine = next((r for r in reqs2 if r.get("id") == leave_id), None)
print(f"  [ravi re-check] HTTP {st}: status now = {mine.get('status') if mine else 'MISSING'}")