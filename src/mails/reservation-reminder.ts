type MailPayload = {
	customer_name: string
	movie_title: string
	date: string
	time: string
	theatre: string
	seat: string
}

export const reservationReminderMail = (payload: MailPayload) => {
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
            <h1>Booking Reminder</h1>
            <p>Dear ${payload.customer_name},</p>
            <p>This is a friendly reminder that your movie booking is scheduled to start in one hour.</p>
            <p><strong>Movie:</strong> ${payload.movie_title}</p>
            <p><strong>Date:</strong> ${payload.date}</p>
            <p><strong>Time:</strong> ${payload.time}</p>
						<p><strong>Theatre:</strong> ${payload.theatre}</p>
            <p><strong>Seat Number:</strong> ${payload.seat}</p>
            <p>We look forward to seeing you at our cinema!</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} <strong>Cinema Hub</strong>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
	`
}
