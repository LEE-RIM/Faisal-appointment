# Faisal Appointment

A responsive static meeting-request website. It uses plain HTML, CSS, and JavaScript; no build step or package installation is required.

## Run locally

From this folder, run:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000` in a browser.

## Publish with GitHub Pages

1. Create a GitHub repository and add these project files at the repository root.
2. Push the default branch as `main`.
3. In the repository, open **Settings → Pages** and set the source to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy-pages.yml` deploys the site after each push to `main`. The published URL appears in the workflow run and Pages settings.

The site uses relative links, so it works from a GitHub Pages project URL as well as from the domain root.

## Important limitations

This is a front-end demo, not a live booking service. Appointment requests are stored only in the visitor's browser; they are not delivered to Faisal, shared across devices, or sent by email. The owner access code is included in client-side JavaScript and is visible to visitors, so it is not secure authentication. Do not use this demo to collect real customer information until it has a server-side database, notification delivery, and secure owner authentication.

The page loads its fonts and hero image from Google Fonts and Unsplash, so those assets require an internet connection.
