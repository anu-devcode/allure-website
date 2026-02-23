import { Router } from "express";
import {
    addWishlistItem,
    getWishlist,
    removeWishlistItem,
    syncGuestWishlist,
} from "../controllers/wishlistController.js";
import {
    authenticate,
    authenticateOptional,
    authorizeCustomer,
    authorizeDomain,
} from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateOptional, getWishlist);
router.post("/items", authenticateOptional, addWishlistItem);
router.delete("/items/:productId", authenticateOptional, removeWishlistItem);
router.post("/sync", authenticate, authorizeDomain("customer"), authorizeCustomer, syncGuestWishlist);

export default router;
