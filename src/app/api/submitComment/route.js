import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { google } from "googleapis";

// Set up OAuth2 client
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // Redirect URL, same as used in OAuth Playground
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

export async function POST(request) {
  try {
    const { comment } = await request.json();

    if (!comment) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    // Get a new access token using the refresh token
    const accessToken = await oauth2Client.getAccessToken();

    // Set up Nodemailer transport with OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: "baespey@gmail.com",
      subject: "New Comment from JacketScore",
      text: `You received a new comment: \n\n${comment}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Comment submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send comment" }, { status: 500 });
  }
}
