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
const app = express();
app.use(cors());
app.use(express.json());


// ----------- Importing Controlelrs -----------//
const quizRoutes = require("./controllers/quizController");


// Initializing different Routes with base Apis //
app.use('/api', quizRoutes);

app.use("/" , async(req , res)=>{
    res.json({status : true , data : process.env})
})

// Starting server
app.listen( process.env.PORT || 5000 ,  function (){
    console.log(`Server Up at ${process.env.PORT}`);
});