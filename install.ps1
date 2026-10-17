# IvysCode Installer for Windows (PowerShell)
# Usage: irm https://raw.githubusercontent.com/JustinLeoni/ivys/main/install.ps1 | iex

param(
    [string]$Version = "",
    [string]$Binary = "",
    [switch]$NoModifyPath
)

$ErrorActionPreference = "Stop"
$App = "ivys"
$Repo = "JustinLeoni/ivys"
$InstallDir = Join-Path $env:LOCALAPPDATA "ivys\bin"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

if ($Binary -ne "") {
    if (-not (Test-Path $Binary)) { throw "Binary not found at $Binary" }
    Copy-Item $Binary (Join-Path $InstallDir "$App.exe") -Force
    Write-Host "Installed $App from $Binary" -ForegroundColor Green
} else {
    if ($Version -eq "") {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
        $Version = $release.tag_name
    }
    $Version = $Version.TrimStart("v")
    $Tag = "v$Version"

    $arch = if ([Environment]::Is64BitOperatingSystem) {
        if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
    } else { throw "Unsupported architecture" }

    $asset = "ivys-windows-$arch.zip"
    $url = "https://github.com/$Repo/releases/download/$Tag/$asset"
    $tmp = New-TemporaryFile | Select-Object -ExpandProperty DirectoryName
    $zipPath = Join-Path $tmp $asset

    Write-Host "Downloading $App $Tag (windows-$arch)..." -ForegroundColor DarkGray
    Invoke-WebRequest -Uri $url -OutFile $zipPath

    Expand-Archive -Path $zipPath -DestinationPath $tmp -Force
    $bin = Get-ChildItem -Path $tmp -Recurse -Filter "$App.exe" | Select-Object -First 1
    if (-not $bin) { throw "Binary not found in archive" }
    Copy-Item $bin.FullName (Join-Path $InstallDir "$App.exe") -Force
    Write-Host "Installed $App $Tag" -ForegroundColor Green
}

if (-not $NoModifyPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$InstallDir*") {
        [Environment]::SetEnvironmentVariable("Path", "$InstallDir;$currentPath", "User")
        Write-Host "Added $InstallDir to user PATH" -ForegroundColor DarkGray
    }
}

Write-Host "Run '$App --version' to verify." -ForegroundColor DarkGray
