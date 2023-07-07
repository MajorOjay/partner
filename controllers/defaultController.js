const mysql = require('mysql');
const {connection, pool} = require('../config/config');
const fs = require('fs');
const {isEmpty, generateAPIKey} = require('../config/customFunction')
const path = require('path');
const multiparty = require('multiparty');
const { json } = require('body-parser');
const util = require('util');
const crypto = require("crypto");
const rand = crypto.randomBytes(4).toString("base64");
const bcrypt = require('bcryptjs');
const {loggedIn, logger} = require('../config/customFunction');
const { start } = require('repl');
const flash = require("connect-flash");
const {check, validator, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');



module.exports  = {

    
    login: (req, res, next) => {
            res.render('default/login');
    },
    
    four: (req, res) => {
            res.render('default/404');
    },
    
    index: (req, res, next) => {
        const user = req.session.user;
            res.render('default/index',{user});
    },


        stores: (req, res) => {
        
            pool.getConnection((err, connection) =>{
                const mer_id = req.session.merchant_id;
                if(!err){
                    connection.query('SELECT * FROM stores WHERE merchant_id =?', [mer_id], (err, stores) =>{
                        connection.release();
                        if(!err){
                        res.render('default/stores', {store: stores})
                        }else{
                            res.status(500).send('Internal Server Error')
                        }
                    })
                
                }
            })
    },

    store: (req, res) => {
    
            pool.getConnection((err, connection) =>{
                if(!err){
                    connection.query('SELECT * FROM stores WHERE id =?', [req.params.id], (err, store) =>{
                        connection.release();
                        const noScan = 1;
                        if(!err){
                        res.render('default/store', {store: store[0], noScan})
                        }else{
                            res.status(500).send('Internal Server Error')
                        }
                    })
                
                }
            })
    },

    newStore: (req, res) => {
        res.render('default/create-store');

    },







    createStore: (req, res) => {

        if (!req.body.name || !req.body.address || !req.body.city || !req.body.category || !req.body.province || !req.body.status){
            const msg = "All fields are mandatory";
            res.render('default/create-store', {msg})

        }else{

        const newStore = {
            name: req.body.name,
            address: req.body.address,
            category: req.body.category,
            no_of_pos: req.body.no_of_pos,
            city: req.body.city,
            province: req.body.province,
            merchant_id: req.session.merchant_id,
            merchant_name: req.session.merchant_name,
            store_id: rand,
            status: req.body.status

        }
        pool.getConnection((err, connection) =>{
            if(err) throw err;
            connection.query('INSERT INTO stores SET?', newStore, (err, saved) => {
                connection.release();
                if (!err) {
                    res.redirect('stores');
                }else{
                    throw err;
                }
            })
        })
    }
    },

    
    editStore: (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(`SELECT * from stores WHERE id =?`, [req.params.id], (err, store) => {
                connection.release();
                if (!err){
                    res.render(`default/edit-store`, {store : store[0]});
                }else{
                    throw err;
                }
            })
        })
    },



    updateStore: (req, res) => {

        if (!req.body.name || !req.body.address || !req.body.city || !req.body.category || !req.body.province){
            req.flash("msg", "All fields are mandatory")
            res.redirect('create-store')

        }else{
            const data = {
                name: req.body.name,
                address: req.body.address,
                category: req.body.category,
                no_of_pos: req.body.no_of_pos,
                city: req.body.city,
                province: req.body.province,
                merchant_id: req.session.merchant_id,
                merchant_name: req.session.merchant_name,
                status: req.body.status

            }
            pool.getConnection((err, connection) =>{
                if(err) throw err;
                connection.query('UPDATE stores SET? WHERE id =?', [data, req.params.id], (err, saved) => {
                    connection.release();
                    if (!err) {
                        req.flash("msg", "Store edited successfully")
                        res.redirect('/stores')
                    }else{
                        throw err;
                    }
                })
             })
        }
    },

    deleteStore: (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query('DELETE from stores WHERE id =?', [req.params.id], (err, deleted) => {
                connection.release();
                if (!err){
                    const msg = "Store deleted successfully";
                    res.redirect('/stores');
                }else{
                    throw err;
                }
            })
        })

    },


    createUser: (req, res) => {
        res.render('default/create-user');
    },

    users: (req, res) => {
        const mer_id = req.session.merchant_id;
            pool.getConnection((err, connection) =>{
                if(!err){
                    connection.query('SELECT * FROM merchant_users WHERE merchant_id =?', [mer_id], (err, users) =>{
                        connection.release();
                        if(!err){
                        res.render('default/users', {user: users})
                        }else{
                            res.status(500).send('Internal Server Error')
                        }
                    })
                
                }
            })


    },

    setupPayment: (req, res) => {
   
        res.render('default/setup-payment');
    },

    paymentHistory: (req, res) => {
   
        res.render('default/payment-history');
    },

    invoice: (req, res) => {
   
        res.render('default/invoice');
    },

    scans: (req, res) => {
      
        res.render('default/scans');
    },


    

    faq: (req, res) => {
      
        res.render('default/faqs');
    },

    setupStore: (req, res) => {
        pool.getConnection((err, connection)=>{
            if (!err)
            connection.query('SELECT * FROM stores WHERE id =?', [req.params.id], (err, store)=>{
                if (err){
                    console.error(err)
                }else{
                    req.session.id = store[0].id
                    req.session.merchant = store[0].merchant_name;
                    console.log(req.session.email)
                    res.render('default/setup-store', {store: store[0]});

                }
                
                });
            
        });
    },

    generate: (req, res) => {
        const user = {
            id: req.session.id,
            name: req.session.merchant_name,
            email: req.session.email ? req.session.email : "osajayabs@gmail.com"
            };
        
        
          // Generate the API key
          const apiKey = generateAPIKey(user);

          pool.getConnection((err, connection)=> {
            if (err) throw err;
            connection.query('UPDATE stores SET store_key =? WHERE id =?', [apiKey, req.params.id], (err, success)=>{
                if (err){ 
                    console.error('Error generating API key:', error);
                }else{
                    res.redirect('/setup/'+req.params.id)
                }
            })
          })
        
    },



    registerUser: (req, res) => {

        const errors = [];
        if (!req.body.firstName || !req.body.email || !req.body.lastName || !req.body.status || !req.body.phone){
            const message = 'All fields are mandatory'
            res.render('default/create-user', {message});
        }
        else if (req.body.password !== req.body.comfirmPassword || req.body.password == ""){
            const message = 'Passwords do not match'
            res.render('default/create-user', {message});
        }else{

            pool.getConnection((err, connection) =>{
                if (err) throw err;
                connection.query('SELECT email FROM merchant_users WHERE email =?', [req.body.email], (err, user) => {
                    connection.release()
                    if (err){
                        res.redirect('create-user')
                    }else{
                        const newUser = {
                            first_name: req.body.firstName,
                            last_name: req.body.lastName,
                            email: req.body.email,
                            phone: req.body.phone,
                            password: req.body.password,
                            user_type: 'Admin',
                            merchant_id: req.session.merchant_id,
                            merchant_name: req.session.merchant_name,
                            status: req.body.status
                        };                      
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                newUser.password = hash;
    
                                connection.query('INSERT INTO merchant_users SET?', newUser, (err, saved) =>{
                                    if (!err){
                                        const msg = "User successfully created";
                                        res.redirect('users')
                                    }else{
                                        throw err;
                                    }
                                })
                            });
                        });
                    }
                })
            })
        }
        
                
           
    },
    
    deleteUser: (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query('DELETE from merchant_users WHERE id =?', [req.params.id], (err, deleted) => {
                connection.release();
                if (!err){
                    const msg = "User successfully deleted";
                    res.redirect('/users');
                }else{
                    throw err;
                }
            })
        })

    },


    editUser: (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(`SELECT * from merchant_users WHERE id =?`, [req.params.id], (err, user) => {
                connection.release();
                if (!err){
                    res.render(`default/edit-user`, {user : user[0]});
                }else{
                    throw err;
                }
            })
        })
    },

    updateUser: (req, res) => {
        if (!req.body.firstName || !req.body.email || !req.body.lastName || !req.body.status || !req.body.phone){
            const message = 'All fields are mandatory';
            req.flash("msg", "All fields are mandatory")
            res.redirect('/edit-user/'+req.params.id);
        }
        else{
       
            const data = {
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                status: req.body.status
            }
        pool.getConnection((err, connection) =>{
            if(err) throw err;
            connection.query('UPDATE merchant_users SET? WHERE id =?', [data, req.params.id], (err, saved) => {
                connection.release();
                if (!err) {
                    const msg = "User information edited successfully"
                    res.redirect('/users');
                }else{
                    throw err;
                }
            })
        })
    }         
           
    },

    
    

















}