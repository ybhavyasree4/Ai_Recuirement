import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


def send_email(to_email, subject, body):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_host or not smtp_port or not smtp_username or not smtp_password:
        raise Exception("SMTP environment variables are missing")

    message = EmailMessage()
    message["From"] = smtp_username
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, int(smtp_port), timeout=30) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(message)

        print(f"Email sent successfully to {to_email}")

    except Exception as e:
        print("Email sending failed:", str(e))
        raise