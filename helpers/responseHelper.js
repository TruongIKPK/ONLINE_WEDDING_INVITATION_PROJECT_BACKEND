export const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message = 'Something went wrong', code = 500) => ({
  success: false,
  message,
  code,
});
