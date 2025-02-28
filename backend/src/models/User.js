import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 8;
        },
        message: "Password must be at least 8 characters long",
      },
    },
    household_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
    },
    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      reminder_times: [
        {
          type: String,
        },
      ],
    },
    chore_history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chore",
      },
    ],
    expense_contributions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expense",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
