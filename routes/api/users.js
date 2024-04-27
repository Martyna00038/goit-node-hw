const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/jwt");

const userValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

router.post("/signup", async (req, res, next) => {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (user) {
        return res.status(409).json({ message: "Email in use" });
    }
    try {
        const newUser = new User({ email, password });
        await newUser.setPassword(password);
        await newUser.save();
        return res.status(201).json({
            user: {
                email: email,
                subscription: newUser.subscription,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = await userValidationSchema.validateAsync(
            req.body
        );
        const user = await User.findOne({ email });
        if (!user || !(await user.isValidPassword(password))) {
            return res
                .status(401)
                .json({ message: "Email or password is wrong" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        user.token = token;
        await user.save();
        res.json({
            token,
            user: { email: user.email, subscription: user.subscription },
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/logout", authMiddleware, async (req, res, next) => {
    try {
        const userId = res.locals.user._id;
        const user = await User.findById(userId);

        user.token = null;
        await user.save();

        return res.status(200).json({ message: "user logged out" });
    } catch (err) {
        next(err);
    }
});

router.get("/current", authMiddleware, async (req, res, next) => {
    try {
        const currentUser = res.locals.user;
        return res.status(200).json({
            email: currentUser.email,
            subscription: currentUser.subscription,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
