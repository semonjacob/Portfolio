<?php
ob_start(); // Start output buffering
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['success' => true, 'message' => 'Contact endpoint is working']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode(['success' => false, 'error' => 'All fields are required.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        $mail->SMTPDebug = 0; // Disable debug output for production
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'semonjeyakumar@gmail.com';
        $mail->Password = 'jgfmiypetzomsczb'; // 16-character app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('semonjeyakumar@gmail.com', 'Semon Jacob');
        $mail->addAddress('semonjeyakumar@gmail.com');
        $mail->Subject = "New Contact Form Submission from $name";
        $mail->Body = "Name: $name\nEmail: $email\n\nMessage:\n$message";

        if ($mail->send()) {
            echo json_encode(['success' => true]);
        } else {
            $errorMessage = 'Email sending failed: ' . $mail->ErrorInfo;
            error_log($errorMessage);
            echo json_encode(['success' => false, 'error' => $errorMessage]);
        }
    } catch (Exception $e) {
        $errorMessage = 'Mail Error: ' . $mail->ErrorInfo; // use PHPMailer error info
        error_log($errorMessage); // logs to Apache log
        echo json_encode(['success' => false, 'error' => $errorMessage]);
    }
    exit;
}
exit;
  <input name="name" type="text" placeholder="Your Name" required>
  <input name="email" type="email" placeholder="Your Email" required>
  <textarea name="message" placeholder="Your Message" required></textarea>
  <button type="submit">Send</button>
</form>

<script>
const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch("contact.php", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ Message sent successfully!");
      form.reset();
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (err) {
    alert("❌ Failed to send the message. Try again later.");
    console.error(err);
  }
});
</script>
