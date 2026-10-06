import express from "express";

import {
  createAddress,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/AddressController.js";

const router = express.Router();

router.post("/", createAddress);

router.get("/", getMyAddresses);

router.get("/:id", getAddressById);

router.put("/:id", updateAddress);

router.patch("/:id/default", setDefaultAddress);

router.delete("/:id", deleteAddress);

export default router;