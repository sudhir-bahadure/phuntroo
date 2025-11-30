$ErrorActionPreference = "Continue"

$toolsDir = "d:\Jarvis-main\tools"
if (!(Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir | Out-Null }

# URLs
$jdkUrl = "https://aka.ms/download-jdk/microsoft-jdk-17.0.9-windows-x64.zip"
$mavenUrl = "https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"

# Paths
$jdkZip = "$toolsDir\jdk.zip"
$mavenZip = "$toolsDir\maven.zip"
$jdkDest = "$toolsDir\jdk-17"
$mavenDest = "$toolsDir\maven"

# 1. Setup Java
if (!(Test-Path "$jdkDest\bin\java.exe")) {
    Write-Host "Setting up Java..."
    
    # Check if already extracted with different name
    $extractedJdk = Get-ChildItem -Path $toolsDir -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "jdk-17*" -and $_.Name -ne "jdk-17" } | Select-Object -First 1
    
    if ($extractedJdk) {
        Write-Host "Found extracted JDK, renaming..."
        try {
            if (Test-Path $jdkDest) { Remove-Item $jdkDest -Recurse -Force }
            Move-Item -Path $extractedJdk.FullName -Destination $jdkDest -Force
        }
        catch {
            Write-Host "Using existing folder: $($extractedJdk.Name)"
            $jdkDest = $extractedJdk.FullName
        }
    }
    else {
        Write-Host "Downloading OpenJDK 17..."
        Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZip
        
        Write-Host "Extracting JDK..."
        Expand-Archive -Path $jdkZip -DestinationPath $toolsDir -Force
        
        $extractedJdk = Get-ChildItem -Path $toolsDir -Directory | Where-Object { $_.Name -like "jdk-17*" } | Select-Object -First 1
        if ($extractedJdk -and $extractedJdk.Name -ne "jdk-17") {
            try {
                Move-Item -Path $extractedJdk.FullName -Destination $jdkDest -Force
            }
            catch {
                $jdkDest = $extractedJdk.FullName
            }
        }
        
        if (Test-Path $jdkZip) { Remove-Item $jdkZip -Force }
    }
    Write-Host "Java setup complete at: $jdkDest"
}
else {
    Write-Host "Java already present."
}

# 2. Setup Maven
if (!(Test-Path "$mavenDest\bin\mvn.cmd")) {
    Write-Host "Setting up Maven..."
    
    $extractedMaven = Get-ChildItem -Path $toolsDir -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "apache-maven*" -and $_.Name -ne "maven" } | Select-Object -First 1
    
    if ($extractedMaven) {
        Write-Host "Found extracted Maven, renaming..."
        try {
            if (Test-Path $mavenDest) { Remove-Item $mavenDest -Recurse -Force }
            Move-Item -Path $extractedMaven.FullName -Destination $mavenDest -Force
        }
        catch {
            Write-Host "Using existing folder: $($extractedMaven.Name)"
            $mavenDest = $extractedMaven.FullName
        }
    }
    else {
        Write-Host "Downloading Maven..."
        Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip
        
        Write-Host "Extracting Maven..."
        Expand-Archive -Path $mavenZip -DestinationPath $toolsDir -Force
        
        $extractedMaven = Get-ChildItem -Path $toolsDir -Directory | Where-Object { $_.Name -like "apache-maven*" } | Select-Object -First 1
        if ($extractedMaven -and $extractedMaven.Name -ne "maven") {
            try {
                Move-Item -Path $extractedMaven.FullName -Destination $mavenDest -Force
            }
            catch {
                $mavenDest = $extractedMaven.FullName
            }
        }
        
        if (Test-Path $mavenZip) { Remove-Item $mavenZip -Force }
    }
    Write-Host "Maven setup complete at: $mavenDest"
}
else {
    Write-Host "Maven already present."
}

Write-Host "Environment setup finished!"
