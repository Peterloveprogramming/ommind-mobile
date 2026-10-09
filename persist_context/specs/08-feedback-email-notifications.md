# Email Notifications For All Feedback Paths

## Goal

Every way a user can give feedback in the app should send an email to the
OmMind inbox, so nothing sits unseen in the database.

Today only **Contact us** sends an email. Ratings, chat problem reports, bug
reports and improvement suggestions are saved to the DB, but nobody is told.

This spec also fixes three problems found during the audit:

1. Contact us emails can't be replied to (no user email in the body, no
   `Reply-To`).
2. Bug reports and improvement suggestions are not emailed, and the screenshot
   only exists in S3.
3. Chat ratings and chat problem reports are not emailed.

**All changes are in the backend:** `/Users/zimingyan/PycharmProjects/lhamo`.
The mobile app needs no code changes (see "Mobile Impact").

## Confirmed Decisions

These were confirmed with the product owner before writing this spec. Do not
change them without asking.

| Decision | Choice |
|---|---|
| Which ratings email | **All** of them, high (4–5★) and low (1–3★) |
| Delivery | **One email per event**, sent immediately. No digest. |
| If the email fails | **Fail like Contact us does today.** The row is already saved. Return `statusCode: 500`, a `"... created but email notification failed"` message and the saved row in `data`. |
| Duplicate-on-retry risk | **Accepted.** If the email fails, the user sees an error and may retry, which saves a second row. Document it, don't fix it. |
| Bug/suggestion screenshot | **Attach** the compressed JPEG to the email |
| Chat context in email | **The rated/reported AI reply and the user's question before it**, each cut to 1000 characters, plus `message_id` / `session_id` |
| Recipient | `ommind.contact@gmail.com`, i.e. `SMTP_USERNAME` (same as today). No new env var. |
| Reply-To | The user's account email, on **all 5** emails |

## The 5 Paths

| # | User action (mobile) | Mobile code | Backend route | Backend handler |
|---|---|---|---|---|
| 1 | Chat: 4–5★ tap (sent straight away, no details) | `comp/chat/Ai.tsx` → `app/chat/new_index.tsx` `handlePositiveRatingSelect` | `add_message_rating` | `controllers/api/message_rating.py` `add_message_rating` |
| 2 | Chat: 1–3★ opens `FeedBackModal` (detail stars, issue chips, comment) | `comp/chat/FeedBackModal.tsx` → `app/chat/new_index.tsx` `handleFeedbackSubmit` | `add_message_rating` | same as #1 |
| 3 | Chat: report icon opens `ReportProblem` | `comp/chat/ReportProblem.tsx` | `add_message_report` | `controllers/api/message_reports.py` `add_message_report` |
| 4 | Profile: Report a bug / Suggest an improvement | `app/(tabs)/profile.tsx` `handleSubmitFeedbackPress` | `submit_feedback` | `controllers/api/feedback.py` `submit_feedback` |
| 5 | Profile: Contact us | `app/(tabs)/profile.tsx` `handleSubmitContactPress` | `notify_customer_feedback` | `controllers/api/feedback.py` `notify_customer_feedback` |

The low/high split is 1–3 = low, 4–5 = high. This matches the app
(`Ai.tsx` opens the detail modal when `rating <= 3`).

## Backend Files

All paths are under `/Users/zimingyan/PycharmProjects/lhamo`.

Create:

- `services/feedback_notifications.py` holds the shared email sender and the
  builders for each email type
- `services/test_feedback_notifications.py`
- `controllers/api/test_message_rating.py`
- `controllers/api/test_message_reports.py`

Update:

- `controllers/api/feedback.py`
  - remove `_send_customer_feedback_email` / `_get_customer_feedback_email_config`
    (they move to the new service)
  - `submit_feedback`: send an email
  - `notify_customer_feedback`: add Reply-To and the user's email
- `controllers/api/message_rating.py`: send an email after the insert
- `controllers/api/message_reports.py`: send an email after the insert
- `controllers/database/chat_messages.py`: add a helper that loads the AI
  message and the user's question before it
- `controllers/api/test_feedback.py`: update mocks and add new cases
- `controllers/database/test_chat_messages.py`: test the new helper

Do not change:

- `routes/*.py`. Route names, `requires_auth` and payloads stay the same.
- DB schema and migrations. No new tables or columns.
- `config/config.py`. It already has `smtp_host`, `smtp_port`,
  `smtp_username` and `smtp_password`.

## 1. Shared Email Service

`services/feedback_notifications.py`

Move the SMTP logic out of `controllers/api/feedback.py` and generalise it:

```python
def send_feedback_notification(
    subject: str,
    body: str,
    reply_to: Optional[str] = None,
    attachments: Optional[list[tuple[str, bytes, str]]] = None,  # (filename, bytes, mime)
) -> None:
    ...
```

Behaviour:

- Config comes from `get_settings()`. `from` and `to` are both
  `settings.smtp_username`, the same as today.
- If any SMTP value is empty, raise `ValueError("Missing feedback email config: ...")`.
  This is the current behaviour.
- Set `Reply-To` only when `reply_to` is a non-empty string.
- Add each attachment with `EmailMessage.add_attachment(data, maintype, subtype, filename=...)`.
- Use `smtplib.SMTP(host, int(port), timeout=15)`, then `starttls()`,
  `login()` and `send_message()`. The timeout is new. It stops a hung SMTP
  server from holding the Lambda.
- Exceptions are raised to the caller. Each handler turns them into the 500
  response.

Add a small helper to cut long text:

```python
MAX_CONTEXT_CHARS = 1000

def truncate(text: Optional[str], limit: int = MAX_CONTEXT_CHARS) -> str:
    if not text:
        return "(not available)"
    return text if len(text) <= limit else text[:limit] + "… [truncated]"
```

Add a helper that formats the user line, used in every email:

```python
def format_user_line(user: Optional[User], user_id) -> str:
    # "Jane Doe <jane@example.com> (user id 2)"
    # or "Unknown user (user id 2)" when the user lookup returns None
```

Add one `build_*` function per email type (sections 3–6). Each returns
`(subject, body)`, so the handlers stay short and the builders can be
unit-tested.

Use plain text emails, like today. No HTML.

## 2. Load Chat Context

`controllers/database/chat_messages.py`

Add `get_message_with_preceding_question(user_id, message_id)`. It returns
`None` if no message is found, otherwise:

```python
{
    "message_id": int,
    "session_id": str,
    "workflow_executed": Optional[str],
    "ai_content": str,              # content of the rated/reported message
    "question_content": Optional[str],  # latest human message in the same
                                        # session at or before it
}
```

Suggested query:

```sql
SELECT
    m.id,
    m.session_id,
    m.workflow_executed,
    m.content,
    (
        SELECT h.content
        FROM chat_messages h
        WHERE h.session_id = m.session_id
          AND h.user_id = m.user_id
          AND h.role = 'human'
          AND h.deleted_at IS NULL
          AND h.created_at <= m.created_at
        ORDER BY h.created_at DESC
        LIMIT 1
    ) AS question_content
FROM chat_messages m
WHERE m.id = %s AND m.user_id = %s
LIMIT 1;
```

Use the human `content`, which is what the user typed, not `enriched_content`.

Loading context is **best-effort**. If the lookup raises or returns `None`,
log it and still send the email, with `(not available)` in the context
sections. Only an SMTP or config failure should fail the request.

## 3. Ratings (paths #1 and #2): `add_message_rating`

`controllers/api/message_rating.py`

Steps after `add_message_rating_query` succeeds:

1. `user = get_user_by_id(user_id)`. If this fails, log it and use
   `user = None`.
2. Load context with `get_message_with_preceding_question(user_id, message_id)`
   (best-effort).
3. Build the email from the **request values** (`rating`, `helpfulness`,
   `accuracy`, `clarity`, `tone`, `issues`, `other_details`). Don't use the
   DB row: `rating` lives on `chat_messages`, not `message_rating`.
4. `send_feedback_notification(subject, body, reply_to=user.email if user else None)`.
5. If sending fails, return:

```python
{
    "statusCode": 500,
    "response": "message rating created but email notification failed",
    "data": inserted_rating,
}
```

6. On success, return `201` with `"response": "message rating created and notification sent"`.

Validation and the existing error responses (400 missing fields, 404 message
not found, 500 query errors) stay exactly as they are. Don't send an email when
the insert fails.

Subject:

- Low: `[OmMind] Low rating: 2/5`
- High: `[OmMind] High rating: 5/5`

Body:

```text
Chat rating: 2/5 (low)

User: Jane Doe <jane@example.com> (user id 2)
Submitted: 2026-10-09T12:34:56Z (UTC)
Session ID: abc-123
Message ID: 456
Workflow: q_and_a

Detailed ratings:
  Helpfulness: 3/5
  Accuracy: 2/5
  Clarity: 3/5
  Tone: 4/5

Issues: not_relevant, incorrect_info
Comment: The steps were too abstract for a beginner.

--- User's question ---
<question_content, truncated to 1000 chars>

--- AI reply that was rated ---
<ai_content, truncated to 1000 chars>
```

Formatting rules:

- If all four detail ratings are `None` (always true for 4–5★ taps), print
  `Detailed ratings: not provided` instead of the four lines.
- `issues` arrives as a list with one comma-joined string, e.g.
  `["not_relevant,incorrect_info"]`. Flatten the list, split on commas, trim,
  drop empties, then join with `", "`. Print `none` when nothing is left.
- Print `Comment: none` when `other_details` is empty.
- Print `Workflow: unknown` when context is unavailable or
  `workflow_executed` is null.

## 4. Chat Problem Report (path #3): `add_message_report`

`controllers/api/message_reports.py`

Same steps as section 3, after `add_message_report_query` succeeds.

- Subject: `[OmMind] Chat problem report`
- Failure response: `500`, `"message report created but email notification failed"`, `data: inserted_report`
- Success response: `201`, `"message report created and notification sent"`

Body:

```text
Chat problem report

User: ...
Submitted: ...
Session ID: ...      (from context; the report request has no session_id)
Message ID: 456
Workflow: ...

Issues: audio_not_playing, slow_response
Details: <other_details or "none">

--- User's question ---
...

--- AI reply that was reported ---
...
```

`issues` uses the same flattening rule as in section 3.

## 5. Bug Report / Improvement (path #4): `submit_feedback`

`controllers/api/feedback.py`

The handler already has the compressed JPEG bytes (`compressed_bytes`) before
uploading to S3. Keep a reference to them so they can be attached.

Steps after `create_feedback` succeeds:

1. `user = get_user_by_id(user_id)` (log on failure and use `None`).
2. Build the email.
3. If an image was uploaded, attach `compressed_bytes` as
   `feedback-{type}-{feedback.id}.jpg`, `image/jpeg`.
4. Send. On failure, return `500`,
   `"feedback created but email notification failed"`, `data: feedback.to_dict()`.
5. On success, return `201`, `"feedback created and notification sent"`.

Subjects:

- `type == "bug"`: `[OmMind] Bug report`
- `type == "improvement"`: `[OmMind] Improvement suggestion`
- `type == "general"`: `[OmMind] General feedback` (the mobile app doesn't
  send this, but the backend allows it)

Body:

```text
Bug report

User: ...
Submitted: ...
Feedback ID: 31

Description:
<description>

Screenshot: attached (S3 key: feedback/bug/2_1760000000.jpg)
```

When there's no image: `Screenshot: none`.

## 6. Contact Us (path #5): `notify_customer_feedback` (fix #1)

`controllers/api/feedback.py`

Keep the current flow (look up the user, return 404 if missing, save, email,
and the current 500 on email failure). Only change the email:

- Switch to `send_feedback_notification`.
- Set `reply_to=user.email`, so pressing Reply in Gmail answers the user.
- Subject: `[OmMind] Contact us`. **This replaces `Customer Feedback`.**
  Update any Gmail filter that matches the old subject.
- Body:

```text
Contact us message

User: Jane Doe <jane@example.com> (user id 2)
Submitted: ...
Feedback ID: 11

Message:
<message>
```

The mobile app already puts the optional subject at the top of `message` as
`Subject: ...`. Leave that as it is.

The response strings stay the same:

- `"feedback created and notification sent"`
- `"feedback created but email notification failed"`

## Mobile Impact

The mobile app needs no code changes. Request payloads and success
status codes (`201`) don't change, and `checkIfLambdaResultIsSuccess`
(`utils/helper.ts`) already treats 500 as a failure.

Expected app behaviour when the email fails (accepted trade-off):

- Chat ratings: `useMessageRating` shows a toast with
  `"message rating created but email notification failed"`. The thank-you card
  doesn't appear and the stars stay tappable. Tapping again saves another
  `message_rating` row and overwrites `chat_messages.rating`.
- Chat report: `useMessageReport` shows a toast and the modal stays open.
  Submitting again saves another `message_reports` row.
- Bug/suggestion and Contact us: the form shows the error text and submitting
  again saves another `feedback` row. Contact us already behaves this way.

Latency: each of these requests now waits for Gmail SMTP, which usually takes
1–3 s and has a 15 s timeout. The existing loading states already cover this.

## Tests (backend)

Run from `/Users/zimingyan/PycharmProjects/lhamo`:

```sh
pytest controllers/api/test_feedback.py controllers/api/test_message_rating.py \
       controllers/api/test_message_reports.py services/test_feedback_notifications.py \
       controllers/database/test_chat_messages.py
```

Mock `send_feedback_notification` in the handler tests. Never send a real email
in tests.

`services/test_feedback_notifications.py`:

- missing SMTP config raises `ValueError`
- `Reply-To` is set when `reply_to` is given and missing when it isn't
- an attachment is added with the right filename and MIME type (mock `smtplib.SMTP`)
- `SMTP` is created with `timeout=15`
- `truncate` cuts at 1000 characters and returns `(not available)` for empty input
- the rating builder gives `Low rating` for 1–3 and `High rating` for 4–5, and
  `Detailed ratings: not provided` when all four details are `None`
- issues flattening: `["not_relevant,incorrect_info"]` becomes
  `not_relevant, incorrect_info`, and `None` / `[]` / `[""]` become `none`

`controllers/api/test_message_rating.py`:

- a high rating with no details sends one email with the high-rating subject and returns 201
- a low rating with details puts every detail, the issues and the comment in the body
- if the email fails, the response is 500 with the saved rating in `data`
- if context lookup fails, the email still sends with `(not available)` and returns 201
- if the user lookup returns `None`, the email sends with no `reply_to`
- a failed insert (404 / 500) sends no email

`controllers/api/test_message_reports.py`: the same cases where they apply.

`controllers/api/test_feedback.py`:

- update the existing `notify_customer_feedback` tests to patch
  `controllers.api.feedback.send_feedback_notification` and assert
  `reply_to="jane@example.com"`
- `submit_feedback` without an image sends an email with no attachments
- `submit_feedback` with an image attaches `feedback-bug-<id>.jpg`
- if the `submit_feedback` email fails, the response is 500 with the saved feedback

`controllers/database/test_chat_messages.py`:
`get_message_with_preceding_question` returns the AI content and the latest
human message before it, and `None` for an unknown id.

## Acceptance Criteria

- All 5 paths send exactly one email per submission to `ommind.contact@gmail.com`.
- Every email has the user's name, email and user id, and its `Reply-To` is the
  user's email when one exists.
- 4–5★ taps with no details send a `High rating` email.
- 1–3★ submissions from `FeedBackModal` send a `Low rating` email with the
  detail ratings, issues and comment.
- Chat rating and report emails include the user's question and the AI reply
  (up to 1000 characters each), plus the session id and message id.
- A bug report or suggestion with a screenshot arrives with the JPEG attached.
- Replying to any of these emails in Gmail goes to the user.
- If the email fails, each path returns 500 with the saved row in `data`. The
  row is not deleted.
- Routes, request payloads, success status codes and the DB schema don't change.
- The mobile app has no code changes.

## Manual Verification

Do these against **prod or staging**, not just local. The deployed
Lambda/container must have `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME` and
`SMTP_PASSWORD` set. No deploy config in the repo mentions them, so check
them in the deploy environment.

1. Chat: tap 5★ on an AI reply. A `High rating: 5/5` email arrives with the
   question and reply.
2. Chat: tap 2★, fill in the modal and submit. A `Low rating: 2/5` email arrives
   with the details.
3. Chat: report icon, pick issues and submit. A `Chat problem report` email arrives.
4. Profile: Report a bug with a screenshot. A `Bug report` email arrives with
   the JPEG attached.
5. Profile: Suggest an improvement without an image. An `Improvement suggestion`
   email arrives with `Screenshot: none`.
6. Profile: Contact us. A `Contact us` email arrives, and pressing Reply
   addresses the user.
7. Break `SMTP_PASSWORD` in a non-prod env and repeat step 1. The app shows
   the error toast and the `message_rating` row still exists.

## Out Of Scope

- Duplicate rows on retry after an email failure (accepted, see Confirmed Decisions).
- Digest or batched emails.
- Async or queued sending (e.g. SQS). Emails are sent inline.
- Sending the Contact us subject as its own API field.
- `add_message_report` doesn't check that `message_id` belongs to the user.
  This is existing behaviour; the context lookup filters by `user_id`, so the
  email would show `(not available)` in that case.
- The tracked `/Users/zimingyan/PycharmProjects/lhamo/.env.example` has a
  non-placeholder-looking `SMTP_PASSWORD`. Check and revoke it separately.
  Don't handle that as part of this work.
