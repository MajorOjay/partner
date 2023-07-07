
const jwt = require('jsonwebtoken');

module.exports = {
    isUserAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        }
        else{
            res.redirect('/auth');
        }
    }, 

    loggedIn: (req, res, next) => {
        if(req.session.loggedin || req.session.email){
            req.session.save();
            next();
        }else{
            res.redirect('/auth');
        }
    },


    isEmpty: function(obj) {
        for (let key in obj) {
            if(obj.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    },

    // Generate a JWT API key
        generateAPIKey: function (user) {
            // Create a payload containing the user information
            const payload = {
            id: user.id,
            name: user.name,
            email: user.email
            };
        
            // Sign the JWT with a secret key
            const apiKey = jwt.sign(payload, process.env.SECRET);
        
            return apiKey;
        }

}