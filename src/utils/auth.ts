export const checkUserExist = (user: any) => {
  if (user) {
    const error: any = new Error("User Already Exist");
    error.status = 409;
    error.code = "Error_AlreadyExist";
    throw error;
  }
};
