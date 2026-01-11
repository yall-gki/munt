# 1️⃣ Base image
FROM node:18-bullseye-slim

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package.json and lockfile & install deps
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# 4️⃣ Copy Prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

# 5️⃣ Copy the rest of the app
COPY . .

# 6️⃣ Set environment variables at build time (so build won't fail)
# They can be overridden at runtime via --env-file
ARG UPLOADTHING_SECRET=""
ARG UPLOADTHING_APP_ID=""
ARG REDIS_URL=""
ARG REDIS_SECRET=""
ARG GOOGLE_CLIENT_ID=""
ARG GOOGLE_CLIENT_SECRET=""
ARG DATABASE_URL=""
ARG DATABASE_shadow_URL=""
ARG CRON_SECRET=""
ARG NEXTAUTH_SECRET=""
ARG NEXTAUTH_URL=""

ENV UPLOADTHING_SECRET=${UPLOADTHING_SECRET}
ENV UPLOADTHING_APP_ID=${UPLOADTHING_APP_ID}
ENV REDIS_URL=${REDIS_URL}
ENV REDIS_SECRET=${REDIS_SECRET}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV DATABASE_URL=${DATABASE_URL}
ENV DATABASE_shadow_URL=${DATABASE_shadow_URL}
ENV CRON_SECRET=${CRON_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# 7️⃣ Build Next.js
RUN npm run build

# 8️⃣ Expose port
EXPOSE 3000

# 9️⃣ Start app
CMD ["npm", "run", "start"]
