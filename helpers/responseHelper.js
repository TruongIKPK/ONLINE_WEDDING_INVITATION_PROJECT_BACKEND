/**
 * Tạo response thành công chuẩn cho API
 * @param {any} data - Dữ liệu trả về
 * @param {string} message - Thông báo thành công (mặc định: 'Success')
 * @returns {Object} Response object với format chuẩn
 */
export const successResponse = (data, message = 'Success') => ({
  success: true,        // Trạng thái thành công
  message,              // Thông báo
  data,                 // Dữ liệu trả về
  timestamp: new Date().toISOString() // Thời gian phản hồi theo chuẩn ISO
});

/**
 * Tạo response lỗi chuẩn cho API
 * @param {string} message - Thông báo lỗi (mặc định: 'Something went wrong')
 * @param {number} code - Mã lỗi HTTP (mặc định: 500)
 * @param {any} details - Chi tiết lỗi (tùy chọn)
 * @returns {Object} Response object lỗi với format chuẩn
 */
export const errorResponse = (message = 'Something went wrong', code = 500, details = null) => ({
  success: false,       // Trạng thái thất bại
  message,              // Thông báo lỗi
  code,                 // Mã lỗi HTTP
  details,              // Chi tiết lỗi (nếu có)
  timestamp: new Date().toISOString() // Thời gian phản hồi theo chuẩn ISO
});

/**
 * Tạo response có phân trang cho API
 * @param {any} data - Dữ liệu trả về
 * @param {Object} pagination - Thông tin phân trang
 * @param {number} pagination.total - Tổng số bản ghi
 * @param {number} pagination.page - Trang hiện tại
 * @param {number} pagination.limit - Số bản ghi trên mỗi trang
 * @param {string} message - Thông báo thành công (mặc định: 'Success')
 * @returns {Object} Response object có phân trang với format chuẩn
 */
export const paginationResponse = (data, pagination, message = 'Success') => ({
  success: true,        // Trạng thái thành công
  message,              // Thông báo
  data,                 // Dữ liệu trả về
  pagination:{
    total: pagination.total,        // Tổng số bản ghi
    page: pagination.page,          // Trang hiện tại
    limit: pagination.limit,        // Số bản ghi trên mỗi trang
    totalPages: Math.ceil(pagination.total / pagination.limit) // Tổng số trang (làm tròn lên)
  },
  timestamp: new Date().toISOString() // Thời gian phản hồi theo chuẩn ISO
})

/**
 * Tạo response lỗi validation cho API
 * @param {Object} errors - Đối tượng chứa lỗi validation
 * @returns {Object} Response object lỗi validation với format chuẩn
 */
export const validationErrorResponse = (errors) => ({
  success: false,       // Trạng thái thất bại
  message: 'Validation failed', // Thông báo lỗi validation
  code: 422,            // Mã lỗi HTTP 422 (Unprocessable Entity)
  errors,               // Chi tiết lỗi validation
  timestamp: new Date().toISOString() // Thời gian phản hồi theo chuẩn ISO
})

/**
 * Object chứa các hàm response chuẩn cho Repository pattern
 * Giúp tạo ra các response nhất quán cho các thao tác CRUD
 */
export const repositoryResponse = {
  // Tạo response khi tạo mới bản ghi thành công
  created: (data, message = "Record created successfully") => 
    successResponse(data, message),

  // Tạo response khi tìm thấy bản ghi
  found: (data, message = "Record found") =>
    successResponse(data, message),

  // Tạo response khi xóa bản ghi thành công
  deleted: (message = "Record deleted successfully") =>
    successResponse(null, message),

  // Tạo response khi không tìm thấy bản ghi (404)
  notFound: (resource = "Record") =>
    errorResponse(`${resource} not found`, 404),

  // Tạo response khi có xung đột dữ liệu (409) - ví dụ: email đã tồn tại
  conflict: (message = "Record already exists") =>
    errorResponse(message, 409),

  // Tạo response khi không có quyền truy cập (403)
  forbidden: (message = "Access forbidden") =>
    errorResponse(message, 403),

  // Tạo response khi chưa xác thực (401)
  unauthorized: (message = "Unauthorized access") =>
    errorResponse(message, 401)
}