const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/ajay")
  .catch((err) => {
    console.log(err);
  })


const itemSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("ToDoList", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItem = [item1, item2, item3];


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItem) {
    // console.log(foundItem);
    if (foundItem.length === 0) {
      Item.insertMany(defaultItem, (err) => {
        if (err) {
          console.log(err);
          mongoose.connection.close();
        } else {
          console.log("Successfully added....");
          mongoose.connection.close();
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: foundItem });
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItems = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    newItems.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName},function(err,founName){
      founName.items.push(newItems);
      founName.save();
      res.redirect("/"+listName);
    })
  }

});

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("list", listSchema);

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  const listChecked = req.body.listName;

  if(listChecked === "Today")
  {
    Item.findByIdAndRemove(checkedItem, function (err) {
      if (err) {
        console.log(err);
        res.redirect("/");
      }
      else {
        console.log("Successfully deleted checked item.......");
        res.redirect("/");
      }
    });
  }
  else
  {
      List.findOneAndUpdate({name : listChecked},{$pull : {items :{_id : checkedItem}}},(err)=>{
        if (err) {
          console.log(err);
          res.redirect("/"+listChecked);
        }
        else {
          console.log("Successfully deleted checked item.......");
          res.redirect("/"+listChecked);
        }
      });
  }

  // res.redirect("/");

});


app.get("/:customListName", (req, res) => {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){

    // console.log(foundList);
    if(!err){
      if(!foundList){
        // create new document
        const list = new List({
          name: customListName,
          items: defaultItem
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        // show existing list
        res.render('list',{listTitle: customListName, newListItems: foundList.items})
      }
    }
  });

});

app.listen(4000, function () {
  console.log("Server started on port 4000");
});
