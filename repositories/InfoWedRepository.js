import BaseRepository from "./BaseRepository.js";
import { where, fn, col, Op } from 'sequelize';
import db from '../models/index.js';

class InfoWedRepository extends BaseRepository {
    constructor() {
        super(db.InfoWed);
    }

    // Lấy wedding info với template
    async getWeddingWithTemplate(weddingId) {
        try {
            return await this.model.findByPk(weddingId, {
                include: [
                    {
                        model: db.Template,
                        as: 'Template',
                        attributes: ['id_template', 'index', 'content']
                    },
                    {
                        model: db.User,
                        as: 'User',
                        attributes: ['id_user', 'username', 'full_name', 'email']
                    }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching wedding with template: ${error.message}`);
        }
    }

    // Lấy weddings theo user ID
    async getWeddingsByUserId(userId, options = {}) {
        try {
            const { limit, offset } = options;

            return await this.findAndCountAll({
                where: { id_user: userId },
                include: [
                    {
                        model: db.Template,
                        as: 'Template',
                        attributes: ['index', 'content']
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching weddings by user ID: ${error.message}`);
        }
    }

    // Lấy wedding với content templates
    async getWeddingWithContent(weddingId) {
        try {
            return await this.model.findByPk(weddingId, {
                include: [
                    {
                        model: db.ContentTemplate,
                        as: 'ContentTemplates',
                        attributes: ['id_content', 'index', 'content'],
                        order: [['index', 'ASC']]
                    },
                    {
                        model: db.Template,
                        as: 'Template',
                        attributes: ['index', 'content']
                    }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching wedding with content: ${error.message}`);
        }
    }

    // Lấy wedding với forms (guest responses)
    async getWeddingWithForms(weddingId) {
        try {
            return await this.model.findByPk(weddingId, {
                include: [
                    {
                        model: db.Form,
                        as: 'Forms',
                        attributes: ['id_form', 'fullname', 'email', 'is_attend', 'number_of_guests']
                    }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching wedding with forms: ${error.message}`);
        }
    }

    // Tìm kiếm wedding theo tên cô dâu/chú rể
    async searchWeddings(searchTerm, userId = null) {
        try {
            const searchPattern = `%${searchTerm}%`;
            const whereCondition = {
                [Op.or]: [
                    { tencodau: { [Op.like]: searchPattern } },
                    { tenchure: { [Op.like]: searchPattern } }
                ]
            };

            if (userId) {
                whereCondition.id_user = userId;
            }

            return await this.getAll({
                where: whereCondition,
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error searching weddings: ${error.message}`);
        }
    }

    // Lấy weddings theo ngày cưới
    async getWeddingsByDate(date, userId = null) {
        try {
            const whereCondition = { ngaycuoi: date };

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
            throw new Error(`Error fetching weddings by date: ${error.message}`);
        }
    }

    // Update wedding info
    async updateWeddingInfo(weddingId, weddingData) {
        try {
            const updateData = {
                tencodau: weddingData.tencodau,
                tenchure: weddingData.tenchure,
                diachi: weddingData.diachi,
                ngaycuoi: weddingData.ngaycuoi
            };

            // Update template nếu có
            if (weddingData.id_template) {
                updateData.id_template = weddingData.id_template;
            }

            const [updatedRowsCount] = await this.model.update(updateData, {
                where: { id_info_wed: weddingId }
            });

            if (updatedRowsCount === 0) {
                throw new Error(`Wedding with id ${weddingId} not found`);
            }

            return await this.getById(weddingId);
        } catch (error) {
            throw new Error(`Error updating wedding info: ${error.message}`);
        }
    }

    // Lấy wedding statistics cho user
    async getUserWeddingStats(userId) {
        try {
            const stats = await this.model.findAll({
                where: { id_user: userId },
                attributes: [
                    [fn('COUNT', col('*')), 'total_weddings'],
                    [fn('COUNT', fn('CASE', where(col('ngaycuoi'), Op.gte, new Date().toISOString().split('T')[0]), 1, null)), 'upcoming_weddings'],
                    [fn('COUNT', fn('CASE', where(col('ngaycuoi'), Op.lt, new Date().toISOString().split('T')[0]), 1, null)), 'past_weddings']
                ],
                raw: true
            });

            return stats[0] || {};
        } catch (error) {
            throw new Error(`Error fetching user wedding stats: ${error.message}`);
        }
    }

    // Assign template to wedding
    async assignTemplate(weddingId, templateId) {
        try {
            const [updatedRowsCount] = await this.model.update(
                { id_template: templateId },
                { where: { id_info_wed: weddingId } }
            );

            return updatedRowsCount > 0;
        } catch (error) {
            throw new Error(`Error assigning template: ${error.message}`);
        }
    }

    // Clone wedding
    async cloneWedding(weddingId, userId) {
        try {
            const originalWedding = await this.getById(weddingId);
            if (!originalWedding) {
                throw new Error('Wedding not found');
            }

            const clonedData = {
                id_user: userId,
                id_template: originalWedding.id_template,
                tencodau: originalWedding.tencodau + ' (Copy)',
                tenchure: originalWedding.tenchure,
                diachi: originalWedding.diachi,
                ngaycuoi: originalWedding.ngaycuoi
            };

            return await this.create(clonedData);
        } catch (error) {
            throw new Error(`Error cloning wedding: ${error.message}`);
        }
    }
}

export default InfoWedRepository;