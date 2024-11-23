import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../utils/httpStatus";
import { IVendorService } from "../interfaces/service/vendorService";

import { otpGenerator } from "../utils/otpGenerator";
import { sendEmail } from "../utils/sendEmail";


export class VendorController {
  private vendorService: IVendorService
  constructor(vendorService: IVendorService) {
    this.vendorService = vendorService
  }


  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorname, email, phone, password, latitude, longitude } = req.body;

      const proceedWithRegistration = async () => {
        try {
          const otp = otpGenerator();
          await this.vendorService.registerVendor({
            vendorname,
            phone,
            email,
            password,
            otp,
            reviews: "",
            address: "",
            district: "",
            state: "",
            description: "", rating: 0,
            reviewsID: null,
            serviceImages: [],
            latitude,
            longitude
          });

          await sendEmail(email, otp);
          res.status(HttpStatus.OK).json("OTP sent to email");
        } catch (error: any) {
          next(error);
        }
      };

      await proceedWithRegistration();
    } catch (error: any) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const vendor = await this.vendorService.findVendorByEmailService(email);
      if (!vendor) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Vendor not found" });
        return;
      }
      if (vendor.otp === otp) {
        await this.vendorService.verifyAndSaveVendor(email, otp);
        res.status(HttpStatus.OK).json("Vendor registered successfully");
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid OTP" });
      }
    } catch (error: any) {
      next(error);
    }
  }



  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { vendor, accessToken, refreshToken } = await this.vendorService.loginVendor(email, password);

      res.cookie("RefreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        domain: ".eventopia.shop",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("vendorToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        domain: ".eventopia.shop",
        maxAge: 1 * 60 * 60 * 1000,
      });

      // res.cookie("RefreshToken", accessToken, {
      //   httpOnly: false,
      //   sameSite: "strict",
      //   maxAge: 1 * 60 * 60 * 1000, 
      // });

      res.status(200).json({ vendor, accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  }


  async logoutController(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Logging out, clearing cookies...');
      res.clearCookie("RefreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        domain: ".eventopia.shop",
        path: "/",
      });
      console.log('refreshToken cleared');

      res.clearCookie("vendorToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        domain: ".eventopia.shop",
        path: "/",
      });
      console.log('token cleared');
      return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Error in logoutController:", error);
      next(error);
    }
  }











  async fetchAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorAddresses = await this.vendorService.vendorAddress();
      res.status(HttpStatus.OK).json(vendorAddresses);
    } catch (error) {
      next(error);
    }
  }


  async editVendorDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('edit vendor controller');

      const userDetails = req.body;
      const updatedUser = await this.vendorService.editVendorService(userDetails);
      res.status(HttpStatus.OK).json(updatedUser);
    } catch (error) {
      console.error('Error in editUserDetails controller:', error);
      next(error);
    }
  }




  async fetchVendorDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId } = req.params; // Extract vendorId from request params
      const vendor = await this.vendorService.findVendorById(vendorId); // Fetch vendor details
      if (!vendor) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "Vendor not found" });
      } else {
        res.status(HttpStatus.OK).json(vendor);
      }
    } catch (error) {
      next(error);
    }
  }

  async fetchdishes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const { dishesId } = req.params;
      const vendor = await this.vendorService.findDishesById(dishesId);
      res.status(HttpStatus.OK).json(vendor);
    } catch (error) {
      next(error);
    }
  }


  async fetchauditorium(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auditoriumId } = req.params;
      const vendor = await this.vendorService.findAuditoriumById(auditoriumId);
      res.status(HttpStatus.OK).json(vendor);
    } catch (error) {
      next(error);
    }
  }



  async getPresignedUrl(req: Request, res: Response, next: NextFunction) {
    try {

      console.log('hey hey hey hey hy hey ehy ehye hey ehy hey hey ');

      const { fileName, fileType } = req.query;
      if (!fileName || !fileType) {
        return res.status(400).json({ error: "fileName and fileType are required" });
      }

      const presignedUrl = await this.vendorService.uploadImage(fileName as string, fileType as string);
      return res.status(200).json({ url: presignedUrl });
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      next(error);
    }
  }


  async addDishes(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Starting to add dishes...");
  
      const vendorId = (req as any).id; 
      const { body } = req;
  
      console.log("Vendor ID:", vendorId);
      console.log("Request Body:", body);
  
      if (!vendorId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: "Vendor ID is required" });
      }
  
      await this.vendorService.uploadDishes(vendorId, body, body.image);
      return res.status(HttpStatus.OK).json({ message: "Dishes added successfully" });
    } catch (error) {
      console.error("Error adding dishes:", error);
      next(error);
    }
  }
  




  


  async addAuditorium(req: Request & { vendorId?: string }, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const vendorId = req.vendorId;
      if (!vendorId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: "Vendor ID is required" });
      }
      const auditoriumData = await this.vendorService.uploadAuditorium(vendorId, body, body.image);
      if (auditoriumData) {
        return res.status(HttpStatus.OK).json("Auditorium added successfully");
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: "Auditorium not added: something went wrong" });
      }
    } catch (error) {
      console.error("Error adding auditorium: ", error);
      next(error);
    }
  }


  async fetchDetailsVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId } = req.params;
      const vendor = await this.vendorService.findVendorById(vendorId);
      res.status(HttpStatus.OK).json(vendor);
    } catch (error) {
      console.error('Error in fetchDetailsVendor:', error);
      next(error);
    }
  }


  async fetchFoodDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId } = req.params;
      const dishes = await this.vendorService.findFoodVendorById(vendorId);
      if (!dishes || dishes.length === 0) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "No dishes found for this vendor" });
      } else {
        res.status(HttpStatus.OK).json(dishes);
      }

    } catch (error) {
      console.error('Error in fetchFoodDetails:', error);
      next(error);
    }
  }

  async fetchReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('review controller');

      const { vendorId } = req.params;
      const Reviews = await this.vendorService.findReviewsVendorById(vendorId);
      if (!Reviews || Reviews.length === 0) {
        res.status(HttpStatus.OK).json({ message: "No Reviews found for this vendor" });
      } else {
        res.status(HttpStatus.OK).json(Reviews);
      }

    } catch (error) {
      console.error('Error in fetchReviews:', error);
      next(error);
    }
  }


  async fetchAuditoriumDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vendorId } = req.params;
      const auditorium = await this.vendorService.findAuditoriumVendorById(vendorId);

      if (!auditorium || auditorium.length === 0) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "No dishes found for this vendor" });
      } else {
        res.status(HttpStatus.OK).json(auditorium);
      }
    } catch (error) {
      console.error('Error in fetchFoodDetails:', error);
      next(error);
    }
  }




  async softDeleteDish(req: Request, res: Response, next: NextFunction) {
    try {
      const { dishId } = req.params;
      if (!dishId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dish ID is missing' });
      }
      const updatedDish = await this.vendorService.softDeleteDishService(dishId);
      res.status(HttpStatus.OK).json({ message: 'Dish deleted successfully', dish: updatedDish });
    } catch (error) {
      next(error);
    }
  }


  async softDeleteAuditorium(req: Request, res: Response, next: NextFunction) {
    try {
      const { auditoriumId } = req.params;
      if (!auditoriumId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Auditorium ID is missing' });
      }
      const updatedAuditorium = await this.vendorService.softDeleteAuditoriumService(auditoriumId);
      res.status(HttpStatus.OK).json({ message: 'Auditorium deleted successfully', auditorium: updatedAuditorium });
    } catch (error) {
      next(error);
    }
  }

  async approveReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      if (!reviewId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'reviewId  is missing' });
      }
      const updatedAuditorium = await this.vendorService.reviewIdService(reviewId);
      res.status(HttpStatus.OK).json({ message: 'reviewId deleted successfully', auditorium: updatedAuditorium });
    } catch (error) {
      next(error);
    }
  }

  async rejectReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      if (!reviewId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'reviewId  is missing' });
      }
      const updatedAuditorium = await this.vendorService.reviewIdServiceReject(reviewId);
      res.status(HttpStatus.OK).json({ message: 'reviewId deleted successfully', auditorium: updatedAuditorium });
    } catch (error) {
      next(error);
    }
  }

  async vendorBookingDetils(req: Request, res: Response, next: NextFunction) {
    const { vendorId } = req.params;
    try {
      const booking = await this.vendorService.findBookingDetails(vendorId)
      res.status(HttpStatus.OK).json(booking);
    } catch (error) {
      next(error);


    }
  }

  async getUnreadMessagesCount(
    req: any,
    res: any, next: NextFunction
  ): Promise<void> {
    const vendorId = req.vendorId;

    try {
      if (!vendorId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: "Vendor ID is required" });
      }

      const chatServiceData = await this.vendorService.chatServices({ vendorId });

      const chatIds = chatServiceData.map((chat: any) => chat._id);

      if (chatIds.length === 0) {
        return res.status(HttpStatus.OK).json({ unreadCount: 0 });
      }

      const unreadCount = await this.vendorService.messageService({ chatIds, vendorId });
      res.status(HttpStatus.OK).json({ unreadCount });
    } catch (error) {
      next(error);

    }
  }



  async createSlotController(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { startDate, endDate } = req.body;
      const { vendorId } = req.params;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and End dates are required" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid start or end date" });
      }

      if (!vendorId) {
        return res.status(400).json({ message: "Vendor ID is required" });
      }

      const slots = await this.vendorService.createWorkerSlots(vendorId, start, end);
      res.status(201).json(slots);
    } catch (error: any) {
      console.error("Error creating slots:", error);
      res.status(500).json({ message: "Error creating slots", error: error.message });
    }
  }

  async getSlotsByWorkerController(req: Request, res: Response) {
    try {
      const vendorId = req.params.vendorId; // Get vendorId from route parameters
      const slots = await this.vendorService.getSlotsByWorkerId(vendorId);
      console.log(slots, "heycontroller");

      res.status(200).json(slots);
    } catch (error: any) {
      console.error("Error fetching slots:", error);
      res.status(500).json({ message: "Error fetching slots", error: error.message });
    }
  }






  async uploadVendorImages(req: Request, res: Response) {
    const { vendorId, photoUrls } = req.body.body
    try {
      console.log({ vendorId, photoUrls })
      const updatedVendor = await this.vendorService.saveVendorServiceImages(vendorId, photoUrls);
      return res.status(200).json({ message: "Service images saved successfully", vendor: updatedVendor });
    } catch (error) {
      return res.status(500).json({ message: `Error saving service images: ${error}` });
    }
  }

  async checkDateAvailability(req: Request, res: Response) {
    const { vendorId, startingDate, endingDate } = req.body;

    if (!vendorId || !startingDate || !endingDate) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    try {
      const isAvailable = await this.vendorService.isDateRangeAvailable(vendorId, new Date(startingDate), new Date(endingDate));
      res.status(200).json({ isAvailable });
    } catch (error) {
      console.error("Error in controller:", error);
      res.status(500).json({ message: "Error checking date availability" });
    }
  }




}



