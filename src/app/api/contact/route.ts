import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ success: false, error: "Email and message are required." }, { status: 400 });
    }

    const sheets = await getSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    const values = [[
      new Date().toISOString(),
      (name || "").trim(),
      (email || "").trim().toLowerCase(),
      (subject || "").trim(),
      (message || "").trim(),
      req.headers.get("user-agent") || "",
      req.headers.get("x-forwarded-for") || "",
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Contact!A:G",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}


