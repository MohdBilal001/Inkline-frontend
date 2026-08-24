# Inkline Contact Us → Gmail

The Contact Us form sends submissions through the Spring Boot backend to a Gmail inbox.

## 1. Gmail setup
Use a Gmail account with 2-Step Verification enabled and create a Google **App Password**.
Do not put your normal Gmail password in the project.

## 2. Backend environment variables (PowerShell)
Set these before starting Spring Boot:

```powershell
$env:MAIL_USERNAME="yourgmail@gmail.com"
$env:MAIL_PASSWORD="your-16-character-app-password"
$env:CONTACT_TO="yourgmail@gmail.com"
```

Then start the backend.

## 3. Start frontend

```powershell
npm install
npm run dev
```

The frontend posts to `/api/contact`, which Vite proxies to `http://localhost:8080`.
