const express = require("express");
const admin = require("firebase-admin");
const cookieParser = require("cookie-parser");
const serviceAccount = require("./serviceAccountKey.json");
const app = express();
const expressLayout = require("express-ejs-layouts");
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(expressLayout);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/savecookie", (req, res) => {
  const Idtoken = req.query.Idtoken;

  savecookie(Idtoken, res);
});

// saving cookies and verify cookies

function savecookie(token, res) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin
    .auth()
    .createSessionCookie(token, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie("session", sessionCookie, options);
        console.log("======>", sessionCookie);
        admin
          .auth()
          .verifyIdToken(token)
          .then(function (decode) {
            res.redirect("/dashboard");
          });
      },
      (error) => {
        res.status(401).send("UnAuthorised Request");
      }
    );
}
app.listen(port, () => {
  console.log(`server running on ${port}`);
});
