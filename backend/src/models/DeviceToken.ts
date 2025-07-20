import {
  Model,
  DataTypes,
  Sequelize,
  Optional,
} from 'sequelize';

export interface DeviceTokenAttributes {
  id: string;
  userId: string;
  deviceToken: string;
  deviceType: 'ios' | 'android' | 'web';
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceTokenCreationAttributes extends Optional<DeviceTokenAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class DeviceToken extends Model<DeviceTokenAttributes, DeviceTokenCreationAttributes> implements DeviceTokenAttributes {
  public id!: string;
  public userId!: string;
  public deviceToken!: string;
  public deviceType!: 'ios' | 'android' | 'web';
  public isActive!: boolean;
  public lastUsedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public markAsUsed(): void {
    this.lastUsedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public activate(): void {
    this.isActive = true;
  }
}

export const initDeviceTokenModel = (sequelize: Sequelize): void => {
  DeviceToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      deviceToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      deviceType: {
        type: DataTypes.ENUM('ios', 'android', 'web'),
        allowNull: false,
        defaultValue: 'android',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'device_tokens',
      modelName: 'DeviceToken',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['deviceToken'],
        },
        {
          fields: ['userId'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['deviceType'],
        },
      ],
      hooks: {
        beforeCreate: async (deviceToken: DeviceToken) => {
          // Ensure new tokens are active
          deviceToken.isActive = true;
        },
      },
    },
  );
};

export default DeviceToken; 