type MailPayload = {
	customer_name: string
	movie_title: string
	date: string
	time: string
}

export const reservationCancellationMail = (payload: MailPayload) => {
	return `
		<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header img {
            max-width: 100px;
        }
        .content {
            text-align: center;
        }
        .content h1 {
            color: #333333;
        }
        .content p {
            color: #666666;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="cinema-logo.png" alt="Cinema Logo">
        </div>
        <div class="content">
            <h1>Reservation Cancellation</h1>
            <p>Dear ${payload.customer_name},</p>
            <p>We regret to inform you that your booking for ${payload.movie_title} on ${payload.date} at ${payload.time} has been cancelled as per your request.</p>
            <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
            <p>Thank you for choosing our cinema. We hope to see you again soon!</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} <strong>Cinema Hub</strong>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
	`
}
