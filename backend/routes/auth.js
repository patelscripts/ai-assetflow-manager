import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

const router = express.Router();

// signup- Employee role only , no self elevation
router.post('/signup', async(req, res) =>{
    try{
        const{name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message:"All Fields are required"});   
        }

        const existing = await User.findOne({email});
        if(existing){
            return res.status(400).json({message : "Email already registered"});
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password:hashPassword,
            role : "Employee"
        });
        const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
        return res.status(201).json({message : 'SignUp successful', userId:user._id})
    }catch(err){
        return res.status(500).json({message : err.message});
    }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
   return  res.status(500).json({ message: err.message });
  }
});

export default router;