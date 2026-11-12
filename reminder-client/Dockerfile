# Stage 1: Build the static assets
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Set the backend URL for production Vite build
ARG VITE_API_BASE_URL=http://localhost:5154/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve with lightweight NGINX
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration to support client-side routing (React Router)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]