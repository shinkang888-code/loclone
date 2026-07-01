FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npx playwright install chromium

ENV LOCLONE_ROOT=/tmp/loclone
ENV CLONE_WORKER_PORT=3100
ENV CLONE_WORKER_HOST=0.0.0.0
ENV WORKER_BROWSER_POOL=1
ENV WORKER_BROWSER_PER_JOB=1
ENV NODE_OPTIONS=--max-old-space-size=320

EXPOSE 3100

CMD ["npm", "start"]
