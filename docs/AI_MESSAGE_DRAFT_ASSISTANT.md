# AI Message Draft Assistant

The AI Assistant page includes a drafts-only message workflow for enquiry replies, fee notifications, and birthday wishes.

## Safety model

- It only creates editable text. It does not send messages, open a messaging channel, create follow-ups, or update enquiries, students, fee dues, or payments.
- The browser sends only the selected record ID, draft type, tone, and optional guidance.
- The `message-draft` Edge Function requires a current active staff account, re-checks the selected record, and sends only the minimum draft-specific fields to the AI provider.
- The function never sends phone numbers, email addresses, addresses, medical notes, payment methods, or other unrelated student data to the provider.

## Configure and deploy

The repository already uses Supabase Edge Functions for server-only secrets. Configure the provider key in Supabase; do not add it to a `NEXT_PUBLIC_*` variable or commit it to the repository.

```bash
supabase secrets set OPENAI_API_KEY=your-key
supabase functions deploy message-draft
```

`OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`.

```bash
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
```

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions. The function verifies the caller's Supabase session and active staff profile before using those server-side credentials to load a minimal record context.

If `OPENAI_API_KEY` is absent, the page remains usable for selecting a draft type and record but displays a configuration requirement and does not fabricate a draft.
