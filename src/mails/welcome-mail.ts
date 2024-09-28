export const welcomeMail = () => {
	return `
		<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Cinema Hub</title>
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
            background-color: #333;
            color: #ffffff;
            padding: 10px 0;
            text-align: center;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h2 {
            color: #333;
        }
        .content p {
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #e50914;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            background-color: #f4f4f4;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Cinema Hub!</h1>
        </div>
        <div class="content">
            <h2>Hi [User's Name],</h2>
            <p>Thank you for registering with <strong>Cinema Hub</strong>. We're excited to have you on board!</p>
            <p>Enjoy the latest movies, exclusive offers, and much more.</p>
            <a href="[Cinema Website URL]" class="button">Visit Our Website</a>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} <strong>Cinema Hub</strong>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
	`
}