import express from 'express'
import cors from 'cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_v1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors'
import cookieParser from 'cookie-parser'
// import exitHook from 'async-exit-hook'
import a from 'async-exit-hook'
const exitHook = a
const START_SERVER = () => {

  const app = express()

  // Lấy cache từ disk qua ExpressJS
  // https://stackoverflow.com/a/53244017/8324172
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  //cau hinh cookieParser
  app.use(cookieParser())
  //
  app.use(cors(corsOptions))
  //Enable req.body json data
  app.use(express.json())
  //Use APIs v1
  app.use('/v1', APIs_v1)
  //Middlewares xu ly loi tap trung
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`Hello Trung Bui DEV, I am Production running at http://${env.APP_HOST}:${env.APP_PORT}/`)
    })
  }
  else {
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`Hello Trung Bui Dev, I am Dev running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`)
    })
  }


  exitHook(() => {
    CLOSE_DB()
  })
}

CONNECT_DB()
  .then(() => console.log('Kết nối thành công'))
  .then(() => START_SERVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })