var mongoose = require("mongoose");


// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Creates a new UserSchema object using the Schema constructor to be put into MongodDB

var ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  saved: {
		type: Boolean,
		default: false
	},
  // `notes` stores a Note id
  // The ref property links the ObjectId to the Note model
  // Populates the Article with an associated Note
  note: [{
    // type: Schema.Types.ObjectId,
    // ref: "Note",
    
    body:  String
   
    // article: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Article"
    // }
  }]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
