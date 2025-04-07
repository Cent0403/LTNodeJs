// db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'centeno',
    host: '44.206.231.4',
    database: 'ltdb',
    password: 'Catolica10',
    port: 5432,
});

export default pool;
