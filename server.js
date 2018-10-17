var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


// Require all models
// var db = require("./models");
var db = mongoose.connection;

var Note = require("./models/Note");
var Article = require("./models/Article");

var bodyParser = require("body-parser");

// Scraping Tools
var axios = require("axios");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Middleware Configuration

// Morgan logger used to log equests
app.use(logger("dev"));
// Parses request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(bodyParser.urlencoded({extended: false}));

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/chicago-tribune-scraped", { useNewUrlParser: true });


// Routes
app.get("/", function(req, res) {
	Article.find({}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("placeholder", {message: "No articles are scraped yet."});
		}
		else{
			res.render("index", {articles: data});
		}
	});
});

// GET route that scrapes the Chicago Tribune trending headlines section
app.get("/scrape", function(req, res) {
  // Grabs the body of the html with axios

  axios.get("http://www.chicagotribune.com/news/trending").then(function(response) {

    var $ = cheerio.load(response.data);

    $("li.trb_outfit_group_list_item").each(function(i, element) {
      // Save an empty results object
      var results = [];
      console.log(results)

      // Add the text and href of every link, and save them as properties of the results object
      var title = $(element).children().find(".trb_outfit_relatedListTitle").text().trim();
      var summary = $(element).find(".trb_outfit_group_list_item_brief").text().trim();
      var image = $(element).find("img").attr("data-baseurl");
      var link = $(element).find("a").attr("href");

      if (title && link) {
        results.push({
          title: title,
          summary: summary,
          image: image,
          link: ("http://www.chicagotribune.com") + link
        });
      }

      // Create a new Article using the `results` object built from scraping
      Article.create(results)
        .then(function(dbArticle) {
          // View the added results in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    //After a successful scrape, redirects to the main page
    res.redirect("/");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Saves Articles
app.post("/save/:id", function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		if (data.saved) {
			Article.findByIdAndUpdate(req.params.id, {$set: {saved: false}}, {new: true}, function(err, data) {
				res.redirect("/");
			});
		}
		else {
			Article.findByIdAndUpdate(req.params.id, {$set: {saved: true}}, {new: true}, function(err, data) {
				// res.redirect("/");
			});
		}
	});
});

//Finds saved articles
app.get("/saved", function(req, res) {
	Article.find({saved: true}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("placeholder", {message: "There are no saved articles."});
		}
		else {
			res.render("saved", {saved: data});
		}
	});
});

//Clears all articles
app.post("/articles/clear", function(req, res) {
  Article.remove({}, function(err) {
    console.log('collection removed')
  })
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
     res.redirect("/");
    }
  });
});

// Delete an article
app.post("/articles/delete/:id", function(req, res) {
  // Use the article id to find and update its saved boolean
  Article.findOneAndUpdate({ "_id": req.params.id }, {saved: false})
  // Execute the above query
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.send(doc);
    }
  });
});

// Creates a new note
app.post("/note/save/:id", function(req, res) {
  // Create a new note based on req.body.text
  var newNote = new Note({
    body: req.body.text,
    // article: req.params.id
  });
  console.log(req.body)
  // Saves note to database
  newNote.save(function(error, note) {
    if (error) {
      console.log(error);
    }
    else {

      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "note": note } })
      .exec(function(err) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        else {
          res.send(note);
        }
      });
    }
  });
});

// Delete Notes
app.post("/note/delete/:id", function(req, res) {
  Note.findOneAndUpdate({ "_id": req.params.id }, {"body": []})
  Article.findOneAndUpdate({ "_id": req.params.id }, {"note": []})

  .exec(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    else {
      res.send(doc);
    }
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});