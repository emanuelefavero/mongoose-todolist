const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');

const app = express();

// BODY PARSER NOW INCLUDED IN EXPRESS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// USE public DIRECTORY
app.use(express.static('public'));

// MONGOOSE LIST ITEMS
mongoose.connect('mongodb://localhost:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
    name: String,
});
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: 'Welcome to your todolist!',
});

const item2 = new Item({
    name: 'Hit the + button to add a new item',
});

const item3 = new Item({
    name: '<-- Hit this to delete an item',
});

const defaultItems = [item1, item2, item3];

// GET
app.get('/', (req, res) => {
    const day = date.getDate();

    // NODEMON FIND + EJS RENDER
    Item.find((err, foundItems) => {
        if (err) throw err;

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) throw err;
                console.log('Successfully added default items on DB.');
            });
            res.redirect('/');
        } else {
            // EJS USES THE view DIRECTORY
            res.render('list.ejs', {
                listTitle: day,
                items: foundItems,
                // newListItem: item,
            });
        }
    });
});

// POST
app.post('/', (req, res) => {
    const itemName = req.body.newItem;

    const newItem = new Item({
        name: itemName,
    });

    newItem.save();

    res.redirect('/');
});

// delete item post route handler
app.post('/delete', (req, res) => {
    // MONGOOSE DELETE CHECKED ITEM ON list.ejs FORM USING ITS _id
    const checkedItemId = req.body.checkbox;
    console.log(checkedItemId);
    Item.findByIdAndRemove(checkedItemId, (err) => {
        if (!err) {
            console.log('Successfully deleted checked item');
            res.redirect('/');
        }
    });
});

// PORT
const port = 3000; // localhost:3000
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
