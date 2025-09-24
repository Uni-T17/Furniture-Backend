export const removeZeroNine = (phone: string) => {
  let actual = phone;
  if (phone.slice(0, 2) === "09") {
    actual = phone.substring(2, phone.length);
  }
  return actual;
};
