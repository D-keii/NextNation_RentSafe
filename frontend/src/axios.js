import axios from "axios"

const instance = axios.create({
    baseURL: "http://127.0.0.1:8889/api",
})

//instance.interceptors.request.use((config) => {
    //config.headers["Content-Type"] = "application/json";
    //return config;
//});

export default instance;