# samsara-exporter

A scheduled Cloudflare Worker that pulls diagnostics for all vehicles, trailers, and equipment. Currently just logs the data but will eventually export to one or many destinations.

## Getting started

1. `cp .dev.vars.example .dev.vars`
1. [Get](https://developers.samsara.com/docs/authentication) and set your SAMSARA_API_KEY
1. Generate an API_KEY
1. `npm i`
1. `npm run dev`
1. Test by running: `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` or `curl -H "Authorization: Bearer {your API_KEY}" http://localhost:8787`
1. Set secrets using Wrangler
1. Deploy: `npm run deploy`
