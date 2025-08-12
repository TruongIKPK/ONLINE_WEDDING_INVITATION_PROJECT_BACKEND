import BaseRepository from './BaseRepository.js';
import { Op } from 'sequelize';

export class TemplateRepository extends BaseRepository {
    constructor() {
        super();
        // Đảm bảo model được thiết lập khi khởi tạo
        setTimeout(() => this.initializeModel(), 100);
    }

    initializeModel() {
        if (this.db && this.db.Template) {
            this.setModel(this.db.Template);
            console.log('✅ TemplateRepository model initialized');
        } else {
            console.warn('⚠️ Template model not available yet');
        }
    }

    ensureModel() {
        if (!this.model && this.db && this.db.Template) {
            this.setModel(this.db.Template);
        }
        if (!this.model) {
            throw new Error('Template model not initialized. Make sure the database connection is established.');
        }
    }

    async getAllWithFilters({ limit, offset, filters }) {
        try {
            this.ensureModel();
            
            const whereClause = {};
            const orderClause = [];

            // Search filter - chỉ tìm trong content
            if (filters.search) {
                whereClause.content = {
                    [Op.like]: `%${filters.search}%`
                };
            }

            // Sorting
            const validSortFields = ['id_template', 'index', 'created_at'];
            if (validSortFields.includes(filters.sort_by)) {
                orderClause.push([filters.sort_by, filters.sort_order]);
            } else {
                orderClause.push(['created_at', 'DESC']);
            }

            console.log('🔍 Query filters:', whereClause);
            console.log('📊 Order clause:', orderClause);

            const result = await this.model.findAndCountAll({
                where: whereClause,
                order: orderClause,
                limit,
                offset,
                attributes: ['id_template', 'index', 'content', 'created_at']
            });

            console.log(`📋 Found ${result.count} templates`);
            return result;

        } catch (error) {
            console.error('TemplateRepository.getAllWithFilters error:', error);
            throw new Error(`Failed to get templates: ${error.message}`);
        }
    }

    async searchByContent(searchTerm, { limit = 10, offset = 0 } = {}) {
        try {
            this.ensureModel();
            
            return await this.model.findAndCountAll({
                where: {
                    content: {
                        [Op.like]: `%${searchTerm}%`
                    }
                },
                order: [['created_at', 'DESC']],
                limit,
                offset
            });
        } catch (error) {
            console.error('TemplateRepository.searchByContent error:', error);
            throw new Error(`Failed to search templates: ${error.message}`);
        }
    }

    async getByIndex(index) {
        try {
            this.ensureModel();
            
            return await this.model.findOne({
                where: { index },
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            console.error('TemplateRepository.getByIndex error:', error);
            throw new Error(`Failed to get template by index: ${error.message}`);
        }
    }
}

export default TemplateRepository;