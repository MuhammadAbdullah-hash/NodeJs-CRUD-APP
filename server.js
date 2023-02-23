require('dotenv').config();
const cors = require("cors");
const express = require("express");



const ERROR_CODE = {
    1 : "SQL CONNECTION ERROR",
    2 : "MISSING_FILED",
    3 : "ERROR IN SQL TRANSACTION",
    4 : "NO PAYLOAD",
    5 : "SQL QUERY ERROR",
    6 : "ERROR IN COMMIT",
    7 : "INCORRECT PAYLOAD"
}
// ------ Initializing Middle-Ware ------ //
const PORT  = process.env.SERVER_PORT;
const app = express();
app.use(cors());
app.use(express.json());


// ----------- Importing Controlelrs -----------//
const quizRoutes = require("./controllers/quizController");
const pool = require('./dataBase/dbConnector.js');



// Initializing different Routes with base Apis //
app.use('/api', quizRoutes);


// Starting server
app.listen(PORT ,  function (){
    console.log(`Server Up at http://localhost:${PORT}`);
});