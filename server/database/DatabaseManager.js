import { Client as PgClient } from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import initSqlJs from 'sql.js';

export class DatabaseManager {
  constructor() {
    this.connections = new Map();
  }

  async testConnection(config) {
    try {
      switch (config.type) {
        case 'postgresql':
          return await this.testPostgreSQL(config);
        case 'mysql':
          return await this.testMySQL(config);
        case 'mongodb':
          return await this.testMongoDB(config);
        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }
    } catch (error) {
      console.log(`Database connection test failed for ${config.type}: ${error.message}`);
      return null;
    }
  }

  async testPostgreSQL(config) {
    const client = new PgClient({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user || 'postgres',
      password: config.password || '',
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      const result = await client.query('SELECT NOW()');
      await client.end();
      return { type: 'postgresql', status: 'connected', timestamp: result.rows[0].now };
    } catch (error) {
      await client.end().catch(() => {});
      throw error;
    }
  }

  async testMySQL(config) {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user || 'root',
      password: config.password || '',
      connectTimeout: 5000,
    });

    try {
      const [rows] = await connection.execute('SELECT NOW() as timestamp');
      await connection.end();
      return { type: 'mysql', status: 'connected', timestamp: rows[0].timestamp };
    } catch (error) {
      await connection.end().catch(() => {});
      throw error;
    }
  }

  async testMongoDB(config) {
    const uri = `mongodb://${config.host}:${config.port}/${config.database}`;
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    try {
      await client.connect();
      const db = client.db(config.database);
      const result = await db.admin().ping();
      await client.close();
      return { type: 'mongodb', status: 'connected', ping: result };
    } catch (error) {
      await client.close().catch(() => {});
      throw error;
    }
  }

  async createTestDatabase() {
    // Create an in-memory SQLite database for testing
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    
    // Wrap with helper methods for compatibility
    return {
      exec: (sql) => db.exec(sql),
      prepare: (sql) => ({
        get: (params = []) => {
          const stmt = db.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
          const result = stmt.step() ? stmt.getAsObject() : null;
          stmt.free();
          return result;
        },
        all: (params = []) => {
          const stmt = db.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
        run: (params = []) => {
          const stmt = db.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
          stmt.step();
          stmt.free();
          return { changes: db.getRowsModified() };
        }
      }),
      close: () => db.close()
    };
  }

  async executeQuery(connectionId, query, params = []) {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const startTime = Date.now();
    try {
      let result;
      switch (connection.type) {
        case 'postgresql':
          result = await connection.client.query(query, params);
          break;
        case 'mysql':
          result = await connection.client.execute(query, params);
          break;
        case 'sqlite':
          if (query.toLowerCase().startsWith('select')) {
            result = await connection.client.all(query, params);
          } else {
            result = await connection.client.run(query, params);
          }
          break;
        default:
          throw new Error(`Query execution not implemented for ${connection.type}`);
      }

      const duration = Date.now() - startTime;
      return { result, duration, status: 'success' };
    } catch (error) {
      const duration = Date.now() - startTime;
      return { error: error.message, duration, status: 'error' };
    }
  }

  async validateDataIntegrity(connectionId, tableName) {
    const queries = {
      checkNulls: `SELECT COUNT(*) as null_count FROM ${tableName} WHERE id IS NULL`,
      checkDuplicates: `SELECT COUNT(*) - COUNT(DISTINCT id) as duplicate_count FROM ${tableName}`,
      checkOrphans: `SELECT COUNT(*) as orphan_count FROM ${tableName} t1 LEFT JOIN users u ON t1.user_id = u.id WHERE u.id IS NULL AND t1.user_id IS NOT NULL`
    };

    const results = {};
    for (const [checkName, query] of Object.entries(queries)) {
      try {
        const result = await this.executeQuery(connectionId, query);
        results[checkName] = result;
      } catch (error) {
        results[checkName] = { error: error.message, status: 'error' };
      }
    }

    return results;
  }

  async getTableSchema(connectionId, tableName) {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    let query;
    switch (connection.type) {
      case 'postgresql':
        query = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position
        `;
        break;
      case 'mysql':
        query = `
          SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type, 
                 IS_NULLABLE as is_nullable, COLUMN_DEFAULT as column_default
          FROM information_schema.COLUMNS
          WHERE TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `;
        break;
      case 'sqlite':
        query = `PRAGMA table_info(${tableName})`;
        break;
      default:
        throw new Error(`Schema query not implemented for ${connection.type}`);
    }

    return await this.executeQuery(connectionId, query, [tableName]);
  }

  async performanceTest(connectionId, queries) {
    const results = [];
    
    for (const query of queries) {
      const startTime = Date.now();
      try {
        const result = await this.executeQuery(connectionId, query.sql, query.params);
        const duration = Date.now() - startTime;
        
        results.push({
          query: query.name || query.sql.substring(0, 50),
          duration,
          status: 'success',
          rowCount: Array.isArray(result.result) ? result.result.length : result.result?.rowCount || 0
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          query: query.name || query.sql.substring(0, 50),
          duration,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  }

  async closeConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        switch (connection.type) {
          case 'postgresql':
            await connection.client.end();
            break;
          case 'mysql':
            await connection.client.end();
            break;
          case 'mongodb':
            await connection.client.close();
            break;
          case 'sqlite':
            await connection.client.close();
            break;
        }
      } catch (error) {
        console.error(`Error closing ${connection.type} connection:`, error);
      }
      this.connections.delete(connectionId);
    }
  }

  async closeAllConnections() {
    const connectionIds = Array.from(this.connections.keys());
    await Promise.all(connectionIds.map(id => this.closeConnection(id)));
  }
}