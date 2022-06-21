rss2toot
===

> **Warning**  
> Still under heavy development, some configuration may be changed in the future. Use it with your own risk.

### Requirements:

- Nodejs 16+
- Redis 6+

### How to use

> **Note**  
> Must use `pnpm`. `yarn` and `npm` is not allowed.

```bash
git clone https://github.com/mashirozx/feditool.git
npm i -g pnpm
# install in project root!
pnpm install
cd packages/rss2toot
cp config.sample.ini config.ini
vi config.ini
npx ts-node src/main.ts
```

### TODO
- [ ] Docker
- [ ] PM2
- [ ] GitHub Action support
- [ ] Vercel support
- [ ] More cache method
- [ ] Single job mode (trigger by system cronjob)
- [x] Weibo
- [ ] Bilibili
- [ ] Twitter
- [ ] Custom filter
