import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default class InfoWed extends Model {
  static initModel(sequelize) {
    return super.init({
      id_info_wed: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4,
      },
      id_template: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      id_user: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      tencodau: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tenchure: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diachi: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ngaycuoi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      sequelize,
      modelName: 'InfoWed',
      tableName: 'info_wed',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'id_user' });
    this.belongsTo(models.Template, { foreignKey: 'id_template' });
    this.hasMany(models.ContentTemplate, { foreignKey: 'id_info_wed' });
    this.hasMany(models.Form, { foreignKey: 'id_info_wed' });
  }
}
