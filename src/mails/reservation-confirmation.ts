import dayjs from "dayjs"

type MailPayload = {
	customer_name: string
	movie_title: string
	start_time: string
	theatre: string
	seat: string
}

export const reservationConfirmationMail = (payload: MailPayload) => {
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
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px 0;
        }
        .header img {
            max-width: 150px;
        }
        .content {
            padding: 20px;
        }
        .content h1 {
            color: #333333;
        }
        .content p {
            color: #666666;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            color: #999999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cinema Hub</h1>
        </div>
        <div class="content">
            <h1>Booking Confirmation</h1>
            <p>Dear [Customer Name],</p>
            <p>Thank you for booking with <strong>Cinema Hub</strong>. Your booking details are as follows:</p>
            <p><strong>Movie:</strong> ${payload.movie_title}</p>
             <p><strong>Date:</strong> ${dayjs(payload.start_time).format("dddd, MMMM D, YYYY")}</p>
            <p><strong>Time:</strong> ${dayjs(payload?.start_time).format("h:mm A")}</p>
            <p><strong>Theatre:</strong> ${payload.theatre}</p>
            <p><strong>Seat Number:</strong> ${payload.seat}</p>
            <p>We look forward to seeing you at the cinema. Enjoy the movie!</p>
            <p>Best regards,<br><strong>Cinema Hub</strong> Team</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} <strong>Cinema Hub</strong>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
	`
}
