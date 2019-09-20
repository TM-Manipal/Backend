"use strict";

const UserModel = require("../models/User");
const { USER_TYPES } = require("../utils/constants");
const hash = require("../utils/hash");
const jwt = require("../utils/jwt");

/**
 * Get a user
 * @param {object} req the request object
 * @param {object} res the response object
 * @param {function} next call the next handler in route
 * @returns {object} the response object
 */
const get = async (req, res, next) => {
  try {
    let user = await UserModel.findById(req.params.user);

    if (!user) return next();

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      type: user.type,
      college: user.college,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.poo(e);
    next();
  }
};

const getAll = async (req, res) => {
  try {
    let users = await UserModel.find();

    users = users.map(user => ({
      id: user.id,
      name: user.name,
      type: user.type,
      college: user.college,
    }));

    return res.json({
      status: 200,
      message: "Success",
      data: users,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/**
 * Create a user
 * @param {object} req the request object
 * @param {object} res the response object
 * @param {function} next call the next handler in route
 * @returns {object} the response object
 */
const create = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        status: 403,
        message: "Forbidden. Requester not authenticated.",
      });
    }

    if (!req.body.name || !req.body.email || !req.body.type || !req.body.password) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request. Invalid request body.",
      });
    }

    let requester = await UserModel.findById(req.user.id);
    if (!requester) {
      return res.status(403).json({
        status: 403,
        message: "Forbidden. Requester not found.",
      });
    }

    if (requester.password !== req.user.password) {
      return res.status(403).json({
        status: 403,
        message: "Forbidden. Requester's password is not valid.",
      });
    }

    if (requester.type !== USER_TYPES.ADMINISTRATOR) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized. Only administrators can create users.",
      });
    }

    let user = await UserModel.findOne({ email: req.body.email });

    if (user) {
      return res.status(400).json({
        status: 400,
        message: "Bad request. An account with that email already exist.",
      });
    }

    let hashedPassword = await hash.generatePasswordHash(req.body.password);

    user = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile || null,
      type: req.body.type,
      password: hashedPassword,
      college: req.body.college || null,
    });

    return res.json({
      status: 200,
      message: "Success. New user created.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        type: user.type,
        college: user.college,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.poo(e);

    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/**
 * Delete a user
 * @param {object} req the request object
 * @param {object} res the response object
 * @param {function} next call the next handler in route
 * @returns {object} the response object
 */
const remove = async (req, res, next) => {
  try {
    if (!req.params.user) return next();

    let user = await UserModel.findByIdAndDelete(req.params.user);

    if (!user) return next();

    return res.json({
      status: 200,
      message: "Success. Deleted user.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        type: user.type,
        college: user.college,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.poo(e);

    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/**
 * Update user details
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns {object} the response object
 */
const updateUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        status: 403,
        message: "Forbidden. Requester not authenticated.",
      });
    }

    if (!req.body.name || !req.body.email || !req.body.type ) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request. Invalid request body.",
      });
    }

    let requester = await UserModel.findById(req.user.id);
    if (!requester) {
      return res.status(403).json({
        status: 403,
        message: "Forbidden. Requester not found.",
      });
    }

    if (requester.type !== USER_TYPES.ADMINISTRATOR) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized. Only administrators can create users.",
      });
    }

    let user = await UserModel.findOne({ email: req.body.email });

    user.name = req.body.name;
    user.email = req.body.email;
    user.college = req.body.college;
    user.type = req.body.type;
    user.save(err => {
      if(err){
        return res.json({
          status: 400,
          message: "Something happened.",
        });
      }
      return res.json({
        status: 200,
        message: "Success. New user created.",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          type: user.type,
          college: user.college,
        },
      });
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.poo(e);

    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/**
 * Update a user
 * @param {object} req the request object
 * @param {object} res the response object
 * @returns {object} the response object
 */
const update = async (req, res) => {
  try {
    if (!req.body.oldUser || !req.body.newUser) {
      return res.status(400).json({
        status: 400,
        message : "Bad request. Invalid request body.",
      });
    }

    if (req.params.user !== req.body.oldUser.id) {
      return res.status(401).json({
        status: 401,
        message : "Unauthorized. User mismatch.",
      });
    }

    let user = await UserModel.findById(req.params.user);

    if (!user) {
      return res.status(401).json({
        status: 401,
        message : "Unauthorized. User doesn't exist.",
      });
    }

    let isValidPassword = await hash.comparePasswordHash(
      req.body.oldUser.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        status: 401,
        message : "Unauthorized. Invalid credentials.",
      });
    }

    if (req.body.newUser.name && user.name !== req.body.newUser.name) user.name = req.body.newUser.name;
    if (req.body.newUser.email && user.email !== req.body.newUser.email) user.email = req.body.newUser.email;
    if (req.body.newUser.mobile && user.mobile !== req.body.newUser.mobile) user.mobile = req.body.newUser.mobile;
    if (req.body.newUser.college && user.college !== req.body.newUser.college) user.college = req.body.newUser.college;

    let hashedNewPassword = await hash.generatePasswordHash(req.body.newUser.password);
    if (user.password !== hashedNewPassword) user.password = hashedNewPassword;

    await user.save();

    const token = await jwt.generateToken({
      id: user.id,
      email: user.email,
      password: user.password,
      type: user.type,
    });

    return res.cookie("token", token, {
      httpOnly: true,
      maxAge: 6 * 60 * 60 * 1000,
    }).json({
      status: 200,
      message: "Success. User updated.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        type: user.type,
        college: user.college,
        token: token,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.poo(e);

    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: 400,
        message : "Bad request. Invalid request body.",
      });
    }

    let admin = await UserModel.findById(req.user.id);
    if (admin.type !== USER_TYPES.ADMINISTRATOR) {
      return res.status(401).json({
        status: 401,
        message : "Unauthorized. Not an administrator.",
      });
    }

    let user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message : "Not Found. User doesn't exist.",
      });
    }

    let hashedNewPassword = await hash.generatePasswordHash(req.body.password);
    if (user.password !== hashedNewPassword) user.password = hashedNewPassword;

    await user.save();

    const token = await jwt.generateToken({
      id: user.id,
      email: user.email,
      password: user.password,
      type: user.type,
    });

    return res.cookie("token", token, {
      httpOnly: true,
      maxAge: 6 * 60 * 60 * 1000,
    }).json({
      status: 200,
      message: "Success. User updated.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        type: user.type,
        college: user.college,
        token: token,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.poo(e);

    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/**
 * Authenticate a user into the system
 * @param {object} req The request object
 * @param {object} res The response object
 * @returns {void}
 */
const login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request. Invalid request body.",
      });
    }

    let user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        status: 401,
        message : "Unauthorized. No account exist with that email.",
      });
    }

    let isValidPassword = await hash.comparePasswordHash(
      req.body.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        status: 401,
        message : "Unauthorized. Invalid Password.",
      });
    }

    const token = await jwt.generateToken({
      id: user.id,
      email: user.email,
      password: user.password,
      type: user.type,
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 6 * 60 * 60 * 1000,
    }).json({
      status: 200,
      message: "Success. User successfully logged it.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        type: user.type,
        college: user.college,
        token: token,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.poo(e);

    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  get,
  getAll,
  create,
  remove,
  update,
  updateUser,
  login,
  resetPassword,
};
