# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /seclob-service

# പാക്കേജ് ഫയലുകൾ കോപ്പി ചെയ്യുന്നു
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine
WORKDIR /seclob-service

# ബിൽഡ് സ്റ്റേജിൽ നിന്ന് അത്യാവശ്യ ഫയലുകൾ മാത്രം കോപ്പി ചെയ്യുന്നു
COPY --from=builder /seclob-service/next.config.js ./
COPY --from=builder /seclob-service/public ./public
COPY --from=builder /seclob-service/.next ./.next
COPY --from=builder /seclob-service/node_modules ./node_modules
COPY --from=builder /seclob-service/package.json ./package.json

# ആപ്പ് റൺ ചെയ്യേണ്ട പോർട്ട്
EXPOSE 10003

# മെമ്മറി ലിമിറ്റ് 300MB ആയി സെറ്റ് ചെയ്യുന്നു
CMD ["node", "--max-old-space-size=300", "node_modules/.bin/next", "start", "-p", "10003"]
