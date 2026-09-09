import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


def send_email(to_email, subject, body):
    message = EmailMessage()

    message["From"] = os.getenv("SMTP_USERNAME")
    message["To"] = to_email
    message["Subject"] = subject

    message.set_content(body)

    try:
        with smtplib.SMTP(
            os.getenv("SMTP_HOST"),
            int(os.getenv("SMTP_PORT"))
        ) as server:

            server.starttls()

            server.login(
                os.getenv("SMTP_USERNAME"),
                os.getenv("SMTP_PASSWORD")
            )

            server.send_message(message)

        print("Email sent successfully!")

    except Exception as e:
        print("Email sending failed:", e)
        raise