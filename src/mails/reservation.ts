type MailPayload = {
	customer_name: string
	movie_title: string
	date: string
	time: string
	theatre: string
	seat: string
	payment_link: string
}

const reservationMail = (payload: MailPayload) => {
	return `
		<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
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
            padding: 10px 0;
        }
        .header img {
            width: 100px;
        }
        .content {
            margin: 20px 0;
        }
        .content h2 {
            color: #333333;
        }
        .content p {
            color: #666666;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            color: #999999;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cinema Hub</h1>
        </div>
        <div class="content">
            <h2>Booking Confirmation</h2>
            <p>Dear ${payload.customer_name},</p>
            <p>Thank you for booking with us! Your reservation for the movie <strong>${payload.movie_title}</strong> has been successfully made.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
                <li><strong>Movie:</strong> ${payload.movie_title}</li>
                <li><strong>Date:</strong> ${payload.date}</li>
                <li><strong>Time:</strong> ${payload.time}</li>
                <li><strong>Theatre:</strong> ${payload.theatre}</li>
                <li><strong>Seat Number:</strong> ${payload.seat}</li>
            </ul>
            <p>Please note that your booking will be held for 15 minutes. If payment is not completed within this time, your reservation will be automatically cancelled.</p>
            <p>To complete your payment, please click the button below:</p>
            <a href="${payload.payment_link}" class="button">Complete Payment</a>
            <p>Thank you for choosing our <strong>Cinema Hub</strong>. We look forward to seeing you!</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} <strong>Cinema Hub</strong>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
	`
}