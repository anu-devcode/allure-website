import { Router } from "express";
import { createRequest, getRequests, updateRequestStatus } from "../controllers/customRequestController.js";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public: Create a request
router.post("/", createRequest);

// Admin only: Get all requests
router.get("/", authenticate, authorizeAdmin, getRequests);

// Admin only: Update request status
router.patch("/:id/status", authenticate, authorizeAdmin, updateRequestStatus);

export default router;
