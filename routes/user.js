const express = require('express');
const {handleUserSignUp, handleUserLogin,handleLogout} = require('../controllers/user');

const router = express.Router();

router.post('/',handleUserSignUp);

router.post('/login',handleUserLogin);

module.exports = router;