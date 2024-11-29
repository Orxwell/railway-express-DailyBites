// Librerías externas, o "del proyecto"
import { join } from 'path';

// Librerías internas, o "propias"
import utils from './utils.mjs';
// -----------------------------------------------------

const publicViewsPath  = join(utils.viewsPath, '/public') ;
const privateViewsPath = join(utils.viewsPath, '/private');

// PUBLIC EJS
const landingEJS = join(publicViewsPath, '/landing.ejs');
// PUBLIC EJS - STUDENT & ADMINS
const loginEJS = join(publicViewsPath, '/login.ejs');
const shopEJS  = join(publicViewsPath, '/shop.ejs') ; //* Dinamic Rendering for Admins
const orderEJS = join(publicViewsPath, '/order.ejs');
const checkEJS = join(publicViewsPath, '/check.ejs');
// PRIVATE EJS - ADMIN
const productFormEJS  = join(privateViewsPath, '/product_form.ejs');
const notificationEJS = join(privateViewsPath, '/notification.ejs');

// HANDLING ERRORS 
const notFoundEJS = join(publicViewsPath, '/not_found.ejs');
// -----------------------------------------------------

const filesEJS = {
  landingEJS,      //*
  loginEJS,        //*
  shopEJS,         //*
  orderEJS,        //*
  checkEJS,        //TODO
  productFormEJS,  //!
  notificationEJS, //!
  notFoundEJS      //*
}

export default filesEJS;
