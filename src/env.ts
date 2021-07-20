import { cleanEnv, num, port, str } from "envalid";

const env = cleanEnv(process.env, {
    PORT: port({
        default: 3000,
        devDefault: 3001
    }),
    AUTHENTICATION_PASSWORD: str({
        devDefault: "password",
        default: Math.floor(Math.random() * 999999999999999999).toString(36)
    }),
});

export default env;