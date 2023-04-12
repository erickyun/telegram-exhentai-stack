import express from "express";
import { getRandomDoujin } from "../libs/sources/exhentai";
import log from "../models/log.model";
const router = express.Router();

/**
 * Fetch all logs
 */
router.get("/", async (req, res) => {
  const logs = await log.find();
  res.json(logs);
});

/**
 * Create a new log
 */
router.post("/", async (req, res) => {
  try {
    const newLog = await log.create(req.body);
    res.json(newLog);
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res.status(422).json({
        message: "Validation failed. Check validation errors for details.",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    }
  }
});

/**
 * Delete a log
 * @param id log id
 * */
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(422).json({
      message: "Validation failed. Check validation errors for details.",
      errors: {
        id: {
          message: "Invalid id",
        },
      },
    });
    return;
  }
  await log.findByIdAndDelete(id);
  res.send().status(200);
});

router.get("/test", async (req, res) => {
  const logs = await getRandomDoujin("+uncensored");
  res.json(logs);
});

router.delete("/", async (req, res) => {
  await log.deleteMany({});
  res.send().status(200);
});

export default router;
