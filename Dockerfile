# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /seclob-service
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine
WORKDIR /seclob-service

COPY --from=builder /seclob-service/package.json ./
COPY --from=builder /seclob-service/node_modules ./node_modules
COPY --from=builder /seclob-service/.next ./.next
COPY --from=builder /seclob-service/public ./public
# .ts ഫയലുകൾ ഉൾപ്പെടെ എല്ലാ കോൺഫിഗറേഷൻ ഫയലുകളും കോപ്പി ചെയ്യാൻ:
COPY --from=builder /seclob-service/next.config.* ./
COPY --from=builder /seclob-service/tsconfig.json ./ 

EXPOSE 10003
CMD ["node", "--max-old-space-size=300", "node_modules/.bin/next", "start", "-p", "10003"]
