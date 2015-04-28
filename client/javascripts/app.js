// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */
var main = function(toDoObjects) {
    "use strict";
    console.log("SANITY CHECK");
    var toDos = toDoObjects.map(function(toDo) {
        // we'll just return the description of this toDoObject
        return toDo.description;
    });

    $(".tabs a span").toArray().forEach(function(element) {
        var $element = $(element);

        // create a click handler for this element
        $element.on("click", function() {
            var $content, //Hold to-do lists.
                i; //Loop increment.

            $(".tabs a span").removeClass("active"); //Remove "active" class from all tags.
            $element.addClass("active"); //Make element have "active" class.
            $("main .content").empty(); //Delete all content from tabs.
            //"new" Tab
            if ($element.parent().is(":nth-child(1)")) {
                $content = $("<ul id='newList'>");
                for (i = toDos.length - 1; i >= 0; i--) {
                    $content.append($("<li>").text(toDos[i]));
                }
            } else if ($element.parent().is(":nth-child(2)")) { //"old" Tab
                $content = $("<ul id='oldList'>");
                toDos.forEach(function(todo) {
                    $content.append($("<li>").text(todo));
                });

            } else if ($element.parent().is(":nth-child(3)")) { //"Tag" Tab
                var tags = [];

                toDoObjects.forEach(function(toDo) {
                    toDo.tags.forEach(function(tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });
                console.log(tags);

                var tagObjects = tags.map(function(tag) {
                    var toDosWithTag = [];
                    toDoObjects.forEach(function(toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return {
                        "name": tag,
                        "toDos": toDosWithTag
                    };
                });

                console.log(tagObjects);

                tagObjects.forEach(function(tag) {
                    var $tagName = $("<h3>").text(tag.name),
                        $content = $("<ul id='tagList'>");
                    tag.toDos.forEach(function(description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $("main .content").append($tagName);
                    $("main .content").append($content);
                });

            } else if ($element.parent().is(":nth-child(4)")) { //"Add" Tab
                var $input = $("<input>").addClass("description"),
                    $inputLabel = $("<p>").text("Description: "),
                    $tagInput = $("<input>").addClass("tags"),
                    $tagLabel = $("<p>").text("Tags: "),
                    $button = $("<span>").text("Add");

                $button.on("click", function() {
                    var description = $input.val(),
                        tags = $tagInput.val().split(","), //Split on the comma.
                        newToDo = {
                            "description": description,
                            "tags": tags
                        };

                    $.post("todos", newToDo, function(result) { //Post to our todos route.
                        console.log(result);

                        //toDoObjects.push(newToDo);
                        toDoObjects = result;

                        // update toDos
                        toDos = toDoObjects.map(function(toDo) {
                            return toDo.description;
                        });
                        //Empty the input text fields after user submits.
                        $input.val("");
                        $tagInput.val("");
                    });
                    // Sending a Socket.IO message to the server when a ToDo item is added 
                    socket.emit("add", newToDo);
                });

                $content = $("<div>").append($inputLabel)
                    .append($input)
                    .append($tagLabel)
                    .append($tagInput)
                    .append($button);
            }

            $("main .content").append($content);

            return false;
        });
    });

    $(".tabs a:first-child span").trigger("click");

    /*Update clients' tabs (New,Old,Tag)*/
    var socket = io();
    socket.on("newToDO", function(data) {
        var $new = $("#newList"),
            $old = $("#oldList"),
            $tagTab = $("#tagList"),
            $myData = data.description,
            $myTag = data.tags,
            $newItem = $("<li>").text($myData).hide();
        //Sliding down new ToDo
        if (($new.length) > 0) {
            $new.prepend($newItem);
            $newItem.slideDown(500);
        } else if (($old.length) > 0) {
            $old.append($newItem);
            $newItem.slideDown(500);
        } else if (($tagTab.length) > 0) {
            $("main .content").append($("<h3>").text($myTag));
            $("main .content").append($newItem);
            $newItem.slideDown(500);
        }

        $.getJSON("todos.json", function(newToDoObjects) {
            toDoObjects = newToDoObjects;
            toDos = newToDoObjects.map(function(toDo) {
                return toDo.description;
            });
        });
    });
    // end Socket.io script
};

$(document).ready(function() {
    "use strict";
    $.getJSON("todos.json", function(toDoObjects) {
        main(toDoObjects);
    });
});