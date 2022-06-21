#!/bin/bash
cd $(dirname $0)/../packages/rss2toot
npx ts-node src/main.ts
