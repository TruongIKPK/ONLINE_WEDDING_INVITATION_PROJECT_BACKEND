import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default class Template extends Model {
  static initModel(sequelize) {
    return super.init({
      id_template: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4,
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
      modelName: 'Template',
      tableName: 'template',
      timestamps: false,
    });
  }

  static associate(models) {
    // Quan hệ với InfoWed
    this.hasMany(models.InfoWed, { foreignKey: 'id_template' });
  }
}
