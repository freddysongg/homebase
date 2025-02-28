import Household from "@models/Household.js";
import User from "@models/User.js";

export const getHouseholdMembers = async (householdId) => {
  const users = await User.find({ household_id: householdId });
  return users.map((user) => user._id);
};

export const validateHouseholdMembership = async (userId, householdId) => {
  const user = await User.findById(userId);
  return user && user.household_id.toString() === householdId.toString();
};
