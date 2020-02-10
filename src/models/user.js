import bcrypt from 'bcryptjs';

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {    
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      field: 'id'
    },
    fullname: DataTypes.STRING,
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowedNull: false,
      validate: {
        notEmpty: true,
        isEmail: true, 
      }
    },
    password: {
      type: DataTypes.STRING,
      allowedNull: false,
      validate: {
        notEmpty: true,
        len: [7, 42],
      },
    },
    role: { 
      type: DataTypes.ENUM,
      values: ['ADMIN', 'AGENT', 'GUEST'],
      defaultValue: 'GUEST'
    },
    isAgentApproved: { 
      type: DataTypes.ENUM,
      values: ['Yes', 'No', 'Disapproved'],
      defaultValue: 'No'
    },
    pix: DataTypes.STRING,
    facebook: DataTypes.STRING,
    twitter: DataTypes.STRING,
    whatsapp: DataTypes.STRING,
    website: DataTypes.STRING,
    youtube: DataTypes.STRING,
    googlePlus: DataTypes.STRING,
    instagram: DataTypes.STRING,
    skype: DataTypes.STRING,
    description: DataTypes.TEXT,
  });

  User.beforeCreate(async user => {
    user.password = await user.generatePasswordHash(user)
  });

  User.beforeUpdate (async user=> {
    user.password = await user.generatePasswordHash(user)
  });

  User.prototype.generatePasswordHash = async function(user) {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(user.password, salt)
  };

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password)
  };

  User.associate = models => {
    User.hasMany(models.Message, { onDelete: 'CASCADE' });
  };

  User.findByLogin = async login => {
    let user = await User.findOne({ where: { username: login }, });

    if (!user) user = await User.findOne({ where: { email: login }, });
   
    return user;
  };

  return User;
};

export default user;
