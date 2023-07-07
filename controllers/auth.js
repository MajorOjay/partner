

module.exports = {
    signinGet: (req, res, next) => {
        res.render('auth/signin', {msg: req.flash("msg")})
    },






}