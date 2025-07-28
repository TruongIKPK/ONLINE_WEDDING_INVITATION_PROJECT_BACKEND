import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default class UserMedia extends Model {
  static initModel(sequelize) {
    return super.init({
      id_user_media: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4
      },
      id_user: DataTypes.UUID,
      url_media: DataTypes.TEXT,
      type: DataTypes.STRING,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'UserMedia',
      tableName: 'user_media',
      timestamps: false
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'id_user' });
  }
}