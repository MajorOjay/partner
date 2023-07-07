const express = require('express');
const router = express.Router();
const defaultController = require('../controllers/defaultController');
const passport = require('passport');
const localStrategy = require('passport-local');
const {loggedIn} = require('../config/customFunction');


router.all('/*', loggedIn, (req, res, next) => {

    req.app.locals.layout = 'default';

    next();

});




passport.use(new localStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({email: email}).then(user => {
        if (!user) {
            return done(null, false)
        }

        bcrypt.compare(password, user.password, (err, passwordMatched) => {
            if(err){
                return errr;
            }
            
            if (!passwordMatched){
                return done(null, false)
            }

            return done(null, user)
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
});

router.post('/signin', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/admin',
    session: false
})  

);


router.route('/')
    .get(defaultController.index);


router.route('/dashboard')
    .get(defaultController.index);

router.route('/create-store')
    .get(defaultController.newStore)  
    .post(defaultController.createStore);

router.route('/store/:id')
    .get(defaultController.store)

router.route('/edit-store/:id')
    .get(defaultController.editStore)
    .put(defaultController.updateStore);
    
router.route('/delete-store/:id')
    .get(defaultController.deleteStore) 
    .delete(defaultController.deleteStore);  

router.route('/new-user')
    .get(defaultController.createUser);  

router.route('/users')
    .get(defaultController.users)  


router.route('/payment-history')
    .get(defaultController.paymentHistory)  

router.route('/invoice')
    .get(defaultController.invoice)  

router.route('/scans')
    .get(defaultController.scans)  

router.route('/stores')
    .get(defaultController.stores)  

router.route('/faqs')
    .get(defaultController.faq)  



router.get('/logout', (req, res) => {
    req.session.destroy();
   // req.flash('success', 'You have successfully logged out');
    res.redirect('/auth')
})
 


router.get('/sitemap.xml', (req, res) => {
    res.sendFile('/views/default/sitemap.xml', {root: "."})
})



module.exports = router;
    