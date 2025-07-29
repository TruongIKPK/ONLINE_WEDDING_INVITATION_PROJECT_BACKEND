import BaseRepository from "./BaseRepository.js";
import { where, fn, col, Op } from 'sequelize';
import db from '../models/index.js';

class TemplateRepository extends BaseRepository {
    constructor() {
        super(db.Template);
    }

    // Lấy templates theo index (ordered)
    async getTemplatesByIndex() {
        try {
            return await this.getAll({
                order: [['index', 'ASC']],
                attributes: ['id_template', 'index', 'content', 'created_at']
            });
        } catch (error) {
            throw new Error(`Error fetching templates by index: ${error.message}`);
        }
    }

    // Lấy template với usage count
    async getTemplatesWithUsage() {
        try {
            const templates = await this.model.findAll({
                include: [
                    {
                        model: db.InfoWed,
                        as: 'InfoWeds',
                        attributes: []
                    }
                ],
                attributes: [
                    'id_template',
                    'index',
                    'content',
                    'created_at',
                    [fn('COUNT', col('InfoWeds.id_info_wed')), 'usage_count']
                ],
                group: ['Template.id_template'],
                order: [['index', 'ASC']]
            });

            return templates.map(template => template.toJSON());
        } catch (error) {
            throw new Error(`Error fetching templates with usage: ${error.message}`);
        }
    }

    // Tìm template theo content
    async searchTemplates(searchTerm) {
        try {
            const searchPattern = `%${searchTerm}%`;

            return await this.getAll({
                where: {
                    content: { [Op.like]: searchPattern }
                },
                order: [['index', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error searching templates: ${error.message}`);
        }
    }

    // Update template index (reorder)
    async updateTemplateIndex(templateId, newIndex) {
        try {
            const [updatedRowsCount] = await this.model.update(
                { index: newIndex },
                { where: { id_template: templateId } }
            );

            return updatedRowsCount > 0;
        } catch (error) {
            throw new Error(`Error updating template index: ${error.message}`);
        }
    }

    // Get most popular templates
    async getPopularTemplates(limit = 5) {
        try {
            const templates = await this.model.findAll({
                include: [
                    {
                        model: db.InfoWed,
                        as: 'InfoWeds',
                        attributes: []
                    }
                ],
                attributes: [
                    'id_template',
                    'index',
                    'content',
                    [fn('COUNT', col('InfoWeds.id_info_wed')), 'usage_count']
                ],
                group: ['Template.id_template'],
                order: [[fn('COUNT', col('InfoWeds.id_info_wed')), 'DESC']],
                limit
            });

            return templates.map(template => template.toJSON());
        } catch (error) {
            throw new Error(`Error fetching popular templates: ${error.message}`);
        }
    }

    // Clone template
    async cloneTemplate(templateId) {
        try {
            const originalTemplate = await this.getById(templateId);
            if (!originalTemplate) {
                throw new Error('Template not found');
            }

            const clonedData = {
                index: originalTemplate.index + 1,
                content: originalTemplate.content
            };

            return await this.create(clonedData);
        } catch (error) {
            throw new Error(`Error cloning template: ${error.message}`);
        }
    }
}

export default TemplateRepository;