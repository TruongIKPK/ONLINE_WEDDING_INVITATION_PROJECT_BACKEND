import BaseRepository from "./BaseRepository.js";
import { where, fn, col, Op } from 'sequelize';
import db from '../models/index.js'

class UserRepository extends BaseRepository {
    constructor() {
        super(db.User);
    }

    // Tìm user theo email
    async findByEmail(email) {
        try {
            return await this.findOne({ email });
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    // Tìm user theo username
    async findByUsername(username) {
        try {
            return await this.findOne({ username });
        } catch (error) {
            throw new Error(`Error finding user by username: ${error.message}`);
        }
    }

    // Kiểm tra email đã tồn tại hay chưa
    async emailExists(email, excludeUserId = null) {
        try {
            const whereCondition = { email };
            
            // Nếu cần exclude một user ID
            if (excludeUserId) {
                whereCondition.id_user = {
                    [Op.ne]: excludeUserId
                };
            }

            const user = await this.model.findOne({
                where: whereCondition,
                attributes: ['id_user']
            });

            return !!user;
        } catch (error) {
            throw new Error(`Error checking email existence: ${error.message}`);
        }
    }

    // Kiểm tra username đã tồn tại hay chưa
    async usernameExists(username, excludeUserId = null) {
        try {
            const whereCondition = { username };
            
            if (excludeUserId) {
                whereCondition.id_user = {
                    [Op.ne]: excludeUserId
                };
            }

            const user = await this.model.findOne({
                where: whereCondition,
                attributes: ['id_user']
            });

            return !!user;
        } catch (error) {
            throw new Error(`Error checking username existence: ${error.message}`);
        }
    }

    // Tìm kiếm user theo multiple fields (Full name || Username || Email)
    async searchUsers(searchTerm, options = {}) {
        try {
            const { limit = 10, offset = 0 } = options;
            const searchPattern = `%${searchTerm}%`;

            return await this.findAndCountAll({
                where: {
                    [Op.or]: [
                        { full_name: { [Op.like]: searchPattern } },
                        { username: { [Op.like]: searchPattern } },
                        { email: { [Op.like]: searchPattern } }
                    ]
                },
                attributes: { exclude: ['password'] },
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error searching users: ${error.message}`);
        }
    }

    // Lấy users theo email domain
    async getUsersByEmailDomain(domain) {
        try {
            return await this.getAll({
                where: {
                    email: {
                        [Op.like]: `%@${domain}`
                    }
                },
                attributes: { exclude: ['password'] }
            });
        } catch (error) {
            throw new Error(`Error fetching users by email domain: ${error.message}`);
        }
    }

    // Lấy users được tạo trong khoảng thời gian
    async getUsersByDateRange(startDate, endDate) {
        try {
            return await this.getAll({
                where: {
                    created_at: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                attributes: { exclude: ['password'] },
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching users by date range: ${error.message}`);
        }
    }

    // Lấy users active (có thể login được)
    async getActiveUsers() {
        try {
            return await this.getAll({
                where: {
                    password: {
                        [Op.not]: null
                    },
                    email: {
                        [Op.not]: null
                    }
                },
                attributes: { exclude: ['password'] }
            });
        } catch (error) {
            throw new Error(`Error fetching active users: ${error.message}`);
        }
    }

    // Lấy user với wedding information
    async getUserWithWeddings(userId) {
        try {
            const user = await this.model.findByPk(userId, {
                include: [
                    {
                        association: 'InfoWeds',
                        attributes: ['id_wedding', 'bride_name', 'groom_name', 'wedding_date']
                    }
                ],
                attributes: { exclude: ['password'] }
            });

            return user ? user.toJSON() : null;
        } catch (error) {
            throw new Error(`Error fetching user with weddings: ${error.message}`);
        }
    }

    // Cập nhật hồ sơ User - Trừ các field nhạy cảm
    async updateProfile(userId, profileData) {
        try {
            // Loại bỏ các field nhạy cảm
            const { password, id_user, created_at, ...updateData } = profileData;
            
            const [updatedRowsCount] = await this.model.update(updateData, {
                where: { id_user: userId }
            });

            if (updatedRowsCount === 0) {
                throw new Error(`No user found with id ${userId}`);
            }

            return await this.getById(userId);
        } catch (error) {
            throw new Error(`Error updating user profile: ${error.message}`);
        }
    }

    // Cập nhật mật khẩu
    async updatePassword(userId, hashedPassword) {
        try {
            const [updatedRowsCount] = await this.model.update(
                { password: hashedPassword },
                { where: { id_user: userId } }
            );

            return updatedRowsCount > 0;
        } catch (error) {
            throw new Error(`Error updating password: ${error.message}`);
        }
    }

    // Override getById để exclude password mặc định
    async getById(id, options = {}) {
        try {
            const defaultOptions = {
                attributes: { exclude: ['password'] },
                ...options
            };

            const record = await this.model.findByPk(id, defaultOptions);
            return record ? record.toJSON() : null;
        } catch (error) {
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    // Get user WITH password (cho authentication)
    async getByIdWithPassword(id) {
        try {
            const record = await this.model.findByPk(id);
            return record ? record.toJSON() : null;
        } catch (error) {
            throw new Error(`Error fetching user with password: ${error.message}`);
        }
    }

    // Lấy users không có trong danh sách IDs
    async getUsersExcluding(excludeIds) {
        try {
            return await this.getAll({
                where: {
                    id_user: {
                        [Op.notIn]: excludeIds
                    }
                },
                attributes: { exclude: ['password'] }
            });
        } catch (error) {
            throw new Error(`Error fetching users excluding IDs: ${error.message}`);
        }
    }

    // Bulk update users (Cập nhật nhanh nhiều bản ghi)
    async bulkUpdateUsers(userIds, updateData) {
        try {
            const [updatedCount] = await this.model.update(updateData, {
                where: {
                    id_user: {
                        [Op.in]: userIds
                    }
                }
            });

            return updatedCount;
        } catch (error) {
            throw new Error(`Error bulk updating users: ${error.message}`);
        }
    }
}

export default UserRepository;