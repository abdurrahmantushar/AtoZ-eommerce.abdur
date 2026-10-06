import { fromNodeHeaders } from "better-auth/node";

import Address from "../models/Address.js";
import { auth } from "../lib/auth.js";

const getUserSession = async (req) => {
  return await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};

export const createAddress = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      fullName,
      phone,
      addressLine,
      city,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { userId: session.user.id },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      userId: session.user.id,
      fullName,
      phone,
      addressLine,
      city,
      postalCode,
      country,
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({
      success: true,
      message: "Address created successfully.",
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyAddresses = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const addresses = await Address.find({
      userId: session.user.id,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAddressById = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const address = await Address.findOne({
      _id: req.params.id,
      userId: session.user.id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const address = await Address.findOne({
      _id: req.params.id,
      userId: session.user.id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const {
      fullName,
      phone,
      addressLine,
      city,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (isDefault === true) {
      await Address.updateMany(
        {
          userId: session.user.id,
          _id: { $ne: address._id },
        },
        {
          isDefault: false,
        }
      );
    }

    address.fullName = fullName ?? address.fullName;
    address.phone = phone ?? address.phone;
    address.addressLine =
      addressLine ?? address.addressLine;
    address.city = city ?? address.city;
    address.postalCode =
      postalCode ?? address.postalCode;
    address.country = country ?? address.country;

    if (isDefault !== undefined) {
      address.isDefault = Boolean(isDefault);
    }

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: session.user.id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const address = await Address.findOne({
      _id: req.params.id,
      userId: session.user.id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    await Address.updateMany(
      {
        userId: session.user.id,
      },
      {
        isDefault: false,
      }
    );

    address.isDefault = true;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully.",
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};