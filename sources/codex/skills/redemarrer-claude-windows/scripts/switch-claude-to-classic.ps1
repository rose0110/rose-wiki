[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$VerifiedBackupPath,

    [switch]$ConfirmSwitch,
    [switch]$PlanOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$manifestPath = Join-Path $VerifiedBackupPath 'backup-manifest.json'
if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "Manifeste de sauvegarde introuvable : $manifestPath"
}
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($manifest.verification_status -ne 'VERIFIED') {
    throw "Sauvegarde non vérifiée : $($manifest.verification_status)"
}
$resolvedBackupPath = (Resolve-Path -LiteralPath $VerifiedBackupPath).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
$manifestBackupPath = [IO.Path]::GetFullPath([string]$manifest.backup_path).TrimEnd([IO.Path]::DirectorySeparatorChar)
if (-not $resolvedBackupPath.Equals($manifestBackupPath, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Le chemin du manifeste ne correspond pas au dossier fourni : $manifestBackupPath"
}
if ([int64]$manifest.backup_files -lt 1 -or @($manifest.checks | Where-Object { [int]$_.differences -ne 0 }).Count -gt 0) {
    throw 'Le manifeste VERIFIED est incohérent : sauvegarde vide ou différences non nulles.'
}

$winget = Get-Command winget.exe -ErrorAction Stop
$showOutput = & $winget.Source show --id Anthropic.Claude --exact --source winget --accept-source-agreements --disable-interactivity 2>&1
$showExitCode = $LASTEXITCODE
if ($showExitCode -ne 0 -or ($showOutput -join "`n") -notmatch 'Anthropic\.Claude') {
    throw "Le paquet WinGet Anthropic.Claude n’est pas disponible. Aucun package ne sera retiré. Sortie : $($showOutput -join ' ')"
}

$packages = @(Get-AppxPackage -Name 'Claude' -ErrorAction SilentlyContinue)
if ($packages.Count -gt 1) {
    throw "Plusieurs packages MSIX Claude sont présents ($($packages.Count)). Arrêt pour éviter une suppression ambiguë."
}

$plan = [pscustomobject]@{
    backup = $VerifiedBackupPath
    backup_status = $manifest.verification_status
    msix_packages_to_remove = @($packages | Select-Object PackageFullName, Version, InstallLocation)
    winget_package = 'Anthropic.Claude'
    classic_launcher = (Join-Path $env:LOCALAPPDATA 'AnthropicClaude\claude.exe')
}
if ($PlanOnly) {
    $plan | ConvertTo-Json -Depth 5
    return
}
if (-not $ConfirmSwitch) {
    throw 'Ajouter -ConfirmSwitch après avoir relu le plan.'
}

$launcher = Join-Path $env:LOCALAPPDATA 'AnthropicClaude\claude.exe'
if (-not (Test-Path -LiteralPath $launcher)) {
    & $winget.Source install --id Anthropic.Claude --exact --source winget --silent --accept-package-agreements --accept-source-agreements --disable-interactivity
    if ($LASTEXITCODE -ne 0) {
        throw "Échec WinGet avant retrait MSIX (code $LASTEXITCODE). Aucun package MSIX n’a été retiré."
    }
}
if (-not (Test-Path -LiteralPath $launcher)) {
    throw "Installation annoncée réussie mais lanceur absent. Aucun package MSIX ne sera retiré : $launcher"
}
$signature = Get-AuthenticodeSignature -FilePath $launcher
if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch 'Anthropic') {
    throw "Signature Anthropic valide non confirmée. Aucun package MSIX ne sera retiré : $launcher"
}

foreach ($package in $packages) {
    $installLocation = $package.InstallLocation
    Stop-Service -Name 'CoworkVMService' -Force -ErrorAction SilentlyContinue
    Get-CimInstance Win32_Process | Where-Object {
        ($_.Name -eq 'claude.exe' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith($installLocation, [StringComparison]::OrdinalIgnoreCase)) -or
        ($_.Name -eq 'chrome-native-host.exe' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith((Join-Path $env:APPDATA 'Claude\ChromeNativeHost'), [StringComparison]::OrdinalIgnoreCase))
    } | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Remove-AppxPackage -Package $package.PackageFullName -ErrorAction Stop
}

$launcherFile = Get-Item -LiteralPath $launcher
[pscustomobject]@{
    status = 'CLASSIC_INSTALLED_MSIX_REMOVED'
    backup = $VerifiedBackupPath
    remaining_msix_packages = @(Get-AppxPackage -Name 'Claude' -ErrorAction SilentlyContinue).Count
    launcher = $launcher
    version = $launcherFile.VersionInfo.FileVersion
    signature = $signature.Status.ToString()
    signer = $signature.SignerCertificate.Subject
} | ConvertTo-Json -Depth 4
