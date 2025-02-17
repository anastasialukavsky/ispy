FROM node:18-buster-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm install -g typescript

ENV NODE_OPTIONS="--max-old-space-size=768"

RUN npm run build

# ---- Nginx setup ----
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
