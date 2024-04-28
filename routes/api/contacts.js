const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("./auth");
const Contact = require("../../models/contacts");

const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    favorite: Joi.boolean(),
});

const { updateStatusContact } = require("../../controllers/controllers");

router.use(auth);

router.get("/", async (req, res, next) => {
    try {
        const contacts = await Contact.find({ owner: req.user._id });
        res.json({ status: "success", code: 200, data: { contacts } });
    } catch (error) {
        next(error);
    }
});

router.get("/:contactId", async (req, res, next) => {
    try {
        const contact = await Contact.findOne({
            _id: req.params.contactId,
            owner: req.user._id,
        });
        if (contact) {
            res.json({ status: "success", code: 200, data: { contact } });
        } else {
            res.json({ status: "error", code: 404, message: "Not found" });
        }
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const value = await schema.validateAsync(req.body);
        const newContact = new Contact({ ...value, owner: req.user._id });
        await newContact.save();
        res.status(201).json({
            status: "success",
            code: 201,
            data: { newContact },
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:contactId", async (req, res, next) => {
    try {
        const contact = await Contact.findOneAndDelete({
            _id: req.params.contactId,
            owner: req.user._id,
        });
        if (contact) {
            res.json({
                status: "success",
                code: 200,
                message: "Contact deleted",
            });
        } else {
            res.json({ status: "error", code: 404, message: "Not found" });
        }
    } catch (error) {
        next(error);
    }
});

router.delete("/:contactId", async (req, res, next) => {
    try {
        const contact = await Contact.findOneAndDelete({
            _id: req.params.contactId,
            owner: req.user._id,
        });
        if (contact) {
            res.json({
                status: "success",
                code: 200,
                message: "Contact deleted",
            });
        } else {
            res.json({ status: "error", code: 404, message: "Not found" });
        }
    } catch (error) {
        next(error);
    }
});

router.patch("/contacts/:id/favorite", async (req, res, next) => {
    const { id } = req.params;
    const { favorite } = req.body;
    try {
        if (!favorite) {
            return res.status(400).json({ message: "Missing field favorite" });
        }
        const result = await updateStatusContact({ id, favorite });
        if (!result) {
            next();
        } else {
            res.json(result);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
