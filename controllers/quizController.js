const express = require('express')
const quizController = express.Router()
const pool = require('../database/dbConnector.js');

quizController.use((req, res, next) => {
    next();
})


// Adding Quiz
quizController.post("/quiz" , async (req , res)=>{
    // initializing variables
    let data;
    let values;
    let quizId;
    let sqlQuery;
    let quizTitle;
    let statusCode;
    let questionIds;
    let quizQuestions;
    let quizDescription;

    // reading Payload
    data  = req.body;
    if(data && Object.keys(data).length > 0 ){
        quizTitle = data.quizTitle;
        quizQuestions = data.quizQuestions;
        quizDescription = data.quizDescription;

        if(!quizTitle){
            statusCode = 400;
            res.status(statusCode).json({success : false , errors :  [ 2 ] , data : null});
        }
        else if (!quizQuestions){
            statusCode = 400;
            res.status(statusCode).json({success : false, errors :  [ 2 ] , data : null});
        }
        else if (!quizDescription){
            statusCode = 400;
            res.status(statusCode).json({success : false , errors :  [ 2 ] , data : null});
        }
        else{
            // getting connection from pool
            pool.getConnection(function(err, connection){
                if(err){
                    statusCode = 500;
                    res.status(statusCode).json({success : false, errors :  [ 1 ] , data : null});        
                }
                else{
                    // starting db transaction
                    connection.beginTransaction(function(err1){
                        if(err1){
                            connection.release();
                            statusCode = 500;
                            res.status(statusCode).json({success : false, errors :  [ 3 ] , data : null});        
                        }
                        else{         
                            // insert quiz into db                   
                            sqlQuery = "INSERT INTO quizez ( title , description ) VALUES (?,?)";
                            values = [ quizTitle , quizDescription ];
                            connection.query( sqlQuery , values , function(err2 , result2){
                                if(err2){
                                    // roll back transaction 
                                    connection.rollback(function() {
                                        connection.release();
                                        statusCode = 500;
                                        res.status(statusCode).json({success : false, errors :  [ 5 ] , data : null});    
                                    });
                                }
                                else{
                                    quizId = result2.insertId;
                                    // insert questions into db
                                    sqlQuery = "INSERT INTO questions (quizId , statement , isMandatory) VALUES "
                                    quizQuestions.map((item_)=>{
                                        sqlQuery += `( ${quizId} , '${item_.questionStatement}' , ${item_.isMandatory ? 1 : 0 } ),`

                                    })
                                    sqlQuery = sqlQuery.slice( 0 , -1)

                                    connection.query( sqlQuery , function(err3 , result3){
                                        if(err3){
                                            connection.rollback(function() {
                                                connection.release();
                                                statusCode = 500;
                                                res.status(statusCode).json({success : false, errors :  [ 5 ] , data : null});    
                                            });        
                                        }
                                        else{
                                            // getting added questions ids
                                            questionIds = [ result3.insertId ]
                                            for (let index = 1; index < quizQuestions.length; index++) {
                                                questionIds.push( questionIds[index-1] + index  )         
                                            }
                                            // insert answers into db
                                            sqlQuery = "INSERT INTO answers (questionId , statement , isCorrect) VALUES"

                                            questionIds.map((id , index)=>{
                                                quizQuestions[index].answers.map((item_)=>{
                                                    sqlQuery += `( ${id} , '${item_.answerStatement}' , ${item_.isCorrect? 1 : 0  } ),`
                                                })
                                            })

                                            sqlQuery = sqlQuery.slice(0,-1);
                                            connection.query(sqlQuery , function(err4 , result4){
                                                if(err4){
                                                    connection.rollback(function() {
                                                        connection.release();
                                                        statusCode = 500;
                                                        res.status(statusCode).json({success : false, errors :  [ 5 ] , data : null});    
                                                    });                
                                                }
                                                else{
                                                    // commiting transaction
                                                    connection.commit(function(err5){
                                                        if(err5){
                                                            connection.rollback(function() {
                                                                connection.release();
                                                                statusCode = 500;
                                                                res.status(statusCode).json({success : false, errors :  [ 6 ] , data : null});    
                                                            });                
                                                        }
                                                        else{
                                                            connection.release();
                                                            statusCode = 200;
                                                            res.status(statusCode).json({success : true  , errors :  null , data : {"message" : "Quiz has been Created Successfully"} });
                                                        }
                                                    })
                                                            

                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    }
    else{
        statusCode = 400;
        res.status(statusCode).json({success : false, errors : [ 4 ] , data : null});
    }
})




quizController.get('/quiz/:id', async (req, res) => {
    let quizId;
    let values;
    let sqlQuery;
    let currentObj;
    let quizResponce;
    let visitedArray;
    let currentResponce;

    quizId  = req.params.id;
    quizId = parseInt(quizId)
    if( Number.isInteger(quizId) ){
        pool.getConnection(function(err , connection){
            if( err ){
                statusCode = 500;
                res.status(statusCode).json({success : false, errors :  [ 1 ] , data : err });        
            }
            else{
                connection.beginTransaction(function(err1){
                    if(err1){
                        connection.release();
                        statusCode = 500;
                        res.status(statusCode).json({success : false, errors :  [ 3 ] , data : null});        
                    }
                    else{
                        sqlQuery = "SELECT quizez.title as quizTitle , quizez.description as quizDescription,";
                        sqlQuery += "questions.isMandatory , answers.questionId,answers.statement as answer,"
                        sqlQuery += "questions.id, questions.statement as questionStatement";
                        sqlQuery += " FROM quizez";
                        sqlQuery += " INNER JOIN questions ON questions.quizId = quizez.id";
                        sqlQuery += " INNER JOIN answers ON answers.questionId = questions.id";
                        sqlQuery += " WHERE quizez.id=?";
                        values = [quizId];

                        connection.query( sqlQuery , values , function(err2 , result2){
                            if(err2){
                                connection.rollback(function() {
                                    connection.release();
                                    statusCode = 500;
                                    res.status(statusCode).json({success : false, errors :  [ 5 ] , data : null});    
                                });
                            }
                            else{
                                connection.commit(function(err3){
                                    if(err3){
                                        connection.rollback(function() {
                                            connection.release();
                                            statusCode = 500;
                                            res.status(statusCode).json({success : false, errors :  [ 6 ] , data : null});    
                                        });                
                                    }
                                    else{

                                        quizResponce = {
                                            quizTitle : result2[0].quizTitle , 
                                            quizDescription:  result2[0].quizDescription , 
                                            quizQuestions : []
                                        }

                                        visitedArray = [];
                                        result2.map((item_)=>{
                                            if (!visitedArray.includes( item_.id)){
                                                currentResponce = result2.filter((obj)=>{ return obj.questionId == item_.id })
                                                visitedArray.push(item_.id);
                                                currentObj = {
                                                    "questionStatement" : currentResponce[0].questionStatement,
                                                    "isMandatory" : currentResponce[0].isMandatory,
                                                    "options" : []
                                                }

                                                currentResponce.map((element , index)=>{
                                                    currentObj.options.push({  "option" : element.answer})
                                                })

                                                quizResponce.quizQuestions.push(currentObj)
                                            }
                                        })

                                        
                                        connection.release();
                                        statusCode = 200;
                                        res.status(statusCode).json({success : true  , errors :  null , data : {"message" : "Api Successfull" , "quizData" : quizResponce } });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
    else{
        statusCode = 400;
        res.status(statusCode).json({success : false, errors : [ 7 ] , data : null});    
    }
})


  

module.exports = quizController;