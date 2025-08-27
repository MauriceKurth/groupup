<?php
$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NTYyMTc2NTMsImV4cCI6MTc1NjIyMTI1Mywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBncm91cHVwLmZyIn0.Crvu5x7A6ndOQhI3FsX49bjhEYNJaDC4ofw9Jqbfv6L0H1zf6zB_WkEAF7JekBLVkITekQaocntuXeioIYXpDU6BAlHhY1Dwb-bFJQj9s4iCfNMVqscRL63ahBLuQwBM5aVkrDF_cw1GvC1eBjEA7GxJZKLG8PWaBtbYEjlOeMhi5y0LGNjFMhWaDM9NJ1xVL6avV-DRlrhRdHpmetqwkxGXR7bi3yRzjKKcGTSu_Q7FjTFA-x5BP69ESnTGfVKlYtxqMEhfb8Q6d8WHioPMMH3U2bPpzJ1ywJYhJzrNRQ37LxikAh1Q7RjE2ZhUtMKyM-dOSm_Fa0ysNaIOPnpJyIkoHiT8bVtw2d9cXweg26OF-ZntCQrj3cuzxyGAKfefLrKNyPseK1U8bXuoAreoOiDWTLGJFKledvoFK3uAqgW58Q9ETwavpT0K8J9ZoSO2KTOu-MvSpusCV5Cpk6wRLe-VlPnH2S4E661ZD3fuLKAkHG5lhz5RujLg3astVEo5jdRc7LRibxKvVFJYouMOExDcCITaXyQwRDh9khm3ldjzwNq5JVNRKKxwCKi2UHDA2LDEDjZ66Su1zwLVqPdbtAohTdy2O_M-17sflzy_fqFzXaILKm_AnF40ucr_Nro0TL7h8HLzmGdFFpJY8uSey47Yoy4h9pA26IK-AwkKv7k';
$url = 'http://localhost:8000/api/me';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";