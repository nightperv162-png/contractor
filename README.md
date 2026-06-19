# Dragon Contractor

Dragon Contractor is a single-file HTML5 Canvas game prototype about drawing dragon contracts, preparing a loadout, and dueling with invoked contract powers.

The deployable game entrypoint is `index.html` at the repository root. There is no build step and no generated build output to deploy.

## Run Locally

Open `index.html` directly in a browser.

For a local static server, run this from the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Deploy With GitHub Pages

This project includes `.github/workflows/pages.yml`, which deploys the repository root on pushes to `main` or when manually run from GitHub Actions.

In GitHub:

1. Go to the repository settings.
2. Open **Pages**.
3. Set the source to **GitHub Actions**.
4. Push to `main`, or run the **Deploy GitHub Pages** workflow manually.

Because `index.html` is at the repository root, deploy the repository root. Do not deploy a build folder.

## Live Demo

Live demo URL: `https://<your-github-username>.github.io/<your-repository-name>/`