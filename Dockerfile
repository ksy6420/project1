FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
EXPOSE 3000
CMD ["npm", "start"]
