const express = require('express');
const router = express.Router();
const User = require('/../models/user');
const {jwtAuthMiddleware,genrateToken} = require('./../jwt');

router.post('/signup', async(req,res)=>{
    try{
        const data = req.body

        const adminUser = await User.findOne({role: 'admin'});
        if(data.role === 'admin'  && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists'});

        }
        if(!/^\d{12}$/.test(data.aadharCardNumber)){
            return res.status(400).json({errr: 'Aadhar Card Number must be 12 digit '});
        }

        const existingUser = await User.findOne({aadharCardNumber:data.aadharCardNumber});
        if(existingUser){
            return res.status(400).json({error:'User with same aadhar Card number is already exists'});
        }

        const newUser = new User(data);

        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id:response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        res.status(200).json({response: response, token: token});

    }catch(err){
        console.log(err);
        res.status(500).json({error: ' Internal Server Error'});

    }
})

router.post('/login', async (req,res) =>{
    try{
        const{aadharCardNumber,password} = req.body;

        if(!aadharCardNumber  || !password ){
            return res.status(400).json({error:'aadhar and passeord are requires'});
        }

        const user = await User.findOne({aadharCardNumber:aadharCardNumber});

        if(!user || !(await user.comparePassword(password))
        ){
    res.status(401).json({error:'Invalid aadhar card and password'});
}   
    const payload = {
        id: user.id,
    }
    const token = generateToken(payload);

    res.json({token})

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});

    }
});

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});

    }
    
})

router.put('/profile/password', jwtAuthMiddleware, async(req, res)=>{
    try{
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword) {
            return res.status(400).json({error: 'Both current and new password are required'});
        }

        const user = await User.findById(userId);

        if(!user || !(await user.comparePassword(currentPassword))) {
            return res.status(400).json({error: 'Invalid current password'});
        }

        user.password = newPasseord;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: 'Your password updated'});

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal error '})

    }
});

module.exports = router;