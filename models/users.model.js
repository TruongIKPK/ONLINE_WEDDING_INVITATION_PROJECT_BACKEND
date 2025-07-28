import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default class User extends Model {
  static initModel(sequelize) {
    return super.init({
      id_user: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4,
      },
      username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: DataTypes.STRING(255),
      avatar_url: DataTypes.TEXT,
      full_name: DataTypes.STRING(255),
      phone: DataTypes.CHAR(15),
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false,
    });
  }

  static associate(models) {
    this.hasMany(models.InfoWed, { foreignKey: 'id_user' });
    this.hasMany(models.UserMedia, { foreignKey: 'id_user' });
  }
}