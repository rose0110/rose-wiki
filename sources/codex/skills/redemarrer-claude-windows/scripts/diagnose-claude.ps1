[CmdletBinding()]
param(
    [ValidateRange(1, 1440)]
    [int]$Minutes = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$since = (Get-Date).AddMinutes(-$Minutes)
$classicRoot = Join-Path $env:LOCALAPPDATA 'AnthropicClaude'
$chromeHostRoot = Join-Path $env:APPDATA 'Claude\ChromeNativeHost'

$msixPackages = @(Get-AppxPackage -Name 'Claude' -ErrorAction SilentlyContinue)
$classicLauncher = Join-Path $classicRoot 'claude.exe'
$classicVersion = $null
if (Test-Path -LiteralPath $classicLauncher) {
    $classicVersion = (Get-Item -LiteralPath $classicLauncher).VersionInfo.FileVersion
}

$service = Get-CimInstance Win32_Service -Filter "Name='CoworkVMService'" -ErrorAction SilentlyContinue
$processes = @(Get-CimInstance Win32_Process | Where-Object {
    $_.Name -in @('claude.exe', 'cowork-svc.exe', 'chrome-native-host.exe')
} | ForEach-Object {
    $processPath = $_.ExecutablePath
    $isMsixDesktop = @($msixPackages | Where-Object {
        $processPath -and $_.InstallLocation -and $processPath.StartsWith($_.InstallLocation, [StringComparison]::OrdinalIgnoreCase)
    }).Count -gt 0
    $role = 'unrelated-or-unknown'
    if ($processPath -and $processPath.StartsWith($classicRoot, [StringComparison]::OrdinalIgnoreCase)) {
        $role = 'classic-desktop'
    } elseif ($isMsixDesktop) {
        $role = 'msix-desktop'
    } elseif ($processPath -and $processPath.StartsWith($chromeHostRoot, [StringComparison]::OrdinalIgnoreCase)) {
        $role = 'claude-chrome-native-host'
    } elseif ($_.Name -eq 'cowork-svc.exe') {
        $role = 'cowork-service'
    }
    [pscustomobject]@{
        name = $_.Name
        pid = $_.ProcessId
        executable_path = $processPath
        role = $role
    }
})

$appModelEvents = @()
try {
    $appModelEvents = @(Get-WinEvent -FilterHashtable @{
        LogName = 'Microsoft-Windows-AppModel-Runtime/Admin'
        StartTime = $since
    } -ErrorAction Stop | Where-Object {
        $_.Message -match 'Claude' -and ($_.Id -in @(208, 215) -or $_.Message -match '0x80070020')
    } | Select-Object -First 20 TimeCreated, Id, LevelDisplayName, Message)
} catch {
    $appModelEvents = @()
}

$crashEvents = @()
try {
    $crashEvents = @(Get-WinEvent -FilterHashtable @{
        LogName = 'Application'
        StartTime = $since
    } -ErrorAction Stop | Where-Object {
        $_.ProviderName -in @('Application Error', 'Windows Error Reporting') -and $_.Message -match 'claude.exe'
    } | Select-Object -First 20 TimeCreated, Id, ProviderName, Message)
} catch {
    $crashEvents = @()
}

$hasSharingViolation = @($appModelEvents | Where-Object { $_.Message -match '0x80070020' }).Count -gt 0
$signature = if ($msixPackages.Count -gt 0 -and $hasSharingViolation) {
    'KNOWN_MSIX_LOCK_0x80070020'
} elseif (Test-Path -LiteralPath $classicLauncher) {
    'CLASSIC_INSTALL_PRESENT'
} elseif ($msixPackages.Count -gt 0) {
    'MSIX_INSTALL_PRESENT_NO_RECENT_0x80070020'
} else {
    'CLAUDE_INSTALL_NOT_FOUND'
}

[pscustomobject]@{
    checked_at = (Get-Date).ToString('o')
    minutes_examined = $Minutes
    diagnosis = $signature
    msix_packages = @($msixPackages | ForEach-Object {
        [pscustomobject]@{
            package_full_name = $_.PackageFullName
            version = $_.Version.ToString()
            status = $_.Status.ToString()
            install_location = $_.InstallLocation
        }
    })
    classic = [pscustomobject]@{
        present = Test-Path -LiteralPath $classicLauncher
        launcher = $classicLauncher
        version = $classicVersion
    }
    cowork_service = if ($service) {
        [pscustomobject]@{
            present = $true
            state = $service.State
            start_mode = $service.StartMode
            process_id = $service.ProcessId
            path = $service.PathName
        }
    } else {
        [pscustomobject]@{ present = $false }
    }
    relevant_processes = $processes
    appmodel_events_208_215 = $appModelEvents
    application_crashes = $crashEvents
} | ConvertTo-Json -Depth 7
