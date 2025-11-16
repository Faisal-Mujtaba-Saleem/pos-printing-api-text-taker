import { User } from "@/models/user.model";

const storeUserToDB = async (userData) => {
  if (await User.isUserExists(userData.email)) {
    console.log("User exist for: ", userData.email);
    return;
  } else {
    const result = await User.create(userData);
    return result;
  }
};

// const getSingleUserFromDB = async (email) => {
//   const result = await User.findOne({ email: email });
//   return result;
// };

// const getAllUserFromDB = async () => {
//   // This query will return unique users , if a user has more than one duplicated value it will show one value
//   const result = await User.find();
//   return result;
// };

// const checkAdminFromDB = async (email) => {
//   const user = User.findOne({ email: email, role: "admin" });
//   return !!user; // return true or false
// };

export const UserServices = {
  storeUserToDB,
  // getSingleUserFromDB,
  // getAllUserFromDB,
  // checkAdminFromDB,
};
