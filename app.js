const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const https = require("https");
const mongoose = require("mongoose");
const _ = require("lodash")
const dotenv = require("dotenv");

dotenv.config();
mongoose.connect(process.env.mongoDBPass.toString(), {useNewUrlParser: true});

const PORT = process.env.PORT || 3000;

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

const postSchema = new mongoose.Schema({
    title: String,
    imageUrl: String
}, {versionKey: false});

const Post = mongoose.model("Post", postSchema);

io.on('connection', (socket) => {
    console.log("A new user has been connected to the server!");

    socket.on('filter', (filter) => {
        const allowedPosts = [];

        Post.find(function(err, posts) {
            if(!err) {
                posts.forEach(post => {
                    if(_.lowerCase(post.title).includes(_.lowerCase(filter))) {
                        allowedPosts.push(post);
                    }

                });
            }
            socket.emit('displayPosts', allowedPosts);
        });
    });
})



app.get("/", function(req, res) {
    Post.find(function(err, posts) {
        if(!err) {
            res.render("index.ejs", {posts: posts});
        } else {
            res.sendStatus(404);
        }
    });
});

app.post("/add", function(req, res) {
    const imageLabel = req.body.imageLabel;
    const imageLink = req.body.imageLink;
    const newId = new mongoose.Types.ObjectId();

    downloadImage(imageLink, `public/images/${newId}.png`).then((value) => {
        if(value != 'Error') {
            console.log("Image added successfully");

            const newPost = new Post({
                _id: newId,
                title: imageLabel,
                imageUrl: newId + ".png"
            });
        
            newPost.save();
            res.redirect("/");
        }
    });

    
});

app.post("/delete", function(req, res) {
    const passwordEntered = req.body.password;
    const postId = req.body.button;

    if(passwordEntered === adminPass) {
        Post.deleteOne({_id: postId}, function(err) {
            if(!err) {
                console.log("Deleting an image...");
            } else {
                console.log("There was an error deleting an image!");
            }
        });
        fs.unlinkSync(path.join(__dirname, 'public', 'images', postId + '.png'));
    } else {
        console.log("Nope");
    }

    res.redirect("/");
});


function downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
        req = https.get(url, function(res) {
            if(res.statusCode == 200) {
                res.pipe(fs.createWriteStream(filePath))
                    .on('error', () => resolve("Error"))
                    .once('close', () => resolve(filePath));
            } else {
                res.resume();
                resolve('Error');
            }
        });

        req.on('error', function(e) {
            resolve("Error");
        })
    });
}


http.listen(PORT, function() {
   console.log("Listening on port " + PORT); 
});