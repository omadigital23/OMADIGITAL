# Test the admin API endpoint with proper authentication
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluX2RjYTc0MGMxIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3NzM3OTU3LCJleHAiOjE3NTc4MjQzNTd9.WCw3WBJfdSkvQcF747XrVnXr6ecOWFvGukkke82Qt6s"
$headers = @{
    "Cookie" = "admin_token=$token"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/admin/chatbot-conversations" -Headers $headers -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "API Response:" -ForegroundColor Green
    $data | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}