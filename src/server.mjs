// Librerías externas, o "del proyecto"
import express from 'express';
import ejs     from 'ejs'    ;

// Librerías internas, o "propias"
import filesEJS from './paths/pathsEJS.mjs'         ;
import utils    from './paths/utils.mjs'            ;
import db       from './controlers/controler_db.mjs';

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

async function generateToken(shopname) {
  const specsToken = generateSpecsToken();
  specsToken.owner = shopname;

  await db.createRecord('tokens', specsToken);

  scheduleTokenExpiration(specsToken.token, specsToken.expiration, db);

  return specsToken.token;
}

(async () => {
  try {
    // Borramos los registros de "tokens"
    db.deleteTable('tokens');
    db.createTable('tokens', [
      { name: 'id'        , type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'token'     , type: 'VARCHAR(255)'          },
      { name: 'expiration', type: 'TIMESTAMP'             }
    ]);
  
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

    app.get('/home', (_, res) => {
      try {
        res.render(filesEJS.homeEJS, {
          title: 'DailyBites - Home',

          footer: FOOTER,
        });
      }
      catch (_) { res.sendStatus(503); }
    });

    app.get('/login', async (req, res) => {
      const {
        shopname, password,
        shopNotExistFlag, invalidPasswordFlag, tokenExpired,
        errorFlag, errorMessage
      } = req.query;

      let records = await db.readRecords('establishments', {}, 'shopname');

      const data = {
        establishments: records,

        shopname: shopname ?? '',
        password: password ?? '',

        shopNotExistFlag   : shopNotExistFlag    === 'true',
        invalidPasswordFlag: invalidPasswordFlag === 'true',
        tokenExpired       : tokenExpired        === 'true',

        errorFlag   : errorFlag    ?? false,
        errorMessage: errorMessage ?? ''   ,
      };

      console.log(data);

      try {
        res.render(filesEJS.loginEJS, {
          title: 'DailyBites - Login',

          data: data,

          footer: FOOTER,
        });
      }
      catch (_) { res.sendStatus(503); }
    });

    app.get('/*', (_, res) => {
      try {
        res.render(filesEJS.notFoundEJS, {
          title: 'DailyBites - 404',

          footer: FOOTER,
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

        if (!shop) {
          baseQuery += 'shopNotExistFlag=true&' +
            `errorMessage=${encodeURIComponent('La tienda no existe.')}`;

          return res.redirect(`/login?${baseQuery}`);
        }

        if (shop.password !== password) {
          baseQuery += `shopname=${username}&` +
            'invalidPasswordFlag=true&' +
            `errorMessage=${encodeURIComponent('La contraseña es inválida.')}`;
          
          return res.redirect(`/login?${baseQuery}`);
        }

        const token = await generateToken(shopname);

        res.redirect(`/dashboard?token=${token}`)
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
