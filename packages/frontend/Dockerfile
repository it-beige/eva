FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/frontend/package.json packages/frontend/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm --filter @eva/shared build
RUN pnpm --filter @eva/frontend build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
EXPOSE 80
