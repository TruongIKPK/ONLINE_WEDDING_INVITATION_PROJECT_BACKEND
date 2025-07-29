import BaseRepository from "./BaseRepository.js";
import { where, fn, col, Op } from 'sequelize';
import db from '../models/index.js';

class ContentTemplateRepository extends BaseRepository {
    constructor() {
        super(db.ContentTemplate);
    }

    // Lấy content templates theo wedding ID (ordered by index)
    async getContentByWeddingId(weddingId) {
        try {
            return await this.getAll({
                where: { id_info_wed: weddingId },
                include: [
                    {
                        model: db.InfoWed,
                        as: 'InfoWed',
                        attributes: ['tencodau', 'tenchure', 'ngaycuoi']
                    }
                ],
                order: [['index', 'ASC']],
                attributes: ['id_content', 'index', 'content', 'created_at']
            });
        } catch (error) {
            throw new Error(`Error fetching content by wedding ID: ${error.message}`);
        }
    }

    // Lấy content template theo index
    async getContentByIndex(weddingId, index) {
        try {
            return await this.findOne({
                id_info_wed: weddingId,
                index: index
            });
        } catch (error) {
            throw new Error(`Error fetching content by index: ${error.message}`);
        }
    }

    // Create content template với auto index
    async createContentWithAutoIndex(weddingId, content) {
        try {
            // Tìm index cao nhất hiện tại
            const maxIndexResult = await this.model.findOne({
                where: { id_info_wed: weddingId },
                attributes: [[fn('MAX', col('index')), 'maxIndex']],
                raw: true
            });

            const maxIndex = maxIndexResult?.maxIndex || 0;
            const newIndex = maxIndex + 1;

            const contentData = {
                id_info_wed: weddingId,
                index: newIndex,
                content: content
            };

            return await this.create(contentData);
        } catch (error) {
            throw new Error(`Error creating content with auto index: ${error.message}`);
        }
    }

    // Bulk create content templates
    async bulkCreateContent(weddingId, contentList) {
        try {
            const contentData = contentList.map((content, idx) => ({
                id_info_wed: weddingId,
                index: idx + 1,
                content: content
            }));

            const contents = await this.model.bulkCreate(contentData, {
                returning: true
            });

            return contents.map(content => content.toJSON());
        } catch (error) {
            throw new Error(`Error bulk creating content: ${error.message}`);
        }
    }

    // Update content template
    async updateContent(contentId, contentData) {
        try {
            const updateData = {};

            if (contentData.content !== undefined) {
                updateData.content = contentData.content;
            }

            if (contentData.index !== undefined) {
                updateData.index = contentData.index;
            }

            const [updatedRowsCount] = await this.model.update(updateData, {
                where: { id_content: contentId }
            });

            if (updatedRowsCount === 0) {
                throw new Error(`Content template with id ${contentId} not found`);
            }

            return await this.getById(contentId);
        } catch (error) {
            throw new Error(`Error updating content template: ${error.message}`);
        }
    }

    // Reorder content templates
    async reorderContents(weddingId, contentOrders) {
        try {
            const promises = contentOrders.map(({ contentId, newIndex }) => 
                this.model.update(
                    { index: newIndex },
                    { where: { id_content: contentId, id_info_wed: weddingId } }
                )
            );

            await Promise.all(promises);

            // Return updated contents in order
            return await this.getContentByWeddingId(weddingId);
        } catch (error) {
            throw new Error(`Error reordering contents: ${error.message}`);
        }
    }

    // Insert content at specific index (shift others)
    async insertContentAtIndex(weddingId, index, content) {
        try {
            // Shift existing contents với index >= target index
            await this.model.update(
                { index: db.sequelize.literal('`index` + 1') },
                { 
                    where: { 
                        id_info_wed: weddingId,
                        index: { [Op.gte]: index }
                    }
                }
            );

            // Insert new content
            const contentData = {
                id_info_wed: weddingId,
                index: index,
                content: content
            };

            return await this.create(contentData);
        } catch (error) {
            throw new Error(`Error inserting content at index: ${error.message}`);
        }
    }

    // Delete content và adjust indexes
    async deleteContentAndAdjust(contentId) {
        try {
            // Get content để biết wedding ID và index
            const contentToDelete = await this.getById(contentId);
            if (!contentToDelete) {
                throw new Error('Content not found');
            }

            const { id_info_wed, index } = contentToDelete;

            // Delete content
            await this.delete(contentId);

            // Adjust indexes của các content sau nó
            await this.model.update(
                { index: db.sequelize.literal('`index` - 1') },
                { 
                    where: { 
                        id_info_wed: id_info_wed,
                        index: { [Op.gt]: index }
                    }
                }
            );

            return true;
        } catch (error) {
            throw new Error(`Error deleting content and adjusting: ${error.message}`);
        }
    }

    // Tìm kiếm content templates
    async searchContent(weddingId, searchTerm) {
        try {
            const searchPattern = `%${searchTerm}%`;

            return await this.getAll({
                where: {
                    id_info_wed: weddingId,
                    content: { [Op.like]: searchPattern }
                },
                order: [['index', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error searching content: ${error.message}`);
        }
    }

    // Clone content templates từ wedding khác
    async cloneContentFromWedding(sourceWeddingId, targetWeddingId) {
        try {
            const sourceContents = await this.getContentByWeddingId(sourceWeddingId);

            if (sourceContents.length === 0) {
                return [];
            }

            const clonedData = sourceContents.map(content => ({
                id_info_wed: targetWeddingId,
                index: content.index,
                content: content.content
            }));

            const clonedContents = await this.model.bulkCreate(clonedData, {
                returning: true
            });

            return clonedContents.map(content => content.toJSON());
        } catch (error) {
            throw new Error(`Error cloning content from wedding: ${error.message}`);
        }
    }

    // Get content template statistics
    async getContentStats(weddingId) {
        try {
            const stats = await this.model.findAll({
                where: { id_info_wed: weddingId },
                attributes: [
                    [fn('COUNT', col('*')), 'total_contents'],
                    [fn('MAX', col('index')), 'max_index'],
                    [fn('AVG', fn('LENGTH', col('content'))), 'avg_content_length']
                ],
                raw: true
            });

            return stats[0] || {};
        } catch (error) {
            throw new Error(`Error fetching content stats: ${error.message}`);
        }
    }

    // Clear all content cho wedding
    async clearWeddingContent(weddingId) {
        try {
            const deletedCount = await this.model.destroy({
                where: { id_info_wed: weddingId }
            });

            return deletedCount;
        } catch (error) {
            throw new Error(`Error clearing wedding content: ${error.message}`);
        }
    }

    // Export content templates
    async exportContent(weddingId) {
        try {
            const contents = await this.getContentByWeddingId(weddingId);
            
            return contents.map(content => ({
                index: content.index,
                content: content.content,
                created_at: content.created_at
            }));
        } catch (error) {
            throw new Error(`Error exporting content: ${error.message}`);
        }
    }

    // Validate content order (check for gaps/duplicates)
    async validateContentOrder(weddingId) {
        try {
            const contents = await this.model.findAll({
                where: { id_info_wed: weddingId },
                attributes: ['index'],
                order: [['index', 'ASC']],
                raw: true
            });

            const indexes = contents.map(c => c.index);
            const expectedIndexes = Array.from({length: indexes.length}, (_, i) => i + 1);

            const hasGaps = !indexes.every((index, i) => index === expectedIndexes[i]);
            const hasDuplicates = new Set(indexes).size !== indexes.length;

            return {
                isValid: !hasGaps && !hasDuplicates,
                hasGaps,
                hasDuplicates,
                actualIndexes: indexes,
                expectedIndexes
            };
        } catch (error) {
            throw new Error(`Error validating content order: ${error.message}`);
        }
    }

    // Fix content order (remove gaps, fix duplicates)
    async fixContentOrder(weddingId) {
        try {
            const contents = await this.getContentByWeddingId(weddingId);

            const promises = contents.map((content, index) => 
                this.model.update(
                    { index: index + 1 },
                    { where: { id_content: content.id_content } }
                )
            );

            await Promise.all(promises);

            return await this.getContentByWeddingId(weddingId);
        } catch (error) {
            throw new Error(`Error fixing content order: ${error.message}`);
        }
    }
}

export default ContentTemplateRepository;