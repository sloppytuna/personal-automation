# personal-automation

Small iOS automation scripts for [Scriptable](https://scriptable.app). The first one makes Apple Calendar event locations open in **Google Maps** with a single tap without giving up any of Apple's native calendar behavior.

## Add Google Maps URL to event notes

### The problem

Apple Calendar always opens an event's location in Apple Maps; I prefer Google Maps. The obvious fix, pasting a GMaps link into the event's **Location** field, breaks three things I care about:

- **Glanceability.** A location of `comgooglemaps://?q=...` is unreadable at a glance.
- **Place names.** I usually type real names ("Joe's Pizza") into events, not addresses. The Location field should keep them.
- **Time to leave and travel time.** Apple computes its "time to leave" notifications and travel time suggestions from the Location field. Overwrite it and they break.

I also didn't want to have to invoke a shortcut separate from the Calendar app every time. My habit is to browse Calendar, tap into an event, and act from the detail view, all in one place. The fix should live *inside the event*, not in the home screen or another app.

### The solution

This script adds a tappable `comgooglemaps://` link to the **notes** field of upcoming events that have a location, leaving the Location field, place names, and time-to-leave / travel time mechanics untouched. Tap the link from the event detail view and Google Maps opens straight to that place.

Because `comgooglemaps://?q=` hands the location text to Google Maps' own search rather than a fixed pin, the link is forgiving of partial inputs and mismatches between the two apps (e.g., if a place's name is more current in GMaps than Apple Maps, or if it has more than one valid address).

### How it works

1. Fetches every calendar event in the next 14 days.
2. Skips events with no location, and events already processed (detected via a `[gmaps]` marker).
3. Builds `comgooglemaps://?q=<url-encoded location>` and prepends it to the notes, **preserving any existing notes** below a blank-line separator.
4. Saves the event and logs a summary (updated / skipped-no-location / skipped-already-tagged).

It runs automatically: an iOS **"App Closed → Calendar"** automation triggers a wrapper Shortcut, which runs this script. Every time I finish using Calendar, upcoming events get their links.

### Design notes

- **Non-destructive.** Existing notes are preserved; the link is prepended with a separator, never overwriting.
- **Idempotent.** The `[gmaps]` marker means re-running never adds duplicate links. Safe to run as often as you like.
- **Native features preserved.** The Location field is never touched, so place names and time-to-leave keep working.
- **Notes field, not the URL field.** Scriptable's `CalendarEvent` bridge doesn't expose a writable `url` property, so assigning `event.url` fails *silently* and never persists. The notes field is the reliable writable target. Diagnosing this silent save failure was the main development hurdle.
- **`Script.complete()`** is called at the end so the script exits cleanly when launched from a Shortcuts automation.

### Setup

Requires an iPhone with [Scriptable](https://scriptable.app) (free) and the Google Maps app installed.

1. **Add the script.** Create a new script in Scriptable and paste `Add_gmaps_URL_to_event_notes.js`. Run it once manually with the ▶ button to confirm it works and to register it with iOS.
2. **Create a wrapper Shortcut.** In the Shortcuts app, make a new shortcut with a single **Run Script** (Scriptable) action pointing at this script. iOS 26's Automation editor doesn't expose third-party app actions directly, so the script has to be wrapped in a normal shortcut first.
3. **Create the automation.** Shortcuts → Automation → **App** → Calendar → **Is Closed** → run the wrapper shortcut. Turn off "Ask Before Running."

### Limitations

- Events created on a Mac sync to the iPhone, but are only processed the next time Calendar is closed on the phone.
- Virtual/video-call "locations" (Zoom, Meet links) still get a GMaps link. Filtering them was considered and deliberately skipped to avoid maintaining a brittle pattern list.
- Tested on iOS 26.3.1.
