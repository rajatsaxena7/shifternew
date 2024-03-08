const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const multer  = require('multer')
const mysql = require("mysql")
const geolib = require('geolib');
const { connection, mySqlQury } = require('../middleware/db')
const axios = require('axios');




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)

    }
})

const upload = multer({storage : storage});



// ============= shift_express ================ //

router.get('/shift', auth, async(req, res) => {
    try {
        const shift_express_list = await mySqlQury(`SELECT * FROM tbl_shift_express`)

        res.render('shift_express', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, shift_express_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_shift', auth, upload.single('image'), async(req, res) => {
    try {
        const {title, price, description} = req.body
        const image = req.file.filename

        await mySqlQury(`INSERT INTO tbl_shift_express (image, title, price, description) VALUE ('${image}', ${mysql.escape(title)}, '${price}', ${mysql.escape(description)})`)

        req.flash('success', 'shift added successfully')
        res.redirect('/settings/shift')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_shift/:id', auth, upload.single('image'), async(req, res) => {
    try {
        const {hidden_image, title, price, description} = req.body

        if (hidden_image == 0) {
            await mySqlQury(`UPDATE tbl_shift_express SET title = ${mysql.escape(title)}, price = '${price}', description = ${mysql.escape(description)} WHERE id = '${req.params.id}'`)
        } else {
            const image  = req.file.filename
            await mySqlQury(`UPDATE tbl_shift_express SET image = '${image}', title = ${mysql.escape(title)}, price = '${price}', description = ${mysql.escape(description)} WHERE id = '${req.params.id}'`)
        }

        req.flash('success', 'shift update successfully')
        res.redirect('/settings/shift')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_shift/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_shift_express WHERE id = '${req.params.id}'`)

        req.flash('success', 'shift deleted successfully')
        res.redirect('/settings/shift')
    } catch (error) {
        console.log(error);
    }
})


// ============= time_management ============= //

router.get('/time', auth, async(req, res) => {
    try {
        const time_list = await mySqlQury(`SELECT * FROM tbl_time_management`)
        
        res.render('time_management', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, time_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_time', auth, async(req, res) => {
    try {
        const {start_time, end_time} = req.body

        await mySqlQury(`INSERT INTO tbl_time_management (start_time, end_time) VALUE ('${start_time}', '${end_time}')`)

        req.flash('success', 'time add successfully')
        res.redirect('/settings/time')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_time/:id', auth, async(req, res) => {
    try {
        const {start_time, end_time} = req.body

        await mySqlQury(`UPDATE tbl_time_management SET start_time = '${start_time}', end_time = '${end_time}' WHERE id = '${req.params.id}'`)

        req.flash('success', 'time update successfully')
        res.redirect('/settings/time')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_time/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_time_management WHERE id = '${req.params.id}'`)
        
        req.flash('success', 'time deleted successfully')
        res.redirect('/settings/time')
    } catch (error) {
        console.log(error);
    }
})



// ============ weight_unit ============= //

router.get('/weight_unit', auth, async(req, res) => {
    try {
        const weight_unit_list = await mySqlQury(`SELECT * FROM tbl_weight_unit`)
        
        res.render('weight_unit', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, weight_unit_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_weight_unit', auth, async(req, res) => {
    try {
        const {name, symbol} = req.body

        await mySqlQury(`INSERT INTO tbl_weight_unit (name, symbol) VALUE ('${name}', '${symbol}')`)

        req.flash('success', 'weight unit add successfully')
        res.redirect('/settings/weight_unit')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_weight_unit/:id', auth, async(req, res) => {
    try {
        const {name, symbol} = req.body

        await mySqlQury(`UPDATE tbl_weight_unit SET name = '${name}', symbol = '${symbol}' WHERE id = '${req.params.id}'`)

        req.flash('success', 'weight unit updated successfully')
        res.redirect('/settings/weight_unit')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_weight_unit/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_weight_unit WHERE id = '${req.params.id}'`)

        req.flash('success', 'weight unit deleted successfully')
        res.redirect('/settings/weight_unit')
    } catch (error) {
        console.log(error);
    }
})



// ============ FAQ ============= //

router.get('/faq', auth, async(req, res)=>{
    try {
        const faq_list = await mySqlQury(`SELECT * FROM tbl_faq`)

        res.render('faq', {auth_data: req.user, module_list: req.module, permission: req.per, language: req.lang, lang: req.lan, general_data: req.general[0], notification_data: req.notification, faq_list});
    } catch (error) {
        console.log(error);
    }
})

router.post("/faq", auth, async(req, res)=>{
    try {
        const {faq_title, faq_des} = req.body

        const faq_faq_title = mysql.escape(faq_title);
        const faq_faq_des = mysql.escape(faq_des);

        await mySqlQury(`INSERT INTO tbl_faq (faq_title, faq_des) VALUE (${faq_faq_title}, ${faq_faq_des})`);

        req.flash('success', 'FAQ add successfully')
        res.redirect("/settings/faq");
    } catch (error) {
        console.log(error);
    }
})

router.post("/edit_faq/:id", auth, async(req, res)=>{
    try {
        const {faq_title, faq_des} = req.body

        const faq_faq_title = mysql.escape(faq_title);
        const faq_faq_des = mysql.escape(faq_des);

        await mySqlQury(`UPDATE tbl_faq SET faq_title = ${faq_faq_title}, faq_des = ${faq_faq_des} WHERE id = '${req.params.id}'`);

        req.flash('success', 'FAQ Edit successfully')
        res.redirect("/settings/faq");
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_faq/:id", auth, async(req, res)=>{
    try {
        await mySqlQury(`DELETE FROM tbl_faq WHERE id = '${req.params.id}'`)
        
        req.flash('success', 'FAQ Delete successfully')
        res.redirect("/settings/faq");
    } catch (error) {
        console.log(error);
    }
})

// ============ Policy List ============= //

router.get("/policy_pages", auth, async(req, res)=>{
    try {
        const policy_list = await mySqlQury(`SELECT * FROM tbl_policy`)
        
        res.render("policy_pages", {auth_data: req.user, module_list: req.module, permission: req.per, language: req.lang, lang: req.lan, general_data: req.general[0], notification_data: req.notification, policy_list})
    } catch (error) {
        console.log(error);
    }
})

router.post("/policy_pages", auth, async (req, res) => {
    try {
        const { policy_title, policy_det } = req.body;

        const escapedPolicyTitle = mysql.escape(policy_title);
        const escapedPolicyDet = mysql.escape(policy_det);

        const insertQuery = `INSERT INTO tbl_policy (policy_title, policy_det) VALUES (${escapedPolicyTitle}, ${escapedPolicyDet})`;
        await mySqlQury(insertQuery);

        req.flash('success', 'Policy added successfully');
        res.redirect("/settings/policy_pages");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/edit_policy/:id", auth, async (req, res) => {
    try {
        const { policy_title, policy_det } = req.body;
        const id = req.params.id;

        const escapedPolicyTitle = mysql.escape(policy_title);
        const escapedPolicyDet = mysql.escape(policy_det);

        const updateQuery = `UPDATE tbl_policy SET policy_title = ${escapedPolicyTitle}, policy_det = ${escapedPolicyDet} WHERE id = ${id}`;
        await mySqlQury(updateQuery);

        res.redirect("/settings/policy_pages");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/delete_policy/:id", auth, async(req, res)=>{
    try {
        await mySqlQury(`DELETE FROM tbl_policy WHERE id = '${req.params.id}'`)
        
        req.flash('success', 'FAQ Delete successfully')
        res.redirect("/settings/policy_pages")
    } catch (error) {
        console.log(error);
    }
})



// ============ package_details ================ //

router.get('/package_details', auth, async(req, res) => {
    try {
        const weight_unit_list = await mySqlQury(`SELECT * FROM tbl_weight_unit`)
        const package_details_list = await mySqlQury(`SELECT tbl_package_details.*, (select tbl_weight_unit.symbol from tbl_weight_unit where tbl_package_details.start_symbol = tbl_weight_unit.id) as start_symbol_data,
                                                                                    (select tbl_weight_unit.symbol from tbl_weight_unit where tbl_package_details.end_symbol = tbl_weight_unit.id) as end_symbol_data
                                                                                    FROM tbl_package_details`)
        
        res.render('package_details', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, weight_unit_list, package_details_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_package', auth, upload.single('image'), async(req, res) => {
    try {
        const {name, start_weight, start_symbol, end_weight, end_symbol, price} = req.body
        const image = req.file.filename

        await mySqlQury(`INSERT INTO tbl_package_details (image, name, start_weight, start_symbol, end_weight, end_symbol, price) VALUE
        ('${image}', '${name}', '${start_weight}', '${start_symbol}', '${end_weight}', '${end_symbol}', '${price}')`)

        req.flash('success', 'package details add successfully')
        res.redirect('/settings/package_details')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_package/:id', auth, upload.single('image'), async(req, res) => {
    try {
        const {hidden_image, name, start_weight, start_symbol, end_weight, end_symbol, price} = req.body
        if (hidden_image == 0) {
            await mySqlQury(`UPDATE tbl_package_details SET name = '${name}', start_weight = '${start_weight}', start_symbol = '${start_symbol}',
            end_weight = '${end_weight}', end_symbol = '${end_symbol}', price = '${price}' WHERE id = '${req.params.id}'`)
        } else {
            const image = req.file.filename

            await mySqlQury(`UPDATE tbl_package_details SET image = '${image}', name = '${name}', start_weight = '${start_weight}', start_symbol = '${start_symbol}',
            end_weight = '${end_weight}', end_symbol = '${end_symbol}', price = '${price}' WHERE id = '${req.params.id}'`)
        }

        req.flash('success', 'package details update successfully')
        res.redirect('/settings/package_details')
    } catch (error) {
        console.log(error);
    }
})



// ============ delivery_type ============== //

router.get('/delivery_type', auth, async(req, res) => {
    try {
        const delivery_type_list1 = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE module = '1' `)
        const delivery_type_list2 = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE module = '2' `)
        const delivery_type_list3 = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE module = '3' `)
        
        res.render('delivery_type', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, delivery_type_list1, delivery_type_list2, delivery_type_list3
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_delivery_type', auth, async(req, res) => {
    try {
        const {type, sub_type, price, delivery_module} = req.body

        await mySqlQury(`INSERT INTO tbl_delivery_type (type, sub_type, price, module) VALUE ('${type}', '${sub_type}', '${price}', '${delivery_module}')`)

        req.flash('success', 'delivery type add successfully')
        res.redirect('/settings/delivery_type')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_delivery_type/:id', auth, async(req, res) => {
    try {
        const {type, sub_type, price} = req.body

        await mySqlQury(`UPDATE tbl_delivery_type SET type = '${type}', sub_type = '${sub_type}', price = '${price}' WHERE id = '${req.params.id}'`)

        req.flash('success', 'delivery type data update successfully')
        res.redirect('/settings/delivery_type')
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_delivery_type/:id", auth, async(req, res)=>{
    try {
        await mySqlQury(`delete FROM tbl_delivery_type WHERE id = '${req.params.id}' `)

        req.flash('success', `Deleted successfully`)
        res.redirect('/settings/delivery_type')
    } catch (error) {
        console.log(error);
    }
})

router.get("/distance_rate", auth, async(req, res)=>{
    try {
        const country_list = await mySqlQury(`SELECT * FROM tbl_country`)

        const distance_data = await mySqlQury(`SELECT tbl_rates.*, (select tbl_country.name from tbl_country where tbl_rates.Origin = tbl_country.id) as country_origin,
                                                                (select tbl_state.name from tbl_state where tbl_rates.State = tbl_state.id) as state_name,
                                                                (select tbl_city.name from tbl_city where tbl_rates.City = tbl_city.id) as city_name,
                                                                (select tbl_country.name from tbl_country where tbl_rates.Destination_Country = tbl_country.id) as destination_origin,
                                                                (select tbl_state.name from tbl_state where tbl_rates.Destination_State = tbl_state.id) as destination_state,
                                                                (select tbl_city.name from tbl_city where tbl_rates.Destination_City = tbl_city.id) as destination_city
                                                                FROM tbl_rates WHERE module = '1' ORDER BY id DESC `)

        const zone_distant_data = await mySqlQury(`SELECT tbl_rates.*, (select tbl_country.name from tbl_country where tbl_rates.Origin = tbl_country.id) as country_origin,
                                                                (select tbl_state.name from tbl_state where tbl_rates.State = tbl_state.id) as state_name,
                                                                (select tbl_city.name from tbl_city where tbl_rates.City = tbl_city.id) as city_name,
                                                                (select tbl_zone.zone_name from tbl_zone where tbl_rates.Destination_Country = tbl_zone.id) as destination_origin
                                                                FROM tbl_rates WHERE module = '3' ORDER BY id DESC `)
        console.log(distance_data);


        const zone_data = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '3' GROUP BY zone_name `)

        res.render("distance_rate", {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, country_list, distance_data, zone_data, zone_distant_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_state/ajax/:id', auth, async(req, res) => {
    try {
        const country_list = await mySqlQury(`SELECT * FROM tbl_state WHERE country_name = '${req.params.id}' `)

        res.json({country_list})
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_city/ajax/:id', auth, async(req, res) => {
    try {
        const city_list = await mySqlQury(`SELECT * FROM tbl_city WHERE state_name = '${req.params.id}' `)

        res.json({city_list})
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_distance", auth, async(req, res)=>{
    try {
        const {Origin, State, City, Destination_Country, zone_Destination_Country, Destination_State, Destination_City, start_weight_range, end_weight_range, Weight_rate, distance_module} = req.body
        console.log(req.body);
        if (distance_module == "1") {
            
            await mySqlQury(`INSERT INTO tbl_rates (Origin, State, City, Destination_Country, Destination_State, Destination_City, start_weight_range, end_weight_range, Weight_rate, module) 
                            VALUE ('${Origin}', '${State}', '${City}', '${Destination_Country}', '${Destination_State}', '${Destination_City}', '${start_weight_range}', '${end_weight_range}', '${Weight_rate}', '${distance_module}')`)

        } else {
                            
            await mySqlQury(`INSERT INTO tbl_rates (Origin, State, City, Destination_Country, start_weight_range, end_weight_range, Weight_rate, module) 
                            VALUE ('${Origin}', '${State}', '${City}', '${zone_Destination_Country}', '${start_weight_range}', '${end_weight_range}', '${Weight_rate}', '${distance_module}')`)
        }

        res.redirect("/settings/distance_rate")
    } catch (error) {
        console.log(error);
    }
})

router.get("/edit_distance/:id", auth, async(req, res)=>{
    try {
        const reates_detail = await mySqlQury(`SELECT * FROM tbl_rates WHERE id = "${req.params.id}" `)
        
        const des_state = await mySqlQury(`SELECT * FROM tbl_state WHERE id = "${reates_detail[0].Destination_State}" `)
        const des_city = await mySqlQury(`SELECT * FROM tbl_city WHERE id = "${reates_detail[0].Destination_City}" `)
        const counter = await mySqlQury(`SELECT * FROM tbl_country`)
        const state = await mySqlQury(`SELECT * FROM tbl_state WHERE id = "${reates_detail[0].State}" `)
        const city = await mySqlQury(`SELECT * FROM tbl_city WHERE id = "${reates_detail[0].City}" `)
        const zone_data = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '3' GROUP BY zone_name `)
        
        res.render("edit_distance", {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, reates_detail:reates_detail[0], counter, state, city, des_state, des_city, zone_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_distance_page/:id", auth, async(req, res)=>{
    try {
        const {Origin, State, City, Destination_Country, Destination_State, Destination_City, start_weight_range, end_weight_range, Weight_rate, end_distance_module} = req.body
        
        if (end_distance_module == "1") {
            
            await mySqlQury(`UPDATE tbl_rates SET Origin = '${Origin}', State = '${State}', City = '${City}', Destination_Country = '${Destination_Country}', Destination_State = '${Destination_State}'
            , Destination_City = '${Destination_City}', start_weight_range = '${start_weight_range}', end_weight_range = '${end_weight_range}', Weight_rate = '${Weight_rate}' WHERE id = '${req.params.id}'`)
        } else {
            
            await mySqlQury(`UPDATE tbl_rates SET Origin = '${Origin}', State = '${State}', City = '${City}', Destination_Country = '${Destination_Country}'
            ,start_weight_range = '${start_weight_range}', end_weight_range = '${end_weight_range}', Weight_rate = '${Weight_rate}' WHERE id = '${req.params.id}'`)
        }


        res.redirect("/settings/distance_rate")
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_distance/:id", auth, async(req, res)=>{
    try {
        await mySqlQury(`DELETE FROM tbl_rates WHERE id = "${req.params.id}" `)

        res.redirect("/settings/distance_rate")
    } catch (error) {
        console.log(error);
    }
})

// ============ general_settings ============== //

router.get('/general_settings', auth, async(req, res) => {
    try {
        const settings_data = await mySqlQury(`SELECT * FROM tbl_general_settings`)
        
        res.render('general_settings', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, settings_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/general_settings', auth, upload.fields([{name: 'site_logo', maxCount: 1}, {name: 'site_dark_logo', maxCount: 1}]), async(req, res) => {
    try {
        const {site_title, site_logo_hidden, site_dark_logo_hidden, site_currency, site_timezone, currency_placement, thousands_separator, driver_autoapproved, onesignal_app_id, onesignal_api_key,
                email_host, email_port, email_id, email_password, sms_status, email_status, length_units, weight_units, order_auto_approved, google_map_key, auth_key, otp_template_id, 
                sms_template_id} = req.body

        let driver_approved, currency_placement_site, sms, email, order_auto
        
        if (driver_autoapproved == 'on') {
            driver_approved = 1
        } else {
            driver_approved = 0
        }

        if (currency_placement == 'on') {
            currency_placement_site = 1
        } else {
            currency_placement_site = 0
        }
        if (sms_status == "on") {
            sms = 1
        } else {
            sms = 0
        }
        if (email_status == "on") {
            email = 1
        } else {
            email = 0
        }
        if (order_auto_approved == "on") {
            order_auto = 1
        } else {
            order_auto = 0
        }

        const all_data = await mySqlQury(`SELECT * FROM tbl_general_settings`)
        
        if (all_data == '') {
            const site_logo = req.files.site_logo[0].filename
            const site_dark_logo = req.files.site_dark_logo[0].filename
            await mySqlQury(`INSERT INTO tbl_general_settings (site_title, site_logo, site_dark_logo, site_currency, site_timezone, currency_placement, thousands_separator, driver_autoapproved,
                onesignal_app_id, onesignal_api_key, auth_key, otp_template_id, sms_template_id, email_host, email_port, email_id, email_password, sms_status, email_status, length_units, weight_units, order_auto_approved, google_map_key) 
                VALUE ('${site_title}', '${site_logo}', '${site_dark_logo}', '${site_currency}', '${site_timezone}', '${currency_placement_site}', '${thousands_separator}', '${driver_approved}', '${onesignal_app_id}', '${onesignal_api_key}', '${auth_key}', '${otp_template_id}', '${sms_template_id}',
                '${email_host}', '${email_port}', '${email_id}', '${email_password}', '${sms}', ''${email}, '${length_units}', '${weight_units}', '${order_auto}', '${google_map_key}')`)
            
        } else {
            let site_logo, site_dark_logo
            if (site_logo_hidden == 1 && site_dark_logo_hidden == 1) {

                site_logo = req.files.site_logo[0].filename
                site_dark_logo = req.files.site_dark_logo[0].filename
                
            } else if (site_logo_hidden == 1 && site_dark_logo_hidden == 0) {

                site_logo = req.files.site_logo[0].filename
                site_dark_logo = all_data[0].site_dark_logo

            } else if (site_logo_hidden == 0 && site_dark_logo_hidden == 1) {

                site_logo = all_data[0].site_logo
                site_dark_logo = req.files.site_dark_logo[0].filename

            } else {

                site_logo = all_data[0].site_logo
                site_dark_logo = all_data[0].site_dark_logo

            }
            
                await mySqlQury(`UPDATE tbl_general_settings SET site_title = '${site_title}', site_logo = '${site_logo}', site_dark_logo = '${site_dark_logo}', site_currency = '${site_currency}', site_timezone = '${site_timezone}',
                    currency_placement = '${currency_placement_site}', thousands_separator = '${thousands_separator}', driver_autoapproved = '${driver_approved}', onesignal_app_id = '${onesignal_app_id}',
                    onesignal_api_key = '${onesignal_api_key}', auth_key = '${auth_key}', otp_template_id = '${otp_template_id}', sms_template_id = '${sms_template_id}', email_host = '${email_host}',
                    email_port = '${email_port}', email_id = '${email_id}', email_password = '${email_password}', sms_status = '${sms}', email_status = '${email}', length_units = '${length_units}',
                    weight_units = '${weight_units}', order_auto_approved = '${order_auto}', google_map_key = '${google_map_key}'`)

        }
        
        req.flash('success', 'General Settings update successfully')
        res.redirect('/settings/general_settings')
    } catch (error) {
        console.log(error);
    }
})



// ============ address_price ============= //

router.get('/pricing', auth, async(req, res) => {
    try {
        const pricing = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '1'`)
        const weight_data1 = await mySqlQury(`SELECT * FROM tbl_weight_rate WHERE module = '1'`)
        const weight_data3 = await mySqlQury(`SELECT * FROM tbl_weight_rate WHERE module = '3'`)
        if (pricing == ''){
            await mySqlQury(`INSERT INTO tbl_pricing (min_distance, min_distance_price, ex_distance_price, floor_no, floor_price, elevator_discount,
                today_price, tomorrow_price, dayaftertomorrow_price, curiour_amount, international_amount) VALUE ('0', '0', '0', '', '', '', '0', '0', '0', '0', '0')`)
        }
        const pricing_data1 = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '1'`)
        const pricing_data2 = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '2'`)
        const pricing_data3 = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '3'`)
        
        const floor_no1 = pricing_data1[0].floor_no.split(',')
        const floor_price1 = pricing_data1[0].floor_price.split(',')

        const floor_no2 = pricing_data2[0].floor_no.split(',')
        const floor_price2 = pricing_data2[0].floor_price.split(',')

        const floor_no3 = pricing_data3[0].floor_no.split(',')
        const floor_price3 = pricing_data3[0].floor_price.split(',')

        res.render('pricing', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, weight_data1, weight_data3, pricing_data1, pricing_data2, pricing_data3, floor_no1, floor_no2, floor_no3, 
            floor_price1, floor_price2, floor_price3
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/pricing', auth, async(req, res) => {
    try {
        const {min_distance, min_distance_price, ex_distance_price, floor_no, floor_price, elevator_discount, today_price, tomorrow_price, dayaftertomorrow_price
                , courier_multiplay_amount, international_amount, module1, module2, module3, carrier_min_distance, carrier_max_price, carrier_ex_dis_price, cou_min_weight, cou_max_weight
                , cou_weight_price, int_min_weight, int_max_weight, int_weight_price} = req.body

        if (module1) {
            const pricing_module = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${module1}'`)

            await mySqlQury(`UPDATE tbl_pricing SET min_distance = '${carrier_min_distance}', min_distance_price = '${carrier_max_price}', ex_distance_price = '${carrier_ex_dis_price}',
            floor_no = '${floor_no}', floor_price = '${floor_price}', elevator_discount = '${elevator_discount}', today_price = '${today_price}',
            tomorrow_price = '${tomorrow_price}', dayaftertomorrow_price = '${dayaftertomorrow_price}', curiour_amount = '${courier_multiplay_amount}' WHERE module = '${pricing_module[0].module}'`)

            await mySqlQury(`DELETE FROM tbl_weight_rate WHERE module = '${module1}'`)

            for (let i = 0; i < cou_min_weight.length; ) {
                await mySqlQury(`INSERT INTO tbl_weight_rate (min_weight, max_weight, price, module) 
                                VALUE ('${cou_min_weight[i]}', '${cou_max_weight[i]}', '${cou_weight_price[i]}', '${module1}')`)
                i++
            }

        } else if(module2) {
            const pricing_module = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${module2}'`)
            
            await mySqlQury(`UPDATE tbl_pricing SET min_distance = '${min_distance}', min_distance_price = '${min_distance_price}', ex_distance_price = '${ex_distance_price}',
            floor_no = '${floor_no}', floor_price = '${floor_price}', elevator_discount = '${elevator_discount}', today_price = '${today_price}',
            tomorrow_price = '${tomorrow_price}', dayaftertomorrow_price = '${dayaftertomorrow_price}' WHERE module = '${pricing_module[0].module}'`)
            
        } else if(module3){
            const pricing_module = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${module3}'`)
            
            await mySqlQury(`UPDATE tbl_pricing SET floor_no = '${floor_no}', floor_price = '${floor_price}', elevator_discount = '${elevator_discount}', today_price = '${today_price}',
            tomorrow_price = '${tomorrow_price}', dayaftertomorrow_price = '${dayaftertomorrow_price}',international_amount = '${international_amount}' WHERE module = '${pricing_module[0].module}'`)
            
            await mySqlQury(`DELETE FROM tbl_weight_rate WHERE module = '${module3}'`)
            
            for (let i = 0; i < int_min_weight.length; ) {
                await mySqlQury(`INSERT INTO tbl_weight_rate (min_weight, max_weight, price, module) 
                VALUE ('${int_min_weight[i]}', '${int_max_weight[i]}', '${int_weight_price[i]}', '${module3}')`)
                i++
            }
        }
        // await mySqlQury(`INSERT INTO tbl_pricing (min_distance, min_distance_price, ex_distance_price, floor_no, floor_price, elevator_discount,
        // today_price, tomorrow_price, dayaftertomorrow_price, module) VALUE ('${min_distance}', '${min_distance_price}', '${ex_distance_price}', '${floor_no}', 
        // '${floor_price}', '${elevator_discount}', '${today_price}', '${tomorrow_price}', '${dayaftertomorrow_price}', '${module2}')`)
        
        res.redirect('/settings/pricing')
    } catch (error) {
        console.log(error);
    }
})


// ============= shipping_status ============== //

router.get('/shipping_status', auth, async(req, res) => {
    try {
        const status_list = await mySqlQury(`SELECT * FROM tbl_shipping_status`)
        
        res.render('shipping_status', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, status_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_status', auth, async(req, res) => {
    try {
        const {status_name, status_details} = req.body
        
        await mySqlQury(`INSERT INTO tbl_shipping_status (status_name, status_details, active) VALUE ('${status_name}', '${status_details}', '1')`)

        req.flash('success', 'Shipping status add successfully')
        res.redirect('/settings/shipping_status')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_status/:id', auth, async(req, res) => {
    try {
        const {status_name, status_details, active} = req.body
        let active_data
        if (active == 'on') {
            active_data = 1
        } else {
            active_data = 0
        }

        await mySqlQury(`UPDATE tbl_shipping_status SET status_name = '${status_name}', status_details = '${status_details}', active = '${active_data}' WHERE id = '${req.params.id}'`)

        req.flash('success', 'Shipping status update successfully')
        res.redirect('/settings/shipping_status')
    } catch (error) {
        console.log(error);
    }
})


// ============ zone =============== //

router.get('/zone', auth, async(req, res) => {
    try {
        const zone_data1 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '1' GROUP BY zone_name ORDER BY id DESC `)
        const zone_data2 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '2' GROUP BY zone_name ORDER BY id DESC `)
        const zone_data3 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '3' GROUP BY zone_name ORDER BY id DESC `)

        res.render('zone', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, zone_data1, zone_data2, zone_data3
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/add_zone', auth, async(req, res) => {
    try {

        res.render('add_zone', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification,
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_zone', auth, async(req, res) => {
    try {
        const {zone_name, status, zone_lat_lon, module_list_id} = req.body

        
        const lat_lon = zone_lat_lon.split(',')
        console.log("lat_lon", lat_lon);
        
        let lat = []
        let lon = []

        for (let i = 0; i < lat_lon.length; ){
            if ((i%2) == 0) {
                console.log('if', lat_lon[i]);
                lat.push(lat_lon[i])
            } else {
                console.log('else', lat_lon[i]);
                lon.push(lat_lon[i])
            }
            i++
        }

        for (let a = 0; a < lat.length; ){

            await mySqlQury(`INSERT INTO tbl_zone (zone_name, status, latitude, longitude, zone_type) VALUE
                ('${zone_name}', '${status}', '${lat[a]}', '${lon[a]}', '${module_list_id}')`)
            a++
        }

        req.flash('success', 'zone add successfully')
        res.redirect('/settings/zone')
    } catch (error) {
        console.log(error);
    }
})

router.get("/edit_zone/:id", auth, async(req, res)=>{
    try {
        let zone = req.params.id.split(",")

        const zone_data = await mySqlQury(`SELECT * FROM tbl_zone WHERE id = '${zone[0]}' AND zone_type = '${zone[1]}' `)
        const all_zone = await mySqlQury(`SELECT latitude, longitude FROM tbl_zone WHERE zone_name = '${zone_data[0].zone_name}' AND zone_type = '${zone[1]}' `)
        
        let edit_zone = ""
        for (let i = 0; i < all_zone.length; ){
            edit_zone += ':' + all_zone[i].latitude + ',' + all_zone[i].longitude
            i++
        }

        let old = [];
        for (let i = 0; i < all_zone.length; ){
            old.push(all_zone[i].latitude + ',' + all_zone[i].longitude)
            i++
        }

        res.render('add_zone', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, zone_data, edit_zone, all_zone, old
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_zone_poly', auth, async(req, res)=>{
    try {
        const {zone_name, status, zone_lat_lon, module_list_id, zone_id} = req.body
        
        let zone_data = await mySqlQury(`SELECT * FROM tbl_zone WHERE id = '${zone_id}' AND zone_type = '${module_list_id}' `)

        if (zone_lat_lon != "") {
            await mySqlQury(`delete FROM tbl_zone WHERE zone_name = '${zone_data[0].zone_name}' AND zone_type = '${module_list_id}'  `)

            const lat_lon = zone_lat_lon.split(',')
            
            let lat = []
            let lon = []

            for (let i = 0; i < lat_lon.length; ){
                if ((i%2) == 0) {
                    console.log('if', lat_lon[i]);
                    lat.push(lat_lon[i])
                } else {
                    console.log('else', lat_lon[i]);
                    lon.push(lat_lon[i])
                }
                i++
            }

            for (let a = 0; a < lat.length; ){

                await mySqlQury(`INSERT INTO tbl_zone (zone_name, status, latitude, longitude, zone_type) VALUE
                    ('${zone_name}', '${status}', '${lat[a]}', '${lon[a]}', '${module_list_id}')`)
                a++
            }

        } else {

            await mySqlQury(`UPDATE tbl_zone SET zone_name = '${zone_name}', status = '${status}' WHERE zone_name = '${zone_data[0].zone_name}' AND zone_type = '${module_list_id}'`)
            
        }
        
        req.flash('success', 'Edit successfully')
        res.redirect('/settings/zone')
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_zone/:id", auth, async(req, res)=>{
    try {
        const zone_data = await mySqlQury(`SELECT * FROM tbl_zone WHERE id = '${req.params.id}' `)
        await mySqlQury(`delete FROM tbl_zone WHERE zone_name = '${zone_data[0].zone_name}' AND zone_type = '${zone_data[0].zone_type}'  `)
        
        res.redirect("/settings/zone")
    } catch (error) {
        console.log(error);
    }
})


// =============== insurance ============== //

router.get('/insurance', auth, async(req, res) => {
    try {
        const insurance_list1 = await mySqlQury(`SELECT * FROM tbl_insurance WHERE module = '1' `)
        const insurance_list2 = await mySqlQury(`SELECT * FROM tbl_insurance WHERE module = '2' `)
        const insurance_list3 = await mySqlQury(`SELECT * FROM tbl_insurance WHERE module = '3' `)
        
        res.render('insurance', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, insurance_list1, insurance_list2, insurance_list3

        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_insurance', auth, async(req, res) => {
    try {
        const {start_price, end_price, premium_charged_percentage, premium_charged, damage_payout_percentage, damage_payout, insurance_module} = req.body

        let premium_percentage, damage_percentage
        if (premium_charged_percentage == 'on') {
            premium_percentage = 1
        } else {
            premium_percentage = 0
        }

        if (damage_payout_percentage == 'on') {
            damage_percentage = 1
        } else {
            damage_percentage = 0
        }

        await mySqlQury(`INSERT INTO tbl_insurance (start_price, end_price, premium_percentage, premium_charged, damage_percentage, damage_payout, module) VALUE
        ('${start_price}', '${end_price}', '${premium_percentage}', '${premium_charged}', '${damage_percentage}', '${damage_payout}', '${insurance_module}')`)

        req.flash('success', 'package insurance add successfully')
        res.redirect('/settings/insurance')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_insurance/:id', auth, async(req, res) => {
    try {
        const {start_price, end_price, premium_charged_percentage, premium_charged, damage_payout_percentage, damage_payout} = req.body

        let premium_percentage, damage_percentage
        if (premium_charged_percentage == 'on') {
            premium_percentage = 1
        } else {
            premium_percentage = 0
        }

        if (damage_payout_percentage == 'on') {
            damage_percentage = 1
        } else {
            damage_percentage = 0
        }
        
        await mySqlQury(`UPDATE tbl_insurance SET start_price = '${start_price}', end_price = '${end_price}', premium_percentage = '${premium_percentage}', premium_charged = '${premium_charged}',
        damage_percentage = '${damage_percentage}', damage_payout = '${damage_payout}' WHERE id = '${req.params.id}'`)

        req.flash('success', 'package insurance data update successfully')
        res.redirect('/settings/insurance')
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_insurance/:id", auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_insurance WHERE id = '${req.params.id}'`)

        req.flash('success', 'package insurance data deleted successfully')
        res.redirect('/settings/insurance')
    } catch (error) {
        console.log(error);
    }
})

router.get("/customer_experience", auth, async(req, res)=>{
    try {
        const cus_experience = await mySqlQury(`SELECT * FROM tbl_customer_experience`)

        res.render("customer_experience", {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, cus_experience
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_cus_exprience", auth, upload.single('custome_img'), async(req, res)=>{
    try {
        const {title, description, name, email} = req.body

        const cou_title = mysql.escape(title);
        const cou_des = mysql.escape(description);
        const cou_name = mysql.escape(name);
        const cou_email = mysql.escape(email);
        
        await mySqlQury(`INSERT INTO tbl_customer_experience (image, title, description, name, email) VALUE ('${req.file.filename}', ${cou_title}, ${cou_des}, ${cou_name}, ${cou_email})`)

        req.flash('success', 'Customer Experience add successfully')
        res.redirect("/settings/customer_experience")
    } catch (error) {
        console.log(error);
    }
})

router.post("/edit_cus_experience/:id", auth, upload.single('cus_edit_img'), async(req, res)=>{
    try {
        const {title, description, name, email} = req.body

        const cus_experience = await mySqlQury(`SELECT * FROM tbl_customer_experience WHERE id = '${req.params.id}'`)
        const cou_title = mysql.escape(title);
        const cou_des = mysql.escape(description);
        const cou_name = mysql.escape(name);
        const cou_email = mysql.escape(email);

        let img
        if (!req.file) {
            img = cus_experience[0].image
        } else {
            img = req.file.filename
        }

        await mySqlQury(`UPDATE tbl_customer_experience SET image = '${img}', title = ${cou_title}, description = ${cou_des}, name = ${cou_name}, email = ${cou_email} WHERE id = '${req.params.id}'`)
        
        req.flash('success', 'Customer Experience data update successfully')
        res.redirect("/settings/customer_experience")
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_cus_experi/:id", auth, async(req, res)=>{
    try {
        await mySqlQury(`DELETE FROM tbl_customer_experience WHERE id = '${req.params.id}'`)

        req.flash('success', 'Customer Experience data deleted successfully')
        res.redirect("/settings/customer_experience")
    } catch (error) {
        console.log(error);
    }
})

router.get("/social_containt", auth, async(req, res)=>{
    try {
        const social_containt = await mySqlQury(`SELECT * FROM tbl_social_containt`)
        
        res.render("social_containt", {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, social_containt
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_social_containt", auth, async(req, res)=>{
    try {
        const {symbol, link} = req.body;
        console.log(req.body);

        await mySqlQury(`INSERT INTO tbl_social_containt (symbol, link) VALUE ('${symbol}', '${link}')`)

        req.flash('success', 'Social Containt add successfully')
        res.redirect("/settings/social_containt")
    } catch (error) {
        console.log(error);
    }
})

router.post("/edit_social_containt/:id", auth, async(req, res)=>{
    try {
        const {symbol, link} = req.body;
        console.log(req.body);
        
        await mySqlQury(`UPDATE tbl_social_containt SET symbol = '${symbol}', link = '${link}' WHERE id = '${req.params.id}'`)

        req.flash('success', 'Social Containt data update successfully')
        res.redirect("/settings/social_containt")
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_social_con/:id", auth, async(req, res)=>{
    try {
        
        await mySqlQury(`DELETE FROM tbl_social_containt WHERE id = '${req.params.id}'`)

        req.flash('success', 'Social Containt data deleted successfully')
        res.redirect("/settings/social_containt")
    } catch (error) {
        console.log(error);
    }
})

// =============== start_price ================= //

router.post('/start_price/:id', auth, async(req, res) => {
    try {
        const insurance_data = await mySqlQury(`SELECT * FROM tbl_insurance WHERE start_price <= '${req.params.id}' AND end_price > '${req.params.id}' AND module = '${req.body.module}'`)
        
        if (insurance_data == ""){
            res.json({data:'done'})
        } else {
            res.json({data:'error'})
        }
    } catch (error) {
        console.log(error);
    }
})


// ============== payment_gateway ================ //

router.get('/payment_gateway', auth, async(req, res) => {
    try {

        
        res.render('payment_gateway', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification,
        })
    } catch (error) {
        console.log(error);
    }
})


// ============= module ============= //

router.get('/module', auth, async(req, res) => {
    try {
        const module_list = await mySqlQury(`SELECT * FROM tbl_module`)

        let module_name, module_icon
        if (module_list == '') {
            module_name = ['Domestic', 'Packers And Movers', 'International']
            module_icon = ['fa fa-truck', 'fa fa-cube', 'fa fa-fighter-jet']

            for (let i = 0; i < module_name.length; i++) {
                await mySqlQury(`INSERT INTO tbl_module (name, icon) VALUE ('${module_name[i]}', '${module_icon[i]}')`)
            }
        }
        
        res.render('module', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, module_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/upadet_module/:id', auth, async(req, res) => {
    try { 
        const {name, icon, isactive, prefix} = req.body
        let active
        if (isactive == 'on') {
            active = 1
        } else {
            active = 0
        }

        await mySqlQury(`UPDATE tbl_module SET name = '${name}', icon = '${icon}', isactive = '${active}', prefix = '${prefix}' WHERE id = '${req.params.id}'`)

        res.redirect('/settings/module')
    } catch (error) {
        console.log(error);
    }
})



module.exports = router