import { RequestHandler } from "express";
import createHttpError from "http-errors";
import MemoryModel from "../models/memories";

interface filterParams {
  jpn_text: string;
  cnzh_text: string;
}

export const getMemories: RequestHandler<
  unknown,
  unknown,
  unknown,
  filterParams
> = async (req, res, next) => {
  try {
    const jpn = req.query.jpn_text;
    const cnzh = req.query.cnzh_text;
    if (jpn) {
      const memories = await MemoryModel.find(
        { $text: { $search: jpn } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .exec();
      if (memories.length === 0) {
        res.status(200).json({ message: "No result" });
      } else {
        res.status(200).json({memories, total:memories.length});
      }
    } else if (cnzh) {
      const memories = await MemoryModel.find(
        { $text: { $search: cnzh } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .exec();
      if (memories.length === 0) {
        res.status(200).json({ message: "no result" });
      } else {
        res.status(200).json({memories, total:memories.length});
      }
    }
  } catch (error) {
    next(error);
  }
};
