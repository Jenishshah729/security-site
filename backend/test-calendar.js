import dotenv from "dotenv";
dotenv.config();
import { google } from "googleapis";
import fs from "fs";

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));
const oAuth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

if (fs.existsSync("token.json")) {
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync("token.json")));
}

const calendarAPI = google.calendar({ version: "v3", auth: oAuth2Client });
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

async function testInsert() {
  try {
    console.log("Inserting test event...");
    const res = await calendarAPI.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: {
        summary: `Test (late)`,
        description: `This is a test late event`,
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 30 * 60000).toISOString() }
      }
    });
    console.log("Event inserted! ID:", res.data.id);
  } catch (err) {
    console.error("Error inserting event:", err.message);
  }
}

testInsert();
