// ============= Configuring the Database Connection =============
import { Pool} from "pg";       //This allows connecting Node.js with PostgreSQL database
import dotenv from "dotenv";    //To allow loading environment variables from a .env file, which is useful for storing sensitive information like database credentials and API keys.

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,       //Database host, typically 'localhost' for local development
    port: process.env.DB_PORT,       //Database port, default is 5432 for PostgreSQL
    user: process.env.DB_USER,       //Database user
    password: process.env.DB_PASSWORD, //Database password
    database: process.env.DB_NAME    //Database name
});

pool.on("connect", (client) => {      //Event listener for the 'connect' event, which is emitted when a new client is successfully connected to the database.
    console.log("Connected to the database successfully!");
});

pool.on("error", (err) => {          //Event listener for unexpected errors on idle clients.
    console.error("Unexpected error on idle database client:", err);
});
export default pool;