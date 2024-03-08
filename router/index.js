const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')
const countryCodes = require('country-codes-list')
const bcrypt = require('bcrypt');
const multer  = require('multer')
const jwt = require('jsonwebtoken');
const languages = require("../public/language/languages.json")
let  distance = require('google-distance-matrix');
const frontend_lng = require("../middleware/frontend_auth")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({storage:storage});

router.get('/', frontend_lng, async(req, res) => {
    try {
        const faq_list = await mySqlQury(`SELECT * FROM tbl_faq LIMIT 6`)
        const customer_list = await mySqlQury(`SELECT * FROM tbl_customer`)
        const module_list = await mySqlQury(`SELECT * FROM tbl_module`)
        const zone_data = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '3' GROUP BY zone_name `)
        const cus_experience = await mySqlQury(`SELECT * FROM tbl_customer_experience ORDER BY id DESC LIMIT 5`)

        res.render('landing',{
            auth_data : '1', language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
            general_data: req.general[0], notification_data: req.notification, customer_list, module_list, faq_list, zone_data, cus_experience
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/index', auth, async(req, res) => {
    try {
        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`);

        const order_list = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name
                                                                FROM tbl_order ORDER BY id DESC `);

        const order_data = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name
                                                                FROM tbl_order ORDER BY id DESC `);

        const curiour_pending = await mySqlQury(`SELECT COUNT(*) as tot_pending FROM tbl_order WHERE shipping_status =1 AND module = '1' `);
        const curiour_rejected = await mySqlQury(`SELECT COUNT(*) as tot_rejected FROM tbl_order WHERE shipping_status =2 AND module = '1' `);
        const curiour_delivered = await mySqlQury(`SELECT COUNT(*) as tot_delivered FROM tbl_order WHERE shipping_status =3 AND module = '1' `);
        const curiour_pickup = await mySqlQury(`SELECT COUNT(*) as tot_pickup FROM tbl_order WHERE shipping_status =4 AND module = '1' `);
        const curiour_progress = await mySqlQury(`SELECT COUNT(*) as tot_progress FROM tbl_order WHERE shipping_status =5 AND module = '1' `);

        const pam_pending = await mySqlQury(`SELECT COUNT(*) as tot_pending FROM tbl_order WHERE shipping_status =1 AND module = '2' `);
        const pam_rejected = await mySqlQury(`SELECT COUNT(*) as tot_rejected FROM tbl_order WHERE shipping_status =2 AND module = '2' `);
        const pam_delivered = await mySqlQury(`SELECT COUNT(*) as tot_delivered FROM tbl_order WHERE shipping_status =3 AND module = '2' `);
        const pam_pickup = await mySqlQury(`SELECT COUNT(*) as tot_pickup FROM tbl_order WHERE shipping_status =4 AND module = '2' `);
        const pam_progress = await mySqlQury(`SELECT COUNT(*) as tot_progress FROM tbl_order WHERE shipping_status =5 AND module = '2' `);

        const int_pending = await mySqlQury(`SELECT COUNT(*) as tot_pending FROM tbl_order WHERE shipping_status =1 AND module = '3' `);
        const int_rejected = await mySqlQury(`SELECT COUNT(*) as tot_rejected FROM tbl_order WHERE shipping_status =2 AND module = '3' `);
        const int_delivered = await mySqlQury(`SELECT COUNT(*) as tot_delivered FROM tbl_order WHERE shipping_status =3 AND module = '3' `);
        const int_pickup = await mySqlQury(`SELECT COUNT(*) as tot_pickup FROM tbl_order WHERE shipping_status =4 AND module = '3' `);
        const int_progress = await mySqlQury(`SELECT COUNT(*) as tot_progress FROM tbl_order WHERE shipping_status =5 AND module = '3' `);


        const driver_length = await mySqlQury(`SELECT * FROM tbl_driver`);
        const driver_detail = await mySqlQury(`SELECT * FROM tbl_driver`);
        const customer_length = await mySqlQury(`SELECT * FROM tbl_customer`);
        const product_length = await mySqlQury(`SELECT * FROM tbl_product`);
        const module_length = await mySqlQury(`SELECT * FROM tbl_module`);
        const delivery_type_length = await mySqlQury(`SELECT * FROM tbl_delivery_type`);

        let date = new Date()
        let day = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate())
        let month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1)
        let year = date.getFullYear()
        let order_full_Date = `${year}-${month}-${day}`

        res.render('index', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module, social: req.social,
            general_data: req.general[0], notification_data: req.notification, order_list:order_list.length, order_data, order_full_Date, driver_data, driver_length:driver_length.length,
            driver_detail, customer_length:customer_length.length, product_length:product_length.length, module_length:module_length.length, delivery_type_length:delivery_type_length.length,
            pending_order:curiour_pending[0].tot_pending, rejected_order:curiour_rejected[0].tot_rejected, delivered_order:curiour_delivered[0].tot_delivered, pickup_order:curiour_pickup[0].tot_pickup, progress_order:curiour_progress[0].tot_progress,
            pam_pending, pam_rejected, pam_delivered, pam_pickup, pam_progress, int_pending, int_rejected, int_delivered, int_pickup, int_progress
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/order_details', auth, async(req, res) => {
    try {
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${req.user.tbl_admin_email}'`)
        const order_list1 = await mySqlQury(`SELECT * FROM tbl_order WHERE customer = '${customer_data[0].id}' AND module = 1 ORDER BY id DESC`)
        const order_list2 = await mySqlQury(`SELECT * FROM tbl_order WHERE customer = '${customer_data[0].id}' AND module = 2 ORDER BY id DESC`)
        const order_list3 = await mySqlQury(`SELECT * FROM tbl_order WHERE customer = '${customer_data[0].id}' AND module = 3 ORDER BY id DESC`)
        const delivery_type_data = await mySqlQury(`SELECT * FROM tbl_delivery_type`)
        const shipping_status_data = await mySqlQury(`SELECT * FROM tbl_shipping_status`)
        const transaction_method_list = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE status = '1'`)
        const module_list = await mySqlQury(`SELECT * FROM tbl_module`)
        
        res.render('customer_order_details', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, social: req.social,
            general_data: req.general[0], notification_data: req.notification, customer_data, delivery_type_data, 
            shipping_status_data, transaction_method_list, module_list, order_list1, order_list2, order_list3
        })
    } catch (error) {
        console.log(error);
    }
})

// ============ edit customer address ============ //

router.get('/address_details', auth, async(req, res) => {
    try {
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${req.user.tbl_admin_email}'`)
        const customer_address_details = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE customer_id = '${customer_data[0].id}'`)

        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)

        res.render('customer_address_details', {
            auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
            general_data: req.general[0], notification_data: req.notification, customer_address_details, CountryCode, nameCode
        })
    } catch (error) {
        console.log(error);
    }
})

// ============ edit customer details jeel ============ //

router.post("/edit_cus_ditail/:id", auth, async(req, res)=>{
    try {
        const {customer_id, first_name, last_name, country_code, phone_no, email, google_address, latitude, longitude, address, city, state, country, pincode} = req.body

        await mySqlQury(`UPDATE tbl_customer_address SET customer_id = '${customer_id}', first_name = '${first_name}', last_name = '${last_name}', country_code = '${country_code}', phone_no = '${phone_no}', email = '${email}'
        , google_address = '${google_address}', latitude = '${latitude}', longitude = '${longitude}', address = '${address}', city = '${city}', state = '${state}', country = '${country}', pincode = '${pincode}' WHERE id = '${req.params.id}'`);

        // await mySqlQury(`INSERT INTO tbl_customer_address (customer_id, first_name, last_name, country_code, phone_no, email, google_address, latitude, longitude, address, city, state, country, pincode) VALUE
        //     ('${customer_id}', '${first_name}', '${last_name}', '${country_code}', '${phone_no}', '${email}', '${google_address}', '${latitude}', '${longitude}', '${address}', '${city}', '${state}', '${country}', '${pincode}')`)

        res.redirect("/address_details")
    } catch (error) {
        console.log(error);
    }
})




router.get('/tracking_details', frontend_lng, async(req, res) => {
    try {

        const module_list = await mySqlQury(`SELECT * FROM tbl_module`);
        const order1 = await mySqlQury(`SELECT tbl_order.order_id FROM tbl_order WHERE module = '1' LIMIT 1 `);
        const order2 = await mySqlQury(`SELECT tbl_order.order_id FROM tbl_order WHERE module = '2' LIMIT 1 `);
        const order3 = await mySqlQury(`SELECT tbl_order.order_id FROM tbl_order WHERE module = '3' LIMIT 1 `);
        
        res.render('customer_tracking_details', {
            auth_data: "1", language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
            general_data: req.general[0], notification_data: "", module_list, order1, order2, order3
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/tracking_details/ajax', async(req, res) => {
    try {
        const {order_type, invoice_no} = req.body

        const order = await mySqlQury(`SELECT * FROM tbl_order WHERE order_id = '${invoice_no}'`);

        if (order != "") {
            const module_list = await mySqlQury(`SELECT * FROM tbl_module WHERE id = '${order_type}'`);
            
            const tracking_data = await mySqlQury(`SELECT tbl_tracking_history.*, (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_tracking_history.delivery_status = tbl_shipping_status.id) as status_name
            FROM tbl_tracking_history WHERE order_id = '${order[0].id}'`);
            
            const order_data = await mySqlQury(`SELECT * FROM tbl_order WHERE order_id = '${invoice_no}'`);
            const pickup_address = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE id = '${order_data[0].pickup_address}'`);
            const delivery_address = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE id = '${order_data[0].delivery_address}'`);
            const tracking = "1";
            res.json({tracking_data, order_data, pickup_address, delivery_address, module_list, tracking})
        } else {
            const tracking = "0";
            res.json({tracking})
            
        }

    } catch (error) {
        console.log(error);
    }
})

router.get('/customer_profile', auth, async(req, res) => {
    try {
        const customer_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.user.tbl_admin_email}'`)
        const gPhoto = await mySqlQury(`SELECT * FROM tbl_general_settings`)
        console.log(customer_data);

        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)
        
        res.render('customer_profile', {
            auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
            general_data: req.general[0], notification_data: req.notification, nameCode, CountryCode, customer_data, gPhoto, message: req.flash('message')
        })
    } catch (error) {
        console.log(error);
    }
})



router.post("/edit_edmin/ajex", auth, async(req, res)=>{
    try {
        const { password, c_password} = req.body

        if (password != c_password) {
            res.json({error: 'password'})
        }
        
    } catch (error) {
        console.log(error);
    }
})



router.post("/edit_edmin/:id", auth, upload.single('profile_img'), async(req, res) => {
    try {
        const customer_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.user.tbl_admin_email}'`)

        let dpassword = customer_data[0].password;

        let image;
        if (!req.file) {
            let gLogo = customer_data[0].profile_img
            image = gLogo
        } else {
            image = req.file.filename
        }

        const {first_name, last_name, email, country_code, phone_no, password, c_password, role } = req.body

        if (password == "" || c_password == "") {

            await mySqlQury(`UPDATE tbl_admin SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', country_code = '${country_code}',
            phone_no = '${phone_no}', password = '${dpassword}', role = '${role}', profile_img = '${image}' WHERE id = '${req.params.id}'`);

            res.redirect("/customer_profile")

        } else if (password != c_password) {

            req.flash("message", "Passowrd not match")
            res.redirect("/customer_profile")

        } else {

            const hash = await bcrypt.hash(password, 10)
            await mySqlQury(`UPDATE tbl_admin SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', country_code = '${country_code}',
            phone_no = '${phone_no}', password = '${hash}', role = '${role}', profile_img = '${image}' WHERE id = '${req.params.id}'`);

            res.redirect("/customer_profile")
        }
        
    } catch (error) {
        console.log(error);
    }
})



router.get("/policy", frontend_lng, async(req, res)=>{
    try {
        const policy_list = await mySqlQury(`SELECT * FROM tbl_policy`)
        if (policy_list == "") {
            req.flash('errors', `Policy is Currently Unavilable`)
            return res.redirect("back")
        }
        
        res.render("f_policy", {auth_data : '1', language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
        general_data: req.general[0], notification_data: req.notification, policy_list})
    } catch (error) {
        console.log(error);
    }
})



router.get("/terms", frontend_lng, async(req, res)=>{
    try {
        const policy_list = await mySqlQury(`SELECT * FROM tbl_policy`)
        if (policy_list == "") {
            req.flash('errors', `Terms and Condition is Currently Unavilable`)
            return res.redirect("back")
        }
        
        res.render("f_term_of_service", {auth_data : '1', language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
        general_data: req.general[0], notification_data: req.notification, policy_list})
    } catch (error) {
        console.log(error);
    }
})



router.get("/c_notifaction", auth, async(req, res)=>{
    try {
        
        const notification_list = await mySqlQury(`SELECT tbl_notification.*, (select tbl_admin.first_name from tbl_admin where tbl_notification.sender = tbl_admin.id) as sender_firstname,
                                                                                (select tbl_admin.last_name from tbl_admin where tbl_notification.sender = tbl_admin.id) as sender_lastname
                                                                                FROM tbl_notification WHERE sender = '${req.user.tbl_admin_id}' ORDER BY id DESC`)
        
        if (notification_list == "") {
            req.flash('errors', `Notification is Currently Unavilable`)
            return res.redirect("back")
        }

        res.render("c_notifaction", {general_data: req.general[0], social: req.social, module_list: req.module, language: req.lang, lang: req.lan, auth_data: req.user, notification_data: req.notification, notification_list})
    } catch (error) {
        console.log(error);
    }
})



router.get('/notification', auth, async(req, res) => {
    try {
        
        let notification_list;
        if (req.user.role == "1") {
            notification_list = await mySqlQury(`SELECT tbl_notification.*, (select tbl_admin.first_name from tbl_admin where tbl_notification.sender = tbl_admin.id) as sender_firstname,
                                                                                    (select tbl_admin.last_name from tbl_admin where tbl_notification.sender = tbl_admin.id) as sender_lastname
                                                                                    FROM tbl_notification WHERE fix = '1' ORDER BY id DESC`);
            
        } else if (req.user.role == "3") {
            notification_list = await mySqlQury(`SELECT tbl_notification.*, (select tbl_admin.first_name from tbl_admin where tbl_notification.sender = tbl_admin.id) as sender_firstname,
                                                                                    (select tbl_admin.last_name from tbl_admin where tbl_notification.sender = tbl_admin.id) as sender_lastname
                                                                                    FROM tbl_notification WHERE received = '${req.user.tbl_admin_id}' ORDER BY id DESC`);
                                                                                    
        } else if (req.user.role == "5") {
            notification_list = await mySqlQury(`SELECT tbl_notification.*, (select tbl_admin.first_name from tbl_admin where tbl_notification.sender = tbl_admin.id) as sender_firstname,
                                                                                    (select tbl_admin.last_name from tbl_admin where tbl_notification.sender = tbl_admin.id) as sender_lastname
                                                                                    FROM tbl_notification WHERE driver_id = '${req.user.tbl_admin_id}' ORDER BY id DESC`);

        }

        if (notification_list == "") {
            req.flash('errors', `Notification is Currently Unavilable`)
            return res.redirect("back")
        }

        res.render('notification', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module, social: req.social,
            general_data: req.general[0], notification_data: req.notification, notification_list
        })
    } catch (error) {
        console.log(error);
    }
})


router.get('/Shipping_calculator', frontend_lng, async(req, res) => {
    try {
        const module_list = await mySqlQury(`SELECT * FROM tbl_module`)
        const zone_data = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '3' GROUP BY zone_name `)
        const delivery_type_list = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE module = '2'`)
        const floor_data = await mySqlQury(`SELECT * FROM tbl_pricing`)
        const floor_no = floor_data[0].floor_no.split(',')
        const category_list = await mySqlQury(`SELECT * FROM tbl_category WHERE status = 'on' AND module = '2' `)
        const sub_category_list = await mySqlQury(`SELECT * FROM tbl_sub_category WHERE status = 'on' AND module = '2' `)
        const product_data = await mySqlQury(`SELECT * FROM tbl_product WHERE status = 'on'`)
        const shifter_list = await mySqlQury(`SELECT * FROM tbl_shift_express`)
        const time_list = await mySqlQury(`SELECT * FROM tbl_time_management`)
        const faq_list = await mySqlQury(`SELECT * FROM tbl_faq LIMIT 6`)
        const cus_experience = await mySqlQury(`SELECT * FROM tbl_customer_experience ORDER BY id DESC LIMIT 5`)

        let date = new Date()
        let day = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate())
        let month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1)
        let year = date.getFullYear()
        let fullDate = `${year}-${month}-${day}`
        let hour = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours())
        let convert_time = []
        for (let dlen = 0; dlen < time_list.length; dlen++){
            let start_time = time_list[dlen].start_time.split(':')
            let end_time = time_list[dlen].end_time.split(':')
            let hours = start_time[0]
            let minutes = start_time[1] == "00" ? "0" : start_time[1];
            let ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = parseFloat(minutes) < parseFloat(10) ? '0'+minutes : minutes;
            let strTime = hours + ':' + minutes + ' ' + ampm;
            let hours1 = end_time[0]
            let minutes1 = end_time[1] == "00" ? "0" : end_time[1];
            let ampm1 = hours1 >= 12 ? 'PM' : 'AM';
            hours1 = hours1 % 12;
            hours1 = hours1 ? hours1 : 12;
            minutes1 = parseFloat(minutes1) < parseFloat(10) ? '0'+minutes1 : minutes1;
            let andTime = hours1 + ':' + minutes1 + ' ' + ampm1;
            convert_time.push(strTime +' to '+ andTime)
        }
        console.log(convert_time);
        res.render('shipping_calculatur', {
            auth_data: "1", language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
            general_data: req.general[0], notification_data: "", module_list, zone_data, delivery_type_list, floor_no, category_list, sub_category_list, product_data,
            shifter_list, time_list, fullDate, hour, faq_list, cus_experience, floor_data, convert_time
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/shipping_type", async(req, res)=>{
    try {
        const delivery_type_list = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE module = '${req.body.module}'`)
        
        res.json({delivery_type_list})
    } catch (error) {
        console.log(error);
    }
})

router.post('/shipping_ajax', frontend_lng, async(req, res)=>{
    try {
        const {pickup_address, delivery_address, module, pickup_floor, delivery_floor, pickup_checkbox, delivery_checkbox, weight_vol, shi_insurance, delivery_type, sp_lat, sp_lon, sd_lat, sd_lon, product_tot, shifter, time, date, weight_tot, unit_price} = req.body

        const city = await mySqlQury(`SELECT * FROM tbl_city`)

        let pickup, city_list, pickup_city, city_id, state, counter;
        if (module == "1" || module == "3") {
            pickup = pickup_address

            city_list = []
            for (let city_check = 0; city_check < city.length; ){
                let check_city = pickup.match(city[city_check].name, "i")
                if (check_city != null) {
                    city_list.push(city[city_check])
                }
                city_check++
            }

            pickup_city = "";
            if (city_list == "") {
                req.flash('errors', `Selected Address Pickup City is Unavailable`)
                pickup_city = 0;
            } else {
                city_id = city_list[0]
                state = await mySqlQury(`SELECT * FROM tbl_state WHERE id = "${city_id.state_name}" `)
                counter = await mySqlQury(`SELECT * FROM tbl_country WHERE id = "${state[0].country_name}"`)
            }
        }
        
        let deliver, des_city_list, delivered_city, add_distance_rate ;
        if (module == "1") {
            deliver = delivery_address

            des_city_list = []
            for (let dcity_len = 0; dcity_len < city.length;){

                let check_city = deliver.match(city[dcity_len].name, "i")
                if (check_city != null) {
                    des_city_list.push(city[dcity_len])
                }
                dcity_len++
            }
            
            let des_city_id, des_state, des_counter;
            delivered_city = "";
            if (des_city_list == "") {
                req.flash('errors', `Selected Delivered Address City is Unavailable`)
                delivered_city = 0
            } else {

                des_city_id = des_city_list[0]
                des_state = await mySqlQury(`SELECT * FROM tbl_state WHERE id = "${des_city_id.state_name}" `)
                des_counter = await mySqlQury(`SELECT * FROM tbl_country WHERE id = "${des_state[0].country_name}"`)
            }
            
            if (pickup_city != "0" || delivered_city != "0") {
                add_distance_rate = await mySqlQury(`SELECT * FROM tbl_rates WHERE Origin = "${counter[0].id}" AND State = "${state[0].id}" AND City = "${city_id.id}" AND Destination_Country = "${des_counter[0].id}" 
                                                                    AND Destination_State = "${des_state[0].id}" AND Destination_City = "${des_city_id.id}" AND module = '${module}' `)
                
            } else {
                add_distance_rate = [{Weight_rate:0}]
                if (add_distance_rate == "") {
                    req.flash('errors', `Selected Pickup City to Delivered City Route currently unavailable`)
                    return res.redirect("back")
                }
            }

        } else if(module == "3") {
            const zone_name = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_name = '${delivery_address}' AND zone_type = '${module}' GROUP BY zone_name`)

            add_distance_rate = await mySqlQury(`SELECT * FROM tbl_rates WHERE Origin = "${counter[0].id}" AND State = "${state[0].id}" AND City = "${city_id.id}" 
                                                                    AND Destination_Country = "${zone_name[0].id}" AND module = '${module}' `)
            
            if (add_distance_rate == "") {
                req.flash('errors', `Selected Address Pickup City to Delivered City Route currently unavailable`)
                return res.redirect("back")
            }

        }

        const pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${module}'`)
        const pickup_elevator = (pickup_checkbox == '1' ? parseFloat(pricing_data[0].elevator_discount) : 0) 
        const delivery_elevator = (delivery_checkbox == '1' ? parseFloat(pricing_data[0].elevator_discount) : 0)

        if (pricing_data[0].floor_no == "") {
            req.flash('errors', `Pricing Not Available`)
            return res.redirect("back")
        };
        if (pricing_data[0].floor_price == "" ) {
            req.flash('errors', `Pricing Not Available`)
            return res.redirect("back")
        };

        const floor_nos = pricing_data[0].floor_no.split(',')
        const floor_prices = pricing_data[0].floor_price.split(',')

        const pickup_price = floor_prices[floor_nos.indexOf(pickup_floor)]
        let pic_price, del_price;
        if (pickup_price == undefined) {
            pic_price = 0;
        } else {
            pic_price = pickup_price
        }

        const delivery_price = floor_prices[floor_nos.indexOf(delivery_floor)]
        if (delivery_price == undefined) {
            del_price = 0;
        } else {
            del_price = delivery_price;
            
        }

        let insurance_product, weight_data, min, max, weight_error ;
        if (module == "1" || module == "3") {
            insurance_product = unit_price

            weight_data = await mySqlQury(`SELECT * FROM tbl_weight_rate WHERE min_weight <= '${weight_tot}' AND max_weight >= '${weight_tot}' AND module = '${module}'`)
            if (weight_data == "") {
                const weight = await mySqlQury(`SELECT * FROM tbl_weight_rate WHERE module = '${module}'`)
                min = weight[0].min_weight
                max = weight[weight.length - 1].max_weight
                weight_error = 0;
                weight_data = [{price:0}]
            } else {

                weight_error = 1;
            }

        } else {
            insurance_product = product_tot
        }

        let insurance_data;
        if (shi_insurance == "1") {
            insurance_data = await mySqlQury(`SELECT * FROM tbl_insurance WHERE start_price <= '${insurance_product}' AND end_price > '${insurance_product}' AND module = '${module}'`) 
        } else {
            insurance_data = 0;
        }

        let premium_charged, damage_payout;
        if (insurance_data == "") {
            premium_charged = 0
            damage_payout = 0
        } else {
            if (insurance_data[0].premium_percentage == '1') {
                premium_charged = (parseFloat(insurance_product) * parseFloat(insurance_data[0].premium_charged) / 100).toFixed(2)
            } else {
                premium_charged = (insurance_data[0].premium_charged).toFixed(2)
            }
            
            if (insurance_data[0].damage_percentage == '1') {
                damage_payout = (parseFloat(insurance_product) * parseFloat(insurance_data[0].damage_payout) / 100).toFixed(2)
            } else {
                damage_payout = (insurance_data[0].premium_charged).toFixed(2)
            }
        }
        
        if (module == "1" || module == "2") {
            
            let today_date = new Date()
            let today_day = (today_date.getDate() < 10 ? '0'+today_date.getDate() : today_date.getDate())
            let tomorrow_day = (today_date.getDate()+1 < 10 ? '0'+(today_date.getDate()+1) : today_date.getDate()+1)
            let today_month = (today_date.getMonth()+1 < 10 ? '0'+(today_date.getMonth()+1) : today_date.getMonth()+1)
            let today_year = today_date.getFullYear()
            
            let date_price
            if (time != "") {
                if (`${today_year}-${today_month}-${today_day}` == date) {
                    date_price = pricing_data[0].today_price
                    
                } else if (`${today_year}-${today_month}-${tomorrow_day}` == date) {
                    date_price = pricing_data[0].tomorrow_price
                    
                } else {
                    date_price = pricing_data[0].dayaftertomorrow_price
                }
            } else {
                date_price = 0 
            }

            distance.key(req.general[0].google_map_key);
            const origin = ''+sp_lat+','+sp_lon+'';

            const destinations = [
                ''+sd_lat+','+sd_lon+'',
            ];

            distance.matrix([origin], destinations, async function(err, distances) {
                if (!err) {
                    let results = distances.rows[0].elements;
                    let address_distance = results[0].distance.text.split(' ')
                    let address_price; 
                    if (Number(address_distance[0]) <= pricing_data[0].min_distance) {

                        address_price = parseFloat(address_distance[0]) * parseFloat(pricing_data[0].min_distance_price)
                    } else {

                        const add_distance = parseFloat(address_distance[0]) - parseFloat(pricing_data[0].min_distance)
                        address_price = (parseFloat(pricing_data[0].min_distance) * parseFloat(pricing_data[0].min_distance_price) + (parseFloat(add_distance) * parseFloat(pricing_data[0].ex_distance_price)))
                    }
                    
                    if (module == "2") {

                        const other_total = parseFloat(date_price) + parseFloat(Number(shifter)) + parseFloat(address_price) + parseFloat(pic_price) + parseFloat(del_price) - parseFloat(pickup_elevator) - parseFloat(delivery_elevator)
                        const total_price = (parseFloat(other_total) + parseFloat(Number(product_tot)) + parseFloat(Number(delivery_type)) + parseFloat(Number(premium_charged))).toFixed(2)

                        res.json({product_tot, pickup_floor, delivery_floor, pic_price, del_price, pickup_elevator, delivery_elevator, other_total, date_price, address_price
                                    , delivery_type, premium_charged, damage_payout, total_price, shi_addresh_dis:address_distance[0]})

                    } else if (module == "1") {
                        
                        const other_total = parseFloat(address_price) + parseFloat(add_distance_rate[0].Weight_rate) + parseFloat(pic_price) + parseFloat(del_price) - parseFloat(pickup_elevator) - parseFloat(delivery_elevator)
                        const total_price = (parseFloat(other_total) + parseFloat(weight_data[0].price) + parseFloat(Number(premium_charged)) + parseFloat(Number(delivery_type))).toFixed(2)
                    
                        res.json({add_distance_rate, weight_vol, pickup_floor, delivery_floor, pic_price, del_price, pickup_elevator, delivery_elevator, other_total, address_price
                            , delivery_type, premium_charged, damage_payout, total_price, pickup_city, delivered_city, shi_addresh_dis:address_distance[0], weight_data, weight_error, min, max})
                    }
                }
            });
        }

        if (module == "3") {
            const other_total = parseFloat(add_distance_rate[0].Weight_rate) + parseFloat(pic_price) + parseFloat(del_price) - parseFloat(pickup_elevator) - parseFloat(delivery_elevator)
            const total_price = (parseFloat(other_total) + parseFloat(weight_data[0].price) + parseFloat(Number(premium_charged)) + parseFloat(Number(delivery_type))).toFixed(2)

            res.json({add_distance_rate, weight_vol, pickup_floor, delivery_floor, pic_price, del_price, pickup_elevator, delivery_elevator, other_total
                , delivery_type, premium_charged, damage_payout, total_price, pickup_city, delivered_city, weight_data, weight_error, min, max})
            
        }
        
    } catch (error) {
        console.log(error);
    }
})

router.get('/faqs', frontend_lng, async(req, res) => {
    try {
        const faq_list = await mySqlQury(`SELECT * FROM tbl_faq`)
        
        res.render('faqs', {
            auth_data: "1", language: req.frontend_lang, lang: req.frontend_lan, module_list: req.module, social: req.social,
            general_data: req.general[0], notification_data: "", faq_list
        })
    } catch (error) {
        console.log(error);
    }
})



module.exports = router