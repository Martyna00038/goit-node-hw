const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("./auth");
const Contact = require("../models/contacts");

const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    favorite: Joi.boolean(),
});

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
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const newContact = new Contact({ ...value, owner: req.user._id });
        await newContact.save();
        res.status(201).json({
            status: "success",
            code: 201,
            data: { newContact },
        });
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

router.put("/:contactId", async (req, res, next) => {
    try {
        const value = schema.validate(req.body);
        const contact = await Contact.findOneAndUpdate(
            { _id: req.params.contactId, owner: req.user._id },
            value,
            { new: true }
        );
        if (contact) {
            res.json({
                status: "success",
                code: 200,
                data: { updatedContact },
            });
        } else {
            res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
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
