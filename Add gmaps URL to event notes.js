// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
// Add Google Maps to Events
// Prepends a comgooglemaps:// URL to the notes of upcoming calendar events
// that have a location, without duplicating on repeat runs.

const DAYS_AHEAD = 14;
const URL_SCHEME = "comgooglemaps://?q=";
const MARKER = "[gmaps]"; // sentinel to detect already-processed events

const calendars = await Calendar.forEvents();

const startDate = new Date();
const endDate = new Date();
endDate.setDate(endDate.getDate() + DAYS_AHEAD);

const events = await CalendarEvent.between(startDate, endDate, calendars);

let updatedCount = 0;
let skippedNoLocation = 0;
let skippedAlreadyTagged = 0;

for (const event of events) {
  if (!event.location || event.location.trim() === "") {
    skippedNoLocation++;
    continue;
  }

  const existingNotes = event.notes || "";

  // Skip if we've already added a gmaps link to this event
  if (existingNotes.includes(MARKER)) {
    skippedAlreadyTagged++;
    continue;
  }

  const gmapsUrl = URL_SCHEME + encodeURIComponent(event.location);
  const linkLine = `${MARKER} ${gmapsUrl}`;

  // Prepend to existing notes, with a blank line separator if notes exist
  event.notes = existingNotes.trim() === ""
    ? linkLine
    : `${linkLine}\n\n${existingNotes.trim()}`;

  try {
    await event.save();
    console.log(`Updated: "${event.title}"`);
    updatedCount++;
  } catch (e) {
    console.log(`Failed to save "${event.title}": ${e}`);
  }
}

const summary = `Updated: ${updatedCount}\nSkipped (no location): ${skippedNoLocation}\nSkipped (already tagged): ${skippedAlreadyTagged}`;
console.log(summary);

if (config.runsInApp) {
  const notif = new Notification();
  notif.title = "Calendar URLs Updated";
  notif.body = summary;
  await notif.schedule();
}

Script.complete();