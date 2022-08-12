//to run the app in development mode, we still use index.js

//to avoid duplicacy import app.js
import app from "./app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("server is up on " + port);
});
