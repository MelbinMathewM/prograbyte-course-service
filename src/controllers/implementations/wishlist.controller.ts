import { HttpResponse } from "@/constants/response.constant";
import { HttpStatus } from "@/constants/status.constant";
import { WishlistService } from "@/services/implementations/wishlist.service";
import { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import { IWishlistController } from "../interfaces/IWishlist.controller";

export class WishlistController implements IWishlistController {
    constructor(@inject(WishlistService) private _wishlistService: WishlistService) { }

    async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const { userId } = req.params;
    
          if (!userId) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: HttpResponse.USER_ID_REQUIRED });
            return
          }
    
          const wishlist = await this._wishlistService.getWishlist(userId);
    
          res.status(HttpStatus.OK).json(wishlist);
        } catch (err) {
          next(err)
        }
      }
    
      async addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const { userId, courseId } = req.body;
    
          if (!userId) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: HttpResponse.USER_ID_REQUIRED });
            return
          }
          if (!courseId) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: HttpResponse.COURSE_ID_REQUIRED });
            return
          }
    
          const wishlist = await this._wishlistService.addWishlist(userId, courseId);
    
          res.status(HttpStatus.OK).json({ message: HttpResponse.COURSE_ADDED_WISHLIST, wishlist });
        } catch (err) {
          next(err)
        }
      }
    
      async removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const { userId, courseId } = req.params;
    
          if (!userId) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: HttpResponse.USER_ID_REQUIRED });
            return
          }
          if (!courseId) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: HttpResponse.COURSE_ID_REQUIRED });
            return
          }
    
          await this._wishlistService.removeWishlist(userId, courseId);
    
          res.status(HttpStatus.OK).json({ message: HttpResponse.COURSE_REMOVED_WISHLIST })
        } catch (err) {
          next(err)
        }
      }
}