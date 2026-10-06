import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index(
  { userId: 1, product: 1 },
  { unique: true }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;