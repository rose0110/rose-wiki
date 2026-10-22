[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$DestinationRoot,

    [string]$RoamingClaudeRoot = (Join-Path $env:APPDATA 'Claude'),
    [string]$MsixPackageRoot = (Join-Path $env:LOCALAPPDATA 'Packages\Claude_pzs8sxrjxfjjc'),
    [string]$ClaudeCliRoot = (Join-Path $env:USERPROFILE '.claude')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-FileInventory {
    param([Parameter(Mandatory)][string]$Root)
    if (-not (Test-Path -LiteralPath $Root)) { return @() }
    return @(Get-ChildItem -LiteralPath $Root -File -Recurse -Force -ErrorAction Stop |
        Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) } |
        ForEach-Object { "$($_.FullName.Substring($Root.Length))|$($_.Length)" })
}

function Copy-DirectoryVerified {
    param(
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$Destination
    )
    if (-not (Test-Path -LiteralPath $Source)) {
        return [pscustomobject]@{ item = $Source; source_files = 0; backup_files = 0; differences = 0; skipped = $true }
    }

    & robocopy.exe $Source $Destination /E /COPY:DAT /DCOPY:DAT /R:2 /W:1 /XJ /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -gt 7) {
        throw "Échec robocopy ($LASTEXITCODE) pour $Source"
    }

    $sourceInventory = @(Get-FileInventory -Root $Source)
    $backupInventory = @(Get-FileInventory -Root $Destination)
    $differences = @(Compare-Object $sourceInventory $backupInventory)
    return [pscustomobject]@{
        item = $Source
        source_files = $sourceInventory.Count
        backup_files = $backupInventory.Count
        differences = $differences.Count
        skipped = $false
    }
}

if (-not (Test-Path -LiteralPath $RoamingClaudeRoot)) {
    throw "Dossier Claude introuvable : $RoamingClaudeRoot"
}

$destinationFull = [IO.Path]::GetFullPath($DestinationRoot).TrimEnd([IO.Path]::DirectorySeparatorChar)
foreach ($protectedSource in @($RoamingClaudeRoot, $MsixPackageRoot, $ClaudeCliRoot)) {
    $sourceFull = [IO.Path]::GetFullPath($protectedSource).TrimEnd([IO.Path]::DirectorySeparatorChar)
    if ($destinationFull.Equals($sourceFull, [StringComparison]::OrdinalIgnoreCase) -or
        $destinationFull.StartsWith("$sourceFull$([IO.Path]::DirectorySeparatorChar)", [StringComparison]::OrdinalIgnoreCase)) {
        throw "La destination ne peut pas se trouver dans un dossier source protégé : $protectedSource"
    }
}

New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupPath = Join-Path $DestinationRoot "Claude-backup-$stamp"
if (Test-Path -LiteralPath $backupPath) {
    throw "Le dossier de sauvegarde existe déjà : $backupPath"
}
New-Item -ItemType Directory -Path $backupPath | Out-Null

$roamingDestination = Join-Path $backupPath 'AppData-Roaming-Claude'
$packageDestination = Join-Path $backupPath 'MSIX-package-state'
New-Item -ItemType Directory -Path $roamingDestination | Out-Null
New-Item -ItemType Directory -Path $packageDestination | Out-Null

$checks = @()
$importantDirectories = @(
    'claude-code',
    'claude-code-sessions',
    'local-agent-mode-sessions',
    'Claude Extensions',
    'Claude Extensions Settings'
)
foreach ($name in $importantDirectories) {
    $checks += Copy-DirectoryVerified -Source (Join-Path $RoamingClaudeRoot $name) -Destination (Join-Path $roamingDestination $name)
}

$importantFiles = @(
    'config.json',
    'claude_desktop_config.json',
    'git-worktrees.json',
    'extensions-installations.json',
    'mcp-user-tool-toggles.json',
    'cowork-enabled-cli-ops.json',
    'window-state.json',
    'plan-usage-history.json',
    'Preferences'
)
foreach ($name in $importantFiles) {
    $source = Join-Path $RoamingClaudeRoot $name
    $destination = Join-Path $roamingDestination $name
    if (Test-Path -LiteralPath $source) {
        Copy-Item -LiteralPath $source -Destination $destination -Force
        $difference = if ((Get-Item -LiteralPath $source).Length -eq (Get-Item -LiteralPath $destination).Length) { 0 } else { 1 }
        $checks += [pscustomobject]@{ item = $source; source_files = 1; backup_files = 1; differences = $difference; skipped = $false }
    }
}

if (Test-Path -LiteralPath $MsixPackageRoot) {
    foreach ($name in @('LocalState', 'RoamingState', 'Settings', 'SystemAppData')) {
        $checks += Copy-DirectoryVerified -Source (Join-Path $MsixPackageRoot $name) -Destination (Join-Path $packageDestination $name)
    }
}

$cliFiles = @()
if (Test-Path -LiteralPath $ClaudeCliRoot) {
    $cliFiles = @(Get-ChildItem -LiteralPath $ClaudeCliRoot -File -Recurse -Force -ErrorAction SilentlyContinue)
}

$backupFiles = @(Get-ChildItem -LiteralPath $backupPath -File -Recurse -Force -ErrorAction Stop)
$totalDifferences = ($checks | Measure-Object -Property differences -Sum).Sum
if ($null -eq $totalDifferences) { $totalDifferences = 0 }
$verificationStatus = if ($totalDifferences -eq 0) { 'VERIFIED' } else { 'FAILED' }

$manifest = [ordered]@{
    created_at = (Get-Date).ToString('o')
    verification_status = $verificationStatus
    verification_method = 'Automatic comparison of non-reparse file paths and sizes'
    backup_path = $backupPath
    backup_files = $backupFiles.Count
    backup_bytes = ($backupFiles | Measure-Object Length -Sum).Sum
    excluded = @('vm_bundles', 'Cache', 'Code Cache', 'GPUCache', 'logs', 'temporary reparse points')
    claude_cli_root = $ClaudeCliRoot
    claude_cli_files_observed = $cliFiles.Count
    claude_cli_bytes_observed = ($cliFiles | Measure-Object Length -Sum).Sum
    claude_cli_modified = $false
    checks = $checks
}

$manifestPath = Join-Path $backupPath 'backup-manifest.json'
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding utf8NoBOM
$manifest | ConvertTo-Json -Depth 6

if ($verificationStatus -ne 'VERIFIED') {
    throw "La sauvegarde contient $totalDifferences différence(s). Ne pas désinstaller Claude."
}
