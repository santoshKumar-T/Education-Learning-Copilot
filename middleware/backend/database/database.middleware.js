/**
 * Database Middleware
 * Centralized middleware for all database operations
 * Handles connection checks, error handling, logging, and transaction management
 */

import mongoose from 'mongoose';

/**
 * Check if MongoDB is connected
 */
export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

/**
 * Database Operation Wrapper
 * Wraps database operations with middleware
 * @param {Function} operation - Database operation function
 * @param {Object} options - Operation options
 * @returns {Promise<Object>} Operation result
 */
export const dbOperation = async (operation, options = {}) => {
  const {
    operationName = 'Database Operation',
    requireConnection = true,
    enableLogging = true,
  } = options;

  const startTime = Date.now();
  const operationId = Date.now().toString(36);

  try {
    // Check database connection
    if (requireConnection && !isMongoConnected()) {
      const error = new Error('Database not connected. Please start MongoDB or configure MongoDB Atlas connection.');
      error.code = 'DB_NOT_CONNECTED';
      throw error;
    }

    // Log operation start
    if (enableLogging) {
      console.log(`\n💾 [DB] ${operationName}`);
      console.log(`   Operation ID: ${operationId}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
    }

    // Execute operation
    const result = await operation();

    // Calculate duration
    const duration = Date.now() - startTime;

    // Log success
    if (enableLogging) {
      console.log(`   ✅ Operation completed in ${duration}ms`);
    }

    return {
      success: true,
      data: result,
      duration,
      operationId,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error
    if (enableLogging) {
      console.error(`   ❌ Operation failed after ${duration}ms`);
      console.error(`   Error: ${error.message}`);
      if (error.code) {
        console.error(`   Error Code: ${error.code}`);
      }
    }

    // Handle specific database errors
    if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        // Duplicate key error
        throw new Error('Duplicate entry. This record already exists.');
      }
    } else if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map(e => e.message);
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    } else if (error.name === 'CastError') {
      throw new Error(`Invalid ID format: ${error.message}`);
    }

    // Re-throw with consistent format
    const dbError = new Error(error.message || 'Database operation failed');
    dbError.code = error.code || 'DB_ERROR';
    dbError.originalError = error;
    throw dbError;
  }
};

/**
 * Database Query Wrapper
 * Wraps database queries with middleware
 * @param {Function} query - Database query function
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Query result
 */
export const dbQuery = async (query, options = {}) => {
  return dbOperation(query, {
    operationName: options.operationName || 'Database Query',
    ...options,
  });
};

/**
 * Database Write Wrapper
 * Wraps database write operations (create, update, delete)
 * @param {Function} write - Database write function
 * @param {Object} options - Write options
 * @returns {Promise<Object>} Write result
 */
export const dbWrite = async (write, options = {}) => {
  return dbOperation(write, {
    operationName: options.operationName || 'Database Write',
    ...options,
  });
};

/**
 * Database Transaction Wrapper
 * Wraps database operations in a transaction
 * @param {Function} transaction - Transaction function
 * @param {Object} options - Transaction options
 * @returns {Promise<Object>} Transaction result
 */
export const dbTransaction = async (transaction, options = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await dbOperation(
      async () => {
        const transactionResult = await transaction(session);
        await session.commitTransaction();
        return transactionResult;
      },
      {
        operationName: options.operationName || 'Database Transaction',
        ...options,
      }
    );

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Safe Database Operation
 * Returns null instead of throwing on connection errors
 * @param {Function} operation - Database operation
 * @param {Object} options - Operation options
 * @returns {Promise<Object|null>} Operation result or null
 */
export const safeDbOperation = async (operation, options = {}) => {
  try {
    return await dbOperation(operation, {
      requireConnection: false,
      ...options,
    });
  } catch (error) {
    if (error.code === 'DB_NOT_CONNECTED') {
      return null;
    }
    throw error;
  }
};

/**
 * Batch Database Operations
 * Executes multiple operations in sequence
 * @param {Array<Function>} operations - Array of operation functions
 * @param {Object} options - Batch options
 * @returns {Promise<Array>} Results array
 */
export const dbBatch = async (operations, options = {}) => {
  const results = [];
  
  for (const operation of operations) {
    try {
      const result = await dbOperation(operation, {
        operationName: options.operationName || 'Batch Operation',
        ...options,
      });
      results.push(result);
    } catch (error) {
      if (options.stopOnError) {
        throw error;
      }
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
};

/**
 * Export connection check utility
 */
export { isMongoConnected };

