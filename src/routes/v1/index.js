import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from '~/routes/v1/userRoute'
const Router = express.Router()

Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'APIs v1 are ready to use' })
})

Router.use('/users', userRoute)

export const APIs_v1 = Router  