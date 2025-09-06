# For dev and prod stages
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

FROM base AS dev
# npm run dev -- --host --port 3000
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]
 
# Production Stage
FROM nginx:stable-alpine AS production
RUN npm run build
COPY /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]