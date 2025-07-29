import BaseRepository from "./BaseRepository.js";
import { where, fn, col, Op } from 'sequelize';
import db from '../models/index.js';

class UserMediaRepository extends BaseRepository {
    constructor() {
        super(db.UserMedia);
    }

    // Lấy tất cả media của user
    async getMediaByUserId(userId, options = {}) {
        try {
            const { type, limit, offset } = options;
            const whereCondition = { id_user: userId };

            // Filter theo type nếu có
            if (type) {
                whereCondition.type = type;
            }

            return await this.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: db.User,
                        as: 'User',
                        attributes: ['username', 'full_name']
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching media by user ID: ${error.message}`);
        }
    }

    // Lấy media theo type
    async getMediaByType(type, userId = null) {
        try {
            const whereCondition = { type };

            if (userId) {
                whereCondition.id_user = userId;
            }

            return await this.getAll({
                where: whereCondition,
                include: [
                    {
                        model: db.User,
                        as: 'User',
                        attributes: ['username', 'full_name']
                    }
                ],
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching media by type: ${error.message}`);
        }
    }

    // Upload multiple media files
    async bulkCreateMedia(userId, mediaFiles) {
        try {
            const mediaData = mediaFiles.map(file => ({
                id_user: userId,
                url_media: file.url,
                type: file.type || this.detectMediaType(file.url)
            }));

            const mediaRecords = await this.model.bulkCreate(mediaData, {
                returning: true
            });

            return mediaRecords.map(media => media.toJSON());
        } catch (error) {
            throw new Error(`Error bulk creating media: ${error.message}`);
        }
    }

    // Detect media type từ URL/extension
    detectMediaType(url) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];

        const urlLower = url.toLowerCase();

        if (imageExtensions.some(ext => urlLower.includes(ext))) {
            return 'image';
        } else if (videoExtensions.some(ext => urlLower.includes(ext))) {
            return 'video';
        } else if (audioExtensions.some(ext => urlLower.includes(ext))) {
            return 'audio';
        }

        return 'other';
    }

    // Lấy media statistics cho user
    async getUserMediaStats(userId) {
        try {
            const stats = await this.model.findAll({
                where: { id_user: userId },
                attributes: [
                    [fn('COUNT', col('*')), 'total_media'],
                    [fn('COUNT', fn('CASE', where(col('type'), 'image'), 1, null)), 'total_images'],
                    [fn('COUNT', fn('CASE', where(col('type'), 'video'), 1, null)), 'total_videos'],
                    [fn('COUNT', fn('CASE', where(col('type'), 'audio'), 1, null)), 'total_audios']
                ],
                raw: true
            });

            return stats[0] || {};
        } catch (error) {
            throw new Error(`Error fetching user media stats: ${error.message}`);
        }
    }

    // Tìm kiếm media theo URL pattern
    async searchMedia(searchTerm, userId = null) {
        try {
            const searchPattern = `%${searchTerm}%`;
            const whereCondition = {
                url_media: { [Op.like]: searchPattern }
            };

            if (userId) {
                whereCondition.id_user = userId;
            }

            return await this.getAll({
                where: whereCondition,
                include: [
                    {
                        model: db.User,
                        as: 'User',
                        attributes: ['username', 'full_name']
                    }
                ],
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error searching media: ${error.message}`);
        }
    }

    // Update media info
    async updateMedia(mediaId, mediaData) {
        try {
            const updateData = {};

            if (mediaData.url_media) {
                updateData.url_media = mediaData.url_media;
            }

            if (mediaData.type) {
                updateData.type = mediaData.type;
            }

            const [updatedRowsCount] = await this.model.update(updateData, {
                where: { id_user_media: mediaId }
            });

            if (updatedRowsCount === 0) {
                throw new Error(`Media with id ${mediaId} not found`);
            }

            return await this.getById(mediaId);
        } catch (error) {
            throw new Error(`Error updating media: ${error.message}`);
        }
    }

    // Bulk delete media của user
    async bulkDeleteUserMedia(userId, mediaIds) {
        try {
            const deletedCount = await this.model.destroy({
                where: {
                    id_user: userId,
                    id_user_media: {
                        [Op.in]: mediaIds
                    }
                }
            });

            return deletedCount;
        } catch (error) {
            throw new Error(`Error bulk deleting user media: ${error.message}`);
        }
    }

    // Get media by date range
    async getMediaByDateRange(userId, startDate, endDate) {
        try {
            return await this.getAll({
                where: {
                    id_user: userId,
                    created_at: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching media by date range: ${error.message}`);
        }
    }

    // Get recent media
    async getRecentMedia(userId, limit = 10) {
        try {
            return await this.getAll({
                where: { id_user: userId },
                limit,
                order: [['created_at', 'DESC']],
                attributes: ['id_user_media', 'url_media', 'type', 'created_at']
            });
        } catch (error) {
            throw new Error(`Error fetching recent media: ${error.message}`);
        }
    }

    // Check if media URL exists
    async mediaUrlExists(url, userId = null) {
        try {
            const whereCondition = { url_media: url };

            if (userId) {
                whereCondition.id_user = userId;
            }

            const media = await this.findOne(whereCondition);
            return !!media;
        } catch (error) {
            throw new Error(`Error checking media URL existence: ${error.message}`);
        }
    }

    // Get media gallery for user (grouped by type)
    async getUserMediaGallery(userId) {
        try {
            const gallery = await this.model.findAll({
                where: { id_user: userId },
                attributes: [
                    'type',
                    [fn('COUNT', col('*')), 'count'],
                    [fn('GROUP_CONCAT', col('url_media')), 'urls']
                ],
                group: ['type'],
                raw: true
            });

            // Format gallery data
            const formattedGallery = {};
            gallery.forEach(group => {
                formattedGallery[group.type] = {
                    count: group.count,
                    urls: group.urls ? group.urls.split(',') : []
                };
            });

            return formattedGallery;
        } catch (error) {
            throw new Error(`Error fetching user media gallery: ${error.message}`);
        }
    }

    // Clean up broken media links
    async cleanupBrokenMedia(userId) {
        try {
            // This would typically involve checking if URLs are still valid
            // For now, just remove media with empty URLs
            const deletedCount = await this.model.destroy({
                where: {
                    id_user: userId,
                    [Op.or]: [
                        { url_media: null },
                        { url_media: '' }
                    ]
                }
            });

            return deletedCount;
        } catch (error) {
            throw new Error(`Error cleaning up broken media: ${error.message}`);
        }
    }
}

export default UserMediaRepository;