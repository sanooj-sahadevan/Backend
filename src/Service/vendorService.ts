import jwt from "jsonwebtoken";
import { uploadToS3Bucket } from "../middleware/fileUpload";
import { io } from "../index";
import { AuditoriumDocument } from "../models/auditoriumModel";
import { IVendorRepository } from "../interfaces/repository/vendorRepository";
import { IVendorService } from "../interfaces/service/vendorService";
import { ISlot } from "../interfaces/slot";
import { generateVendorAccessToken, generatevendorRefreshToken } from "../utils/generateJWT";


export class VendorService implements IVendorService {
  private vendorRepository: IVendorRepository

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository
  }



  async registerVendor(vendor: any) {
    try {
      const existingVendor = await this.vendorRepository.findVendorByEmail(vendor.email);
      if (existingVendor) {
        if (existingVendor.otpVerified) {
          throw new Error("User already exists");
        } else {
          await this.vendorRepository.updateVendor(existingVendor.email, vendor);
          return existingVendor;
        }
      }
      return await this.vendorRepository.createVendor(vendor);
    } catch (error: any) {
      console.error("Error during user registration:");
      throw new Error(error);
    }
  }

  async verifyAndSaveVendor(email: string, otp: string) {
    try {
      const vendor = await this.vendorRepository.findVendorByEmail(email);
      if (vendor && vendor.otp === otp) {
        vendor.otp = undefined;
        vendor.otpVerified = true;
        await vendor.save();
        return vendor;
      }

    } catch (error: any) {
      throw new Error(error);
    }

  }


  async loginVendor(email: string, password: string) {
    try {
      const vendor = await this.vendorRepository.findVendorByEmail(email);
      console.log(vendor, 'vendor');
console.log(vendor);
console.log(vendor.password);
console.log(vendor.vendorname);



      if (!vendor) {
        throw new Error("Invalid Email/Password");
      }
      console.log(password,'okpas');
      console.log(email,'ok email');



      if (password !== vendor.password) {
        throw new Error("Invalid Password");
      }
      const accessToken = generateVendorAccessToken(vendor._id, "vendorToken");
      const refreshToken = generatevendorRefreshToken(vendor._id, "vendorToken");
      return { vendor, accessToken, refreshToken };
    } catch (error: any) {
      throw new Error(error);
    }
  }



  async vendorAddress() {
    try {
      return await this.vendorRepository.vendorAddressFromDB();
    } catch (error: any) {
      throw new Error(error);
    }
  }


  async editVendorService(vendorDetails: any): Promise<any> {
    try {
      console.log('vendor service', vendorDetails);

      const existingVendor = await this.vendorRepository.findVendorByEmailRepo(vendorDetails.email);

      if (existingVendor) {
        return await this.vendorRepository.editVendorRepo(existingVendor, vendorDetails);
      } else {
        return await this.vendorRepository.editVendorRepo(null, vendorDetails);
      }
    } catch (error: any) {
      console.error('Error in editVendorService:', error);
      throw new Error(error);
    }
  }




  async uploadImage(fileName: string, fileType: string): Promise<string> {
    try {
      console.log("Generating pre-signed URL for file:", fileName, "with type:", fileType);  // Log the details
      const presignedUrl = await uploadToS3Bucket(fileName, fileType);
      return presignedUrl;
    } catch (error: any) {
      throw new Error(error);
    }
  }



  async findVendorById(vendorId: string) {
    try {
      const vendor = await this.vendorRepository.findVendorByIdInDb(vendorId);
      if (!vendor) {
        throw new Error(`Error finding vendor`);
      }
      return vendor;
    } catch (error: any) {
      throw new Error(error);
    }
  }



  async findAuditoriumById(auditoriumId: string) {
    try {
      console.log('controller 2');
      const vendor = await this.vendorRepository.findAuditoriumByIdInDb(auditoriumId);
      if (!vendor) {
        throw new Error(`Error finding vendor`);
      }
      return vendor;
    } catch (error: any) {
      throw new Error(error);
    }
  }


  async findDishesById(dishesId: string) {
    try {
      const vendor = await this.vendorRepository.findDishesByIdInDb(dishesId);
      if (!vendor) {
        throw new Error(`Error finding vendor`);
      }
      return vendor;
    } catch (error: any) {
      throw new Error(error);
    }
  }


  async uploadDishes(vendorId: any, data: any, images?: string) {
    try {
      data.price = Number(data.price);
      const dishesData = { vendorId, data, images };
      console.log("Dishes Data: ", dishesData);

      const newDish = await this.vendorRepository.createDishes(dishesData);
      console.log("New dish created:", newDish);

      const dishNotification = await this.vendorRepository.notifyDishAdded(vendorId, newDish, newDish.dishesName);
      console.log("Dish notification result:", dishNotification);

      return newDish;
    } catch (error: any) {
      console.error("Error in uploadDishes: ", error);
      throw new Error(error);
    }
  }


  async uploadAuditorium(vendorId: string, data: AuditoriumDocument, images?: string
  ) {
    try {
      const auditoriumData = { vendorId, data, images };
      auditoriumData.data.price = Number(auditoriumData.data.price);

      const newAuditorium = await this.vendorRepository.createAuditorium(auditoriumData);
      const dishNotification = await this.vendorRepository.notifyAuditoriumAdded(vendorId, newAuditorium, newAuditorium.auditoriumName);
      console.log("Dish notification result:", dishNotification);
      return newAuditorium;
    } catch (error: any) {
      console.error("Error in uploadAuditorium: ", error);
      throw new Error(error);
    }
  }


  async findFoodVendorById(vendorId: string) {
    try {
      console.log('Service invoked to find dishes for vendor:', vendorId);
      const dishes = await this.vendorRepository.findFoodVendorIdInDb(vendorId);
      return dishes;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async findReviewsVendorById(vendorId: string) {
    try {
      console.log('Service invoked to find reviews for vendor:', vendorId);
      const dishes = await this.vendorRepository.findReviewsVendorIdInDb(vendorId);
      return dishes;
    } catch (error: any) {
      throw new Error(error);
    }
  }



  async findAuditoriumVendorById(vendorId: string) {
    try {
      console.log('Service invoked to find auditorium for vendor:', vendorId);
      const Auditorium = await this.vendorRepository.findAuditoriumVendorIdInDb(vendorId);
      return Auditorium;
    } catch (error: any) {
      throw new Error(error);
    }
  }


  async softDeleteDishService(dishId: string) {
    try {
      const updatedDish = await this.vendorRepository.softDeleteDishRepo(dishId);
      if (!updatedDish) {
        throw new Error(`Error soft-deleting dish`);
      }
      return updatedDish;
    } catch (error: any) {
      throw new Error(error);
    }
  }


  async softDeleteAuditoriumService(auditoriumId: string) {
    try {
      const updatedAuditorium = await this.vendorRepository.softDeleteAuditoriumRepo(auditoriumId);
      if (!updatedAuditorium) {
        throw new Error(`Error soft-deleting auditorium`);
      }
      return updatedAuditorium;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async reviewIdService(reviewId: string) {
    try {
      const updatedreview = await this.vendorRepository.updatedreviewRepo(reviewId);
      if (!updatedreview) {
        throw new Error(`Error soft-deleting auditorium`);
      }
      return updatedreview;
    } catch (error: any) {
      throw new Error(error);
    }
  }


  async reviewIdServiceReject(reviewId: string) {
    try {
      const deletereview = await this.vendorRepository.updatedreviewRepoReject(reviewId);
      if (!deletereview) {
        throw new Error(`Error soft-deleting auditorium`);
      }
      return deletereview;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async findBookingDetails(vendorId: string) {
    try {
      const bookingDetails = await this.vendorRepository.findDetailsByvendorId(vendorId);
      if (!bookingDetails) {
        throw new Error(`Error soft-deleting auditorium`);
      }
      return bookingDetails
    } catch (error: any) {
      throw new Error(error);

    }
  }




  async findVendorByEmailService(email: string) {
    try {
      const vendor = await this.vendorRepository.findVendorByEmail(email);
      return vendor
    } catch (error: any) {
      throw new Error(error);

    }
  }


  async chatServices({ vendorId }: { vendorId: string }) {
    try {
      const chats = await this.vendorRepository.chatDB(vendorId);
      return chats;
    } catch (error: any) {
      console.error("Error fetching chats:", error);
      throw new Error(error);
    }
  }

  async messageService({
    chatIds,
    vendorId,
  }: {
    chatIds: string[];
    vendorId: string;
  }) {
    try {
      const unreadCount = await this.vendorRepository.messageDB(chatIds);

      io.to(vendorId).emit("unreadCount", { unreadCount });

      return unreadCount;
    } catch (error: any) {
      console.error("Error fetching unread messages:", error);
      throw new Error(error);
    }
  }





  async createWorkerSlots(vendorId: string, startDate: Date, endDate: Date): Promise<ISlot[]> {
    try {
      const slots: ISlot[] = [];
      const workerObjectId = vendorId;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate <= today) {
        throw new Error("Start date must be tomorrow or a future date.");
      }

      const currentDate = new Date(startDate);
      const end = new Date(endDate);

      while (currentDate <= end) {
        const existingSlot = await this.vendorRepository.findSlotByWorkerAndDate(workerObjectId, currentDate);

        if (existingSlot) {
          throw new Error(`Slot already exists for vendor ${vendorId} on ${currentDate.toDateString()}`);
        }

        const slot = await this.vendorRepository.createSlot({
          vendorId: workerObjectId,
          date: new Date(currentDate),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });

        slots.push(slot);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return slots;
    } catch (error: any) {
      throw new Error(error);

    }
  }



  async getSlotsByWorkerId(vendorId: string): Promise<ISlot[]> {
    try {
      return await this.vendorRepository.getSlotsByWorkerIdFromRepo(vendorId);
    } catch (error: any) {
      console.error("Error fetching slots from repository:", error);
      throw new Error(error);
    }
  }



  async saveVendorServiceImages(vendorId: string, photoUrls: string[]): Promise<void> {
    try {
      console.log('Vendor ID and Photo URLs in Service:', vendorId, photoUrls);

      const updatedVendor = await this.vendorRepository.updateVendorServiceImages(vendorId, photoUrls);
      return updatedVendor;
    } catch (error: any) {
      throw new Error(error);
    }
  }


  async isDateRangeAvailable(vendorId: string, startDate: Date, endDate: Date): Promise<boolean> {
    try {
      return this.vendorRepository.isDateRangeAvailable(vendorId, startDate, endDate);

    } catch (error: any) {
      throw new Error(error);
    }
  }

}




