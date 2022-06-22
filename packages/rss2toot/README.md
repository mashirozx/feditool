rss2toot
===

> **Warning**  
> Still under heavy development, some configuration may be changed in the future. Use it with your own risk.

### How to use

#### Docker Compose

- Docker version 20.10.16
- Docker Compose version v2.6.0

```bash
git clone https://github.com/mashirozx/feditool.git
cd feditool
mkdir configs
cp packages/rss2toot/config.sample.ini configs/rss2toot.ini
# Edit configuration with your favorite editor! 
vi configs/rss2toot.ini
docker compose build
docker compose up -d
```

#### Manual

Requirements:

- Nodejs 16+
- Redis 6+

> **Note**  
> Must use `pnpm`, while `yarn` and `npm` is not allowed.


```bash
git clone https://github.com/mashirozx/feditool.git
cd feditool
npm i -g pnpm
# Install in project root!
pnpm install
cp packages/rss2toot/config.sample.ini packages/rss2toot/config.ini
# Edit configuration with your favorite editor! 
vi packages/rss2toot/config.ini
sh scripts/start-rss2toot.sh
```

### TODO
- [x] Docker
- [ ] PM2
- [ ] GitHub Action support
- [ ] Vercel support
- [ ] More cache method
- [ ] Single job mode (trigger by system cronjob)
- [x] Weibo
- [ ] Bilibili
- [ ] Twitter
- [ ] Custom filter
