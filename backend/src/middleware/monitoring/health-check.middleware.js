/**
 * Health Check Middleware
 * Provides health check endpoints and monitoring
 */

import mongoose from 'mongoose';
import { isMongoConnected } from '../database/index.js';

/**
 * Health check endpoint handler
 */
export const healthCheck = async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: isMongoConnected() ? 'connected' : 'disconnected',
        type: 'MongoDB',
      },
      api: {
        status: 'operational',
      },
    },
  };
  
  // Determine overall status
  const allHealthy = health.services.database.status === 'connected';
  health.status = allHealthy ? 'healthy' : 'degraded';
  
  const statusCode = allHealthy ? 200 : 503;
  
  res.status(statusCode).json(health);
};

/**
 * Detailed health check with more information
 */
export const detailedHealthCheck = async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
    services: {
      database: {
        status: isMongoConnected() ? 'connected' : 'disconnected',
        type: 'MongoDB',
        readyState: mongoose.connection.readyState,
      },
      api: {
        status: 'operational',
        version: '1.0.0',
      },
    },
    environment: process.env.NODE_ENV || 'development',
  };
  
  const allHealthy = health.services.database.status === 'connected';
  health.status = allHealthy ? 'healthy' : 'degraded';
  
  const statusCode = allHealthy ? 200 : 503;
  
  res.status(statusCode).json(health);
};

