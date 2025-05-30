# Smart Klimakontrollsystem

## Overview

The Smart Climate Control System is a solution designed to optimize heating and cooling systems based on electricity prices. The system helps property managers and individual users reduce energy costs while maintaining comfort levels by automatically controlling climate systems during high electricity price periods.

## Key Features

- **Price-based Optimization**: Adjust climate control based on real-time electricity prices
- **Device Group Management**: Organize and control multiple climate devices as groups
- **Location-aware Settings**: Configure settings based on geographical regions
- **Smart Control Settings**: Define energy saving strategies and temperature offsets
- **User Authentication**: Secure access control with role-based permissions

## Architecture

The system is built using NestJS framework with a modular architecture that separates concerns into distinct domains:
- Device Management
- Price Collection and Analysis
- Smart Control Logic
- User Management
- Location Management


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
