# Upload all screenshots to R2
$screenshotDir = "public/screenshots"
$bucketName = "partner-screenshots"

# Get all PNG files in the screenshots directory
$screenshots = Get-ChildItem -Path $screenshotDir -Filter "*.png" -Recurse

Write-Host "Found $($screenshots.Count) screenshots to upload..."

foreach ($screenshot in $screenshots) {
    $relativePath = $screenshot.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $objectKey = $screenshot.Name
    
    Write-Host "Uploading $objectKey..."
    
    # Upload to R2
    & wrangler r2 object put "$bucketName/$objectKey" --file="$($screenshot.FullName)" --remote
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Uploaded $objectKey" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to upload $objectKey" -ForegroundColor Red
    }
}

Write-Host "Upload complete!"
