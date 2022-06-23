require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");
const Book = require("./models/book");
const Library = require("./models/library");
const alert = require("alert");

const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(methodOverride("_method"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/index", (req, res) => {
  res.render("index", {success: ''});
});


app.get("/addbook", (req, res) => {
  Library.find((err, docs) => {
    if (!err) {
        res.render("addbook", {
            data: docs
        });
    } else {
        console.log('Failed to retrieve the Libraries: ' + err);
    }
});

});

app.get("/addlibrary", (req, res) => {
        res.render("addlibrary")
});


app.get('/liblist', (req, res) => {
      
  Library.find((err, docs) => {
      if (!err) {
          res.status(200)
          res.render("liblist", {
              data: docs
          });
      } else {
          console.log('Failed to retrieve the Libraries: ' + err);
      }
  });

});

app.get('/booklist', (req, res) => {

  Book.find({
    published_at: {
        $gte: "2022-04-12"
    }}, (err, docs) => {
      if (!err) {
          res.render("booklist", {
              list: docs
          }); 
      } else {
          console.log('Failed to retrieve the Book Title: ' + err);
      }
  });
  
});


app.post("/addbook", async (req, res) => {
  const { title, published_at, library, language } = req.body;
  if (!title || !published_at || !library || !language) {
    return alert("Please fill the details"),
            res.redirect("addbook");
    }
    try {
        const bookExist = await Book.findOne({ title: title });
          if (bookExist)
          { return alert("This Book is Already Exists."),
                      res.redirect("addbook") }
        const book = new Book({ title, published_at, library, language });
        const bookRegister = await book.save();
          if (bookRegister)
          { 
            res.render("index",{ success: 'Book Added Successfully!!!'}) }
     } catch (err) {
        console.log(err);  
     }
});



app.post("/addlibrary", async (req, res) => {
  const { name, author, opening_time, closing_time } = req.body;
  if (!name || !author || !opening_time || !closing_time) {
    return alert("Please fill the details"),
            res.redirect("addlibrary");
    }
    try {
        const libraryExist = await Library.findOne({ name: name });
          if (libraryExist)
          { return alert("This Library is Already Exists."),
                      res.redirect("addlibrary") }
        const library = new Library({ name, author, opening_time, closing_time });
        const libraryRegister = await library.save();
          if (libraryRegister)
          { res.render("index",{ success: 'Library Added Successfully!!!'}) }
     } catch (err) {
        console.log(err);  
     }
});




app.delete("/logout", (req, res) => {
  res.redirect('/');
});

app.get('/deletebook/:id', (req, res) => {
  Book.findByIdAndRemove(req.params.id, (err, doc) => {
      if (!err) {
          res.redirect('/booklist');
      }
      else { console.log('Error in delete :' + err); }
  });
});

app.get('/deletelib/:id', (req, res) => {
  Library.findByIdAndRemove(req.params.id, (err, doc) => {
      if (!err) {
          res.redirect('/liblist');
      }
      else { console.log('Error in delete :' + err); }
  });
});

const Port = 7000;

mongoose
  .connect("mongodb://localhost:27017/Login", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.listen(Port, () => {
      console.log(`Server is running on Port ${Port}`);
    });
  });
