# create packed folder if it doesn't exist
if (-not (Test-Path -Path "packed")) {
    New-Item -ItemType Directory -Path "packed" | Out-Null
}

#copy all files from addon_files to packed folder
Copy-Item -Path "addon_files/*" -Destination "packed" -Recurse -Force

#go trough all microfrontends and use pnpm run build on them

$basePath = "./card_sources"

$microFrontends = @(
    "dnd5e-itemcard",
    "dnd5e-monstercard",
    "dnd5e-nordvikcard",
    "dnd5e-template_settings"
)

foreach ($microFrontend in $microFrontends) {
    Write-Host "Building $microFrontend..."
    Push-Location (Join-Path -Path $basePath -ChildPath $microFrontend)
    pnpm install
    pnpm run build
    Pop-Location
}

# now go again and extract css + js file to packed/resources folder and rename them to {nameofmicrofrontend}.js and {nameofmicrofrontend}.css
foreach ($microFrontend in $microFrontends) {
    Write-Host "Packing $microFrontend..."
    $buildFolder = Join-Path -Path $basePath -ChildPath (Join-Path -Path $microFrontend -ChildPath "dist/assets")
    $jsFile = Get-ChildItem -Path $buildFolder -Filter "*.js" | Select-Object -First 1

    if ($jsFile) {
        Copy-Item -Path $jsFile.FullName -Destination (Join-Path -Path "packed/Resources" -ChildPath "$microFrontend.js")
    } else {
        Write-Warning "No JS file found for $microFrontend"
    }
}


