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

    if not smtp_host:
        raise Exception("SMTP_HOST is missing")

    if not smtp_port:
        raise Exception("SMTP_PORT is missing")

    if not smtp_username:
        raise Exception("SMTP_USERNAME is missing")

    if not smtp_password:
        raise Exception("SMTP_PASSWORD is missing")

    try:
        port = int(smtp_port)
    except ValueError:
        raise Exception("SMTP_PORT must be a number")

    message = EmailMessage()
    message["From"] = smtp_username
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        print(f"Connecting to SMTP server: {smtp_host}:{port}")
        print(f"SMTP username: {smtp_username}")
        print(f"Sending email to: {to_email}")

        with smtplib.SMTP(
            smtp_host,
            port,
            timeout=30
        ) as server:

            server.ehlo()

            print("Starting TLS...")
            server.starttls()

            server.ehlo()

            print("Logging into SMTP server...")
            server.login(
                smtp_username,
                smtp_password
            )

            print("Sending email...")
            server.send_message(message)

        print(f"Email sent successfully to {to_email}")

    except Exception as e:
        print("EMAIL ERROR TYPE:", type(e).__name__)
        print("EMAIL ERROR:", repr(e))
        raise