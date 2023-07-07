const express = require('express');
const router = express.Router();
const defaultController = require('../controllers/defaultController');
const {loggedIn} = require('../config/customFunction');
const bcrypt = require('bcryptjs');
const {check, validator} = require('express-validator')


router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'default';

    next();
});


router.route('/')
    .get(loggedIn, defaultController.index);


router.route('/dashboard')
    .get(loggedIn, defaultController.index);

router.route('/create-store')
    .get(loggedIn, defaultController.newStore)  
    .post(loggedIn,[
        check('name').notEmpty().withMessage('Name field is required'),
        check('address').notEmpty().withMessage('Address field is required'),
        check('city').notEmpty().withMessage('City field is required'),
        check('province').notEmpty().withMessage('Province field is required'),
        check('category').notEmpty().withMessage('Category field is required'),
        ], defaultController.createStore);

router.route('/store/:id')
    .get(loggedIn, defaultController.store)

router.route('/edit-store/:id')
    .get(loggedIn, defaultController.editStore)
    .put(loggedIn, defaultController.updateStore);

    
router.route('/delete-store/:id')
    .get(loggedIn, defaultController.deleteStore) 
    .delete(loggedIn, defaultController.deleteStore);  

router.route('/new-user')
    .get( defaultController.createUser)  
    .post(defaultController.registerUser);

router.route('/users')
    .get(loggedIn, defaultController.users)  
    
router.route('/edit-user/:id')
    .get(loggedIn, defaultController.editUser)
    .put(loggedIn, defaultController.updateUser);

router.route('/delete-user/:id')
    .get(loggedIn, defaultController.deleteUser);  


router.route('/setup-payment')
    .get(loggedIn, defaultController.setupPayment)  

router.route('/payment-history')
    .get(loggedIn, defaultController.paymentHistory)  

router.route('/invoice')
    .get(loggedIn, defaultController.invoice)  

router.route('/scans')
    .get(loggedIn, defaultController.scans)  

router.route('/stores')
    .get(loggedIn, defaultController.stores)  

router.route('/faqs')
    .get(loggedIn, defaultController.faq)  

router.route('/404')
    .get(loggedIn, defaultController.four)  

router.route('/setup/:id')
    .get(loggedIn, defaultController.setupStore);  

router.route('/generate/:id')
    .get(loggedIn, defaultController.generate);  



router.get('/logout', (req, res) => {
    req.session.destroy();
   // req.flash('success', 'You have successfully logged out');
    res.redirect('/auth')
})
 


router.get('/sitemap.xml', (req, res) => {
    res.sendFile('/views/default/sitemap.xml', {root: "."})
})





module.exports = router;
    