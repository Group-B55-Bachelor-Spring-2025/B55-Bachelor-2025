# Smart Klimakontrollsystem

## Overview
The Smart Klimakontrollsystem is a NestJS application designed to manage climate control systems efficiently. It utilizes PostgreSQL with TimescaleDB for data storage and Redis with BullMQ for managing background jobs and queues.


## Prerequisites
Node.js (v20.0.0 or higher)
Docker and Docker Compose
npm (latest version)

## Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/smart-klimakontrollsystem.git
cd smart-klimakontrollsystem

# Install dependencies
npm install
```

## Database Setup
`docker-compose up -d`

## Environment Configuration
```bash
# Copy the example .env file
cp .env.example .env
```

## Database Migration
Run database migrations to set up the schema:

```bash
# Create a new migration
npm run migration:create --name=MigrationName

# Generate a migration from entity changes
npm run migration:generate

# Run pending migrations
npm run migration:run

# Revert the last applied migration
npm run migration:revert
```

## Running the Application

`npm run start:dev`

## Testing
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```