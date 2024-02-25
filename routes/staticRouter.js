const express = require('express');
const URL = require('../models/url');
const config = require('../config');
const router = express.Router();

router.get('/',async(req,res)=>{
    if(!req.user) return res.redirect('/login');

    const allUrls = await URL.find({createdBy : req.user._id});
    return res.render('home',{
        urls : allUrls,
        baseUrl : config.baseUrl
    });
})
router.get('/signup',async(req,res)=>{
    return res.render('signup');
})
router.get('/login',async(req,res)=>{
    return res.render('login');
})
router.get('/logout',async(req,res)=>{
    res.clearCookie('uid');
    return res.redirect('/login');
})


module.exports = router;
