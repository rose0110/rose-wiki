[CmdletBinding()]
param(
    [switch]$PlanOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$classicRoot = Join-Path $env:LOCALAPPDATA 'AnthropicClaude'
$launcher = Join-Path $classicRoot 'claude.exe'
if (-not (Test-Path -LiteralPath $launcher)) {
    throw "Installation classique Claude introuvable : $launcher"
}

$targets = @(Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'claude.exe' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith($classicRoot, [StringComparison]::OrdinalIgnoreCase)
} | Select-Object Name, ProcessId, ExecutablePath)

if ($PlanOnly) {
    [pscustomobject]@{
        launcher = $launcher
        launcher_version = (Get-Item -LiteralPath $launcher).VersionInfo.FileVersion
        processes_to_stop = $targets
    } | ConvertTo-Json -Depth 5
    return
}

foreach ($target in $targets) {
    Stop-Process -Id $target.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 3

$remaining = @(Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'claude.exe' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith($classicRoot, [StringComparison]::OrdinalIgnoreCase)
})
if ($remaining.Count -gt 0) {
    throw "Des processus Claude Desktop classiques sont encore actifs : $($remaining.ProcessId -join ', ')."
}

Start-Process -FilePath $launcher
$deadline = (Get-Date).AddSeconds(20)
$mainProcess = $null
do {
    Start-Sleep -Milliseconds 500
    $mainProcess = Get-CimInstance Win32_Process | Where-Object {
        $_.Name -eq 'claude.exe' -and
        $_.ExecutablePath -and
        $_.ExecutablePath.StartsWith($classicRoot, [StringComparison]::OrdinalIgnoreCase) -and
        $_.CommandLine -notmatch '--type='
    } | Select-Object -First 1
} until ($mainProcess -or (Get-Date) -ge $deadline)

if (-not $mainProcess) {
    throw "Le processus principal Claude ne s’est pas présenté dans les 20 secondes."
}

[pscustomobject]@{
    status = 'PROCESS_RESTARTED'
    process_id = $mainProcess.ProcessId
    executable_path = $mainProcess.ExecutablePath
    version = (Get-Item -LiteralPath $mainProcess.ExecutablePath).VersionInfo.FileVersion
    window_verification_required = $true
} | ConvertTo-Json -Depth 4
