const S = require("fluent-schema");
const { strictSchema } = require("./utils");

const loginSchema = {
  body: strictSchema()
    .prop("email", S.string().required())
    .prop("password", S.string().required()),
};

// todo: add password confirmation as required field
const signupSchema = {
  body: strictSchema()
    .prop("email", S.string().required())
    .prop("password", S.string().required())
    .prop("confirmPassword", S.string().required()),
};

const oAuthSchema = {
  body: strictSchema()
    .prop("code", S.string().required())
    .prop("state", S.string().required()),
};

const oAuthProviderSchema = {
  params: strictSchema().prop(
    "provider",
    S.enum(["google", "facebook", "linkedin", "twitter"]).required(),
  ),
};

module.exports = {
  loginSchema,
  oAuthProviderSchema,
  oAuthSchema,
  signupSchema,
};
