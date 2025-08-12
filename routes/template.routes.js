import express from 'express';
import { TemplateController } from '../controllers/template.controller.js';

const router = express.Router();
const templateController = new TemplateController();

// GET /templates - Lấy tất cả thiệp với phân trang và tìm kiếm
router.get('/', templateController.getAllTemplates);

// GET /templates/:id - Lấy chi tiết 1 thiệp
router.get('/:id', templateController.getTemplateById);

export default router;