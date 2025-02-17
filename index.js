const express = require('express');
const app = express();

const path = require('path');
const usermodel = require("./models/user.js");
const cookieParser = require('cookie-parser');
const { REFUSED } = require('dns');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const post = require('./models/post.js');
const postmodel = require('./models/post.js');


const upload = require('./config/multerconfig.js');
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));  
app.use(cookieParser());

app.get("/", (req, res) => {
    res.render("index");
   
})
app.get("/login",(req,res)=>{
    res.render('login.ejs');
});

app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    let users = await usermodel.findOne({email});
    
    if(users) {

        bcrypt.compare(password, users.password, (err, result) => {
            
            if(result){
                
                let token = jwt.sign({ email: email, userid: users.id }, "secretekey");
                res.cookie("token", token);
                
                res.redirect("/profile");
            } 

        });
     }

            else {
            res.redirect("/login");
        }
        });



app.get("/profile", isloggedin, async (req, res) => {
    
    let userdata = await usermodel.findOne({email:req.user.email}).populate("posts");
    res.render("profile",{userdata});
    
        

});
app.get("/profilepic",isloggedin, async (req, res) => {
    let userdata = await usermodel.findOne({email:req.user.email});
    res.render("profilepic",{userdata});
});
app.post("/profilepic",isloggedin,upload.single("profilepic"), async (req, res) => {
 let user = await usermodel.findOne({email:req.user.email}); 
 user.profilepic = req.file.filename;
 user.save();
    res.redirect("/profile");                          
});

app.get("/like/:id", isloggedin, async (req, res) => {
    try {
        let postdata = await postmodel.findOne({ _id: req.params.id }).populate("user");
        
        if (postdata.likes.indexOf(req.user.userid) === -1) {
            postdata.likes.push(req.user.userid);
         
        } else {
         postdata.likes.splice(postdata.likes.indexOf(req.user.userid), 1);
        } 
        await postdata.save();
        res.redirect("/profile");
    }
        catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
}
);


app.get("/edit/:id", isloggedin, async (req, res) => {
    let { id } = req.params;
    let post = await postmodel.findById(id);
    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.render("edit",{post});
});
app.post("/edit/:id", isloggedin, async (req, res) => {
    let { id } = req.params;
    let { content } = req.body;
    let post = await postmodel.findById(id);
    if (!post) {
        return res.status(404).send("Post not found");
    }
    post.content = content;
    await post.save();
    res.redirect("/profile");
});


app.post("/post", isloggedin, async (req, res) => {
    
    let users= await usermodel.findOne({email:req.user.email})
 let {content} =  req.body;
    
          let post = await postmodel.create({
            user : users._id,
             content
            });
        
    users.posts.push(post._id);
    await users.save();
    res.redirect('/profile');
    
    });
    app.get("/delete/:id", isloggedin, async (req, res) => {
        let { id } = req.params;
        let post = await postmodel.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).send("Post not found");
        }
      
        res.redirect("/profile");
    });

app.post("/register", async (req, res) => { 
    let { username, name, age, email, password } = req.body;
    let users = await usermodel.findOne({ email });  
    if(users) 
        {return res.status(500).send("user already registered");
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                let newuser = await usermodel.create({ username, name, age, email, password: hash });
                let token = jwt.sign({ email: email, userid: newuser._id }, "secretekey");
                res.cookie("token", token);
                res.redirect("/login");
            });
            
        });
    } 
);


app.get('/logout',(req,res)=>{
res.cookie("token","")
    res.redirect('/login');
});


function isloggedin(req, res, next) {
    if (!req.cookies.token) {
        res.redirect("/login");
    } else {
        jwt.verify(req.cookies.token, "secretekey", (err, decoded) => {
            if (err) {
                res.redirect("/login");
            } else {
                req.user = decoded;
                next();
            }
        });
    }
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));