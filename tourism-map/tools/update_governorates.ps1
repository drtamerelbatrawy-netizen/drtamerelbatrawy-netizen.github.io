# Download open governorate boundaries (geoBoundaries SAU ADM2) and save them as data\governorates_official.js
# Usage: right-click > Run with PowerShell (needs internet), or run tools\update_governorates.bat
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$url = 'https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/SAU/ADM2/geoBoundaries-SAU-ADM2_simplified.geojson'
$tmp = Join-Path $env:TEMP 'sau_adm2.geojson'
Write-Host 'Downloading governorate boundaries...'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing
$json = [IO.File]::ReadAllText($tmp, [Text.Encoding]::UTF8)
$out = Join-Path $root 'data\governorates_official.js'
[IO.File]::WriteAllText($out, 'window.KSA_GEO=window.KSA_GEO||{};KSA_GEO.governorates_official=' + $json + ';', (New-Object Text.UTF8Encoding($false)))
Remove-Item $tmp -ErrorAction SilentlyContinue
$n = ([regex]::Matches($json, '"type"\s*:\s*"Feature"')).Count
Write-Host "Done: $n governorates saved to $out . Reopen the map."
