const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')
const multer  = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)

    }
})

const upload = multer({storage : storage});

// ============ country ============ //

router.get('/country', auth, async(req, res) => {
    try {
        const country_list = await mySqlQury(`SELECT * FROM tbl_country`)
        
        res.render('country', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, country_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_country', auth, async(req, res) => {
    try {
        const {name, province_code} = req.body
        // const flag = req.file.filename

        await mySqlQury(`INSERT INTO tbl_country (name, province_code) VALUE ('${name}', '${province_code}')`)

        req.flash('success', 'country added successfully')
        res.redirect('/location/country')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_country/:id', auth, async(req, res) => {
    try {
        const {name, province_code} = req.body
       
        await mySqlQury(`UPDATE tbl_country SET name = '${name}', province_code = '${province_code}' WHERE id = '${req.params.id}'`)
        
        req.flash('success', 'country data update successfully')
        res.redirect('/location/country')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_country/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_country WHERE id = '${req.params.id}'`)

        req.flash('success', 'country data deleted successfully')
        res.redirect('/location/country')
    } catch (error) {
        console.log(error);
    }
})


// =========== state ============= //

router.get('/state', auth, async(req, res) => {
    try {
        const country_list = await mySqlQury(`SELECT * FROM tbl_country`)
        const state_list = await mySqlQury(`SELECT tbl_state.*, (select tbl_country.name from tbl_country where tbl_state.country_name = tbl_country.id) as c_name FROM tbl_state`)
        
        res.render('state', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, country_list, state_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_state', auth, async(req, res) => {
    try {
        const {country_name, name} = req.body

        await mySqlQury(`INSERT INTO tbl_state (country_name, name) VALUE ('${country_name}', '${name}')`)

        req.flash('success', 'state data add successfully')
        res.redirect('/location/state')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_state/:id', auth, async(req, res) => {
    try {
        const {country_name, name} = req.body

        await mySqlQury(`UPDATE tbl_state SET country_name = '${country_name}', name = '${name}' WHERE id = '${req.params.id}'`)

        req.flash('success', 'state data update successfully')
        res.redirect('/location/state')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_state/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_state WHERE id = '${req.params.id}'`)

        req.flash('success', 'state data deleted successfully')
        res.redirect('/location/state')
    } catch (error) {
        console.log(error);
    }
})


// =========== city ============== //

router.get('/city', auth, async(req, res) => {
    try {
        const country_list = await mySqlQury(`SELECT * FROM tbl_country`)
        const city_list = await mySqlQury(`SELECT tbl_city.*, (select tbl_country.name from tbl_country where tbl_city.country_name = tbl_country.id) as c_name,
                                                            (select tbl_state.name from tbl_state where tbl_city.state_name = tbl_state.id) as s_name
                                                            FROM tbl_city`)

        res.render('city', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, country_list, city_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/state/:id', auth, async(req, res) => {
    try {
        const state_list = await mySqlQury(`SELECT * FROM tbl_state WHERE country_name = '${req.params.id}'`)
        console.log(state_list);

        res.json({state_list})
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_city', auth, async(req, res) => {
    try {
        const {country_name, state_name, name} = req.body

        await mySqlQury(`INSERT INTO tbl_city (country_name, state_name, name) VALUE ('${country_name}', '${state_name}', '${name}')`)

        req.flash('success', 'city data add successfully')
        res.redirect('/location/city')
    } catch (error) {
        console.log(error);
    }
})

router.get('/edit_citydata/:id', auth, async(req, res) => {
    try {
        const state_list = await mySqlQury(`SELECT * FROM tbl_state WHERE country_name = '${req.params.id}'`)
        const country_list = await mySqlQury(`SELECT * FROM tbl_country`)
        console.log(state_list);
        console.log(country_list);

        res.json({state_list, country_list})
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_city/:id', auth, async(req, res) => {
    try {
        const {country_name, state_name, name} = req.body
        console.log(req.body);

        await mySqlQury(`UPDATE tbl_city SET country_name = '${country_name}', state_name = '${state_name}', name = '${name}' WHERE id = '${req.params.id}'`)
        
        req.flash('success', 'city data update successfully')
        res.redirect('/location/city')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_city/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_city WHERE id = '${req.params.id}'`)

        req.flash('success', 'city data deleted successfully')
        res.redirect('/location/city')
    } catch (error) {
        console.log(error);
    }
})



module.exports = router