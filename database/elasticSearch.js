import{ Client } from '@elastic/elasticsearch';
import loadEnvVariables from '../utils/envHelper.js';
loadEnvVariables();

const client = new Client({
  node: "http://127.0.0.1:9200"
});

export default client;