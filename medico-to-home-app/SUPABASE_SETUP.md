# Supabase Setup Guide

Follow these steps once. It takes about 15 minutes. You do not need to create any tables, because the project's migrations will do that.

Supabase changes its dashboard from time to time, so a button or label may look slightly different from this guide.

---

## Step 1: Create your account

1. Go to [supabase.com](https://supabase.com) and click **Start your project**.
2. Sign up. Using your GitHub account is the easiest option.

## Step 2: Create an organization

1. When asked, create an organization.
2. **Name:** `Medico To Home`
3. **Plan:** Free

## Step 3: Create the project

1. Click **New project**.
2. Fill in these fields:

| Field | Value |
|---|---|
| Project name | `medico-to-home` |
| Database password | Click **Generate a password**, then save it in a password manager |
| Region | **South Asia (Mumbai)** |

3. If you see security options, keep the **Data API** on. If you see an option for **automatic RLS**, turn it on.
4. Click **Create new project** and wait a few minutes until it finishes.

> **The region cannot be changed later** without moving the project, so check that it says Mumbai before you click create.

## Step 4: Set up login

Patients and professionals sign in with **Google** or with a **6-digit code sent by email** (the same email also has a magic link). There are no passwords for them. Admin staff sign in with email + password and then a **2-step code** from an authenticator app.

**Email code**

1. In the left menu, open **Authentication** → **Sign In / Providers** → **Email**. Check it is **enabled** and click **Save**.
2. Open **Authentication** → **Emails** → **Magic Link** template. Replace the body with this, so the email carries the code as well as the link:

   ```html
   <h2>Your Medico To Home sign-in code</h2>
   <p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
   <p>Or <a href="{{ .ConfirmationURL }}">tap here to sign in</a>. The code expires in 1 hour.</p>
   ```

3. Do the same for the **Confirm signup** template (a brand-new account receives that one).
4. Open **Authentication** → **URL Configuration**. Set **Site URL** to `http://localhost:3000` now (your real domain later) and add `http://localhost:3000/**` to **Redirect URLs**.
5. **Sending email:** Supabase's built-in sender allows only a few emails per hour and is for testing. Before real users, open **Authentication** → **Emails** → **SMTP Settings** and connect a provider such as Resend, Postmark or Amazon SES.

**Google**

1. In Google Cloud Console create an **OAuth client ID** (type: Web application). Add `https://<your-project>.supabase.co/auth/v1/callback` as an authorised redirect URI.
2. In Supabase open **Sign In / Providers** → **Google**, paste the client ID and secret, enable it and save. Until then the app tells users to use email instead.

**2-step code for admin staff**

Authenticator-app (TOTP) 2-step is on by default in Supabase. Check **Authentication** → **Multi-Factor** shows **TOTP** enabled. Staff set it up themselves by scanning a QR code on their first admin sign-in.

Leave **Phone** turned off.

## Step 5: Find your keys

Open **Settings → API Keys**. If you see no keys starting with `sb_`, click the button to create them.

You need these items:

| Item | Where to find it | Looks like | Secret? |
|---|---|---|---|
| Project URL | **Connect** button at the top of the dashboard | `https://abcd1234.supabase.co` | No |
| Publishable key | Settings → API Keys | `sb_publishable_...` | No |
| Secret key | Settings → API Keys | `sb_secret_...` | **Yes** |
| Database connection string | **Connect** button → **Session pooler** | `postgresql://postgres.abcd1234:[YOUR-PASSWORD]@...` | **Yes** |

In the connection string, replace `[YOUR-PASSWORD]` with the password from Step 3.

Use the **publishable** and **secret** keys. The older `anon` and `service_role` keys are being retired.

## Step 6: Save the keys safely

1. In the `medico-to-home-app` folder, create a new file named `.env.local`.
2. Paste this in and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DATABASE_URL=
```

3. Save the file.

The repository is set to ignore this file, so it will not be pushed to GitHub.

**Never paste the secret key or database password into chat, GitHub, WhatsApp or email.** The secret key can read and change all your data. If one leaks, delete it in Settings → API Keys and create a new one.

## Step 7: Tell me it is done

Send one message: **"Supabase done"**. Do not paste the keys, because I can read them from `.env.local`.

---

## Checklist

- [ ] Project created in **South Asia (Mumbai)**
- [ ] Database password saved
- [ ] Email login enabled
- [ ] **Confirm email** turned off
- [ ] Phone login left off
- [ ] `.env.local` created with all 4 values

## Good to know

- **Free plan pause:** free projects can pause after about a week without activity. If that happens, open the dashboard and click **Restore**. No data is lost.
- **Backups:** move to a paid plan with backups before storing any real patient data.
- **Forgot password:** patients and professionals have no password, so there is nothing to reset. A staff member who forgets theirs gets a new one-time password from a super admin under **Staff & roles** (invite them again with the same email).

---

## Turn on Google login

The app already has the **Continue with Google** button. Until these steps are done, it shows "Google sign-in is not set up yet".

### Part A: Google Cloud (about 10 minutes)

1. Open https://console.cloud.google.com and create a project named `Medico To Home`.
2. Go to **APIs & Services → OAuth consent screen**.
   - User type: **External**.
   - App name: `Medico To Home`, support email: your email.
   - Save. You do not need to add scopes.
3. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Medico To Home web`.
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `https://kwxkkhoctazwdekpbked.supabase.co/auth/v1/callback`
4. Click **Create**, then copy the **Client ID** and **Client secret**.

### Part B: Supabase (about 2 minutes)

1. Open your project → **Authentication → Sign In / Providers → Google**.
2. Turn it **on**, paste the **Client ID** and **Client secret**, and click **Save**.
3. Open **Authentication → URL Configuration**.
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** add `http://localhost:3000/**`
   - Click **Save**.

**Keep the Client secret out of chat, GitHub and email.** It only goes into the Supabase form.

When the site goes live, add the real domain in both places: Google's **Authorized JavaScript origins**, and Supabase's **Site URL** and **Redirect URLs**.

While the Google consent screen is in **Testing** mode, only the test users you add there can sign in. Click **Publish app** before real users try it.
