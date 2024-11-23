import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import UserModel from "../models/userModel";
import { Dishes } from "../models/dishesModel";
import { Auditorium } from "../models/auditoriumModel";
import { bookedModel } from "../models/bookedEvent";
import { chatModel } from "../models/chatModel";
import { User } from '../interfaces/user';
import { VendorModel } from "../models/vendorModel";
import { IUserRepository } from "../interfaces/repository/userRepository";
import { messageModel } from "../models/messageModal";
import { Reviews } from "../models/reviews";
import { NotificationModel } from "../models/notificationModel";
import { ISlot } from "../interfaces/slot";
import { Slot } from '../models/slotModel';
import { BaseRepository } from "../Base Repository/BaseRepo";
import AdminModel from "../models/adminModel";



export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor() {
    super(UserModel, VendorModel, AdminModel, chatModel);
  }

  async getAllVendors() {
    return await this.getAll();
  }



  async createUser(user: User): Promise<any> {
    try {
      return await this.create(user)
    } catch (error) {
      throw new Error('Database Error');
    }
  }

  async findUserByEmail(email: string) {
    try {

      const user = await this.userByEmail(email);
      return user;
    } catch (error:any) {
      console.error('Error finding user by email:', error);
      throw new Error(error);
    }
  }

  async verifyAndSaveUserRepo(email: string, otp: string) {
    try {
      const user = await UserModel.findOne({ email, isBlocked: false }).exec();
      if (user && user.otp === otp) {
        user.otp = undefined;
        user.otpVerified = true;
        await user.save();
        return user;
      }
      throw new Error("Invalid OTP");
    } catch (error:any) {
      console.error('Error saving user:', error);
      throw new Error(error);
    }
  }

  async findUserById(userId: string) {
    try {
      return await this.userById(userId)
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async userEditFromDB(userDetails: User): Promise<User> {
    try {
      const existingUser = await UserModel.findOne({ email: userDetails.email });
      if (existingUser) {
        existingUser.username = userDetails.username;
        existingUser.phone = userDetails.phone;
        existingUser.profileImage = userDetails.profileImage;
        existingUser.address = userDetails.address;
        existingUser.state = userDetails.state;
        existingUser.district = userDetails.district;
        existingUser.pincode = userDetails.pincode;
        existingUser.reviews = userDetails.reviews;
        await existingUser.save();
        return existingUser;
      } else {
        const newUser = new UserModel(userDetails);
        await newUser.save();
        return newUser;
      }
    } catch (error:any) {
      throw new Error(error);

    }
  }


  async updateUser(email: string, update: Partial<User>) {
    try {
      return this.updateUserBase(email, update)
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async findUserByEmailupdate(email: string, password: string) {
    try {
      const user = await UserModel.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }
      console.log(user.email);
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
      return user;
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async fetchfromDBDishes(vendorId: string): Promise<any | null> {
    try {
      const objectId = new mongoose.Types.ObjectId(vendorId);
      const result = await Auditorium.find(objectId);
      return result;
    } catch (error:any) {
      throw new Error(error);

    }

  }




  async fetchfromDBAuditorium(vendorId: string): Promise<any | null> {
    try {
      return this.fetchAuditorium(vendorId)
    } catch (error:any) {
      throw new Error(error);

    }
  }



  async findVendor(vendorId: string) {
    try {
      return this.findVendorBase(vendorId)
    } catch (error:any) {
      throw new Error(error);

    }
  }


  async findVendorByIdInDb(vendorId: string, userId: string) {
    try {
      let chat = await chatModel.findOne({ userId, vendorId });
      if (!chat) {
        chat = new chatModel({
          userId,
          vendorId,
        });
        await chat.save();
      }
      return { chatId: chat._id };
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async findReviewByIdInDb(vendorId: string, userId: string) {
    try {
      console.log(vendorId, userId);

      console.log('repository revuw');

      const review = await Reviews.find({
        userId,
        vendorId,
        vendorVerified: true
      }).populate('userId')

      console.log(review);

      if (!review) {
        return { message: 'No review found' };
      }

      return { review }
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async findNotificationsByIdInDb(userId: any) {
    try {
      const notifications = await NotificationModel.find()
      // .populate('vendorId')
      // .populate('userId')
      return { notification: notifications };
    } catch (error:any) {
      throw new Error(error);

    }
  }





  async findFoodVendorIdInDb(vendorId: string) {
    try {


      const objectId = new mongoose.Types.ObjectId(vendorId);
      const result = await Dishes.find({ vendorId: objectId, isDeleted: false });

      return result;
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async findAuditoriumVendorIdInDb(vendorId: string) {
    try {
      const objectId = new mongoose.Types.ObjectId(vendorId);

      const result = await Auditorium.find({ vendorId: objectId, isDeleted: false });
      return result
    } catch (error:any) {
      throw new Error(error);

    }
  }


  async findAuditoriumByIdInDb(auditoriumId: string) {

    try {
      let result = await Auditorium.findById(auditoriumId);
      return result
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async finddishesByIdInDb(dishesId: string) {
    console.log('thenkasi');

    try {
      console.log('Entering Repository Layer');
      const result = await this.dishesById(dishesId);
      return result;
    } catch (error:any) {
      throw new Error(error);

    }
  }


  async getBookingDetail(id: string) {
    try {

      const bookedData = await bookedModel
        .findById(id)
      return bookedData;
    } catch (error:any) {
      throw new Error(error);

    }
  }







  async updateBookingStatus(bookingData: any) {
    try {
      const { txnid, status, StartingDate, EndingDate, vendorId } = bookingData;
      const bookings = await bookedModel.find({ txnId: txnid });
      console.log(bookings, 'liston');

      if (bookings.length > 1) {
        const [firstBooking, ...duplicateBookings] = bookings;
        await bookedModel.deleteMany({ _id: { $in: duplicateBookings.map(b => b._id) } });
        console.log(`Deleted ${duplicateBookings.length} duplicate bookings for txnid: ${txnid}`);

        firstBooking.paymentStatus = 'success';
        await firstBooking.save();
        console.log('Booking updated successfully:', firstBooking);

        await this.updateSlotAvailability(firstBooking.StartingDate, firstBooking.EndingDate, vendorId);
        return firstBooking;
      } else if (bookings.length === 1) {
        const booking = bookings[0];
        booking.paymentStatus = 'success';
        await booking.save();
        console.log('Booking updated successfully:', booking);

        await this.updateSlotAvailability(booking.StartingDate, booking.EndingDate, vendorId);
        return booking;
      } else {
        const newBooking = await bookedModel.create({
          txnId: txnid,
          paymentStatus: status,
          ...bookingData,
          createdAt: new Date(),
        });
        console.log('New booking created:', newBooking);

        await this.updateSlotAvailability(newBooking.StartingDate, newBooking.EndingDate, vendorId);
        return newBooking;
      }
    } catch (error:any) {
      throw new Error(error);

    }
  }





  async updateSlotAvailability(startingDate: Date, endingDate: Date, vendorId: string) {
    try {
      const startTimestamp = startingDate.getTime();
      const endTimestamp = endingDate.getTime();

      const availableSlots = await Slot.find({
        vendorId: vendorId,
        date: {
          $gte: new Date(Math.min(startTimestamp, endTimestamp)),
          $lte: new Date(Math.max(startTimestamp, endTimestamp))
        },
        isAvailable: true,
      });

      if (availableSlots.length > 0) {
        await Slot.updateMany(
          {
            _id: { $in: availableSlots.map(slot => slot._id) },
          },
          { isAvailable: false }
        );
        console.log(`Updated ${availableSlots.length} slots to unavailable.`);
      } else {
        console.log('No available slots found for the given dates.');
      }
    } catch (error:any) {
      throw new Error(error);

    }
  }








  async savechatDB(chat: string) {
    try {
      const newChat = new chatModel({ message: chat });
      return await newChat.save();
    } catch (error:any) {
      throw new Error(error);

    }
  }


  async findDetailsByUserId(userId: string) {
    try {
      const results = await bookedModel
        .find({ userId: userId, paymentStatus: "success" })
        .populate('dishesId')
        .populate('userId')
        .populate('vendorId')
        .populate('auditoriumId');
      return results;
    } catch (error:any) {
      throw new Error(error);

    }
  }


  async changepassword(userId: string, newPassword: string) {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await user.save();
      return user;
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async updatePasswordInDatabase(email: string, hashedPassword: string) {
    const user = await UserModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  };

  async chatDB(userId: string) {
    try {
      const chats = await chatModel.find({ userId }).select('_id');
      return chats;
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async messageDB(chatIds: string[]) {
    try {
      const unreadCount = await messageModel.countDocuments({
        chatId: { $in: chatIds },
        senderModel: "Vendor",
        isRead: false,
      });

      return unreadCount;
    } catch (error:any) {
      throw new Error(error);

    }
  }




  async reviewRepository(reviewData: { reviews: string; stars: number; userId: string; vendorId: string }): Promise<any> {
    try {
      console.log('reviewRepository');

      const review = new Reviews(reviewData);

      const savedReview = await review.save();
      console.log("Review saved:", savedReview);

      return savedReview;
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async getReviewsByVendorId(vendorId: string): Promise<any[]> {
    console.log('getReviewsByVendorId');

    try {
      const reviews = await Reviews.find({
        vendorId: vendorId,
        vendorVerified: true
      });

      console.log(reviews);
      return reviews;
    } catch (error:any) {
      throw new Error(error);

    }
  }




  async updateVendorRating(vendorId: string, averageRating: number): Promise<any | null> {
    console.log('updateVendorRating', averageRating, vendorId);

    try {
      const updatedVendor = await VendorModel.findByIdAndUpdate(
        vendorId,
        { rating: averageRating },
        { new: true }
      );
      return updatedVendor;
    } catch (error:any) {
      throw new Error(error);

    }
  }

  async getSlotsByWorkerIdFromRepo(vendorId: string): Promise<ISlot[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return await Slot.find({
        vendorId,
        isAvailable: true,
        date: { $gte: today },
      }).exec();
    } catch (error:any) {
      throw new Error(error);

    }
  }


  async saveBooking(bookingData: any): Promise<any> {
    try {
      console.log('Booking Data:', bookingData);
  
      // Convert udf4 and udf7 into Date objects
      const startDate = new Date(bookingData.udf4);
      const endDate = new Date(bookingData.udf7);
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format for udf4 or udf7');
      }
  
      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);
  
      const formattedStartDate = startDate.toISOString().split('T')[0];
      console.log('Formatted Start Date:', formattedStartDate);
  
      // Check if the slot is already booked
      const availableSlot = await bookedModel
        .findOne({
          vendorId: bookingData.productinfo,
          paymentStatus: "success",
          StartingDate: startDate,
        })
        .exec();
  
      console.log('Available Slot:', availableSlot);
  
      if (availableSlot) {
        throw new Error('The selected dates are already booked.');
      }
  
      const newBooking = new bookedModel({
        vendorId: bookingData.productinfo,
        userId: bookingData.udf1,
        totalAmount: bookingData.amount,
        paymentType: "online",
        paymentStatus: bookingData.paymentStatus,
        txnId: bookingData.txnid || null,
        StartingDate: startDate,
        EndingDate: endDate,
        eventType: bookingData.udf6,
        category: bookingData.udf5,
        occupancy: bookingData.occupancy,
        dishesId: bookingData.udf3 !== "nil" ? bookingData.udf3 : null,
        auditoriumId: bookingData.udf2 !== "nil" ? bookingData.udf2 : null,
      });
  
      const savedBooking = await newBooking.save();
  
      console.log('Booking saved successfully:', savedBooking);
      return savedBooking;
  
    } catch (error:any) {
      throw new Error(error);

    }
  }
  





  // async saveBooking(bookingData: any): Promise<any> {
  //   try {
  //     console.log('sanooj');
  //     const newBooking = new bookedModel({
  //       vendorId: bookingData.productinfo,
  //       userId: bookingData.udf1,
  //       totalAmount: bookingData.amount,
  //       paymentType: "online",
  //       paymentStatus: bookingData.paymentStatus,
  //       txnId: bookingData.txnid || null,
  //       StartingDate: bookingData.udf4,
  //       EndingDate: bookingData.udf7,
  //       eventType: bookingData.udf6,
  //       category: bookingData.udf5,
  //       occupancy: bookingData.occupancy,
  //       dishesId: bookingData.udf3 !== "nil" ? bookingData.udf3 : null,
  //        auditoriumId: bookingData.udf2 !== "nil" ? bookingData.udf2 : null,
  //     });

  //     const savedBooking = await newBooking.save();
  //     console.log('akil----------------------------------');

  //     return savedBooking;
  //   } catch (error) {
  //     console.error('Error saving booking:', error);
  //     throw new Error('Error saving booking');
  //   }
  // }



  async searchVendorsByName(term: string) {
    try {
      return await VendorModel.find({
        vendorname: { $regex: term, $options: 'i' },
        isBlocked: false,
      }).exec();
    } catch (error:any) {
      throw new Error(error);

    }
  }




}

















