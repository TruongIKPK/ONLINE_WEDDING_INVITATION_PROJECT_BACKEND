import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default class Form extends Model {
  static initModel(sequelize) {
    return super.init({
      id_form: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4,
      },
      id_info_wed: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      number_of_guests: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_attend: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      are_guest_of: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      sequelize,
      modelName: 'Form',
      tableName: 'form',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.InfoWed, {
      foreignKey: 'id_info_wed',
      onDelete: 'CASCADE',
    });
  }
}
