# Lclone production smoke test (user journey)
$ErrorActionPreference = "Continue"
$base = "https://loclone.vercel.app"
$worker = "https://loclone-clone-worker.onrender.com"
$results = @()

function Add-Result($area, $check, $status, $detail) {
    $script:results += [PSCustomObject]@{ Area = $area; Check = $check; Status = $status; Detail = $detail }
}

function Test-Page($path, $expectStatus = 200, $mustContain = $null) {
    $url = "$base$path"
    try {
        $r = Invoke-WebRequest -Uri $url -TimeoutSec 90 -UseBasicParsing
        $ok = $r.StatusCode -eq $expectStatus
        if ($mustContain -and $r.Content -notmatch $mustContain) { $ok = $false; $detail = "missing: $mustContain" }
        else { $detail = "len=$($r.Content.Length)" }
        return @{ Ok = $ok; Detail = if ($ok) { $detail } else { "status=$($r.StatusCode) $detail" } }
    } catch {
        return @{ Ok = $false; Detail = $_.Exception.Message }
    }
}

Write-Host "=== Git sync ===" -ForegroundColor Cyan
$repoRoot = Split-Path $PSScriptRoot -Parent
$local = git -C $repoRoot rev-parse HEAD 2>$null
$remote = git -C $repoRoot rev-parse origin/master 2>$null
$synced = $local -eq $remote
Add-Result "repo" "local=origin/master" $(if ($synced) { "PASS" } else { "FAIL" }) "$local vs $remote"

Write-Host "=== Public pages ===" -ForegroundColor Cyan
foreach ($item in @(
    @{ Path = "/"; Match = "Lclone|클론" },
    @{ Path = "/login"; Match = "로그인|개발 로그인" }
)) {
    $t = Test-Page $item.Path 200 $item.Match
    Add-Result "pages" $item.Path $(if ($t.Ok) { "PASS" } else { "FAIL" }) $t.Detail
}

Write-Host "=== API health ===" -ForegroundColor Cyan
try {
    $h = Invoke-RestMethod -Uri "$base/api/health" -TimeoutSec 90
    Add-Result "api" "/api/health" $(if ($h.ok) { "PASS" } else { "FAIL" }) "store=$($h.store) projects=$($h.projects)"
} catch {
    Add-Result "api" "/api/health" "FAIL" $_.Exception.Message
}

Write-Host "=== Worker health ===" -ForegroundColor Cyan
try {
    $w = Invoke-RestMethod -Uri "$worker/health" -TimeoutSec 120
    Add-Result "worker" "/health" $(if ($w.ok) { "PASS" } else { "FAIL" }) "perJob=$($w.browserPool.perJobBrowser)"
} catch {
    Add-Result "worker" "/health" "FAIL" $_.Exception.Message
}

Write-Host "=== Auth + dashboard (dev login) ===" -ForegroundColor Cyan
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    $login = Invoke-WebRequest -Uri "$base/api/auth/dev-login" -Method POST -WebSession $session -TimeoutSec 90 -UseBasicParsing
    $loginJson = $login.Content | ConvertFrom-Json
    if (-not $loginJson.ok) { throw "dev-login failed" }
    Add-Result "auth" "dev-login" "PASS" "user=$($loginJson.user.email)"
} catch {
    Add-Result "auth" "dev-login" "FAIL" $_.Exception.Message
}

foreach ($dash in @("/dashboard", "/dashboard/guide", "/dashboard/projects")) {
    try {
        $r = Invoke-WebRequest -Uri "$base$dash" -WebSession $session -TimeoutSec 90 -UseBasicParsing
        Add-Result "dashboard" $dash $(if ($r.StatusCode -eq 200) { "PASS" } else { "FAIL" }) "status=$($r.StatusCode)"
    } catch {
        Add-Result "dashboard" $dash "FAIL" $_.Exception.Message
    }
}

Write-Host "=== Clone flow (static) ===" -ForegroundColor Cyan
try {
  # list projects
  $proj = Invoke-RestMethod -Uri "$base/api/projects" -WebSession $session -TimeoutSec 90
  if (-not $proj.ok -or $proj.projects.Count -eq 0) {
    $create = Invoke-RestMethod -Uri "$base/api/projects" -Method POST -WebSession $session -TimeoutSec 90 -ContentType "application/json" -Body '{"name":"Smoke Test","url":"https://example.com"}'
    $projectId = $create.project.id
    Add-Result "clone" "create project" "PASS" $projectId
  } else {
    $projectId = $proj.projects[0].id
    Add-Result "clone" "list projects" "PASS" "using $projectId"
  }

  $cloneBody = '{"url":"https://example.com","mode":"static","options":{}}'
  $clone = Invoke-RestMethod -Uri "$base/api/projects/$projectId/clone" -Method POST -WebSession $session -TimeoutSec 120 -ContentType "application/json" -Body $cloneBody
  if (-not $clone.ok) { throw $clone.error }
  $runId = $clone.result.runId
  Add-Result "clone" "static clone" "PASS" "runId=$runId status=$($clone.run.status)"

  $preview = Invoke-WebRequest -Uri "$base/api/clones/$runId" -WebSession $session -TimeoutSec 90 -UseBasicParsing
  $hasContent = $preview.Content -match "Example Domain"
  Add-Result "preview" "/api/clones/{runId}" $(if ($hasContent) { "PASS" } else { "FAIL" }) "len=$($preview.Content.Length)"
} catch {
  Add-Result "clone" "static flow" "FAIL" $_.Exception.Message
}

Write-Host "=== Clone flow (render via worker) ===" -ForegroundColor Cyan
try {
  if (-not $projectId) { throw "no project" }
  $cloneBody = '{"url":"https://example.com","mode":"render","options":{}}'
  $clone = Invoke-RestMethod -Uri "$base/api/projects/$projectId/clone" -Method POST -WebSession $session -TimeoutSec 300 -ContentType "application/json" -Body $cloneBody
  if (-not $clone.ok) { throw $clone.error }
  $runId = $clone.result.runId
  Add-Result "clone" "render clone" "PASS" "runId=$runId status=$($clone.run.status)"

  $preview = Invoke-WebRequest -Uri "$base/api/clones/$runId" -WebSession $session -TimeoutSec 90 -UseBasicParsing
  $hasContent = $preview.Content -match "Example Domain"
  Add-Result "preview" "render preview" $(if ($hasContent) { "PASS" } else { "FAIL" }) "len=$($preview.Content.Length)"
} catch {
  Add-Result "clone" "render flow" "FAIL" $_.Exception.Message
}

Write-Host ""
$results | Format-Table -AutoSize
$failed = @($results | Where-Object { $_.Status -eq "FAIL" }).Count
$passed = @($results | Where-Object { $_.Status -eq "PASS" }).Count
Write-Host "SUMMARY: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
if ($failed -gt 0) { exit 1 }
