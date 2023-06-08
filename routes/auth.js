const { Router } = require('express');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Sachinisagoodb$oy';


// const { scryRenderedDOMComponentsWithClass } = require('react-dom/cjs/react-dom-test-utils.production.min');
const fetchuser = require('../middleware/fetchuser');



//Route1:create a user using:POST "/api/auth".Doesn't requir auth
router.post('/createuser', [
    body('name', 'enter a valid name').isLength({ min: 3 }),
    body('email', 'enter a valid email').isEmail(),
    //body('name').isLength({ min: 3 }),
    body('password', 'password must be 5 chracters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    //If there are errors,return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    //Check wheather the user with this email exists already
    try {
        let user = await User.findOne({ email: req.body.email });
        console.log(user)
        if (user) {
            return res.status(400).json({success, error: "sorry a user with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt);
        //create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        })
        //.then(user => res.json(user))
        //.catch(err=> {console.log(err)
        //res.json({error:'please enter a unque value for email',message :err.message})})
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        //console.log(jwtData);
        success =true;
        res.json({success, authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }


    //res.send(req.body);

    //res.json(obj)

})


//Route2:Authenticate a user using:POST "api/auth/login".No login required
router.post('/login', [
    body('email', 'enter a valid email').isEmail(),
    body('password', 'password can not be blank').exists(),
    //body('name').isLength({ min: 3 }),
    body('password', 'password must be 5 chracters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    //If there are errors,return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "please try to login with correct credential" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "please try to login with correct credential" });

        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({ success,authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");

    }







});


//Route3:Get loggedin User Details using:POST "api/auth/getuser".No login required
router.put('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findOne({userId}).select("-password")
        res.send(user)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");

    }
})


module.exports = router