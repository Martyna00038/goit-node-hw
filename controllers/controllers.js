const Contact = require("../models/contacts");

const getAllContact = async (query) => {
    return Contact.find(query);
};

const getOneContact = async (id) => {
    return Contact.findById(id);
};

const createContact = async (body) => {
    return Contact.create(body);
};

const updateContact = async (id, body) => {
    return Contact.findByIdAndUpdate(id, body, {
        new: true,
    });
};

const removeContact = async (id) => {
    return Contact.findByIdAndRemove(id);
};

const updateStatusContact = async (id, favorite) => {
    return Contact.findByIdAndUpdate(
        id,
        { favorite },
        {
            new: true,
        }
    );
};

module.exports = {
    getAllContact,
    getOneContact,
    createContact,
    updateContact,
    removeContact,
    updateStatusContact,
};
