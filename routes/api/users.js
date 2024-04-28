const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/jwt");
const gravatar = require("gravatar");
const { v4: uuidV4 } = require("uuid");
const path = require("path");
const uploadMiddleware = require("../../middleware/uploadMiddleware.js");
const storeAvatarDir = path.join(__dirname, "../../public/avatars");
const isImageAndTransform = require("../../helpers/helpers.js");

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
        const gravatarURL = gravatar.url(email);
        console.log(gravatarURL);
        await newUser.setPassword(password);
        newUser.avatarURL = gravatarURL;
        await newUser.save();
        return res.status(201).json({
            user: {
                email: email,
                subscription: newUser.subscription,
                avatarURL: newUser.avatarURL,
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
        if (!user || !(await user.validatePassword(password))) {
            return res
                .status(401)
                .json({ message: "Email or password is wrong" });
        }
        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: "1h",
        });
        user.token = token;
        await user.save();
        res.json({
            token,
            user: {
                email: user.email,
                subscription: user.subscription,
                avatarURL: newUser.avatarURL,
            },
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
            avatarURL: newUser.avatarURL,
        });
    } catch (err) {
        next(err);
    }
});

router.post(
    "/avatars",
    authMiddleware,
    uploadMiddleware.single("avatar"),
    async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const { path: temporaryPath } = req.file;
        const extension = path.extname(temporaryPath);
        const fileName = `${uuidV4()}${extension}`;
        const filePath = path.join(storeAvatarDir, fileName);

        const isValidAndTransform = await isImageAndTransform(temporaryPath);
        if (!isValidAndTransform) {
            await fs.unlink(temporaryPath);
            return res
                .status(400)
                .json({ message: "File isnt a photo but is pretending" });
        }

        try {
            await fs.rename(temporaryPath, filePath);
        } catch (error) {
            await fs.unlink(temporaryPath);
            return next(error);
        }

        try {
            const currentUser = res.locals.user;
            currentUser.avatarURL = `/avatars/${fileName}`;
            return res.status(200).json({ avatarURL: currentUser.avatarURL });
        } catch (err) {
            next(err);
        }
    }
);
module.exports = router;
