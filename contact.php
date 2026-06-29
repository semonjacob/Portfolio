<?php
header('Content-Type: application/json');
http_response_code(410);
echo json_encode([
    'success' => false,
    'error' => 'This static portfolio no longer accepts PHP contact submissions. Please email semonjeyakumar@gmail.com.'
]);
exit;
