const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const countryCodes = require('country-codes-list')
const { mySqlQury } = require('../middleware/db')
const bcrypt = require('bcrypt');
const multer  = require('multer')
const geolib = require('geolib');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({storage : storage});


// ============= customer ============= //

router.get('/customer', auth, async(req, res) => {
    try {
        const customer_list = await mySqlQury(`SELECT * FROM tbl_customer ORDER BY id DESC`)

        res.render('customer', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, customer_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/add_customer', auth, async(req, res) => {
    try {
        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)

        
        res.render('add_customer', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, nameCode, CountryCode
        })
    } catch (error) {
        console.log(error);
    }
})


// =========== address ajax =========== //

router.post('/address/ajax', async(req, res) => {
    try {
        const {latitude, longitude, zone_id, addresh_module_id} = req.body

        console.log(req.body);
        let id
        if (addresh_module_id) {
            id = addresh_module_id
        } else if (zone_id) {
            id = zone_id
        } else {
            id = ""
        }

        const zone_name = await mySqlQury(`SELECT * FROM tbl_zone WHERE status = '1' AND zone_type = '${id}' GROUP BY zone_name `)

        let name_list = []
        let name_li_len = zone_name.length
        for (let i = 0; i < name_li_len; i++){
            let name =  zone_name[i].zone_name
            name_list.push(name)
        }

        let zone_let = name_list.length
        let zone = []
        for (let a = 0; a < zone_let; a++){
            const zone_lat_lon = await mySqlQury(`SELECT tbl_zone.latitude, tbl_zone.longitude FROM tbl_zone WHERE status = '1' AND zone_type = '${id}' AND zone_name = '${name_list[a]}' `)
            zone.push(zone_lat_lon)
        }

        let zone_co_len = zone.length
        let zone_count = 0;
        for (let b = 0; b < zone_co_len; b++){

            const point = { latitude, longitude };
            const polygon = zone[b]

            let count = geolib.isPointInPolygon(point, polygon)
            if (count === true) {
                zone_count += parseFloat(1)
            }
        }

        if (zone_count >= "1"){
            res.json({data:'done'})
        } else {
            res.json({data:'error'})
        }
        
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_customer', auth, async(req, res) => {
    try {
        const {first_name, last_name, country_code, phone_no, email, password} = req.body

        await mySqlQury(`INSERT INTO tbl_customer (first_name, last_name, country_code, phone_no, email, module) VALUE 
            ('${first_name}', '${last_name}', '${country_code}', '${phone_no}', '${email}', '2')`)

        const hash = await bcrypt.hash(password, 10)

        await mySqlQury(`INSERT INTO tbl_admin (first_name, last_name, email, country_code, phone_no, password, role) VALUE 
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${hash}', '2')`)

        req.flash('success', 'customer add successfully')
        res.redirect('/user/customer')
    } catch (error) {
        console.log(error);
    }
})

router.get('/edit_customer/:id', auth, async(req, res) => {
    try {
        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${req.params.id}'`)
        
        res.render('edit_customer', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, nameCode, CountryCode, customer_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_customer/:id', auth, async(req, res) => {
    try {
        const {first_name, last_name, country_code, phone_no, email} = req.body
        
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${req.params.id}'`)
        
        await mySqlQury(`UPDATE tbl_customer SET first_name = '${first_name}', last_name = '${last_name}', country_code = '${country_code}',
        phone_no = '${phone_no}', email = '${email}' WHERE id = '${req.params.id}'`)

        await mySqlQury(`UPDATE tbl_admin SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}',
        country_code = '${country_code}', phone_no = '${phone_no}' WHERE email = '${customer_data[0].email}'`)

        req.flash('success', 'customer data update successfully')
        res.redirect('/user/customer')
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_customer/:id", auth, async(req, res)=>{
    try {
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${req.params.id}'`)
        const admin_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${customer_data[0].email}'`)

        await mySqlQury(`DELETE FROM tbl_customer WHERE id = '${req.params.id}'`)
        await mySqlQury(`DELETE FROM tbl_admin WHERE id = '${admin_data[0].id}'`)

        res.redirect("/user/customer")
    } catch (error) {
        console.log(error);
    }
})

router.post("/customer_ajex", auth, async(req, res)=>{
    try {
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${req.body.email}'`)
        const admin_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.email}'`)

        const customer_data_ph = await mySqlQury(`SELECT * FROM tbl_customer WHERE phone_no = '${req.body.phone}'`)
        const admin_data_ph = await mySqlQury(`SELECT * FROM tbl_admin WHERE phone_no = '${req.body.phone}'`)

        res.json({customer_data, admin_data, customer_data_ph, admin_data_ph})
    } catch (error) {
        console.log(error);
    }
})

// ============ driver ============= //

router.get('/driver', auth, async(req, res) => {
    try {
        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)

        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver ORDER BY id DESC`)
        const zone_data = await mySqlQury(`SELECT * FROM tbl_zone GROUP BY zone_name`)
        
        res.render('driver', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, nameCode, CountryCode, driver_data, zone_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_driver', auth, async(req, res) => {
    try {
        const {first_name, last_name, email, license_number, country_code, phone_no, zone, carrier_commission, carrier_min_balance_for_withdraw, password} = req.body

        await mySqlQury(`INSERT INTO tbl_driver (first_name, last_name, country_code, phone_no, email, license_number, zone, carrier_commission, carrier_min_balance_for_withdraw,  tot_balance, tbl_Withdraw, driver_total_bal) VALUE 
            ('${first_name}', '${last_name}', '${country_code}', '${phone_no}', '${email}', '${license_number}', '${zone}', '${carrier_commission}', '${carrier_min_balance_for_withdraw}', '0', '0', '0')`)

        const hash = await bcrypt.hash(password, 10)

        await mySqlQury(`INSERT INTO tbl_admin (first_name, last_name, email, country_code, phone_no, password, role) VALUE
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${hash}', '3')`)
        
        req.flash('success', 'customer add successfully')
        res.redirect('/user/driver')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_driver/:id', auth, async(req, res) => {
    try {
        const {first_name, last_name, email, license_number, country_code, phone_no, zone, carrier_commission, approved, carrier_min_balance_for_withdraw} = req.body
        let checkbox
        if (approved == 'on') {
            checkbox = 1
        } else {
            checkbox = 0
        }
        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE id = '${req.params.id}'`)
        
        await mySqlQury(`UPDATE tbl_driver SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', license_number = '${license_number}',
        country_code = '${country_code}', phone_no = '${phone_no}', zone = '${zone}', carrier_commission = '${carrier_commission}', approved = '${checkbox}', carrier_min_balance_for_withdraw = '${carrier_min_balance_for_withdraw}' WHERE id = '${req.params.id}'`)

        await mySqlQury(`UPDATE tbl_admin SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', 
        country_code = '${country_code}', phone_no = '${phone_no}' WHERE email = '${driver_data[0].email}'`)

        req.flash('success', 'customer update successfully')
        res.redirect('/user/driver')
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_carrier/:id", auth, async(req, res)=>{
    try {
        const carrier_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE id = '${req.params.id}'`)
        const admin_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${carrier_data[0].email}'`)

        await mySqlQury(`DELETE FROM tbl_driver WHERE id = '${req.params.id}'`)
        await mySqlQury(`DELETE FROM tbl_driver_document WHERE id = '${carrier_data[0].id}'`)
        await mySqlQury(`DELETE FROM tbl_admin WHERE id = '${admin_data[0].id}'`)
        
        res.redirect('/user/driver')
    } catch (error) {
        console.log(error);
    }
})

router.post("/carrier_ajex", auth, async(req, res)=>{
    try {
        const carrier_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.body.email}'`)
        const admin_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.email}'`)

        const customer_data_ph = await mySqlQury(`SELECT * FROM tbl_driver WHERE phone_no = '${req.body.phone}'`)
        const admin_data_ph = await mySqlQury(`SELECT * FROM tbl_admin WHERE phone_no = '${req.body.phone}'`)

        res.json({carrier_data, admin_data, customer_data_ph, admin_data_ph})
    } catch (error) {
        console.log(error);
    }
})


// ============== driver document ============== //

router.post('/driver_document', auth, async(req, res) => {
    try {
        const data = await mySqlQury(`SELECT * FROM tbl_driver_document WHERE driver_id = '${req.body.data_id}'`)
        console.log(data);

        res.send({data})

        // res.render('driver_doc', {
        //     auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per,
        //     general_data: req.general[0], notification_data: req.notification, driver_id: req.params.id, data
        // })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_driver_document/:id', auth, upload.single('image'), async(req, res) => {
    try {
        console.log(req.body);
        const {vehicle_document_status, hidden_image} = req.body

        let status, vehicle_image
        if (vehicle_document_status == 'on') {
            status = 1
        }else{
            status = 0
        }

        let driver_doc = await mySqlQury(`SELECT * FROM tbl_driver_document WHERE driver_id = '${req.params.id}'`)

        if (driver_doc != "") {

            if (hidden_image == '0') {
                await mySqlQury(`UPDATE tbl_driver_document SET status = '${status}' WHERE driver_id = '${req.params.id}'`)
                
            } else {
                vehicle_image = req.file.filename
                console.log(vehicle_image);
                await mySqlQury(`UPDATE tbl_driver_document SET image = '${vehicle_image}', status = '${status}' WHERE driver_id = '${req.params.id}'`)
            }
        } else {
            vehicle_image = req.file.filename
            console.log(vehicle_image);
            await mySqlQury(`INSERT INTO tbl_driver_document (driver_id, type, image, status) VALUE ('${req.params.id}', '1', '${vehicle_image}', '0')`)
        }

        req.flash('success', 'driver document update successfully')
        res.redirect('/user/driver')
    } catch (error) {
        console.log(error);
    }
})


module.exports = router