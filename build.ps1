<#
.SYNOPSIS
    Builds existing .NET Web API and Node.js React frontend applications, then zips their build artifacts.
.DESCRIPTION
    This script checks for the presence of the .NET SDK and Node.js/npm/pnpm.
    It navigates to the specified backend directory, builds the .NET project, and then zips its output.
    After that, it navigates to the specified frontend directory, installs dependencies,
    builds the Node.js React project using the chosen package manager, and then zips its output.
    This script assumes both projects already exist and does not create new ones.
.PARAMETER AppName
    Specifies the name of the .NET Web API application's directory. This directory
    is expected to contain an existing .NET project. Defaults to 'backend/fx-backend'.
.PARAMETER TargetFramework
    Specifies the target framework for the .NET backend application to build against.
    Defaults to 'net9.0'.
.PARAMETER Configuration
    Specifies the build configuration for the .NET backend (e.g., 'Debug' or 'Release').
    Defaults to 'Debug'.
.PARAMETER FrontendAppName
    Specifies the name of the Node.js React application's directory. This directory
    is expected to contain an existing Node.js project. Defaults to 'frontend'.
.PARAMETER PackageManager
    Specifies the package manager to use for the frontend build ('npm' or 'pnpm').
    Defaults to 'npm'.
.EXAMPLE
    .\BuildApps.ps1
    Builds 'backend/fx-backend' (net9.0, Debug) and 'frontend' (npm), then zips their artifacts.
.EXAMPLE
    .\BuildApps.ps1 -AppName "my-api" -FrontendAppName "my-ui" -Configuration "Release" -PackageManager "pnpm"
    Builds 'my-api' (net9.0, Release) and 'my-ui' (pnpm), then zips their artifacts.
#>
param(
    [string]$AppName = "backend/fx-backend",
    [string]$TargetFramework = "net9.0",
    [string]$Configuration = "Debug",
    [string]$FrontendAppName = "frontend", # New parameter for frontend app path
    [string]$PackageManager = "npm" # New parameter for package manager
)

Write-Host "Starting application build process..." -ForegroundColor Cyan

# --- Set current directory to the script's running directory ---
# This ensures that relative paths for AppName and FrontendAppName are resolved correctly.
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path $ScriptDir
Write-Host "Current working directory set to: $ScriptDir" -ForegroundColor DarkGray
Write-Host "" # Add a blank line for readability

# Define artifact zip file names
$BackendZipFileName = "backend_dist.zip"
$FrontendZipFileName = "frontend_dist.zip"

# --- Step 1: Check for .NET SDK presence ---
Write-Host "Checking for .NET SDK..." -ForegroundColor Yellow
try {
    $dotnetPath = (Get-Command dotnet -ErrorAction Stop).Source
    Write-Host ".NET SDK found at: $dotnetPath" -ForegroundColor Green

    # --- Display installed .NET SDK versions ---
    Write-Host "Listing installed .NET SDK versions:" -ForegroundColor Yellow
    dotnet --list-sdks
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Could not list .NET SDKs. Ensure 'dotnet' is correctly installed."
    }
    Write-Host "" # Add a blank line for readability
}
catch {
    Write-Warning "'.NET SDK' not found in your PATH."
    Write-Host "Please install the .NET SDK to proceed." -ForegroundColor Red
    return # Use return instead of exit to stop execution but not close PowerShell
}

# --- Step 2: Navigate to the backend application directory ---
Write-Host "Navigating to backend application directory '$AppName'..." -ForegroundColor Yellow
if (-not (Test-Path -Path $AppName -PathType Container)) {
    Write-Error "The specified backend application directory '$AppName' does not exist."
    Write-Host "Please ensure the directory exists and contains your .NET Web API project." -ForegroundColor Red
    return # Use return instead of exit to stop execution but not close PowerShell
}

Push-Location -Path $AppName # Use Push-Location to easily return later

# --- Step 3: Build the .NET backend project ---
Write-Host "Building the .NET Web API project in '$AppName' for target framework '$TargetFramework' with configuration '$Configuration'..." -ForegroundColor Yellow
try {
    dotnet build --framework $TargetFramework --configuration $Configuration
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build the .NET Web API project. Error code: $LASTEXITCODE"
        Write-Host "Please check the output above for more details." -ForegroundColor Red
        Pop-Location # Ensure we pop location even on error
        return # Use return instead of exit to stop execution but not close PowerShell
    }
    Write-Host "Project in '$AppName' built successfully for '$TargetFramework' in '$Configuration' configuration." -ForegroundColor Green
}
catch {
    Write-Error "An error occurred while building the backend project: $($_.Exception.Message)"
    Pop-Location # Ensure we pop location even on error
    return # Use return instead of exit to stop execution but not close PowerShell
}

# --- Step 4: Zip backend build artifacts ---
Write-Host "Zipping backend build artifacts..." -ForegroundColor Yellow
# Construct the path to the backend build output directory
# Corrected Join-Path usage for multiple segments
$BackendBuildOutputPath = Join-Path (Join-Path (Join-Path (Get-Location) "bin") $Configuration) $TargetFramework
$BackendZipFilePath = Join-Path $ScriptDir $BackendZipFileName

if (Test-Path -Path $BackendBuildOutputPath -PathType Container) {
    try {
        # Remove existing zip file if it exists
        if (Test-Path -Path $BackendZipFilePath) {
            Remove-Item -Path $BackendZipFilePath -Force
            Write-Host "Removed existing '$BackendZipFileName'." -ForegroundColor DarkGray
        }
        Compress-Archive -Path "$BackendBuildOutputPath\*" -DestinationPath $BackendZipFilePath -Force
        Write-Host "Backend artifacts zipped to '$BackendZipFilePath'." -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to zip backend artifacts: $($_.Exception.Message)"
        Write-Host "Please ensure you have write permissions to the destination directory." -ForegroundColor Red
    }
} else {
    Write-Warning "Backend build output directory '$BackendBuildOutputPath' not found. Skipping zipping."
}

Pop-Location # Return to the original directory after backend build

Write-Host "" # Add a blank line for readability
Write-Host "--- Starting Frontend Build Process ---" -ForegroundColor Cyan
Write-Host "" # Add a blank line for readability

# --- Step 5: Check for Node.js presence ---
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    (Get-Command node -ErrorAction Stop).Source
    Write-Host "Node.js found." -ForegroundColor Green
}
catch {
    Write-Warning "'Node.js' not found in your PATH."
    Write-Host "Please install Node.js to proceed with frontend build." -ForegroundColor Red
    Write-Host "You can download it from: https://nodejs.org/en/download" -ForegroundColor White
    return # Use return instead of exit to stop execution but not close PowerShell
}

# --- Step 6: Check for specified Package Manager presence ---
Write-Host "Checking for package manager '$PackageManager'..." -ForegroundColor Yellow
if ($PackageManager -eq "pnpm") {
    try {
        (Get-Command pnpm -ErrorAction Stop).Source
        Write-Host "pnpm found." -ForegroundColor Green
    }
    catch {
        Write-Warning "'pnpm' not found in your PATH."
        Write-Host "Please install pnpm (npm install -g pnpm) or set PackageManager to 'npm'." -ForegroundColor Red
        return # Use return instead of exit to stop execution but not close PowerShell
    }
} elseif ($PackageManager -eq "npm") {
    try {
        (Get-Command npm -ErrorAction Stop).Source
        Write-Host "npm found." -ForegroundColor Green
    }
    catch {
        Write-Warning "'npm' not found in your PATH."
        Write-Host "npm is usually installed with Node.js. Please check your Node.js installation." -ForegroundColor Red
        return # Use return instead of exit to stop execution but not close PowerShell
    }
} else {
    Write-Error "Invalid PackageManager specified: '$PackageManager'. Please use 'npm' or 'pnpm'."
    return # Use return instead of exit to stop execution but not close PowerShell
}

# --- Step 7: Navigate to the frontend application directory ---
Write-Host "Navigating to frontend application directory '$FrontendAppName'..." -ForegroundColor Yellow
if (-not (Test-Path -Path $FrontendAppName -PathType Container)) {
    Write-Error "The specified frontend application directory '$FrontendAppName' does not exist."
    Write-Host "Please ensure the directory exists and contains your Node.js React project." -ForegroundColor Red
    return # Use return instead of exit to stop execution but not close PowerShell
}

Push-Location -Path $FrontendAppName # Use Push-Location for frontend dir

# --- Step 8: Install frontend dependencies ---
Write-Host "Installing frontend dependencies using '$PackageManager'..." -ForegroundColor Yellow
try {
    if ($PackageManager -eq "pnpm") {
        pnpm install
    } else {
        npm install
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install frontend dependencies using '$PackageManager'. Error code: $LASTEXITCODE"
        Write-Host "Please check the output above for more details." -ForegroundColor Red
        Pop-Location # Ensure we pop location even on error
        return # Use return instead of exit to stop execution but not close PowerShell
    }
    Write-Host "Frontend dependencies installed successfully." -ForegroundColor Green
}
catch {
    Write-Error "An error occurred during frontend dependency installation: $($_.Exception.Message)"
    Pop-Location # Ensure we pop location even on error
    return # Use return instead of exit to stop execution but not close PowerShell
}

# --- Step 9: Build the frontend project ---
Write-Host "Building the frontend application using '$PackageManager'..." -ForegroundColor Yellow
try {
    if ($PackageManager -eq "pnpm") {
        pnpm run build
    } else {
        npm run build
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build the frontend application using '$PackageManager'. Error code: $LASTEXITCODE"
        Write-Host "Please check the output above for more details." -ForegroundColor Red
        Pop-Location # Ensure we pop location even on error
        return # Use return instead of exit to stop execution but not close PowerShell
    }
    Write-Host "Frontend application built successfully." -ForegroundColor Green
}
catch {
    Write-Error "An error occurred while building the frontend project: $($_.Exception.Message)"
    Pop-Location # Ensure we pop location even on error
    return # Use return instead of exit to stop execution but not close PowerShell
}

# --- Step 10: Zip frontend build artifacts ---
Write-Host "Zipping frontend build artifacts..." -ForegroundColor Yellow
# Construct the path to the frontend build output directory
$FrontendBuildOutputPath = Join-Path (Get-Location) "dist"
$FrontendZipFilePath = Join-Path $ScriptDir $FrontendZipFileName

if (Test-Path -Path $FrontendBuildOutputPath -PathType Container) {
    try {
        # Remove existing zip file if it exists
        if (Test-Path -Path $FrontendZipFilePath) {
            Remove-Item -Path $FrontendZipFilePath -Force
            Write-Host "Removed existing '$FrontendZipFileName'." -ForegroundColor DarkGray
        }
        Compress-Archive -Path "$FrontendBuildOutputPath\*" -DestinationPath $FrontendZipFilePath -Force
        Write-Host "Frontend artifacts zipped to '$FrontendZipFilePath'." -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to zip frontend artifacts: $($_.Exception.Message)"
        Write-Host "Please ensure you have write permissions to the destination directory." -ForegroundColor Red
    }
} else {
    Write-Warning "Frontend build output directory '$FrontendBuildOutputPath' not found. Skipping zipping."
}

Pop-Location # Return to the original directory after frontend build

Write-Host "" # Add a blank line for readability
Write-Host "All application build processes completed." -ForegroundColor Cyan
Write-Host "All application build processes completed. You can now find the zipped artifacts: '$BackendZipFileName' and '$FrontendZipFileName' in the script's original running directory." -ForegroundColor Cyan
