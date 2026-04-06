# Stage 1: Build Phase
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .

# Pass build args if needed (e.g., VITE_API_URL)
RUN npm run build

# Stage 2: Serve Phase
FROM nginx:stable-alpine

# Copy built assets to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
