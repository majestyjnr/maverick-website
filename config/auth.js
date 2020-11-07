module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'You need to login in first');
        res.redirect('/maverick-admin/login');
    }   
}