require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");
const QRCode = require("qrcode");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let db;
let usersCollection;
let pdfCollection;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URL);
    db = client.db();
    usersCollection = db.collection("users");
    pdfCollection = db.collection("pdfs");
    console.log("? MongoDB Connected Successfully");
  } catch (error) {
    console.error(`? MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const setupAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin@12345";

    const adminExists = await usersCollection.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("\n? Admin already exists");
      console.log(`   Email: ${adminExists.email}`);
      return;
    }

    const admin = {
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      createdAt: new Date(),
    };

    await usersCollection.insertOne(admin);
    console.log("\n? Admin created successfully");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);
  } catch (error) {
    console.error(`? Error creating admin: ${error.message}`);
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "PDF Management API is running...",
  });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await usersCollection.findOne({ email, role: "admin" });

    if (user && user.password === password) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        message: "Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "pdfs",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const encodeId = (id) => {
  return Buffer.from(id.toString())
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const generateShortId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

const decodeId = (encodedId) => {
  let base64 = encodedId.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
};

app.post("/api/pdf/upload", upload.single("pdf"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No PDF file uploaded" });

    const result = await uploadToCloudinary(file.buffer);

    const pdfDoc = {
      pdfUrl: result.secure_url,
      createdAt: new Date(),
    };

    const insertResult = await pdfCollection.insertOne(pdfDoc);
    const encodedId = generateShortId();

    const displayLink = `https://dakhila-ldtax-gov-bd-print.lat/print/${encodedId}`;
    const actualLink = `${process.env.FRONTEND_URL}/print/${encodedId}`;

    const qrCodeData = await QRCode.toDataURL(displayLink);

    await pdfCollection.updateOne(
      { _id: insertResult.insertedId },
      {
        $set: {
          qrCode: qrCodeData,
          encodedId: encodedId,
          actualLink: actualLink,
          displayLink: displayLink,
        },
      },
    );

    res.json({
      message: "PDF uploaded successfully",
      pdfUrl: result.secure_url,
      qrCode: qrCodeData,
      viewLink: actualLink,
      displayLink: displayLink,
      encodedId: encodedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/print/:encodedId", async (req, res) => {
  try {
    const encodedId = req.params.encodedId;
    const redirectUrl = `${process.env.FRONTEND_URL}/print/${encodedId}`;
    res.redirect(301, redirectUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/pdf/all", async (req, res) => {
  try {
    const pdfs = await pdfCollection.find({}).sort({ createdAt: -1 }).toArray();

    res.json({
      message: "PDFs fetched successfully",
      count: pdfs.length,
      pdfs: pdfs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/pdf/:encodedId", async (req, res) => {
  try {
    const encodedId = req.params.encodedId;
    const decodedId = decodeId(encodedId);

    const result = await pdfCollection.deleteOne({
      _id: new ObjectId(decodedId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.json({
      message: "PDF deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/pdf/:encodedId", async (req, res) => {
  try {
    const encodedId = req.params.encodedId;

const pdf = await pdfCollection.findOne({
  encodedId: encodedId,
});

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.json({
      pdfUrl: pdf.pdfUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, async () => {
    console.log(`\n?? Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`\n?? Admin Setup:`);
    await setupAdmin();
    console.log(`\n? Server is ready!`);
  });
};

startServer();