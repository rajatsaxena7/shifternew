const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')


// ============== Domestic ============== //


// domestic_address 

router.get('/domestic_address', auth, async(req, res) => {
    try {
        
        res.render('domestic_address', {
            auth_data: req.user, language: req.lang, lang: req.lan,
            general_data: req.general[0], notification_data: req.notification
        })
    } catch (error) {
        console.log(error);
    }
})


// domestic describe package

router.get('/domestic_describe_package', auth, async(req, res) => {
    try {

        res.render('domestic_describe_package', {
            auth_data: req.user, language: req.lang, lang: req.lan,
            general_data: req.general[0], notification_data: req.notification
        })
    } catch (error) {
        console.log(error);
    }
})


// domestic date & time

router.get('/domestic_date_time', auth, async(req, res) => {
    try {

        res.render('domestic_date_time', {
            auth_data: req.user, language: req.lang, lang: req.lan,
            general_data: req.general[0], notification_data: req.notification
        })
    } catch (error) {
        console.log(error);
    }
})


// domestic details

router.get('/domestic_details', auth, async(req, res) => {
    try {
        
        res.render('domestic_details', {
            auth_data: req.user, language: req.lang, lang: req.lan,
            general_data: req.general[0], notification_data: req.notification
        })
    } catch (error) {
        console.log(error);
    }
})


module.exports = router