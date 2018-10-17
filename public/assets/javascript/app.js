$(document).on("click", "#clear-articles", clearArticles);
$(document).on("click", "#delete-article", deleteArticle);
$(document).on("click", "#add-note", addNote);
$(document).on("click", "#delete-note", deleteNote);

function clearArticles(event) {
	event.preventDefault();

	$.post("/articles/clear/", function(data) {
	}).done(function(data) {
        window.location = "/"
    })
}

function deleteArticle(event) {
	event.preventDefault();
	var id = $(this).attr("data-id");
	$.post("/articles/delete/" + id, function(data) {
	}).done(function(data) {
        window.location = "/saved"
    })
}

function addNote(event) {
	event.preventDefault();
	var id = $(this).attr("data-id");
	if (!$("#note-input" + id).val()) {
        alert("Fill in a note before sumitting")
    }else {
      $.ajax({
            method: "POST",
            url: "/note/save/" + id,
            data: {
              text: $("#note-input" + id).val()
            }
          }).done(function(data) {
              console.log(data);
              // Clears Note Input
              $("#note-input" + id).val("");
             location.reload();
          });
    }
}

function deleteNote(event) {
	event.preventDefault();
	var id = $(this).attr("data-article-id");
	console.log(id)
	$.post("/note/delete/" + id, function(data) {
	}).done(function(data) {
        location.reload();
    })
}

// Materialize Modal
$(document).ready(function(){
    $('.modal').modal();
  });








