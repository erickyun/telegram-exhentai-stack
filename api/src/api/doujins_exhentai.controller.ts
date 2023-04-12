import express from "express";
import { getDoujin, getRandomDoujin } from "../libs/sources/exhentai";
import { validateAndParseTags } from "../libs/utils";
import doujin_exhentaiModel, {
  IDoujinExhentai,
} from "../models/doujin_exhentai.model";
const router = express.Router();

/**
 * Fetch all doujins
 */
router.get("/", async (_, res) => {
  const doujins = await doujin_exhentaiModel.find();
  res.json(doujins);
});

/**
 * Fetch doujins count
 */
router.get("/count", async (req, res) => {
  const count = await doujin_exhentaiModel.countDocuments();
  res.json({ count });
});

router.get("/exists/:id", async (req, res) => {
  const doujin = await doujin_exhentaiModel.findOne({
    doujin_id: req.params.id,
  });
  res.json({ exists: doujin ? true : false });
});

/**
 * Fetch doujin by _id or doujin_id
 */
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  let doujin;
  if (!id) res.send("No id provided").status(400);
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    doujin = await doujin_exhentaiModel.findById(req.params.id);
  } else {
    doujin = await doujin_exhentaiModel.findOne({ doujin_id: req.params.id });
  }
  res.json(doujin);
});

router.post("/", async (req, res) => {
  const doujin = req.body;
  if (!doujin) res.json({ message: "No doujin provided" }).status(400);
  const newDoujin = await doujin_exhentaiModel.create(doujin);
  res.json(newDoujin);
});

/**
 * Create a new doujin
 */
router.post("/get", async (req, res) => {
  const url = req.body.url;
  if (!url) res.json({ message: "No url provided" }).status(400);
  try {
    const doujin = await getDoujin(url);
    res.json(doujin);

  } catch (error: any) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
});

router.post("/random", async (req, res) => {
  const tags = req.body.tags;
  try {
    if (!tags) {
      const doujin = await getRandomDoujin("");
      res.json(doujin);
      return;
    }
    const tagsString = validateAndParseTags(tags);
    const doujin_url = await getRandomDoujin(tagsString);
    res.json(doujin_url);

  } catch (error: any) {
    if (error.name === "InvalidTagFormatError") {
      res.status(422).json({
        message: "Validation failed. Check validation errors for details.",
        errors: {
          tags: {
            message: "Invalid tags format",
          },
        },
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
 * Update a doujin
 */
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) res.send("No id provided").status(400);
  let updateResult;

  try {
    const updatedDoujin = req.body as IDoujinExhentai;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      updateResult = await doujin_exhentaiModel.updateOne(
        { _id: req.params.id },
        updatedDoujin
      );
    } else {
      updateResult = await doujin_exhentaiModel.updateOne(
        { doujin_id: req.params.id },
        updatedDoujin
      );
    }
    res.json(updateResult);
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
 * Delete a doujin
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleteResult = await doujin_exhentaiModel.deleteOne({
      _id: req.params.id,
    });
    res.json(deleteResult);
  } catch (error: any) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
});

export default router;
