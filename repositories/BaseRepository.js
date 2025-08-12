import db from '../models/index.js';

export class BaseRepository {
    constructor() {
        this.db = db;
    }

    // Phương thức để thiết lập model (sẽ được gọi từ class con)
    setModel(model) {
        this.model = model;
        this.primaryKey = model.primaryKeyAttribute || 'id';
    }

    async create(data) {
        try {
            if (!this.model) {
                throw new Error('Model not initialized');
            }
            return await this.model.create(data);
        } catch (error) {
            console.error(`BaseRepository.create error:`, error);
            throw new Error(`Failed to create record: ${error.message}`);
        }
    }

    async getById(id) {
        try {
            if (!this.model) {
                throw new Error('Model not initialized');
            }
            return await this.model.findByPk(id);
        } catch (error) {
            console.error(`BaseRepository.getById error:`, error);
            throw new Error(`Failed to get record by ID: ${error.message}`);
        }
    }

    async getAll(options = {}) {
        try {
            if (!this.model) {
                throw new Error('Model not initialized');
            }
            return await this.model.findAll(options);
        } catch (error) {
            console.error(`BaseRepository.getAll error:`, error);
            throw new Error(`Failed to get all records: ${error.message}`);
        }
    }

    async update(id, data) {
        try {
            if (!this.model) {
                throw new Error('Model not initialized');
            }
            const [updatedRowsCount] = await this.model.update(data, {
                where: { [this.primaryKey]: id }
            });
            
            if (updatedRowsCount === 0) {
                return null;
            }
            
            return await this.getById(id);
        } catch (error) {
            console.error(`BaseRepository.update error:`, error);
            throw new Error(`Failed to update record: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            if (!this.model) {
                throw new Error('Model not initialized');
            }
            const deletedRowsCount = await this.model.destroy({
                where: { [this.primaryKey]: id }
            });
            
            return deletedRowsCount > 0;
        } catch (error) {
            console.error(`BaseRepository.delete error:`, error);
            throw new Error(`Failed to delete record: ${error.message}`);
        }
    }
}

export default BaseRepository;