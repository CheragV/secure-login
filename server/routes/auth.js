const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcrypt');
const { UserSchema, LoginSchema } = require('../validations');
const jwt = require('jsonwebtoken');


router.put('/register', async (req, res) => {
    let { error } = UserSchema.validate(req.body);

    if (error) {
        res.status(400).send({message: error.details[0].message})
    } else { 
        try {
            let hashedPassword = await bcrypt.hash(req.body.password, 10);

            await User.find({ email: req.body.email }, async (err, user) => { 
                if (user.length) { 
                    res.status(301).send({
                        message: 'User already registered'
                    })
                } else if (!user.length) {
                    const userData = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: hashedPassword
                    })
                    
                    let userSaved = await userData.save();
                    const token = jwt.sign({
                        id: userSaved._id
                    }, process.env.TOKEN_SECRET)
    
                    res.header('auth-token', token).send({
                        token,
                        user: userSaved
                    });

                    res.status(200).send({user: userSaved})
                }
            })
        } catch (err) { 
            res.status(400).send(err);
        }
    } 
})


router.post('/login', async (req, res) => {
    let { error } = LoginSchema.validate(req.body);

    if (error) {
        res.status(400).send({ message: error.details[0].message })
    } else {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            res.status(400).send({
                message: 'Email does not exist'
            });
        } else {
            const validPass = await bcrypt.compare(req.body.password, user.password);
            if (!validPass) {
                res.status(400).send({
                    message: 'Password is Invalid'
                });
            } else {
                const token = jwt.sign({
                    id: user._id
                }, process.env.TOKEN_SECRET)

                res.header('auth-token', token).send({
                    token,
                    user
                });
            }
        }
    }
})

module.exports = router;