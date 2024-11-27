import { fileURLToPath }      from 'url' ;
import { dirname, normalize } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename)           ;

const utils = {
  srcPath  : normalize(`${__dirname}/../`),
  viewsPath: normalize(`${__dirname}/../../views`)
}

export default utils;
