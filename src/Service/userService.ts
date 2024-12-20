import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import jsSHA from "jssha";
import { otpGenerator } from "../utils/otpGenerator";
import { sendEmail } from "../utils/sendEmail";
import { io } from "..";
import { ISlot } from "../interfaces/slot";

import { IUserRepository } from "../interfaces/repository/userRepository";
import { log } from "winston";
import { generateAccessToken, generateRefreshToken } from "../utils/generateJWT";


export class UserService {

  private userRepository: IUserRepository

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository
  }
  async getAllVendors(): Promise<any[]> {
    try {
      return await this.userRepository.getAllVendors();
    } catch (error) {
      throw new Error('Error fetching vendors');
    }
  }
  async registerUser(user: any) {
    try {
      const existingUser = await this.userRepository.findUserByEmail(user.email);
      if (existingUser) {
        if (existingUser.otpVerified) {
          throw new Error("User already exists and is verified.");
        }
      }
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      return await this.userRepository.createUser(user);
    } catch (error: any) {
      console.error("Error during user registration:", error);
      throw new Error(error);
    }
  }




  // async loginUser(email: string, password: string) {
  //   try {
  //     const user = await this.userRepository.findUserByEmail(email);

  //     if (!user) {
  //       throw new Error("Invalid Email/Password");
  //     }

  //     const isPasswordValid = await bcrypt.compare(password, user.password);
  //     if (!isPasswordValid) {
  //       throw new Error("Invalid Email/Password");
  //     }
  //     const accessToken = generateAccessToken(user._id, "user");
  //     const refreshToken = generateRefreshToken(user._id, "user");
  //     return { user, token };
  //   } catch (error: any) {
  //     console.error('Error during login:', error);
  //     throw new Error(error.message);
  //   }
  // }


  async loginUser(email: string, password: string) {
    try {
      const user = await this.userRepository.findUserByEmail(email);
      console.log('user',user);
      
      if (!user) {
        throw new Error("Email does not exist");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Incorrect password");
      }
      const accessToken = generateAccessToken(user._id, "user");
      const refreshToken = generateRefreshToken(user._id, "user");

      return { user, accessToken, refreshToken };
    } catch (error: any) {
      console.error("Error during login:", error);
      throw new Error(error);
    }
  }





  async checkEmail(email: string) {

    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      const otp = otpGenerator();
      await sendEmail(email, otp);
      return { user, otp };
    } catch (error:any) {
      throw new Error(error);
    }
  }



  async verifyOtpService(email: string, otp: string) {

    try {
      const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.otp === otp) {
      await this.userRepository.verifyAndSaveUserRepo(email, otp);
      return "User registered successfully";
    } else {
      throw new Error("Invalid OTP");
    }
      
    } catch (error) {
      
    }
    
  }


  async update(email: string, password: string) {
    try {
      console.log('Service: Calling repository to update password');
      const user = await this.userRepository.findUserByEmailupdate(email, password);
      return user;
    } catch (error:any) {
      console.error(error);
      throw new Error(error);

    }
  }







  async getAllDishes(vendorId: string): Promise<any[]> {
    try {
      const result = await this.userRepository.fetchfromDBDishes(vendorId);
      return result;
    } catch (error:any) {
      throw new Error(error);
    }
  }

  async getAllAuditorium(vendorId: string): Promise<any[]> {
    try {
      console.log('Service: Fetching auditoriums for vendor:', vendorId);
      const result = await this.userRepository.fetchfromDBAuditorium(vendorId);
      return result;
    } catch (error:any) {
      throw new Error(error);
    }
  }


  async editUser(userDetails: any) {
    try {
      return await this.userRepository.userEditFromDB(userDetails);
    } catch (error:any) {
      throw new Error(`Failed to update user details: ${error.message}`);
    }
  }



  async findVendorById(vendorId: string, userId: string) {
    try {
      const vendor = await this.userRepository.findVendor(vendorId);
      const chat = await this.userRepository.findVendorByIdInDb(vendorId, userId);
      return { vendor, chatId: chat.chatId };
    } catch (error:any) {
      throw new Error(`Error finding vendor: ${error.message}`);
    }
  }


  async fetchReviewById(vendorId: string, userId: string) {
    try {
      console.log('review service');

      const review = await this.userRepository.findReviewByIdInDb(vendorId, userId);
      console.log(review);

      if (!review || !review.review) {
        throw new Error('No review found');
      }
      return { review };
    } catch (error:any) {
      throw new Error(`Error fetching review: ${error.message}`);
    }
  }


  async fetchNotificationsById(userId: string) {
    try {
      console.log('ziya', userId);  
      const notificationsData = await this.userRepository.findNotificationsByIdInDb(userId);

      if (!notificationsData || !notificationsData.notification) {
        throw new Error('No notifications found');  
      }

      console.log(notificationsData, 'okokok');
      return notificationsData;  
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error}`);  // Improved error message
    }
  }







  async findFoodVendorById(vendorId: string) {
    try {
      console.log('Service invoked to find dishes for vendor:', vendorId);
      const dishes = await this.userRepository.findFoodVendorIdInDb(vendorId);
      if (!dishes || dishes.length === 0) {
        throw new Error(`Error finding vendor dishes`);
      } else {
        return dishes;

      }
    } catch (error) {
      throw new Error(`Error finding vendor dishes: ${error}`);
    }
  }

  async findAuditoriumVendorById(vendorId: string) {
    try {
      console.log('Service invoked to find dishes for vendor:', vendorId);
      const dishes = await this.userRepository.findAuditoriumVendorIdInDb(vendorId);
      if (!dishes || dishes.length === 0) {
        throw new Error(`Error finding vendor dishes`);
      } else {
        return dishes;
      }

    } catch (error) {
      throw new Error(`Error finding vendor dishes: ${error}`);
    }
  }


  async findAuditoriumById(auditoriumId: string) {
    try {
      const vendor = await this.userRepository.findAuditoriumByIdInDb(auditoriumId);
      if (!vendor) {
        throw new Error(`Error finding vendor dishes`);
      } else {
        return vendor;
      }
    } catch (error) {
      throw new Error(`Error finding vendor: ${error}`);
    }
  }



  async finddishesById(dishesId: string) {
    try {
      const vendor = await this.userRepository.finddishesByIdInDb(dishesId);
      if (!vendor) {
        throw new Error(`Vendor with ID ${dishesId} not found`);
      }
      return vendor;
    } catch (error) {
      throw new Error(`Service Error - Finding vendor: ${error}`);
    }
  }



  async findEvent(bookingId: string) {
    try {

      const bookingDetails = await this.userRepository.getBookingDetail(bookingId);
      if (!bookingDetails) {
        throw new Error(`Booking with id not found`);
      }
      return bookingDetails;
    } catch (error) {
      console.error("Error fetching booking details:", error);
      throw error;
    }
  }


  async addTransactionDetails(
    email: string,
    PayUOrderId: string,
    status: "success" | "failed"
  ) {
    try {
      // const PayUOrderData = await PayURepository.getPayUOrder(PayUOrderId);
      // if (!PayUOrderData) throw new Error("PayU Order Data not found");
      // console.log("Got order id");
      // console.log(PayUOrderData);

      // const userData = await userServices.getUserDataByEmail(email);
      // if (!userData) throw new Error("User Data not found.");
      // const userId = userData._id.toString();

      // const transaction = await adsRepository.addTransaction(
      //   userId,
      //   PayUOrderId,
      //   PayUOrderData.mihpayid,
      //   status,
      //   PayUOrderData.amount
      // );
      // console.log("Added transaction");
      // console.log(transaction);
      // if (!transaction) throw new Error("Transaction Data not found");

      // if (status === "success") {
      //   const postId = PayUOrderData?.productinfo;
      //   const WeNetAdsData = await adsRepository.createWenetAds(
      //     userId,
      //     postId,
      //     transaction._id.toString()
      //   );
      //   console.log("created WeNetAdsData");
      //   console.log(WeNetAdsData);

      //   const postData = await adsRepository.addAdDataToPost(postId);
      //   console.log("Added ad data to post ");
      //   console.log(postData);

      //   try {
      //     await adsRepository.sendPostAdDataToMQ(
      //       postData._id.toString(),
      //       postData.WeNetAds
      //     );
      //   } catch (error: any) {
      //     console.log(error.message);
      //   }
      // }
      // return transaction._id.toString();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async findBookingDetails(userId: string) {
    const bookingDetails = await this.userRepository.findDetailsByUserId(userId);
    if (!bookingDetails) {
      throw new Error(`Booking with id not found`);
    }
    return bookingDetails;
  }

  async updateBookingStatus(bookingData: any) {
    const updatedBooking = await this.userRepository.updateBookingStatus(bookingData);
    console.log(updatedBooking, 'Booking Update Service');
    return updatedBooking;
  }


  async findChangePassword(email: string, newPassword: string) {
    console.log('Updating password for email:', email);
    const otp = otpGenerator();
    console.log(otp);

    await sendEmail(email, otp);

    return otp;
  }


  async updatePasswordService(email: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePasswordInDatabase(email, hashedPassword);
  };






  async findUserByEmailService(email: string) {
    try {
      const user = await this.userRepository.findUserByEmail(email);
      console.log('otp service');

      return { user, email };
    } catch (error) {
      console.error(error);
    }
  }


  // async generatePaymentHash({
  //   txnid, amount, productinfo, username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7
  // }: {
  //   txnid: string,
  //   amount: string,
  //   productinfo: string,
  //   username: string,
  //   email: string,
  //   udf1: string,
  //   udf2: string,
  //   udf3: string,
  //   udf4: string,
  //   udf5: string,
  //   udf6: string, 
  //   udf7: string, 
  // }) {
  //   try {
  //     console.log('123');

  //     const hashString = `${process.env.PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${username}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}||||${process.env.PAYU_SALT}`;
  //     console.log('123456');

  //     const sha = new jsSHA("SHA-512", "TEXT");
  //     sha.update(hashString);
  //     const hash = sha.getHash("HEX");
  //     console.log(hash, 'hash');
  //     // const bookingData = {
  //     //   txnid,
  //     //   amount,
  //     //   productinfo,
  //     //   username,
  //     //   email,
  //     //   udf1,
  //     //   udf2,
  //     //   udf3,
  //     //   udf4,
  //     //   udf5,
  //     //   udf6,
  //     //   udf7,
  //     //   paymentStatus: 'pending', 
  //     //   paymentHash: hash         
  //     // };

  //     // const savedBooking = await this.userRepository.saveBooking(bookingData);
  //     return hash;
  //   } catch (error) {
  //     throw new Error("Error generating payment hash");
  //   }
  // }




  // async generatePaymentHash({
  //   txnid,
  //   amount,
  //   productinfo,
  //   firstname,
  //   email,
  //   udf1,
  //   udf2,
  //   udf3,
  //   udf4,
  //   udf5,
  // }: {
  //   txnid: string;
  //   amount: string;
  //   productinfo: string;
  //   firstname: string;
  //   email: string;
  //   udf1: string;
  //   udf2: string;
  //   udf3: string;
  //   udf4: string;
  //   udf5: string;
  // }) {
  //   try {
  //     const key = process.env.PAYU_MERCHANT_KEY;
  //     const salt = process.env.PAYU_SALT;

  //     // Make sure key and salt are available
  //     if (!key || !salt) {
  //       throw new Error("Merchant key or salt not found in environment variables");
  //     }

  //     // Construct the hash string
  //     const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|||||${salt}`;
  //     console.log("Hash String:", hashString);

  //     // Generate hash using SHA-512
  //     const sha = new jsSHA("SHA-512", "TEXT");
  //     sha.update(hashString);
  //     const hash = sha.getHash("HEX");

  //     console.log("Generated Payment Hash:", hash);
  //     return hash;
  //   } catch (error) {
  //     console.error("Error generating payment hash:", error);
  //     throw new Error("Error generating payment hash");
  //   }
  // }


  async generatePaymentHash({
    txnid,
    amount,
    productinfo,
    username,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    udf6,
    udf7
  }: {
    txnid: string;
    amount: string;
    productinfo: string;
    username: string;
    email: string;
    udf1: string;
    udf2: string;
    udf3: string;
    udf4: string;
    udf5: string;
    udf6: string;
    udf7: string;
  }) {
    try {
      console.log(process.env.PAYU_MERCHANT_KEY);
      console.log(process.env.PAYU_SALT);

      const hashString = `${process.env.PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${username}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}||||${process.env.PAYU_SALT}`;
      console.log("Hash String:", hashString);

      const sha = new jsSHA("SHA-512", "TEXT");
      sha.update(hashString);
      const hash = sha.getHash("HEX");
      console.log("Generated Hash:", hash);

      const bookingData = {
        txnid,
        amount,
        productinfo,
        username,
        email,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        udf6,
        udf7,
        paymentStatus: "pending",
        paymentHash: hash,
      };
      console.log(udf7, 'end');
      console.log(udf4, 'start');


      await this.userRepository.saveBooking(bookingData);
      return hash;
    } catch (error:any) {
      throw new Error(error);
    }
  }







  async chatServices({ userId }: { userId: string }) {
    try {
      const chats = await this.userRepository.chatDB(userId);
      console.log(chats, 'ok serive');

      return chats;
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw error;
    }
  }
  async messageService({
    chatIds,
    userId,
  }: {
    chatIds: string[];
    userId: string;
  }) {
    try {
      const unreadCount = await this.userRepository.messageDB(chatIds);

      io.to(userId).emit("unreadCount", { unreadCount });
      console.log(unreadCount, 'ok messge service');
      console.log('emmited sucessfullly');

      return unreadCount;
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      throw error;
    }
  }




  async reviewService(reviewData: { reviews: string; stars: number; userId: string; vendorId: string }): Promise<any> {
    try {
      const review = await this.userRepository.reviewRepository(reviewData);
      const reviews = await this.userRepository.getReviewsByVendorId(reviewData.vendorId);
      const averageRating = this.calculateAverageRating(reviews);
      await this.userRepository.updateVendorRating(reviewData.vendorId, averageRating);
      return review;
    } catch (error) {
      console.error("Error in reviewService:", error);
      throw error;
    }
  }

  private calculateAverageRating(reviews: any[]): number {
    console.log('hlper function');
    if (reviews.length === 0) return 0;
    const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
    return totalStars / reviews.length;
  }


  async getSlotsByWorkerId(vendorId: string): Promise<ISlot[]> {
    try {
      let result = await this.userRepository.getSlotsByWorkerIdFromRepo(vendorId);
      console.log(result);
      return result

    } catch (error) {
      console.error("Error fetching slots from repository:", error);
      throw error;
    }
  }


  async searchVendors(term: string) {
    if (!term) {
      throw new Error("Search term is required");
    }

    try {
      const vendors = await this.userRepository.searchVendorsByName(term);
      return vendors;
    } catch (error) {
      throw new Error(`Service error: ${error}`);
    }
  }






}
























