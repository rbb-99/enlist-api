//for testing environment we need the express app before it can listen
//hence we duplicate original index.js to app.js w/o listening port
//and use app.js for testing

import express from "express";
import "./db/mongoose.js";
import userRouter from "./routers/user.js";
import taskRouter from "./routers/task.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

export default app;
