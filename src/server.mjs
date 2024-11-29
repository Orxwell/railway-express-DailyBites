// Librerías externas, o "del proyecto"
import express from 'express';
import ejs     from 'ejs'    ;

// Librerías internas, o "propias"
import uploadPNG from './handlers/pngHandler.mjs'    ;
import filesEJS  from './paths/pathsEJS.mjs'         ;
import utils     from './paths/utils.mjs'            ;
import db        from './controlers/controler_db.mjs';

import {
  generateSpecsToken,
  scheduleTokenExpiration
} from './controlers/controler_token.mjs'

const app  = express();
const PORT = process.env.PORT || 5050;

const FOOTER = 'DailyBites es un...';

app.set('view engine', ejs);

app.use(express.static(utils.viewsPath))       ;
app.use(express.urlencoded({ extended: true }));
app.use(express.json())                        ;

async function generateToken() {
  const specsToken = generateSpecsToken();

  await db.createRecord('tokens', specsToken);

  scheduleTokenExpiration(specsToken);

  return specsToken.token;
}

(async () => {
  try {
    // Borramos los registros de "tokens"
    await db.truncateTable('tokens');
  
    // >>-------- GET - Endpoints - Below --------<<
    app.get('/', (_, res) => {
      try {
        res.render(filesEJS.landingEJS, {
          title: 'DailyBites',

          footer: FOOTER,
        });
      }
      catch (_) { res.sendStatus(503); }
    });

    app.get('/login', async (req, res) => {
      const {
        shopname, password, tokenExpired,
        errorFlag, errorMessage
      } = req.query;

      let records = await db.readRecords('establishments', {}, 'shopname');

      const data = {
        establishments: records,

        shopname: shopname ?? '',
        password: password ?? '',

        tokenExpired: tokenExpired === 'true',

        errorFlag   : errorFlag    ?? false,
        errorMessage: errorMessage ?? ''   ,
      };

      try {
        res.render(filesEJS.loginEJS, {
          title: 'DailyBites - Login',

          data: data,
        });
      }
      catch (_) { res.sendStatus(503); }
    });

    app.get('/shop', async (req, res) => {
      const { token } = req.query;

      let records = await db.readRecords('dishes', {});

      const data = {
        dishes: records,

        token: token ?? '',
      };

      try {
        res.render(filesEJS.shopEJS, {
          title: 'DailyBites - Shop',

          data: data,
        });
      }
      catch (_) { res.sendStatus(503); }
    });

    app.get('/order', async (req, res) => {
      const { dishid } = req.query;

      let records = await db.readRecords('dishes', { id: dishid });

      const data = {
        dish: records[0]
      };

      try {
        res.render(filesEJS.orderEJS, {
          title: 'DailyBites - Order',

          data: data,
        });
      }
      catch (_) { res.sendStatus(503); }
    });

    app.get('/check', async (req, res) => {
      const { dishid, clientname, deliverytime, paymethod } = req.query;

      let records = await db.readRecords('dishes', { id: dishid }, 'name, price, location, img_uri');

      const data = {
        dish: records[0],

        clientname  : clientname   ?? 'N/A',
        deliverytime: deliverytime ?? 'N/A',
        paymethod   : paymethod    ?? 'N/A',
      };

      try {
        res.render(filesEJS.checkEJS, {
          title: 'DailyBites - Check',

          data: data,
        });
      }
      catch (_) { res.sendStatus(503); }
    });

    app.get('/product_form', async (req, res) => {
      const { token, dishid } = req.query;

      let records = await db.readRecords('establishments', {}, 'shopname')

      const data = {
        establishments: records,
        
        token: token ?? '',
      };

      if (dishid) {
        const foundDish = await db.readRecords('dishes', { id: dishid });
        data.dish = foundDish[0];
      }

      try {
        res.render(filesEJS.productFormEJS, {
          title: 'DailyBites - Form',

          data: data,
        });
      }
      catch (_) { res.sendStatus(503); }
    });

    app.get('/*', (_, res) => {
      try {
        res.render(filesEJS.notFoundEJS, {
          title: 'DailyBites - 404',
        });
      }
      catch (_) { res.sendStatus(503); }
    });
    // >>-------- GET - Endpoints - Above --------<<

    // >>-------- POST - Endpoints - Below --------<<
    app.post('/test', (_, res) => {
      try       { res.sendStatus(202); }
      catch (_) { res.sendStatus(503); }
    });

    app.post('/login', async (req, res) => {
      const { shopname, password } = req.body;

      if (!shopname) {
        return res.status(404).send({ msg: 'Shopname not specified.' });
      }
      
      if (!password) {
        return res.status(404).send({ msg: 'Password not specified.' });
      }

      try {
        let baseQuery = 'errorFlag=true&';

        const shop = await db.readRecords('establishments',
          { shopname: shopname },
          'password'
        );

        if (shop[0].password !== password) {
          baseQuery += `shopname=${shopname}&` +
            `errorMessage=${encodeURIComponent('La contraseña es inválida')}`;
          
          return res.redirect(`/login?${baseQuery}`);
        }

        const token = await generateToken();

        res.redirect(`/shop?token=${token}`);
      }
      catch (_) { res.sendStatus(503); }
    });

    app.post('/order', async (req, res) => {
      const { dishid, clientname, deliverytime, paymethod } = req.body;

      try {
        res.redirect(`/check?dishid=${dishid}&` +
          `clientname=${clientname}&` +
          `deliverytime=${deliverytime}&` +
          `paymethod=${paymethod}`
        );
      }
      catch (_) { res.sendStatus(503); }
    });

    app.post('/check', async (req, res) => {
      const {
        clientname, deliverytime, paymethod, location, productname,
        totalprice
      } = req.body;

      await db.createRecord('notifications',
        {
          clientname  : clientname  ,
          deliverytime: deliverytime,
          paymethod   : paymethod   ,
          location    : location    ,
          productname : productname ,
          totalprice  : totalprice  ,
        }
      );

      //TODO - BELOW
      // Aquí es donde se hará la conexión con el Arduino.
      //TODO - ABOVE

      try {
        res.redirect(`/shop`);
      }
      catch (_) { res.sendStatus(503); }
    });

    app.post('/product_form', uploadPNG.single('image'), async (req, res) => { 
      const {
        token, dishname, price, shopname, flag
      } = req.body;

      try {
        if (flag) {
          await db.updateRecord('dishes',
            { name: dishname },
            {
              name  : dishname,
              price: price,
              location: shopname,
              img_uri: `/static/img/${req.file.originalname}`,
            }
          );
        } else {
          await db.createRecord('dishes',
            {
              name  : dishname,
              price: price,
              location: shopname,
              img_uri: `/static/img/${req.file.originalname}`,
            }
          );
        }

        res.redirect(`/shop?token=${token}`); 
      }
      catch (_) { res.sendStatus(503); }
    }); 
    // >>-------- POST - Endpoints - Above --------<<

    app.listen(PORT, () => {
      console.log(
        `  ~Servidor web escuchando en puerto [ ${PORT} ]...~\n` +
        `  ~[ http://localhost:${PORT} ]~` //! quitar esta línea antes de desplegar
      );
    });

  } catch (err) {
    console.error(
      '\n  ~An error occurred while starting the server.~' +
      `\n    -> ${err.message}`
    );
  }
})();
