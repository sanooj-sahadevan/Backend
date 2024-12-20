import mongoose, { Model } from "mongoose";
import UserModel from "../models/userModel";
import AdminModel from "../models/adminModel";
import chatModel from "../models/chatModel";
import VendorModel from "../models/vendorModel";
import { Vendor } from "../interfaces/vendor";
import { Admin } from "../interfaces/admin";
import { Ichat } from "../interfaces/chat";
import { User } from "../interfaces/user";
import { Slot } from "../models/slotModel";
import { bookedModel } from "../models/bookedEvent";
import { Auditorium } from "../models/auditoriumModel";
import { Dishes } from "../models/dishesModel";

export class BaseRepository<T> {
    protected userModel: Model<User>;
    protected vendorModel: Model<Vendor>;
    protected adminModel: Model<Admin>;
    protected chatModel: Model<Ichat>;

    constructor(
        userModel: Model<User>,
        vendorModel: Model<Vendor>,
        adminModel: Model<Admin>,
        chatModel: Model<Ichat>
    ) {
        this.userModel = userModel;
        this.vendorModel = vendorModel;
        this.adminModel = adminModel;
        this.chatModel = chatModel;
    }





    async getAll() {
        try {
            return await this.vendorModel.find().sort({ createdAt: -1 }).exec();
        } catch (error:any) {
            throw new Error(error);

        }
    }


    async create(user: User): Promise<any> {
        try {

            const newUser = new UserModel(user);
            return await newUser.save();
        } catch (error:any) {
            throw new Error(error);

        }
    }


   
async userByEmail(email: string) {
    try {
        console.log('234567890');
        const user = await UserModel.findOne({ email, isBlocked: false }).exec();
        return user;
    } catch (error:any) {
        console.error('Error finding user by email:', error);
        throw new Error(error);
    }
}



    async userById(userId: string) {
        try {
            return UserModel.findById(userId);
        } catch (error:any) {
            throw new Error(error);

        }
    }

    async updateUserBase(email: string, update: Partial<User>) {
        try {
            return UserModel.findOneAndUpdate({ email }, update, { new: true });
        } catch (error:any) {
            throw new Error(error);
        }
    }

    async fetchAuditorium(vendorId: string): Promise<any | null> {
        const objectId = new mongoose.Types.ObjectId(vendorId);
        return await Auditorium.findById(objectId);
    }

    async findVendorBase(vendorId: string) {
        return await VendorModel.findById(vendorId);
    }
   


    async dishesById(dishesId: string) {
  try {
    console.log("Entering Base Repository Layer");
    const result = await Dishes.findById(dishesId);
    console.log('Result:', result);
    return result;
  } catch (error:any) {
    throw new Error(error);
}
}



}

export const baseRepo = new BaseRepository(
    UserModel,
    VendorModel,
    AdminModel,
    chatModel
);
