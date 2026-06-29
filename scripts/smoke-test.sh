#!/bin/bash
# Smoke-test the 10s Only API after the contract fixes.
# Usage: bash scripts/smoke-test.sh
set -uo pipefail
B=http://localhost:8080
ORIGIN=http://localhost:3000
pass(){ echo "✅ $1"; }
fail(){ echo "❌ $1"; }
hdr(){ echo; echo "=== $1 ==="; }

jqv(){ python3 -c "import sys,json;d=json.load(sys.stdin);print(d$1)" 2>/dev/null; }

# --- mint tokens via supabase sync -----------------------------------------
sync_token(){ # $1=email  -> echoes token
  curl -s -X POST "$B/api/auth/supabase/sync" -H "Content-Type: application/json" -H "Origin: $ORIGIN" \
    -d "{\"emailOrPhone\":\"$1\",\"name\":\"Smoke $1\",\"avatarUrl\":\"\",\"city\":\"mumbai\"}" | jqv "['token']"
}

hdr "auth: member + admin sync"
MEMBER_EMAIL="smoke.member@example.com"
ADMIN_EMAIL="abixspeaks@gmail.com"
HOST_EMAIL="smoke.host@example.com"
MEMBER_TOK=$(sync_token "$MEMBER_EMAIL"); [ -n "$MEMBER_TOK" ] && pass "member token" || fail "member token"
ADMIN_TOK=$(sync_token "$ADMIN_EMAIL");  [ -n "$ADMIN_TOK" ] && pass "admin token"  || fail "admin token"

# --- promote a host user directly in mongo, then re-sync to get HOST token --
sync_token "$HOST_EMAIL" >/dev/null
if command -v mongosh >/dev/null 2>&1; then
  mongosh --quiet "mongodb://localhost:27017/tensonly" --eval \
    "db.users.updateOne({emailOrPhone:'$HOST_EMAIL'},{\$set:{role:'HOST',approved:true}})" >/dev/null 2>&1 \
    && pass "host role bump (mongosh)" || fail "host role bump"
else
  echo "⚠️  mongosh not found — host-only endpoints will be skipped"
fi
HOST_TOK=$(sync_token "$HOST_EMAIL")

hdr "quiz: questions shape + submit"
curl -s "$B/api/quiz/questions" | python3 -c "import sys,json;q=json.load(sys.stdin);print('first q has id/text/options:', all(k in q[0] for k in('id','text','options')), '| option has id/text/vibe:', all(k in q[0]['options'][0] for k in('id','text','vibe')))"
curl -s -X POST "$B/api/quiz/submit" -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"q1","optionId":"a"},{"questionId":"q3","optionId":"a"}]}' \
  -w "\n[submit HTTP %{http_code}]\n"

hdr "applications: submit (public) -> mine -> list -> review"
APP=$(curl -s -X POST "$B/api/applications" -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Smoke Member\",\"emailOrPhone\":\"$MEMBER_EMAIL\",\"whyJoin\":\"I love the underground techno scene and bring great energy\",\"city\":\"mumbai\",\"favoriteVibe\":\"drum-and-bass\",\"quizScore\":78,\"quizAnswersJson\":\"[{\\\"questionId\\\":\\\"q1\\\",\\\"optionId\\\":\\\"a\\\"}]\"}")
echo "submit -> $APP" | head -c 400; echo
APP_ID=$(echo "$APP" | jqv "['id']")
curl -s "$B/api/applications/mine" -H "Authorization: Bearer $MEMBER_TOK" -w "\n[mine HTTP %{http_code}]\n" | head -c 300; echo
curl -s "$B/api/applications" -H "Authorization: Bearer $ADMIN_TOK" -w "\n[list HTTP %{http_code}]\n" -o /dev/null
curl -s -X POST "$B/api/applications/$APP_ID/review" -H "Authorization: Bearer $ADMIN_TOK" -H "Content-Type: application/json" \
  -d '{"status":"APPROVED","reviewerNotes":"great fit"}' -w "\n[review HTTP %{http_code}]\n" | head -c 200; echo

hdr "events: list (public) + create (host) + host list + admin pending"
curl -s "$B/api/events" -w "\n[list HTTP %{http_code}]\n" -o /dev/null
if [ -n "${HOST_TOK:-}" ]; then
  EVT=$(curl -s -X POST "$B/api/events" -H "Authorization: Bearer $HOST_TOK" -H "Content-Type: application/json" \
    -d '{"title":"SMOKE 001 — Test Night","vibe":"DRUM_AND_BASS","city":"mumbai","venueName":"Test Bunker","venueAddress":"Lower Parel","venueCapacity":200,"startAt":"2026-08-01T20:00:00Z","endAt":"2026-08-02T04:00:00Z","ticketPrice":1500,"totalTickets":200,"description":"smoke","lineup":["VOID","RHEA K"],"visibility":"MEMBERS_ONLY"}')
  echo "create -> $EVT" | head -c 400; echo
  EVT_ID=$(echo "$EVT" | jqv "['id']")
  curl -s "$B/api/events/host" -H "Authorization: Bearer $HOST_TOK" -w "\n[host list HTTP %{http_code}]\n" -o /dev/null
  curl -s "$B/api/events/pending" -H "Authorization: Bearer $ADMIN_TOK" -w "\n[admin pending HTTP %{http_code}]\n" -o /dev/null
  if [ -n "${EVT_ID:-}" ]; then
    curl -s -X POST "$B/api/events/$EVT_ID/approve" -H "Authorization: Bearer $ADMIN_TOK" -w "\n[approve HTTP %{http_code}]\n" -o /dev/null
  fi
fi

hdr "confessions: create + list (event-scoped)"
EVID="${EVT_ID:-smoke-evt}"
curl -s -X POST "$B/api/confessions" -H "Content-Type: application/json" \
  -d "{\"eventId\":\"$EVID\",\"message\":\"best night of my life\",\"anonymousName\":\"Ghost\"}" -w "\n[create HTTP %{http_code}]\n" | head -c 200; echo
curl -s "$B/api/confessions?eventId=$EVID" -w "\n[list HTTP %{http_code}]\n" | head -c 300; echo

hdr "admin: stats + city-stats"
curl -s "$B/api/admin/stats" -H "Authorization: Bearer $ADMIN_TOK" -w "\n[stats HTTP %{http_code}]\n" | head -c 400; echo
curl -s "$B/api/admin/city-stats" -H "Authorization: Bearer $ADMIN_TOK" -w "\n[city-stats HTTP %{http_code}]\n" | head -c 300; echo

hdr "host: ledger"
[ -n "${HOST_TOK:-}" ] && curl -s "$B/api/host/ledger" -H "Authorization: Bearer $HOST_TOK" -w "\n[ledger HTTP %{http_code}]\n" -o /dev/null

echo; echo "=== done ==="
