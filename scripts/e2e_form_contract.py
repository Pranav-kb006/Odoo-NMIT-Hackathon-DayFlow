#!/usr/bin/env python3
"""E2E for the directory-form contract: POST/PATCH with snake_case EmployeeFormValues."""
import json, base64, urllib.parse, urllib.request, urllib.error

APP = "http://localhost:4100"; REF = "iorhdmosupqmithgzkag"
env = {l.split("=",1)[0].strip(): l.split("=",1)[1].strip() for l in open(".env.local") if "=" in l and not l.startswith("#")}
ANON, SRK = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"], env["SUPABASE_SERVICE_ROLE_KEY"]
URL = f"https://{REF}.supabase.co"

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
            try: return r.status, json.loads(raw)
            except Exception: return r.status, None
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try: return e.code, json.loads(raw)
        except Exception: return e.code, None

ack = login("admin@acme.test")

# EXACTLY what employee-form-modal.tsx sends (snake_case EmployeeFormValues)
form_payload = {
    "first_name": "Ada", "last_name": "Lovelace",
    "work_email": "ada@acme.test", "personal_email": "",
    "mobile": "+91 90000 00001", "date_of_joining": "2026-08-01",
    "department": "Engineering", "job_position": "Systems Intern",
    "manager_id": "", "location": "Bengaluru",
}
st, d = call("/api/employees", cookie=ack, method="POST", body=form_payload)
emp = (d or {}).get("employee", {})
print(f"[form-shape CREATE] HTTP {st} name={emp.get('full_name')} email={emp.get('email')} dept={emp.get('department')} desig={emp.get('designation')} joined={emp.get('joined_on')}")
creds = (d or {}).get("credentials")
print(f"[credentials]       {'OK login_id=' + str(creds.get('login_id')) if creds else 'MISSING'}")

if emp.get("id"):
    st, d = call(f"/api/employees/{emp['id']}", cookie=ack, method="PATCH", body={
        "first_name": "Ada", "last_name": "King", "work_email": "ada@acme.test",
        "job_position": "Junior Engineer", "department": "Engineering",
        "mobile": "+91 90000 00002", "date_of_joining": "2026-08-01",
        "personal_email": "", "manager_id": "", "location": "",
    })
    print(f"[form-shape EDIT]   HTTP {st} name={(d or {}).get('employee', {}).get('full_name')} desig={(d or {}).get('employee', {}).get('designation')}")

    # new hire can log in
    try:
        login("ada@acme.test"); print("[ada LOGIN]         OK")
    except Exception as ex:
        print(f"[ada LOGIN]         FAIL: {ex}")

    # cleanup
    pr = urllib.request.Request(f"{URL}/rest/v1/profiles?id=eq.{emp['id']}", method="DELETE",
        headers={"apikey": SRK, "Authorization": f"Bearer {SRK}"})
    urllib.request.urlopen(pr)
    import subprocess
    subprocess.run(["curl", "-s", "-o", "/dev/null", "-X", "DELETE", f"{URL}/auth/v1/admin/users/{emp['id']}",
                    "-H", f"apikey: {SRK}", "-H", f"Authorization: Bearer {SRK}"])
    print("[cleanup]           removed")