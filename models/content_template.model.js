import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default class ContentTemplate extends Model {
  static initModel(sequelize) {
    return super.init({
      id_content: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4,
      },
      id_info_wed: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      index: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      sequelize,
      modelName: 'ContentTemplate',
      tableName: 'content_template',
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
