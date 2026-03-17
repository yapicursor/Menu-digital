const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const sqlPath = path.join(__dirname, 'migrations', 'add_order_history_indexes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    try {
        console.log('🔄 Running migration: add_order_history_indexes.sql');
        await pool.query(sql);
        console.log('✅ Migration completed successfully!');
        console.log('📊 Indexes created:');
        console.log('   - idx_orders_customer_phone');
        console.log('   - idx_orders_restaurant_created');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

runMigration();
