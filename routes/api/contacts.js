const express = require("express");
const router = express.Router();
const Joi = require("joi");

const {
    listContacts,
    getContactById,
    removeContact,
    addContact,
} = require("../../models/contacts.js");

const contactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
});

router.get("/", async (req, res, next) => {
    try {
        const contacts = await listContacts();
        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
});

router.get("/:contactId", async (req, res, next) => {
    try {
        const contact = await getContactById(req.params.contactId);
        if (contact) {
            res.status(200).json(contact);
        } else {
            res.status(404).json({ message: "Not found" });
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
        const newContact = await addContact(req.body);
        res.status(201).json(newContact);
    } catch (error) {
        next(error);
    }
});

router.delete("/:contactId", async (req, res, next) => {
    try {
        const contact = await getContactById(req.params.contactId);
        if (!contact) {
            return res.status(404).json({ message: "Not found" });
        }
        await removeContact(contactId);
        res.status(200).json({ message: "Contact deleted" });
    } catch (error) {
        next(error);
    }
});

router.put("/:contactId", async (req, res, next) => {
    try {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: "Missing fields" });
        }
        const contact = await getContactById(req.params.contactId);
        if (!contact) {
            return res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
