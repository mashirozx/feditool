#!/bin/bash
cd $(dirname $0)/../packages/rss2toot
npx esno src/main.ts
