#!/bin/bash
# visual-check.sh — Standalone visual quality gate PoC.
#
# Takes Playwright screenshots of configured routes at multiple viewports,
# sends them to a vision LLM (OpenAI or Anthropic) for UI quality review,
# and writes a machine-readable review.json plus a human-readable summary.
#
# Environment variables:
#   BASE_URL        (required) — the URL to screenshot
#   VISUAL_ROUTES   (default: "/") — space-separated routes
#   VISUAL_VIEWPORTS (default: "desktop mobile")
#   VISUAL_BACKEND  (default: "openai-gpt-5.4-mini")
#   VISUAL_OUTPUT_DIR (default: ".effectum/visual-reports")
#   OPENAI_API_KEY or ANTHROPIC_API_KEY depending on backend
#
# Flags: --dry-run, --verbose
# Exit codes: 0=pass, 1=fail (critical issues), 3=tool error

set -euo pipefail

# --- Defaults ---------------------------------------------------------------

VISUAL_ROUTES="${VISUAL_ROUTES:-/}"
VISUAL_VIEWPORTS="${VISUAL_VIEWPORTS:-desktop mobile}"
VISUAL_BACKEND="${VISUAL_BACKEND:-openai-gpt-5.4-mini}"
VISUAL_OUTPUT_DIR="${VISUAL_OUTPUT_DIR:-.effectum/visual-reports}"

# Viewport dimensions (portable function — avoids declare -A for macOS bash 3.2 compat)
get_viewport_dims() {
  case "$1" in
    desktop) echo "1440x900" ;;
    mobile)  echo "390x844" ;;
    tablet)  echo "768x1024" ;;
    *)       echo "$1" ;;  # passthrough for custom dimensions
  esac
}

# --- Flag parsing ------------------------------------------------------------

DRY_RUN=false
VERBOSE=false

for arg in "$@"; do
  case "$arg" in
    --dry-run)  DRY_RUN=true ;;
    --verbose)  VERBOSE=true ;;
    *)          echo "Unknown flag: $arg"; exit 3 ;;
  esac
done

log() {
  if [ "$VERBOSE" = true ]; then
    echo "[visual-check] $*"
  fi
}

# --- Validation --------------------------------------------------------------

if [ -z "${BASE_URL:-}" ]; then
  echo "ERROR: BASE_URL is required but not set."
  exit 3
fi

# Determine API backend and validate key
case "$VISUAL_BACKEND" in
  openai-*|gpt-*)
    API_PROVIDER="openai"
    if [ -z "${OPENAI_API_KEY:-}" ]; then
      echo "ERROR: OPENAI_API_KEY is required for backend '$VISUAL_BACKEND'."
      exit 3
    fi
    ;;
  anthropic-*|claude-*)
    API_PROVIDER="anthropic"
    if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
      echo "ERROR: ANTHROPIC_API_KEY is required for backend '$VISUAL_BACKEND'."
      exit 3
    fi
    ;;
  *)
    echo "ERROR: Unknown VISUAL_BACKEND '$VISUAL_BACKEND'. Use openai-* or anthropic-*."
    exit 3
    ;;
esac

# --- Dry-run output ----------------------------------------------------------

if [ "$DRY_RUN" = true ]; then
  echo "=== visual-check.sh — dry run ==="
  echo "BASE_URL:         $BASE_URL"
  echo "VISUAL_ROUTES:    $VISUAL_ROUTES"
  echo "VISUAL_VIEWPORTS: $VISUAL_VIEWPORTS"
  echo "VISUAL_BACKEND:   $VISUAL_BACKEND"
  echo "VISUAL_OUTPUT_DIR: $VISUAL_OUTPUT_DIR"
  echo "API_PROVIDER:     $API_PROVIDER"
  echo "API key:          (set)"
  echo "=== No screenshots or API calls made ==="
  exit 0
fi

# --- Check Playwright --------------------------------------------------------

if ! npx playwright --version >/dev/null 2>&1; then
  echo "ERROR: Playwright not found. Install with: npx playwright install chromium"
  exit 3
fi

# --- Setup output dir --------------------------------------------------------

mkdir -p "$VISUAL_OUTPUT_DIR"

# --- Vision review prompt ----------------------------------------------------

VISION_PROMPT='You are a senior UI quality reviewer inside an autonomous coding workflow.
Review the attached screenshot for visible UI quality issues.

Return STRICT JSON ONLY. No markdown, no commentary outside the JSON.

{
  "score": <integer 0-10>,
  "critical": [{"route": "<route>", "viewport": "<viewport>", "element": "<element>", "issue": "<issue>", "fix": "<fix>"}],
  "warnings": [{"route": "<route>", "viewport": "<viewport>", "element": "<element>", "issue": "<issue>", "suggestion": "<suggestion>"}],
  "passed": ["<item>"]
}

Scoring: 9-10=great, 7-8=solid, 5-6=mixed, 3-4=rough, 0-2=broken.
Critical = visibly broken or unacceptable. Warning = usable but improvable.
Be conservative: only report what is VISIBLE in the screenshot.'

# --- API call helpers --------------------------------------------------------

call_openai() {
  local b64_image="$1"
  local route="$2"
  local viewport="$3"

  # Write payload builder to a temp file to avoid shell-quoting issues
  local py_script
  py_script=$(mktemp /tmp/visual-check-openai-XXXXXX.py)
  cat > "$py_script" << 'PYEOF'
import json, sys, os
prompt = os.environ.get("_VISION_PROMPT", "")
b64 = os.environ.get("_B64_IMAGE", "")
payload = {
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": "data:image/png;base64," + b64}}
    ]}],
    "max_tokens": 2000,
    "temperature": 0.2
}
print(json.dumps(payload))
PYEOF

  local body
  body=$(_VISION_PROMPT="$VISION_PROMPT" _B64_IMAGE="$b64_image" python3 "$py_script")
  rm -f "$py_script"

  curl -s https://api.openai.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d "$body"
}

call_anthropic() {
  local b64_image="$1"
  local route="$2"
  local viewport="$3"

  local py_script
  py_script=$(mktemp /tmp/visual-check-anthropic-XXXXXX.py)
  cat > "$py_script" << 'PYEOF'
import json, sys, os
prompt = os.environ.get("_VISION_PROMPT", "")
b64 = os.environ.get("_B64_IMAGE", "")
payload = {
    "model": "claude-haiku-4-5",
    "max_tokens": 2000,
    "messages": [{"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": b64}},
        {"type": "text", "text": prompt}
    ]}]
}
print(json.dumps(payload))
PYEOF

  local body
  body=$(_VISION_PROMPT="$VISION_PROMPT" _B64_IMAGE="$b64_image" python3 "$py_script")
  rm -f "$py_script"

  curl -s https://api.anthropic.com/v1/messages \
    -H "Content-Type: application/json" \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "$body"
}

extract_json_content() {
  local raw_response="$1"
  local provider="$2"

  python3 -c "
import json, sys, re

raw = sys.stdin.read()
data = json.loads(raw)

provider = '$provider'
if provider == 'openai':
    text = data['choices'][0]['message']['content']
elif provider == 'anthropic':
    text = data['content'][0]['text']
else:
    text = ''

# Strip markdown fences if present
text = re.sub(r'^\s*\`\`\`json?\s*', '', text)
text = re.sub(r'\s*\`\`\`\s*$', '', text)

# Validate it parses as JSON
parsed = json.loads(text)
print(json.dumps(parsed))
" <<< "$raw_response"
}

# --- Main loop: screenshot + review -----------------------------------------

ALL_REVIEWS=()
OVERALL_SCORE=0
REVIEW_COUNT=0
HAS_CRITICAL=false

for route in $VISUAL_ROUTES; do
  for viewport in $VISUAL_VIEWPORTS; do
    dimensions="$(get_viewport_dims "$viewport")"
    width="${dimensions%x*}"
    height="${dimensions#*x}"
    url="${BASE_URL%/}${route}"

    safe_route=$(echo "$route" | tr '/' '_')
    screenshot_file="${VISUAL_OUTPUT_DIR}/screenshot${safe_route}_${viewport}.png"

    log "Capturing $url at ${dimensions} → $screenshot_file"

    if ! npx playwright screenshot \
      --browser chromium \
      --viewport-size "${width},${height}" \
      "$url" "$screenshot_file" 2>/dev/null; then
      echo "ERROR: Playwright screenshot failed for $url at $dimensions"
      exit 3
    fi

    # Encode screenshot as base64 and pass via env to avoid shell escaping issues
    export _B64_IMAGE
    _B64_IMAGE=$(base64 < "$screenshot_file")

    log "Sending $screenshot_file to $API_PROVIDER for review"

    # Call vision API
    if [ "$API_PROVIDER" = "openai" ]; then
      raw_response=$(call_openai "$_B64_IMAGE" "$route" "$viewport")
    else
      raw_response=$(call_anthropic "$_B64_IMAGE" "$route" "$viewport")
    fi

    unset _B64_IMAGE

    # Extract and parse JSON from response
    review_json=$(extract_json_content "$raw_response" "$API_PROVIDER" 2>/dev/null) || {
      echo "ERROR: Failed to parse API response for $route@$viewport"
      log "Raw response: $raw_response"
      exit 3
    }

    ALL_REVIEWS+=("$review_json")

    # Extract score
    score=$(echo "$review_json" | python3 -c "import json,sys; print(json.load(sys.stdin).get('score', 0))")
    OVERALL_SCORE=$((OVERALL_SCORE + score))
    REVIEW_COUNT=$((REVIEW_COUNT + 1))

    # Check for critical issues
    critical_count=$(echo "$review_json" | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('critical', [])))")
    if [ "$critical_count" -gt 0 ]; then
      HAS_CRITICAL=true
    fi

    echo "  [$viewport] $route — score: $score/10, critical: $critical_count"
  done
done

# --- Build combined review.json ----------------------------------------------

if [ "$REVIEW_COUNT" -gt 0 ]; then
  AVG_SCORE=$((OVERALL_SCORE / REVIEW_COUNT))
else
  AVG_SCORE=0
fi

HAS_CRITICAL_PY="$( [ "$HAS_CRITICAL" = true ] && echo 'True' || echo 'False' )"

python3 -c "
import json, sys

reviews = []
for line in sys.stdin:
    line = line.strip()
    if line:
        reviews.append(json.loads(line))

combined = {
    'average_score': $AVG_SCORE,
    'total_reviews': $REVIEW_COUNT,
    'has_critical': $HAS_CRITICAL_PY,
    'reviews': reviews
}

print(json.dumps(combined, indent=2))
" <<< "$(printf '%s\n' "${ALL_REVIEWS[@]}")" > "${VISUAL_OUTPUT_DIR}/review.json"

# --- Human-readable summary --------------------------------------------------

echo ""
echo "=== Visual Quality Review ==="
echo "Routes:    $VISUAL_ROUTES"
echo "Viewports: $VISUAL_VIEWPORTS"
echo "Backend:   $VISUAL_BACKEND"
echo "Avg Score: $AVG_SCORE/10"
echo "Report:    ${VISUAL_OUTPUT_DIR}/review.json"

if [ "$HAS_CRITICAL" = true ]; then
  echo ""
  echo "RESULT: FAIL — critical issues found"
  exit 1
else
  echo ""
  echo "RESULT: PASS — no critical issues"
  exit 0
fi
