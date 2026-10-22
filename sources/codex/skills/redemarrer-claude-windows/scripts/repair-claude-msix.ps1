[CmdletBinding()]
param(
    [switch]$Reregister,
    [switch]$PlanOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$packages = @(Get-AppxPackage -Name 'Claude' -ErrorAction SilentlyContinue)
if ($packages.Count -ne 1) {
    throw "Attendu exactement un package MSIX Claude ; trouvé : $($packages.Count)."
}

$package = $packages[0]
$installLocation = $package.InstallLocation
$chromeHostRoot = Join-Path $env:APPDATA 'Claude\ChromeNativeHost'
$targets = @(Get-CimInstance Win32_Process | Where-Object {
    ($_.Name -eq 'claude.exe' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith($installLocation, [StringComparison]::OrdinalIgnoreCase)) -or
    ($_.Name -eq 'chrome-native-host.exe' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith($chromeHostRoot, [StringComparison]::OrdinalIgnoreCase))
} | Select-Object Name, ProcessId, ExecutablePath)

$plan = [pscustomobject]@{
    package = $package.PackageFullName
    install_location = $installLocation
    stop_service = [bool](Get-Service -Name 'CoworkVMService' -ErrorAction SilentlyContinue)
    processes_to_stop = $targets
    reregister = [bool]$Reregister
}

if ($PlanOnly) {
    $plan | ConvertTo-Json -Depth 5
    return
}

Stop-Service -Name 'CoworkVMService' -Force -ErrorAction SilentlyContinue
foreach ($target in $targets) {
    Stop-Process -Id $target.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

$remaining = @(Get-CimInstance Win32_Process | Where-Object {
    ($_.Name -eq 'claude.exe' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith($installLocation, [StringComparison]::OrdinalIgnoreCase)) -or
    ($_.Name -eq 'chrome-native-host.exe' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith($chromeHostRoot, [StringComparison]::OrdinalIgnoreCase))
})
if ($remaining.Count -gt 0) {
    throw "Des processus Claude ciblés sont encore actifs : $($remaining.ProcessId -join ', ')."
}

if ($Reregister) {
    $manifest = Join-Path $installLocation 'AppxManifest.xml'
    if (-not (Test-Path -LiteralPath $manifest)) {
        throw "Manifeste MSIX introuvable : $manifest"
    }
    Add-AppxPackage -DisableDevelopmentMode -Register $manifest -ErrorAction Stop
    Stop-Service -Name 'CoworkVMService' -Force -ErrorAction SilentlyContinue
}

[pscustomobject]@{
    status = 'REPAIR_ACTIONS_COMPLETED'
    package = $package.PackageFullName
    stopped_processes = $targets.Count
    reregistered = [bool]$Reregister
    data_reset = $false
} | ConvertTo-Json -Depth 4
