import { body } from "express-validator";
export const createEventValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const eventDate = new Date(value);
      if (eventDate <= new Date()) {
        throw new Error("Event date must be in the future");
      }
      return true;
    }),
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 3 })
    .withMessage("Location must be at least 3 characters"),
  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required")
    .isInt({ min: 1, max: 10000 })
    .withMessage("Capacity must be between 1 and 10,000"),
  body("ticketType")
    .optional()
    .isIn(["FREE", "PAID"])
    .withMessage("Ticket type must be FREE or PAID"),
  body("ticketPrice")
    .optional()
    .custom((value, { req }) => {
      if (req.body.ticketType === "PAID") {
        if (!value || parseFloat(value) <= 0) {
          throw new Error(
            "Ticket price is needed and has to be greater than 0 for paid events",
          );
        }
      }
      return true;
    }),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category must be less than 100 characters"),
  body("imageUrl").optional().trim().isURL().withMessage("Invalid image URL"),
  body("organizationId")
    .notEmpty()
    .withMessage("Organization ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid organization ID"),
  body("organizerId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid organizer ID"),
];
