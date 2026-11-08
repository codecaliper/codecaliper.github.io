# codecaliper.uk

CodeCaliper homepage, built with [Astro](https://astro.build) and deployed to
GitHub Pages on every push to `main`.

```bash
npm install
npm run dev
```

Edit links in `src/data/links.ts`.

Brand assets (logo, icons, social images, fonts) live in [`brand/`](brand/).

Renovate checks dependencies on the first day of each month. To run it manually,
dispatch the `Renovate` workflow in GitHub Actions. It requires the
`HOMELAB_RENOVATE` Actions secret in this repository.
