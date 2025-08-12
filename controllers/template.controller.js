import { TemplateRepository } from '../repositories/index.js';
import { successResponse, errorResponse, repositoryResponse } from '../helpers/responseHelper.js';

export class TemplateController {
    constructor() {
        this.templateRepository = new TemplateRepository();
    }

    //GET /templates– API lấy tất cả thiệp, hỗ trợ phân trang, tìm kiếm
    getAllTemplates = async (req, res) => {
        try {
            const {
                page = 1,
                limit = 12,
                search = '',
                sort_by = 'created_at',
                sort_order = 'DESC'
            } = req.query;

            console.log('📥 Request params:', { page, limit, search, sort_by, sort_order });

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            if (pageNum < 1 || limitNum < 1) {
                return res.status(400).json(
                    errorResponse('Page and limit must be positive numbers')
                );
            }

            if (limitNum > 100) {
                return res.status(400).json(
                    errorResponse('Limit cannot exceed 100')
                );
            }

            const offset = (pageNum - 1) * limitNum;

            const filters = {
                search: search.trim(),
                sort_by,
                sort_order: sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
            };

            console.log('🔧 Processing with filters:', filters);

            const result = await this.templateRepository.getAllWithFilters({
                limit: limitNum,
                offset,
                filters
            });

            const totalPages = Math.ceil(result.count / limitNum);
            const hasNextPage = pageNum < totalPages;
            const hasPrevPage = pageNum > 1;

            const response = {
                templates: result.rows,
                pagination: {
                    current_page: pageNum,
                    total_pages: totalPages,
                    per_page: limitNum,
                    total_items: result.count,
                    has_next_page: hasNextPage,
                    has_prev_page: hasPrevPage,
                    next_page: hasNextPage ? pageNum + 1 : null,
                    prev_page: hasPrevPage ? pageNum - 1 : null
                },
                filters: {
                    search,
                    sort_by,
                    sort_order
                }
            };

            console.log('✅ Response ready:', { 
                templateCount: result.rows.length, 
                totalItems: result.count 
            });

            res.json(successResponse(
                response, 
                `Retrieved ${result.rows.length} templates successfully`
            ));

        } catch (error) {
            console.error('❌ Get templates error:', error);
            res.status(500).json(errorResponse(error.message));
        }
    };

    getTemplateById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(
                    errorResponse('Template ID is required')
                );
            }

            console.log('🔍 Looking for template with ID:', id);

            const template = await this.templateRepository.getById(id);

            if (!template) {
                return res.status(404).json(
                    repositoryResponse.notFound('Template')
                );
            }

            console.log('✅ Template found:', template.id_template);

            res.json(successResponse(
                template, 
                'Template retrieved successfully'
            ));

        } catch (error) {
            console.error('❌ Get template by ID error:', error);
            res.status(500).json(errorResponse(error.message));
        }
    };
}

export default TemplateController;

