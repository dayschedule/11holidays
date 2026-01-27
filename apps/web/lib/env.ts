const devEnv = {
    IS_PROD: false,
    API_URL: "http://localhost:8787/v1",
};

const prodEnv = {
    IS_PROD: true,
    API_URL: "https://api.dayschedule.com/v1",
};

const env = process?.env?.NODE_ENV === "development" ? devEnv : prodEnv;

export default env;