import BaseRepository from "./BaseRepository.js";
import { where, fn, col, Op } from 'sequelize';
import db from '../models/index.js';

class FormRepository extends BaseRepository {
    constructor() {
        super(db.Form);
    }

    // Lấy tất cả form responses theo wedding ID
    async getByWeddingId(weddingId, options = {}) {
        try {
            const { isAttend, limit, offset } = options;
            const whereCondition = { id_info_wed: weddingId };

            // Filter theo attendance status
            if (isAttend !== undefined) {
                whereCondition.is_attend = isAttend;
            }

            return await this.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: db.InfoWed,
                        as: 'InfoWed',
                        attributes: ['tencodau', 'tenchure', 'ngaycuoi', 'diachi']
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching forms by wedding ID: ${error.message}`);
        }
    }

    // Kiểm tra guest đã RSVP chưa
    async hasGuestRSVPed(weddingId, email) {
        try {
            const form = await this.findOne({
                id_info_wed: weddingId,
                email: email
            });

            return !!form;
        } catch (error) {
            throw new Error(`Error checking guest RSVP: ${error.message}`);
        }
    }

    // Lấy thống kê RSVP cho wedding
    async getRSVPStats(weddingId) {
        try {
            const stats = await this.model.findAll({
                where: { id_info_wed: weddingId },
                attributes: [
                    [fn('COUNT', col('*')), 'total_responses'],
                    [fn('COUNT', fn('CASE', where(col('is_attend'), true), 1, null)), 'attending'],
                    [fn('COUNT', fn('CASE', where(col('is_attend'), false), 1, null)), 'not_attending'],
                    [fn('SUM', fn('CASE', where(col('is_attend'), true), col('number_of_guests'), 0)), 'total_guests_attending'],
                    [fn('COUNT', fn('CASE', where(col('are_guest_of'), true), 1, null)), 'bride_guests'],
                    [fn('COUNT', fn('CASE', where(col('are_guest_of'), false), 1, null)), 'groom_guests']
                ],
                raw: true
            });

            return stats[0] || {};
        } catch (error) {
            throw new Error(`Error fetching RSVP stats: ${error.message}`);
        }
    }

    // Lấy guest list attending
    async getAttendingGuests(weddingId) {
        try {
            return await this.getAll({
                where: { 
                    id_info_wed: weddingId,
                    is_attend: true
                },
                attributes: ['fullname', 'email', 'phone', 'number_of_guests', 'are_guest_of'],
                order: [['fullname', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching attending guests: ${error.message}`);
        }
    }

    // Tìm kiếm forms theo tên hoặc email
    async searchForms(weddingId, searchTerm, options = {}) {
        try {
            const { limit = 10, offset = 0 } = options;
            const searchPattern = `%${searchTerm}%`;

            return await this.findAndCountAll({
                where: {
                    id_info_wed: weddingId,
                    [Op.or]: [
                        { fullname: { [Op.like]: searchPattern } },
                        { email: { [Op.like]: searchPattern } }
                    ]
                },
                limit,
                offset,
                order: [['fullname', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error searching forms: ${error.message}`);
        }
    }

    // Update RSVP response
    async updateRSVP(formId, rsvpData) {
        try {
            const updateData = {
                is_attend: rsvpData.is_attend,
                number_of_guests: rsvpData.number_of_guests || '1',
                are_guest_of: rsvpData.are_guest_of
            };

            const [updatedRowsCount] = await this.model.update(updateData, {
                where: { id_form: formId }
            });

            if (updatedRowsCount === 0) {
                throw new Error(`Form with id ${formId} not found`);
            }

            return await this.getById(formId);
        } catch (error) {
            throw new Error(`Error updating RSVP: ${error.message}`);
        }
    }

    // Bulk create invitation forms (gửi invitation cho nhiều người)
    async bulkCreateInvitations(weddingId, guestList) {
        try {
            const formData = guestList.map(guest => ({
                id_info_wed: weddingId,
                fullname: guest.fullname,
                email: guest.email,
                phone: guest.phone || null,
                number_of_guests: '1',
                is_attend: null, // Chưa response
                are_guest_of: guest.are_guest_of || null
            }));

            const forms = await this.model.bulkCreate(formData, {
                returning: true
            });

            return forms.map(form => form.toJSON());
        } catch (error) {
            throw new Error(`Error bulk creating invitations: ${error.message}`);
        }
    }

    // Lấy pending RSVPs (chưa response)
    async getPendingRSVPs(weddingId) {
        try {
            return await this.getAll({
                where: {
                    id_info_wed: weddingId,
                    is_attend: { [Op.is]: null }
                },
                include: [
                    {
                        model: db.InfoWed,
                        as: 'InfoWed',
                        attributes: ['tencodau', 'tenchure', 'ngaycuoi']
                    }
                ],
                order: [['created_at', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching pending RSVPs: ${error.message}`);
        }
    }

    // Lấy forms theo guest type (bride/groom guests)
    async getFormsByGuestType(weddingId, areGuestOf) {
        try {
            return await this.getAll({
                where: {
                    id_info_wed: weddingId,
                    are_guest_of: areGuestOf
                },
                order: [['fullname', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching forms by guest type: ${error.message}`);
        }
    }

    // Delete form (remove guest from invitation list)
    async removeGuest(formId) {
        try {
            const deletedCount = await this.model.destroy({
                where: { id_form: formId }
            });

            return deletedCount > 0;
        } catch (error) {
            throw new Error(`Error removing guest: ${error.message}`);
        }
    }

    // Lấy summary cho dashboard
    async getWeddingRSVPSummary(weddingId) {
        try {
            const summary = await this.model.findAll({
                where: { id_info_wed: weddingId },
                attributes: [
                    [fn('COUNT', col('*')), 'total_invited'],
                    [fn('COUNT', fn('CASE', where(col('is_attend'), true), 1, null)), 'confirmed_attending'],
                    [fn('COUNT', fn('CASE', where(col('is_attend'), false), 1, null)), 'confirmed_not_attending'],
                    [fn('COUNT', fn('CASE', where(col('is_attend'), Op.is, null), 1, null)), 'pending_response'],
                    [fn('SUM', fn('CASE', where(col('is_attend'), true), fn('CAST', col('number_of_guests'), 'SIGNED'), 0)), 'total_guests_coming'],
                    [fn('AVG', fn('CASE', where(col('is_attend'), Op.ne, null), 1, 0)), 'response_rate']
                ],
                raw: true
            });

            return summary[0] || {};
        } catch (error) {
            throw new Error(`Error fetching wedding RSVP summary: ${error.message}`);
        }
    }

    // Export guest list to CSV format
    async exportGuestList(weddingId) {
        try {
            return await this.getAll({
                where: { id_info_wed: weddingId },
                attributes: [
                    'fullname',
                    'email', 
                    'phone',
                    'number_of_guests',
                    'is_attend',
                    'are_guest_of',
                    'created_at'
                ],
                order: [['fullname', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error exporting guest list: ${error.message}`);
        }
    }
}

export default FormRepository;