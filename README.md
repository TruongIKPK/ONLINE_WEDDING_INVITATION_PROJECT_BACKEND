# ONLINE_WEDDING_INVITATION_PROJECT_BACKEND

# ONLINE_WEDDING_INVITATION_PROJECT_BACKEND

Các câu lệnh cần cài!
npm install dotenv
npm install sequelize sequelize-cli mysql2

npm install uuid

## JSON Response Format

All API responses use a consistent structure via `src/helpers/responseHelper.js`.

### Success:
{
  "success": true,
  "message": "Success",
  "data": {...}
}

### Error
{
  "success": false,
  "message": "Error message",
  "code": 500
}



