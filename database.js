import 'dotenv/config';
import pg from 'pg';

const developmentConfiguration = `postgresql://${process.env.DATABASE_USER}:${process.env.KEY}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;

const productionConfiguration = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString:
    process.env.NODE_ENV === 'production'
      ? productionConfiguration
      : developmentConfiguration,
});

export default pool;
