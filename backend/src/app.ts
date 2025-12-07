import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import rfpRoutes from "./routes/rfpRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import emailRoutes from "./routes/emailRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rfps", rfpRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/emails", emailRoutes);

export default app;
