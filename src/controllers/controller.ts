import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose, { ObjectId } from "mongoose";
import StaffModel from "../models/staff";

interface filterParams {
  name:string;
}
export const getStaffs: RequestHandler<unknown,unknown,unknown,filterParams> = async (req, res, next) => {
  try {
    const name = req.query.name;
    if (name) {
      const staff = await StaffModel.find({
        name: new RegExp(name, "i"),
      });
      if (!staff) throw Error("No users exist");
      res.json(staff);
    } else {
      const staffs = await StaffModel.find().exec();
      if (!staffs) {
        throw Error("there are no any staffs");
      }
      res.status(200).json(staffs);
    }
  } catch (error) {
    next(error);
  }
};

export const getStaff: RequestHandler = async (req, res, next) => {
  const staffid = req.params.staffid;

  try {
    if (!mongoose.isValidObjectId(staffid)) {
      throw createHttpError(400, "Invaild Staff ID");
    }
    const staff = await StaffModel.findById(staffid).exec();
    if (!staff) {
      throw createHttpError(404, "there is no fucking such person!");
    }
    res.status(200).json(staff);
  } catch (error) {
    next(error);
  }
};

interface CreateStaffBody {
  id?: number;
  name?: string;
  post?: string;
}
export const createStaff: RequestHandler<
  unknown,
  unknown,
  CreateStaffBody,
  unknown
> = async (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const post = req.body.post;
  try {
    if (!id || !name || !post) {
      throw createHttpError(400, "must input id, name and post");
    }
    const newStaff = await StaffModel.create({
      id: id,
      name: name,
      post: post,
    });
    res.status(201).json(newStaff);
  } catch (error) {
    next(error);
  }
};

interface updateStaffParams {
  staffid: string;
}

interface updateStaffBody {
  id?: number;
  name?: string;
  post?: string;
}

export const updateStaff: RequestHandler<
  updateStaffParams,
  unknown,
  updateStaffBody,
  unknown
> = async (req, res, next) => {
  const staffid = req.params.staffid;
  const newid = req.body.id;
  const newname = req.body.name;
  const newpost = req.body.post;
  try {
    if (!mongoose.isValidObjectId(staffid)) {
      throw createHttpError(400, "Invaild Staff ID");
    }
    if (!newid || !newname || !newpost) {
      throw createHttpError(
        400,
        "wanna update you must input id, name and post"
      );
    }
    const staff = await StaffModel.findById(staffid).exec();
    if (!staff) {
      throw createHttpError(404, "there is no fucking such person!");
    }
    staff.id = newid;
    staff.name = newname;
    staff.post = newpost;

    const UpdatedStaff = await staff.save();

    res.status(200).json(UpdatedStaff);
  } catch (error) {
    next(error);
  }
};

interface PaginationParams {
  page:string;
  pageSize:string;
}

interface PageBody {
  totalCount:number;
  pageCount:number;
  data:any
}
export const getPagination: RequestHandler<unknown,PageBody,unknown,PaginationParams> = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  if(page < 1 ) {
    res.redirect('?page=1')
  }
  const pageSize = parseInt(req.query.pageSize) || 1;
  if(pageSize < 1 ) {
    res.redirect('?pageSize=1')
  }
  const skipIndex = (page - 1) * pageSize;

  try {
    const totalCount = await StaffModel.countDocuments();
    const data = await StaffModel.find()
    .sort({_id:1})
    .skip(skipIndex)
    .limit(pageSize)
    res.status(200).json({
      totalCount,
      pageCount:pageSize,
      data
    })

  } catch (error) {
    next(error);
  }
}