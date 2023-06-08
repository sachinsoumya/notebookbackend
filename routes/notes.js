const { Router } = require('express');
const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');


//ROUTE 1: Get all the notes using : GET "api/notes/fetchallnotes"
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})


//ROUTE 2: Add a new note using : POST "api/notes/addnote"
router.post('/addnote', fetchuser, [
    body('title', 'enter a valid email').isLength({ min: 3 }),
    body('description', 'description must be atleast  characters').isLength({ min: 5 }),]
    , async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            //If there are errors return bad request and errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const notes = new Notes({
                title, description, tag, user: req.user.id

            })
            const savedNotes = await notes.save()
            res.json(savedNotes)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");

        }
    })
//ROUTE 4:Update an existing Note using:PUT "api/notes/updatenote".Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        //create a newnote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note and updated
        let note = await Notes.findById(req.params.id);
        if (!note) { res.status(404).send("Not found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");

        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");

    }
})



//ROUTE 3:Delete an existing Note using:POST "api/notes/deletenote".Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    //const{title,description,tag} = req.body;
    try {



        //find the note and deleted
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found") }

        //Allow deletion on if the user owns it.
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");

        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note is successfully deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");

    }


})

module.exports = router