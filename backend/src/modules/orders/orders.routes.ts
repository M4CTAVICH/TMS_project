import { Router } from "express";
import { body } from "express-validator";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  rateOrder,
  getMyOrderNotifications,
  acceptOrder,
} from "./orders.controller";
import { validate } from "../../shared/middleware/validator";
import { authenticate, authorize } from "../../shared/middleware/auth";
import { ROLES } from "../../config/constants";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(
    ROLES.PRODUCTION_CLIENT,
    ROLES.DISTRIBUTOR,
    ROLES.FINISHED_STOCK_MANAGER,
  ),
  [
    body("type")
      .isIn(["RAW_MATERIAL_ORDER", "FINISHED_PRODUCT_ORDER", "DELIVERY"])
      .withMessage("Valid order type is required"),
    body("fromLocationId").notEmpty().withMessage("From location is required"),
    body("toLocationId").notEmpty().withMessage("To location is required"),
    body("confirmingUserId")
      .notEmpty()
      .withMessage("Confirming user is required"),
    body("transportProviderId")
      .notEmpty()
      .withMessage("Transport provider is required"),
    body("destinationUserId")
      .if(body("type").equals("DELIVERY"))
      .notEmpty()
      .withMessage("Destination user is required for delivery"),
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    body("items.*.productId").notEmpty().withMessage("Product ID is required"),
    body("items.*.quantity")
      .isFloat({ min: 0.01 })
      .withMessage("Quantity must be greater than 0"),
    validate,
  ],
  createOrder,
);

router.get("/", getOrders);

/**
 * Assigned-user notification list:
 * returns pending orders where current user is confirmingUserId
 */
router.get("/notifications/my", getMyOrderNotifications);

/**
 * Assigned user accepts order (PENDING -> CONFIRMED)
 */
router.post("/:id/accept", acceptOrder);

router.put(
  "/:id/status",
  authorize(
    ROLES.MANAGER,
    ROLES.RAW_STOCK_MANAGER,
    ROLES.TRANSPORT_PROVIDER,
    ROLES.FINISHED_STOCK_MANAGER,
  ),
  [
    body("status")
      .isIn([
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
      ])
      .withMessage("Valid status is required"),
    validate,
  ],
  updateOrderStatus,
);

router.post(
  "/:id/rate",
  [
    body("onTime").isBoolean().withMessage("onTime must be boolean"),
    body("damageFree").isBoolean().withMessage("damageFree must be boolean"),
    validate,
  ],
  rateOrder,
);

router.post("/:id/cancel", cancelOrder);
router.get("/:id", getOrderById);

export default router;
