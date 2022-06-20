rss2toot
===
### Requirements:

- Nodejs 16+
- Redis 6+

### How to use

```bash
npm i -g pnpm
pnpm install
cp config.sample.ini config.ini
vi config.ini
node -r ts-node/register packages/rss2toot/src/main.ts
```
