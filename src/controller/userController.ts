import { NextFunction, Request, Response } from "express";
import { otpGenerator } from "../utils/otpGenerator";
import { sendEmail } from "../utils/sendEmail";
import { HttpStatus } from '../utils/httpStatus'


export class UserController {
  private userService
  constructor(userService: any) {
    this.userService = userService
  }

  //  

  // async login(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { email, password } = req.body;
  //     const { user, token } = await this.userService.loginUser(email, password);
  //     res.cookie("token", token, {
  //       sameSite: 'strict',
  //       maxAge: 3600000,
  //     });
  //     res.status(HttpStatus.OK).json({ user, token });
  //   } catch (error: any) {
  //     next(error.message);
  //   }
  // }


  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await this.userService.loginUser(email, password);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        domain: ".eventopia.shop",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });


      res.cookie("token", accessToken, {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        domain: ".eventopia.shop",
        maxAge: 1 * 60 * 60 * 1000,
      });
      res.status(HttpStatus.OK).json({ user, accessToken });
    } catch (error: unknown) {
      console.error("Error in loginController:", error);
      next(error);
    }
  }




  async logoutController(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Logging out, clearing cookies...');

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        domain: ".eventopia.shop",
        path: "/",
      });
      console.log('refreshToken cleared');

      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        domain: ".eventopia.shop",
        path: "/",
      });
      console.log('token cleared');
      return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error:unknown) {
      console.error("Error in logoutController:", error);
      next(error);
    }
  }


  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      console.log({ otp });
      const result = await this.userService.verifyOtpService(email, otp);
      res.status(HttpStatus.OK).json(result);
    } catch (error:unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({ error });
    }
  }



  async vendorList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendors = await this.userService.getAllVendors();
      res.status(HttpStatus.OK).json(vendors);
    } catch (error:unknown) {
      next(error);
    }
  }

  async dishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId } = req.query;
      const dishes = await this.userService.getAllDishes(vendorId as string);
      res.status(HttpStatus.OK).json(dishes);
    } catch (error:unknown) {
      next(error);
    }
  }

  async auditoriumlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId } = req.query;
      const auditorium = await this.userService.getAllAuditorium(vendorId as string);
      res.status(HttpStatus.OK).json(auditorium);
    } catch (error:unknown) {
      next(error);
    }
  }


  async forgottenPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const { user, otp } = await this.userService.checkEmail(email);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'User not found' });
      }
      res.status(HttpStatus.OK).json({ message: 'OTP sent successfully', otp, email });
    } catch (error:unknown) {
      next(error);
    }
  }



  async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await this.userService.update(email, password);

      res.status(HttpStatus.OK).json({ message: "Password updated successfully", user });
    } catch (error:unknown) {
      next(error);
    }
  }



  async editUserDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userDetails = req.body;
      console.log('Received user details for update:', userDetails);

      const updatedUser = await this.userService.editUser(userDetails);

      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (error:unknown) {
      console.error('Error in editUserDetails controller:', error);
      res.status(500).json({ message: 'Internal server error' });
      next(error);
    }
  }




  async fetchVendorDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId, userId } = req.query;
      const result = await this.userService.findVendorById(vendorId as string, userId as string);
      res.status(HttpStatus.OK).json(result);
    } catch (error:unknown) {
      next(error);
    }
  }

  async fetchReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId, userId } = req.query;
      if (!vendorId || !userId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'vendorId and userId are required' });
        return;
      }

      const result = await this.userService.fetchReviewById(vendorId as string, userId as string);
      res.status(HttpStatus.OK).json(result);
    } catch (error:unknown) {
      next(error);
    }
  }



  async fetchNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query;
      const result = await this.userService.fetchNotificationsById(userId as string);
      res.status(HttpStatus.OK).json(result);
    } catch (error:unknown) {
      next(error);
    }
  }



  async fetchFoodDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId } = req.params;
      const dishes = await this.userService.findFoodVendorById(vendorId);
      res.status(HttpStatus.OK).json(dishes);
    } catch (error:unknown) {
      console.error('Error in fetchFoodDetails:', error);
      next(error);
    }
  }


  async fetchAuditoriumDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId } = req.params;
      const dishes = await this.userService.findAuditoriumVendorById(vendorId);
      res.status(HttpStatus.OK).json(dishes);
    } catch (error:unknown) {
      console.error('Error in fetchFoodDetails:', error);
      next(error);
    }
  }

  async fetchauditorium(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auditoriumId } = req.params;
      const vendor = await this.userService.findAuditoriumById(auditoriumId);
      res.status(HttpStatus.OK).json(vendor);
    } catch (error:unknown) {
      next(error);
    }
  }

  async fetchdishes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dishesId } = req.params;
      const vendor = await this.userService.finddishesById(dishesId);
      res.status(HttpStatus.OK).json(vendor);
    } catch (error:unknown) {
      next(error);
    }
  }


  async fetchBookedData(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const booking: any = await this.userService.findEvent(id);
      res.status(HttpStatus.OK).json(booking);
    } catch (error:unknown) {
      next(error);
    }
  }




  async payment(req: Request, res: Response, next: NextFunction) {
    try {
      const { txnid, amount, productinfo, username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7 } = req.body;
      if (!txnid || !amount || !productinfo || !username || !email || !udf1 || !udf2 || !udf3 || !udf4 || !udf5 || !udf6 || !udf7) {
        console.log('poi');
        return res.status(400).send("Mandatory fields missing");
      }

      const hash = await this.userService.generatePaymentHash({
        txnid, amount, productinfo, username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7,
      });
      console.log('last', { hash, udf6, udf7 });

      res.send({ hash, udf6, udf7 });
    } catch (error:unknown) {
      next(error);
    }
  }


  async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('step3');

      const otp = otpGenerator();
      await this.userService.registerUser({
        username: req.body.username,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        otp,
        _id: undefined,
        address: "",
        state: "",
        pincode: 0,
        reviews: undefined,
        district: undefined,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      });
      await sendEmail(req.body.email, otp);
      res.status(HttpStatus.OK).json("OTP sent to email and saved in the database.");
    } catch (error:unknown) {
      next(error);
    }
  }


  async addTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { PayUOrderId, email, status } = req.body;
      const transactionId = await this.userService.addTransactionDetails(
        email,
        PayUOrderId,
        status
      );
      res.status(HttpStatus.OK).send(transactionId);
    } catch (error:unknown) {
      next(error);
    }
  }



  async saveData(req: Request, res: Response, next: NextFunction) {
    try {
      const { txnid, email, productinfo, status, amount, udf1, udf2, udf3, udf4, udf5, udf6, udf7 } = req.body;
      console.log('req.body', req.body);

      const userId = udf1;
      const auditoriumId = udf2;
      const dishesId = udf3;
      const StartingDate = udf4;
      const category = udf5;
      const vendorId = productinfo;
      const eventType = udf6;
      const EndingDate = udf7;

      const updatedBooking = await this.userService.updateBookingStatus({
        txnid,
        email,
        vendorId,
        status,
        amount,
        userId,
        auditoriumId,
        dishesId,
        StartingDate,
        category,
        eventType,
        EndingDate
      });

      if (updatedBooking) {
        res.status(HttpStatus.OK).json({ success: true, updatedBookingId: updatedBooking._id });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Booking update failed" });
      }

    } catch (error:unknown) {
      next(error);
    }
  }








  async fetchBookingDetails(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params;
    try {
      const booking = await this.userService.findBookingDetails(userId);
      res.status(HttpStatus.OK).json(booking);
    } catch (error:unknown) {
      next(error);

    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.params;
    const { newPassword } = req.body;
    try {
      const updatedPassword = await this.userService.findChangePassword(email, newPassword); // Updated method name
      res.status(HttpStatus.OK).json(updatedPassword);
    } catch (error:unknown) {
      next(error);
    }
  }



  async updatePasswordController(req: Request, res: Response,next:NextFunction) {
    const { email } = req.params;
    const { newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }
    try {
      await this.userService.updatePasswordService(email, newPassword);
      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error:unknown) {
      console.error('Error updating password:', error);
      next(error);    }
  };






  async getUnreadMessagesCount(
    req: any,
    res: any,
    next: NextFunction
  ): Promise<void> {
    const userId = req.query.userId;
    console.log('User ID from query:', userId);

    try {
      if (!userId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: "User ID is required" });
      }
      // console.log('Controller hit with valid userId');

      const chatServiceData = await this.userService.chatServices({ userId });
      const chatIds = chatServiceData.map((chat: any) => chat._id);

      if (chatIds.length === 0) {
        return res.status(HttpStatus.OK).json({ unreadCount: 0 });
      }

      const unreadCount = await this.userService.messageService({ chatIds, userId });
      console.log('Unread messages count:', unreadCount);

      res.status(HttpStatus.OK).json({ unreadCount });
    } catch (error:unknown) {
      next(error);
    }
  }



  async review(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { reviews, stars, userId, vendorId } = req.body;

      if (!reviews || !stars || !userId || !vendorId) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      const reviewData = await this.userService.reviewService({ reviews, stars, userId, vendorId });
      res.status(HttpStatus.OK).json(reviewData);
    } catch (error:unknown) {
      next(error);
    }
  }

  async getSlotsByWorkerController(req: Request, res: Response,next:NextFunction) {
    try {
      const vendorId = req.params.vendorId;
      const slots = await this.userService.getSlotsByWorkerId(vendorId);
      res.status(200).json(slots);
    } catch (error:unknown) {
      console.error("Error fetching slots:", error);
      next(error);    }
  }

  async searchVendors(req: Request, res: Response,next:NextFunction) {
    const searchTerm = req.query.term as string;

    try {
      const vendors = await this.userService.searchVendors(searchTerm);
      return res.status(200).json({ data: vendors });
    } catch (error:unknown) {
      next(error);    }
  }

}




























