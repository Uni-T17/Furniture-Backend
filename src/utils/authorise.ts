export const isAuthorise = (
  permission: boolean,
  userRole: string,
  ...roles: string[]
) => {
  let isAuthorise = true;

  const result = roles.includes(userRole);
  if (permission && !result) {
    isAuthorise = false;
  }
  if (!permission && result) {
    isAuthorise = false;
  }
  return isAuthorise;
};
