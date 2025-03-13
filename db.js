const { query } = require('express');
const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASS,
    host :  process.env.DATABASE_HOST,
    database : process.env.DATABASE_DB,
    port : process.env.DATABASE_PORT
});

module.exports = {
    query : (text , params) => pool.query(text,params),
};