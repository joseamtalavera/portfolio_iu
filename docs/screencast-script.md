# BeWorking — Screencast Narration Script (~90s)

Voice-over script for the Phase 2 screencast. Read the **bold** lines aloud.
The *italic* brackets are on-screen action cues — do **not** read them.

**Workflow (video first, audio second):**
1. Record the screen **silently**, performing the actions at each `[PAUSE]` point. Redo until smooth.
2. Add the **voice-over** afterward while watching playback, reading the bold lines.
3. Reuse the same bold lines as **subtitles**.

Demo flow: create → listed → double-booking rejected → delete → responsive/mobile.

---

**0:00** — *(Bookings page visible, logged in as tutor)*
> **"This is BeWorking, a virtual office platform. I'm logged in as the tutor account."**

**0:07** — **"I'll book a meeting room."**
*[PAUSE ~4s — select Room = Meeting Room, pick a Date]*

**0:11** — **"I choose the room, a date, from ten to eleven, with one attendee..."**
*[PAUSE ~4s — set Start 10:00, End 11:00, Attendees 1]*

**0:17** — **"...and I click Create Booking."**
*[PAUSE ~3s — click Create Booking, booking appears]*

**0:22** — **"The request goes to the Spring Boot backend, which validates it and saves it. The booking comes straight back and appears in my list."**
*[PAUSE ~3s — point to the new booking in the list / timeline]*

**0:33** — **"Now I'll try to book an overlapping time — ten-thirty to eleven-thirty."**
*[PAUSE ~4s — set Start 10:30, End 11:30, click Create Booking]*

**0:42** — **"The app detects the conflict and rejects it."**
*[PAUSE ~3s — the "Time Slot Already Booked" dialog appears; let it sit on screen]*

**0:48** — **"No two bookings can overlap. This is the correctness rule I added and covered with automated unit tests."**

**0:56** — **"I'll close the warning and delete my booking."**
*[PAUSE ~4s — close dialog, delete the 10–11 booking]*

**1:02** — **"It's removed from the server, and the list updates immediately."**
*[PAUSE ~3s — show the empty/updated list]*

**1:09** — **"Finally, the whole interface is responsive."**
*[PAUSE ~4s — switch to mobile width; page reflows, sidebar collapses]*

**1:17** — **"Here's the same booking page on mobile — same features, adapted layout."**
*[PAUSE ~3s — scroll the mobile view briefly]*

**1:23** — **"That's BeWorking: booking creation, double-booking prevention, and a responsive design, all backed by a tested Spring Boot API."**

**~1:28** — *(end)*

---

**Recording checklist:**
- [ ] Logged in as tutor (`tutor@be-working.com`), on the Bookings page.
- [ ] No leftover bookings in the demo slot before starting.
- [ ] Conflict dialog text confirmed: **"Time Slot Already Booked"**.
- [ ] Record screen with **Cmd + Shift + 5** (macOS built-in).
- [ ] Desktop pass, then mobile pass (~390px width).
- [ ] Total under 2:00 (target ~90s).
