# Little Roses Academy Specification (SPEC.md)

PROJECT: Little Roses Academy, Nakuru, Kenya. Primary school app (Kenyan CBC). Grades 1-6, one class per grade, no streams. Lower Primary = Gr 1-3, Upper = Gr 4-6. Three terms (Terms 1-2 cover the syllabus, Term 3 is revision).

=== GLOBAL RULES ===
1. LOGO: use the attached logo image exactly as it is on every screen. Never redraw, recolour, regenerate, or add rings. One shared Logo component. Tagline everywhere: "LEARN TODAY BUILD TOMORROW". No other taglines.
2. OPENING FLOW: Splash 1 (school photo background with a light navy tint, logo fades in, about 2.5s) -> Splash 2 (navy, logo, tagline, 0-100% bar) -> portal selection with four cards: School Administration, Staff & Teachers, Parents & Guardians, Learners.
3. Phone-first Android, installable (PWA), works offline. Only things sent between portals need internet and wait in a queue: assignments, CATs, notices, messages, marks. The status pill "Saved to Phone 💾" / "Synced with School ☁️" must reflect the real connection and real pending items, never a toggle button.
4. Real data only: no sample names, counts, dates or passwords. The calendar, term and week always follow the real device date. Admin sets term dates.
5. COLOURS: each class, subject and teacher has its own colour. Green, blue, yellow and red are reserved for EE/ME/AE/BE badges only. Bright and friendly, with emojis for parents and learners. Every tab is a full screen. Clean and uncluttered; secondary tools go in menus or drawers.
6. Nothing reaches learners or parents until the teacher approves it. A teacher's marks are never overwritten by sync.
7. Use school words only (Timetable, Scheme of Work, Lesson Plan, Record of Work, Pupils). Never show "AI", "algorithm" or database terms.
8. SECURITY: passwords and PINs are stored hashed, never displayed, and no default passwords are printed anywhere. Admin can only reset (new password shown once). Login: staff and parents by phone number + password; learners by UPI + PIN; admin by admin code. PIN at least 4 digits, parent password at least 6 characters. Phone numbers accept 07.., 01.., +254.. and spaces.
9. CODE: small files, one per screen or feature, never giant files. ALL data goes through ONE data-layer file so a cloud database can be added later. Do not use any paid API.

=== SUBJECTS ===
Lower (Gr 1-3): Mathematical Activities, English Language Activities, Shughuli za Kiswahili, Environmental Activities, CRE, Creative Activities. NO Social Studies.
Upper (Gr 4-6): Mathematics, English, Kiswahili, Science & Technology, Agriculture & Nutrition, Social Studies, CRE, Creative Arts & Sports.
Strands and sub-strands are editable lists (admin or teacher can add and edit). Do not invent curriculum content.

=== MARKING ===
Per strand: any number of CATs (each with its own total) scaled to 60%; assignments scaled to 40%; strand total 100%.
CAT part = (sum of CAT marks obtained / sum of CAT marks possible) x 60. Assignment part is the same x 40.
Bands: EE 80-100, ME 60-79, AE 40-59, BE 0-39. Never use "30 marks".

=== ADMIN PORTAL (School Office) - controls everything ===
Tabs: Home, Teachers, Pupils, Families, Timetable & Calendar, Promotion.
- Home: real counts (teachers, pupils, families, classes), term week and teaching days left (Mon-Fri), activity-pause banner, quick buttons (Admit Pupil, Add Staff, Publish Announcement).
- Teachers: add or edit (name, phone, photo, subjects per grade, class teacher), reset password, teaching audit (lessons marked taught, assignments approved, marks entered). Open any teacher's Resources and add a document to that specific teacher (shown under "From Administration", readable in the app, not only PDF). Some staff are dual-role (teacher + admin): one-tap switch without logging out. If a teacher's phone matches a parent's phone, link them so they can switch to Parent view.
- Pupils: filter by grade. Single admission (name, gender, grade, auto UPI LRA-<year>-XXXX, parent name and phone; if the parent phone already exists, link as siblings). Bulk admission by pasted list or CSV with a preview and error rows. Printable credential sheet (pupil PIN, parent password). Edit anytime without losing history. Shared parent phone triggers a sibling question for admin to confirm.
- Families: grouped by parent phone, children listed, reset parent password, send notices to all parents or one grade.
- Timetable & Calendar: master timetable per class (Mon-Fri, periods and breaks; period times set by admin, never hard-coded). Warn when a teacher is booked in two classes at the same time. Real term calendar. "School activity pause" for chosen dates: freezes lessons and homework expectations, nothing shows as missed.
- Promotion: at the end of Term 3, move each grade up; mark individuals Retained or Transferred with a reason; Grade 6 goes to Alumni Archive; nothing is ever deleted.
- Backup and restore of all data.

=== TEACHERS PORTAL ===
Header: logo, name, photo, sync pill, term and week. Bottom tabs: Timetable (Today), My Classes, Resources, Assessments, Messages.
- Timetable: the teacher's own week with real dates. Each lesson card shows time, grade, subject, topic, status (Upcoming / Taught / Pending). Tap to open that lesson: its lesson plan, class notes and assignment (empty until the teacher adds them). Buttons: Mark as Taught / Not Taught (with a reason).
- Reflection after every lesson: learners understood / partly / did not understand, plus a note. This is also the Reflection section at the end of the lesson plan.
- Daily assignments: every weekday a Maths assignment on what was taught that day, plus that day's second subject (e.g. Mon English, Tue Kiswahili). The app drafts it from the lesson's class notes or question bank; the teacher edits and APPROVES; only then does it go to learners and parents.
- Small alert bell: unmarked lessons, no Maths assignment by 1pm, CATs without scores after 5 days.
- My Classes: class roll for the teacher's grades; tap to mark Present, Absent or Late; learner cards (photo, name, UPI, current band, call or WhatsApp the parent); private notes visible only to that teacher and admin.
- Messages: parent chats with delivery ticks, read-only office broadcasts, class announcements to all parents of a grade.

=== RESOURCES (the teacher's own work; starts empty; private unless shared) ===
16 folders in workflow order: KNEC/CBE Curriculum Documents; Schemes of Work; Lesson Plans; Lesson Notes; Records of Work; CATs & Assessment Records; Rubrics/Assessment Books; Teaching & Learning Resources (Storybooks, Flashcards); Assignments; Revision Exams/Past Papers; Class Notes; Teacher-created Documents; Shared Staff Documents; Timetables (teacher's own + admin master per class); Class Lists/Learner Records; Teacher Reports.
Workflow: KNEC/CBE -> Scheme -> Lesson Plan -> Lesson Notes -> Class Notes -> Assignment/CAT -> Record of Work -> Reports. Each document links to the one before.
- Roles: Scheme + Lesson Plan guide what is taught that day. Lesson Notes = the whole book. Class Notes = only the part for that lesson or period.
- Made by the app (not uploaded): Records of Work, Timetables, Class Lists, CAT records, Reports. The others are the teacher's own.
- Actions on every document: upload, edit, save, duplicate, version history, share (private / staff room / a grade), download (Word or PDF), print. Word, Excel, text and typed-PDF uploads become readable, editable text inside the app.
- Smart filing (offline keyword rules; the teacher always confirms with one tap): on upload, read the text and suggest grade, subject, strand, term and folder. For uploaded exams: split into questions, match each to a strand by keywords (e.g. "fraction", "numerator", "1/2" -> Fractions) and offer to file under CATs, Assignments or Classwork. For Lesson Notes: find the section matching the lesson's sub-strand and offer it as Class Notes for the teacher to edit.
- Scheme of Work layout: Week, Lesson, Strand, Sub-strand, Specific Learning Outcomes, Learning Experiences, Key Inquiry Question(s), Learning Resources, Assessment, Reflection/Remarks. When every row of a strand is taught, stamp the scheme "Strand completed" with the date.
- Lesson Plan layout: header (school, subject, grade, date, time, roll), strand, sub-strand, outcomes, key inquiry question, core competencies, values, resources, organisation of learning, introduction, lesson development, conclusion, extension activity, Reflection (answered after the lesson). Stamp "Taught" with the date once the reflection is saved.
- Record of Work: filled automatically by Mark as Taught (date, period, strand, sub-strand, work covered, reflection). Shows Taught vs Remaining (scheme rows not yet taught) and % covered. Printable per term.
- Storybooks and Flashcards: only school-uploaded (nothing invented). Grade 1-3 storybooks need the teacher's "Approve & Publish" before learners see them. Reading questions are multiple choice, auto-marked, and feed the Reading/Kusoma marks.

=== ASSESSMENTS (teacher) ===
Choose grade, subject, term, strand. Add CATs (title, total, date) and assignments. Enter marks per learner (paper CATs typed in). Online A/B/C/D CATs: the teacher builds questions with an answer key, approves, sends; learners answer on their phone (works offline, sends when connected); auto-marked by the answer key. Show CAT part /60, assignment part /40, total /100 and an EE/ME/AE/BE badge with a remark. Save to phone first.
FOCUS ZONE RULE: a topic goes into a learner's My Focus Zone only when (a) the lesson reflection said "did not understand" AND (b) that learner's CATs in that strand are AE or BE. It carries the teacher's note and suggested practice, shows "Improving", and clears when the learner reaches ME or better. If only one condition is true, only the teacher sees a check note.

=== PARENTS PORTAL ===
Login by phone. One login for all linked children, with a sibling switcher (no re-login). A parent sees only their own children. Tabs: Today (attendance, timetable with "Taught in Class" ticks, homework due, latest reading result, contact teacher or office), Homework (Due Soon / Submitted & Marked / Past; approved assignments only), CBC Reports (Term 1/2/3; per strand CATs /60 + assignments /40 = /100 with badge; teacher remarks; PDF download with logo), Focus Zone, School Noticeboard (Academic Calendar, Fees & Welfare, School Event, Term Dates; pause banners). Fun touches: emojis, stars, "Reading Superstar". Everything downloaded reads offline.

=== LEARNERS PORTAL ===
Login by UPI + PIN. Bottom tabs: Today, Timetable, Homework, Storybook Zone, Me.
Today: the day's lessons (colour per subject), My Next Step, messages (no learner-to-learner chat). Timetable: week view, current period highlighted, Taught ticks, a kind message on activity days. Homework: To Do / Completed / Returned; online questions one at a time with an instant tick or cross when the teacher enabled it; paper work shows "Hand in at school". Learning Materials: teacher-shared, read-only, save for offline. Storybook Zone: stories and flashcards with questions. Me: progress by subject (badges), strengths, My Focus Zone, saved work, profile, sign out. Offline submissions show "Saved to Phone 💾" and send automatically later.

=== EXTRAS ===
Absent-today alert to parents; weekly "Star Learner" sticker; homework reminder before the due date; printable term report cards; backup file.
