#!/usr/bin/env bash
# ============================================================
#  PHANTOM TRACE — Startup Script
#  Starts Tor, then the Node.js server
#  Usage:  ./start.sh          (foreground, logs to terminal)
#          ./start.sh --daemon  (background, logs to /tmp/)
# ============================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE="/opt/homebrew/Cellar/node/25.9.0_1/bin/node"
TOR="/opt/homebrew/bin/tor"
SERVER_LOG="/tmp/phantom-trace.log"
SERVER_ERR="/tmp/phantom-trace-err.log"
TOR_LOG="/tmp/tor.log"
TOR_PID="/tmp/tor.pid"
SERVER_PID="/tmp/phantom-trace.pid"
DAEMON=false

# ── Parse flags ───────────────────────────────────────────
for arg in "$@"; do
  [[ "$arg" == "--daemon" ]] && DAEMON=true
done

# ── Colours ───────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[PHANTOM]${RESET} $*"; }
ok()   { echo -e "${GREEN}[  OK  ]${RESET} $*"; }
warn() { echo -e "${YELLOW}[ WARN ]${RESET} $*"; }
err()  { echo -e "${RED}[ FAIL ]${RESET} $*"; }

# ── Banner ────────────────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "  ██████╗ ██╗  ██╗ █████╗ ███╗  ██╗████████╗ ██████╗ ███╗  ███╗"
echo "  ██╔══██╗██║  ██║██╔══██╗████╗ ██║╚══██╔══╝██╔═══██╗████╗████║"
echo "  ██████╔╝███████║███████║██╔██╗██║   ██║   ██║   ██║██╔████╔██║"
echo "  ██╔═══╝ ██╔══██║██╔══██║██║╚████║   ██║   ██║   ██║██║╚██╔╝██║"
echo "  ██║     ██║  ██║██║  ██║██║ ╚███║   ██║   ╚██████╔╝██║ ╚═╝ ██║"
echo "  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝"
echo "                    T R A C E  v3.0 — STARTUP"
echo -e "${RESET}"

# ── Preflight checks ──────────────────────────────────────
log "Checking dependencies..."

if [[ ! -x "$NODE" ]]; then
  err "Node.js not found at $NODE"
  exit 1
fi
ok "Node.js $($NODE --version)"

if [[ ! -x "$TOR" ]]; then
  warn "Tor binary not found at $TOR — geo-blocked platforms will be unavailable"
  TOR=""
else
  ok "Tor $($TOR --version 2>&1 | head -1 | awk '{print $3}')"
fi

if [[ ! -f "$DIR/server.js" ]]; then
  err "server.js not found in $DIR"
  exit 1
fi
ok "Project directory: $DIR"

# ── Kill any existing instances ───────────────────────────
log "Cleaning up previous instances..."

if [[ -f "$SERVER_PID" ]]; then
  OLD_PID=$(cat "$SERVER_PID" 2>/dev/null)
  if kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null && ok "Stopped previous server (PID $OLD_PID)"
    sleep 1
  fi
  rm -f "$SERVER_PID"
fi

# Free port 3000 if something is still holding it
STALE=$(lsof -ti :3000 2>/dev/null | grep -v "^$$" || true)
if [[ -n "$STALE" ]]; then
  echo "$STALE" | xargs kill -9 2>/dev/null || true
  sleep 1
  ok "Freed port 3000"
fi

# ── Start Tor ─────────────────────────────────────────────
start_tor() {
  if [[ -z "$TOR" ]]; then return; fi

  # Check if already running and healthy
  if pgrep -x tor > /dev/null 2>&1; then
    if curl -s --socks5 127.0.0.1:9050 --max-time 5 https://check.torproject.org/api/ip > /dev/null 2>&1; then
      ok "Tor already running and connected"
      return
    else
      warn "Tor process found but SOCKS not ready — restarting"
      pkill -x tor 2>/dev/null || true
      sleep 2
    fi
  fi

  log "Starting Tor daemon..."
  rm -f "$TOR_LOG" "$TOR_PID"
  "$TOR" \
    --RunAsDaemon 1 \
    --PidFile "$TOR_PID" \
    --Log "notice file $TOR_LOG" \
    --SocksPort 9050 \
    --ControlPort 9051 \
    > /dev/null 2>&1

  # Wait for bootstrap (max 90s)
  local deadline=$((SECONDS + 90))
  local last_pct=0
  printf "  Bootstrapping Tor "
  while [[ $SECONDS -lt $deadline ]]; do
    sleep 3
    if [[ -f "$TOR_LOG" ]]; then
      local pct
      pct=$(grep -o 'Bootstrapped [0-9]*%' "$TOR_LOG" 2>/dev/null | tail -1 | grep -o '[0-9]*' || echo "0")
      if [[ "$pct" != "$last_pct" ]]; then
        printf "\r  Bootstrapping Tor [%-20s] %3s%%" "$(printf '#%.0s' $(seq 1 $((pct / 5))))" "$pct"
        last_pct=$pct
      fi
      if grep -q 'Bootstrapped 100%' "$TOR_LOG" 2>/dev/null; then
        echo ""
        ok "Tor bootstrapped — SOCKS5 ready on :9050"
        return
      fi
    fi
  done

  echo ""
  warn "Tor bootstrap timed out — continuing without Tor"
}

start_tor

# ── Check VPN ─────────────────────────────────────────────
detect_vpn() {
  # macOS VPN services
  if scutil --nc list 2>/dev/null | grep -qiE "Connected|Running"; then
    ok "VPN detected: macOS VPN service active"
    return 0
  fi
  # Known VPN processes
  local vpn_procs="nordvpnd expressvpnd mullvad surfshark openvpn wireguard v2ray clash sing-box trojan ss-local"
  for p in $vpn_procs; do
    if pgrep -x "$p" > /dev/null 2>&1; then
      ok "VPN detected: $p is running"
      return 0
    fi
  done
  # Active utun interface with a routable IP
  local utun_ip
  utun_ip=$(ifconfig 2>/dev/null | awk '
    /^utun/{iface=$1}
    /inet /{
      ip=$2
      if (iface && ip !~ /^192\.168\.64\./ && ip !~ /^169\.254\./ && ip !~ /^127\./)
        print ip
      iface=""
    }' | head -1)
  if [[ -n "$utun_ip" ]]; then
    ok "VPN detected: tunnel interface with IP $utun_ip"
    return 0
  fi
  warn "No VPN detected — Chinese/defence sites will use Tor only"
  return 1
}

detect_vpn || true

# ── Start Node.js server ──────────────────────────────────
log "Starting PHANTOM TRACE server..."

export PATH="/opt/homebrew/Cellar/node/25.9.0_1/bin:$PATH"
cd "$DIR"

if $DAEMON; then
  nohup "$NODE" server.js > "$SERVER_LOG" 2> "$SERVER_ERR" &
  SERVER_PID_VAL=$!
  echo "$SERVER_PID_VAL" > "$SERVER_PID"

  # Wait for server to be ready (max 30s)
  SERVER_DEADLINE=$((SECONDS + 30))
  while [[ $SECONDS -lt $SERVER_DEADLINE ]]; do
    sleep 2
    if curl -s --max-time 2 http://localhost:3000/api/status > /dev/null 2>&1; then
      ok "Server is up (PID $SERVER_PID_VAL)"
      open http://localhost:3000
      break
    fi
  done

  echo ""
  echo -e "${BOLD}${GREEN}  ✓ PHANTOM TRACE running in background${RESET}"
  echo -e "  Server  → ${CYAN}http://localhost:3000${RESET}"
  echo -e "  Logs    → ${YELLOW}$SERVER_LOG${RESET}"
  echo -e "  Errors  → ${YELLOW}$SERVER_ERR${RESET}"
  echo ""
  echo -e "  Stop:   ${RED}kill \$(cat $SERVER_PID) && pkill -x tor${RESET}"
else
  echo ""
  echo -e "${BOLD}${GREEN}  ✓ Starting PHANTOM TRACE (Ctrl+C to stop)${RESET}"
  echo -e "  Open → ${CYAN}http://localhost:3000${RESET}"
  echo ""
  # Trap Ctrl+C to also kill Tor
  trap 'echo ""; log "Shutting down..."; pkill -x tor 2>/dev/null || true; exit 0' INT TERM
  open http://localhost:3000
  exec "$NODE" server.js
fi
