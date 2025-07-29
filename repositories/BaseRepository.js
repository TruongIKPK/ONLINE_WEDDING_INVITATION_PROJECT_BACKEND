import { where, fn, col, Op } from "sequelize";

class BaseRepository {
    constructor(model) {
        this.model = model;
        this.primaryKey = model.primaryKeyAttribute || 'id';
    }

    //Tạo bản ghi mới
    async create(data) {
        try {
            const record = await this.model.create(data);
            return record.toJSON();
        } catch (error) {
            throw new Error(`Error creating record in ${this.model.name}: ${error.message}`);
        }
    }

    //Lấy đơn
    async getById(id, options = {}) {
        try {
            const record = await this.model.findByPk(id, options);
            return record ? record.toJSON() : null;
        } catch (error) {
            throw new Error(`Error fetching record from ${this.model.name}: ${error.message}`);
        }
    }

    //Lấy tất cả
    async getAll(options = {}) {
        try {
            const {
                where = {},
                include = [],
                order = [['created_at', 'DESC']],
                limit,
                offset,
                attributes
            } = options;

            const queryOptions = {
                where,
                include,
                order
            };

            if (attributes) queryOptions.attributes = attributes;
            if (limit) queryOptions.limit = limit;
            if (offset) queryOptions.offset = offset;

            const records = await this.model.findAll(queryOptions);
            return records.map(record => record.toJSON());
        } catch (error) {
            throw new Error(`Error fetching records from ${this.model.name}: ${error.message}`);
        }
    }

    //Cập nhật đơn
    async update(id, data) {
        try {
            const [updatedRowsCount] = await this.model.update(data, {
                where: { [this.primaryKey]: id },
                returning: true
            });

            if (updatedRowsCount === 0) {
                throw new Error(`No record found with id ${id}`);
            }

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating record in ${this.model.name}: ${error.message}`);
        }
    }

    //Xóa đơn
    async delete(id) {
        try {
            const deletedRowsCount = await this.model.destroy({
                where: { [this.primaryKey]: id }
            });

            if (deletedRowsCount === 0) {
                throw new Error(`No record found with id ${id}`);
            }

            return { message: 'Record deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting record from ${this.model.name}: ${error.message}`);
        }
    }

    //Đếm
    async count(where = {}) {
        try {
            const count = await this.model.count({ where });
            return count;
        } catch (error) {
            throw new Error(`Error counting records in ${this.model.name}: ${error.message}`);
        }
    }

    //Kiểm tra tồn tại
    async exists(id) {
        try {
            const record = await this.model.findByPk(id, {
                attributes: [this.primaryKey]
            });
            return !!record;
        } catch (error) {
            throw new Error(`Error checking existence in ${this.model.name}: ${error.message}`);
        }
    }

    //Tìm kiếm đơn
    async findOne(where, options = {}) {
        try {
            const record = await this.model.findOne({
                where,
                ...options
            });
            return record ? record.toJSON() : null;
        } catch (error) {
            throw new Error(`Error finding record in ${this.model.name}: ${error.message}`);
        }
    }

    //phân trang (pagination) kết hợp đếm tổng số bản ghi
    async findAndCountAll(options = {}) {
        try {
            const {
                where = {},
                include = [],
                order = [['created_at', 'DESC']],
                limit,
                offset,
                attributes
            } = options;

            const queryOptions = {
                where,
                include,
                order,
                distinct: true
            };

            if (attributes) queryOptions.attributes = attributes;
            if (limit) queryOptions.limit = limit;
            if (offset) queryOptions.offset = offset;

            const result = await this.model.findAndCountAll(queryOptions);

            return {
                rows: result.rows.map(record => record.toJSON()),
                count: result.count
            };
        } catch (error) {
            throw new Error(`Error fetching paginated records from ${this.model.name}: ${error.message}`);
        }
    }

    // Tìm kiếm hàng loạt với ID
    async findByIds(ids) {
        try {
            const records = await this.model.findAll({
                where: {
                    [this.primaryKey]: {
                        [Op.in]: ids
                    }
                }
            });
            return records.map(record => record.toJSON());
        } catch (error) {
            throw new Error(`Error finding records by IDs: ${error.message}`);
        }
    }

    //Xóa hàng loạt với danh sách Id
    async bulkDelete(ids) {
        try {
            const deletedCount = await this.model.destroy({
                where: {
                    [this.primaryKey]: {
                        [Op.in]: ids
                    }
                }
            });
            return deletedCount;
        } catch (error) {
            throw new Error(`Error bulk deleting records: ${error.message}`);
        }
    }

    //Tìm kiếm tương đối
    async search(field, searchTerm) {
        try {
            const records = await this.model.findAll({
                where: {
                    [field]: {
                        [Op.like]: `%${searchTerm}%`
                    }
                }
            });
            return records.map(record => record.toJSON());
        } catch (error) {
            throw new Error(`Error searching records: ${error.message}`);
        }
    }
}

export default BaseRepository;