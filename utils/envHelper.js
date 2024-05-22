import dotenv from 'dotenv';
import path from 'path';

const loadEnvVariables = () => {
    dotenv.config({path: path.resolve(process.cwd(), '.env')});
    console.log("process.env--->", process.env)
}

export default loadEnvVariables;