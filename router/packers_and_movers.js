const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')
const countryCodes = require('country-codes-list')
let  distance = require('google-distance-matrix');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
let sendNotification = require("../middleware/send");
const multer  = require('multer')
const paypal = require('paypal-rest-sdk');
const { json } = require('body-parser')
const https = require('https');
const axios = require('axios');
const { LogInstance } = require('twilio/lib/rest/serverless/v1/service/environment/log')
const { log } = require('console')
const geolib = require('geolib');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({storage:storage});



// =============== pam ==================== //

router.get('/pam', auth, async(req, res) => {
    try {
        const customer_list = await mySqlQury(`SELECT * FROM tbl_customer`)
        const category_list = await mySqlQury(`SELECT * FROM tbl_category WHERE status = 'on'`)

        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        let data;
        if (cart_data == '') {
            
            await mySqlQury(`INSERT INTO tbl_cart (created_by) VALUE ('${req.user.tbl_admin_id}')`)
            data = 0;
        } else {
            await mySqlQury(`DELETE FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
            data = 1;
        }
        
        if (data == "1") {
            await mySqlQury(`INSERT INTO tbl_cart (created_by) VALUE ('${req.user.tbl_admin_id}')`)
        }


        if (req.user.role == '1') {
            res.render('pam', {
                auth_data: req.user, language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, customer_list, category_list
            })

        } else {
            const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${req.user.tbl_admin_email}'`)
            const order_list1 = await mySqlQury(`SELECT * FROM tbl_order WHERE customer = '${customer_data[0].id}' AND module = '1' ORDER BY id DESC LIMIT 5`)
            const order_list2 = await mySqlQury(`SELECT * FROM tbl_order WHERE customer = '${customer_data[0].id}' AND module = '2' ORDER BY id DESC LIMIT 5`)
            const order_list3 = await mySqlQury(`SELECT * FROM tbl_order WHERE customer = '${customer_data[0].id}' AND module = '3' ORDER BY id DESC LIMIT 5`)
            const delivery_type_data = await mySqlQury(`SELECT * FROM tbl_delivery_type`)
            const shipping_status_data = await mySqlQury(`SELECT * FROM tbl_shipping_status`)
            const transaction_method_list = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE status = '1'`)
            
            const total_order = await mySqlQury(`SELECT * FROM tbl_order WHERE customer = '${customer_data[0].id}'`)
            const pending = await mySqlQury(`SELECT COUNT(*) as tot_pending FROM tbl_order WHERE shipping_status =1 AND customer = '${customer_data[0].id}' `)
            const delivered = await mySqlQury(`SELECT COUNT(*) as tot_delivered FROM tbl_order WHERE shipping_status =3 AND customer = '${customer_data[0].id}'`)
            const total_amount = await mySqlQury(`SELECT SUM(tbl_order.paid_amount)  as tot_payment_amount FROM tbl_order WHERE customer = '${customer_data[0].id}'`)
            const zone_data = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '3' GROUP BY zone_name `)

            let tot_amount;
            if (total_amount[0].tot_payment_amount != null) {
                tot_amount = (parseFloat(total_amount[0].tot_payment_amount)).toFixed(2)
            } else {    
                tot_amount = (parseFloat(0)).toFixed(2)
            }

            res.render('customer_dashbord', {
                auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, customer_data, delivery_type_data, shipping_status_data, order_list1, order_list2, order_list3,
                transaction_method_list, total_order:total_order.length, pending, delivered, tot_amount, zone_data
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/pam', auth, async(req, res) => {
    try {
        if (req.user.role == '1') {
            const {domestic_customer, pickup_pincode, delivery_pincode} = req.body
    
            await mySqlQury(`UPDATE tbl_cart SET customer = '${domestic_customer}', pickup_pincode = '${pickup_pincode}', delivery_pincode = '${delivery_pincode}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        } else {

            const {pickup_pincode, delivery_pincode, profix, profix_id} = req.body
            console.log(req.body);
            const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${req.user.tbl_admin_email}'`)

            await mySqlQury(`UPDATE tbl_cart SET customer = '${customer_data[0].id}', pickup_pincode = '${pickup_pincode}', delivery_pincode = '${delivery_pincode}', profix = '${profix}', module = '${profix_id[0]}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        }
        res.redirect('/packers_and_movers/pam_address')
    } catch (error) {
        console.log(error);
    }
})


// ============ pam_address ============ //

router.get('/pam_address', auth, async(req, res) => {
    try {
        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)
        let cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        const floor_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${cart_data[0].module}'`)
        const floor_no = floor_data[0].floor_no.split(',')
        if (req.user.role == '1') {
            res.render('pam_address', {
                auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, nameCode, CountryCode, cart_data, floor_no
            })
        } else {
            res.render('customer_address', {
                auth_data : req.user, module_list: req.module, card:cart_data[0], language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, nameCode, CountryCode, floor_no
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_address', auth, async(req, res) => {
    try {
        const {first_name, last_name, country_code, phone_no, email, google_address, latitude, longitude, address, city, state, country, pincode} = req.body

        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)

        const zone_name1 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '1' GROUP BY zone_name `)
        let name_list1 = []
        for (let list1 = 0; list1 < zone_name1.length;){
            const name11 =  zone_name1[list1].zone_name
            name_list1.push(name11)
            list1++
        }

        let zone1 = []
        for (let zonll1 = 0; zonll1 < name_list1.length; ){
            const zone_lat_lon1 = await mySqlQury(`SELECT tbl_zone.id, tbl_zone.latitude, tbl_zone.longitude FROM tbl_zone WHERE zone_type = '1' AND zone_name = '${name_list1[zonll1]}' `)
            zone1.push(zone_lat_lon1)
            zonll1++
        }

        let zone_count1 = 0;
        let zone_id1 = []
        for (let zonecheck1 = 0; zonecheck1 < zone1.length;){
            const point = { latitude, longitude };
            const polygon = zone1[zonecheck1]
            const count1 = geolib.isPointInPolygon(point, polygon)

            if (count1 === true) {
                zone_id1.push(polygon[zonecheck1].id)
                zone_count1 += parseFloat(1)
            }
            zonecheck1++
        }

        const zone_name2 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '2' GROUP BY zone_name `)
        let name_list2 = []
        for (let list2 = 0; list2 < zone_name2.length;){
            const name22 =  zone_name2[list2].zone_name
            name_list2.push(name22)
            list2++
        }

        let zone2 = []
        for (let zonll2 = 0; zonll2 < name_list2.length;){
            const zone_lat_lon2 = await mySqlQury(`SELECT tbl_zone.id, tbl_zone.latitude, tbl_zone.longitude FROM tbl_zone WHERE zone_type = '2' AND zone_name = '${name_list2[zonll2]}' `)
            zone2.push(zone_lat_lon2)
            zonll2++
        }

        let zone_count2 = 0;
        let zone_id2 = []
        for (let zonecheck2 = 0; zonecheck2 < zone2.length;){
            const point = { latitude, longitude };
            const polygon = zone2[zonecheck2]
            const count2 = geolib.isPointInPolygon(point, polygon)

            if (count2 === true) {
                zone_id2.push(polygon[zonecheck2].id)
                zone_count2 += parseFloat(1)
            }
            zonecheck2++
        }

        const zone_name3 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '3' GROUP BY zone_name `)
        let name_list3 = []
        for (let zone_n3 = 0; zone_n3 < zone_name3.length;){
            const name33 =  zone_name3[zone_n3].zone_name
            name_list3.push(name33)
            zone_n3++
        }

        let zone3 = []
        for (let zonll3 = 0; zonll3 < name_list3.length;){
            const zone_lat_lon3 = await mySqlQury(`SELECT tbl_zone.id, tbl_zone.latitude, tbl_zone.longitude FROM tbl_zone WHERE zone_type = '3' AND zone_name = '${name_list3[zonll3]}' `)
            zone3.push(zone_lat_lon3)
            zonll3++
        }

        let zone_count3 = 0;
        let zone_id3 = []
        for (let zonecheck3 = 0; zonecheck3 < zone3.length;){
            const point = { latitude, longitude };
            const polygon = zone3[zonecheck3]
            const count3 = geolib.isPointInPolygon(point, polygon)

            if (count3 === true) {
                zone_id3.push(polygon[zonecheck3].id)
                zone_count3 += parseFloat(1)
            }
            zonecheck3++
        }

        const latitude_data1 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '1' AND id = '${zone_id1}' GROUP BY zone_name`)
        const latitude_data2 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '2' AND id = '${zone_id2}' GROUP BY zone_name`)
        const latitude_data3 = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '3' AND id = '${zone_id3}' GROUP BY zone_name`)

        let addresh_zone_id;
        if (latitude_data1 != "" && latitude_data2 != "" && latitude_data3 != "") {
            addresh_zone_id = 4
        } else if (latitude_data1 != "" && latitude_data2 != "") {
            addresh_zone_id = 5
        } else if (latitude_data2 != "" && latitude_data3 != "") {
            addresh_zone_id = 6
        } else if (latitude_data1 != "" && latitude_data3 != "") {
            addresh_zone_id = 7
        } else if (latitude_data1 != "") {
            addresh_zone_id = 1
        } else if (latitude_data2 != "") {
            addresh_zone_id = 2
        } else if (latitude_data3 != "") {
            addresh_zone_id = 3
        } else {
            addresh_zone_id = 0
        }

        const address_id = await mySqlQury(`INSERT INTO tbl_customer_address (customer_id, first_name, last_name, country_code, phone_no, email, google_address, latitude, longitude, address, city, 
                            state, country, pincode, module) VALUE
                            ('${cart_data[0].customer}', '${first_name}', '${last_name}', '${country_code}', '${phone_no}', '${email}', '${google_address}', '${latitude}', '${longitude}', 
                            '${address}', '${city}', '${state}', '${country}', '${pincode}', '${addresh_zone_id}')`)

       res.send({add:true, insertedid:address_id.insertId})
        // res.redirect('/packers_and_movers/pam_address')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delivery_address/:id', auth, async(req, res) => {
    try {
        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)

        let customer_data, customer_data1, customer_data2, customer_data3, addresh; 
        if (cart_data[0].module == "1") {
            
            customer_data = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '1' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data1 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '4' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data2 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '5' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data3 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '7' AND customer_id = '${cart_data[0].customer}'  `)
            addresh =  customer_data.concat(customer_data1, customer_data2, customer_data3);

        } else if (cart_data[0].module == "2") {
            
            customer_data = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '2' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data1 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '4' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data2 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '5' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data3 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '6' AND customer_id = '${cart_data[0].customer}'  `)
            addresh =  customer_data.concat(customer_data1, customer_data2, customer_data3);
            
        } else if (cart_data[0].module == "3") {

            customer_data = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '3' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data1 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '4' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data2 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '6' AND customer_id = '${cart_data[0].customer}'  `)
            customer_data3 = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE  module = '7' AND customer_id = '${cart_data[0].customer}'  `)
            addresh =  customer_data.concat(customer_data1, customer_data2, customer_data3);
            
        }
        
        res.json({addresh})
    } catch (error) {
        console.log(error);
    }
})

router.post('/pam_add_address', auth, async(req, res) => {
    try {
        const {pickup_address, delivery_address, pickup_floor, delivery_floor, pickup_checkbox, delivery_checkbox} = req.body
        
        const pickup_address_data = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE id = '${pickup_address}'`)
        const delivery_address_data = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE id = '${delivery_address}'`)

        const card_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        
        const pickup = pickup_address_data[0].google_address
        const deliver = delivery_address_data[0].google_address

        const city = await mySqlQury(`SELECT * FROM tbl_city`)

        let city_list = []
        for (let city_check = 0; city_check < city.length; ){
            let check_city = pickup.match(city[city_check].name, "i")
            if (check_city != null) {
                city_list.push(city[city_check])
            }
            city_check++
        }

        let city_id, state, counter;
        if (city_list == "") {
            req.flash('errors', `Selected Address Pickup City is Unavailable`)
            return res.redirect("back")
        } else {
            city_id = city_list[0]
            state = await mySqlQury(`SELECT * FROM tbl_state WHERE id = "${city_id.state_name}" `)
            counter = await mySqlQury(`SELECT * FROM tbl_country WHERE id = "${state[0].country_name}"`)
        }
        
        let des_city_id, des_state, des_counter, add_distance_rate ;
        if (card_data[0].module == "1") {

            let des_city_list = []
            for (let dcity_len = 0; dcity_len < city.length;){

                let check_city = deliver.match(city[dcity_len].name, "i")
                if (check_city != null) {
                    des_city_list.push(city[dcity_len])
                }
                dcity_len++
            }
            
            if (des_city_list == "") {
                req.flash('errors', `Selected Delivered Address City is Unavailable`)
                return res.redirect("back")
            } else {
                des_city_id = des_city_list[0]
                des_state = await mySqlQury(`SELECT * FROM tbl_state WHERE id = "${des_city_id.state_name}" `)
                des_counter = await mySqlQury(`SELECT * FROM tbl_country WHERE id = "${des_state[0].country_name}"`)
            }

            add_distance_rate = await mySqlQury(`SELECT * FROM tbl_rates WHERE Origin = "${counter[0].id}" AND State = "${state[0].id}" AND City = "${city_id.id}" AND Destination_Country = "${des_counter[0].id}" 
                                                                AND Destination_State = "${des_state[0].id}" AND Destination_City = "${des_city_id.id}" AND module = '${card_data[0].module}' `)
            if (add_distance_rate == "") {
                req.flash('errors', `Selected Pickup City to Delivered City Route currently unavailable`)
                return res.redirect("back")
            }

        } else if(card_data[0].module == "3") {

            const zone_name3 = await mySqlQury(`SELECT * FROM tbl_zone WHERE status = '1' AND zone_type = '3' GROUP BY zone_name `)

            let name_list3 = []
            for (let zon_name = 0; zon_name < zone_name3.length ;){
                const name =  zone_name3[zon_name].zone_name
                name_list3.push(name)
                zon_name++
            }

            let zone3 = []
            for (let lat_lon = 0; lat_lon < name_list3.length ;){
                const zone_lat_lon3 = await mySqlQury(`SELECT tbl_zone.id, tbl_zone.latitude, tbl_zone.longitude FROM tbl_zone WHERE status = '1' AND zone_type = '3' AND zone_name = '${name_list3[lat_lon]}' `)
                zone3.push(zone_lat_lon3)
                lat_lon++
            }

            let lat = delivery_address_data[0].latitude
            let lon = delivery_address_data[0].longitude

            let zone_count3 = 0;
            let zone_id3 = []
            for (let zone3_len = 0; zone3_len < zone3.length ;){
                const point = { lat, lon };
                const polygon = zone3[zone3_len]
                const count3 = geolib.isPointInPolygon(point, polygon)

                if (count3 === true) {
                    zone_id3.push(polygon[zone3_len].id)
                    zone_count3 += parseFloat(1)
                }
                zone3_len++
            }

            if (zone_id3 == "") {
                req.flash('errors', `Selected Delivered Address City is Unavailable`)
                return res.redirect("back")
            }

            const delivered_zone = await mySqlQury(`SELECT * FROM tbl_zone WHERE id = '${zone_id3[0]}' AND zone_type = '${card_data[0].module}' GROUP BY zone_name`)

            const zone_name = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_name = '${delivered_zone[0].zone_name}' AND zone_type = '${card_data[0].module}' GROUP BY zone_name`)

            add_distance_rate = await mySqlQury(`SELECT * FROM tbl_rates WHERE Origin = "${counter[0].id}" AND State = "${state[0].id}" AND City = "${city_id.id}" 
                                                                    AND Destination_Country = "${zone_name[0].id}" AND module = '${card_data[0].module}' `)
            
            if (add_distance_rate == "") {
                req.flash('errors', `Selected Address Pickup City to Delivered City Route currently unavailable`)
                return res.redirect("back")
            }
        }
        console.log(add_distance_rate);

        const tbl_pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${card_data[0].module}'`)

        distance.key(req.general[0].google_map_key);

        const origin = ''+pickup_address_data[0].latitude+','+pickup_address_data[0].longitude+'';
        
        const destinations = [
            ''+delivery_address_data[0].latitude+','+delivery_address_data[0].longitude+'',
        ];
        
        distance.matrix([origin], destinations, async function(err, distances) {
            
            if (!err) {

                let results, address_distance, address_price, add_distance
                if (card_data[0].module == "1" || card_data[0].module == "2") {
                    
                    results = distances.rows[0].elements;
                    address_distance = results[0].distance.text.split(' ')
    
                    if (Number(address_distance[0]) <= tbl_pricing_data[0].min_distance) {
                        address_price = parseFloat(address_distance[0]) * parseFloat(tbl_pricing_data[0].min_distance_price)
                        
                    } else {
                        add_distance = parseFloat(Number(address_distance[0])) - parseFloat(Number(tbl_pricing_data[0].min_distance))
                        address_price = (parseFloat(tbl_pricing_data[0].min_distance) * parseFloat(tbl_pricing_data[0].min_distance_price) + (parseFloat(add_distance) * parseFloat(tbl_pricing_data[0].ex_distance_price)))
                    }
                }
                
                if (card_data[0].module == "2") {

                    await mySqlQury(`UPDATE tbl_cart SET pickup_address = '${pickup_address}', delivery_address = '${delivery_address}', 
                    pickup_floor = '${pickup_floor}', delivery_floor = '${delivery_floor}', distance = '${address_distance[0]}',
                    pickup_checkbox = '${pickup_checkbox}', delivery_checkbox = '${delivery_checkbox}', address_price = '${address_price}' WHERE created_by = '${req.user.tbl_admin_id}'`)
                    
                } else if (card_data[0].module == "1") {

                    await mySqlQury(`UPDATE tbl_cart SET pickup_address = '${pickup_address}', delivery_address = '${delivery_address}', pickup_floor = '${pickup_floor}', 
                                    delivery_floor = '${delivery_floor}', distance = '${address_distance[0]}', pickup_checkbox = '${pickup_checkbox}', delivery_checkbox = '${delivery_checkbox}', 
                                    address_price = '${address_price}', diss_weight_price = '${add_distance_rate[0].Weight_rate}', rate_price_id = '${add_distance_rate[0].id}' WHERE created_by = '${req.user.tbl_admin_id}'`)
                    

                } else if (card_data[0].module == "3") {

                    await mySqlQury(`UPDATE tbl_cart SET pickup_address = '${pickup_address}', delivery_address = '${delivery_address}', pickup_floor = '${pickup_floor}', 
                                    delivery_floor = '${delivery_floor}', pickup_checkbox = '${pickup_checkbox}', delivery_checkbox = '${delivery_checkbox}', address_price = '${add_distance_rate[0].Weight_rate}', 
                                    address_price = '${0}', diss_weight_price = '${add_distance_rate[0].Weight_rate}',rate_price_id = '${add_distance_rate[0].id}' WHERE created_by = '${req.user.tbl_admin_id}'`)

                }
                
            }
        });
        
        res.redirect('/packers_and_movers/pam_category')
    } catch (error) {
        console.log(error);
    }
})


// ============ category ================ //

router.get('/pam_category', auth, async(req, res) => {
    try {
        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        const category_list = await mySqlQury(`SELECT * FROM tbl_category WHERE status = 'on' AND module = '${cart_data[0].module}' `)
        
        if (req.user.role == '1') {
            
            res.render('pam_category', {
                auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, category_list
            })
        } else {
            
            res.render('customer_category', {
                auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, category_list, cart_data
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_category', auth, async(req, res) => {
    try {
        const {category_id} = req.body

        await mySqlQury(`UPDATE tbl_cart SET category_id = '${category_id}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        
        res.redirect('/packers_and_movers/pam_subcategory')
    } catch (error) {
        console.log(error);
    }
})


// ============ sub_category ============== //

router.get('/pam_subcategory', auth, async(req, res) => {
    try {
        const category_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)

        const subcategory_data = await mySqlQury(`SELECT * FROM tbl_sub_category WHERE status = 'on' AND find_in_set(tbl_sub_category.category_name, '${category_data[0].category_id}')`)
        const product_data = await mySqlQury(`SELECT * FROM tbl_product WHERE status = 'on'`)

        if (req.user.role == '1') {
            res.render('pam_subcategory', {
                auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, subcategory_data, product_data
            })

        } else {
            res.render('customer_subcategory', {
                auth_data: req.user,  module_list: req.module, category_data, language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, subcategory_data, product_data
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_subcategory_product', auth, async(req, res) => {
    try {
        const {product_name, product_qty, product_price, sub_category_id} = req.body

        const card_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)

        if (card_data[0].module == "2") {
            
            await mySqlQury(`UPDATE tbl_cart SET product_name = '${product_name}', product_qty = '${product_qty}', product_price = '${product_price}' WHERE created_by = '${req.user.tbl_admin_id}'`)
            res.redirect('/packers_and_movers/pam_shifter')
            
        } else {
            
            await mySqlQury(`UPDATE tbl_cart SET product_name = '${sub_category_id}' WHERE created_by = '${req.user.tbl_admin_id}'`)
            res.redirect('/packers_and_movers/customer_product')
            
        }

    } catch (error) {
        console.log(error);
    }
})

router.get("/customer_product", auth, async(req, res)=>{
    try {
        const card_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        const product_data = await mySqlQury(`SELECT * FROM tbl_product WHERE status = 'on'`)
        const pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${card_data[0].module}'`)
        
        res.render("customer_product", {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, social: req.social,
            general_data: req.general[0], notification_data: req.notification, card_data, product_data, pricing_data:pricing_data[0]
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_product_price", auth, async(req, res)=>{
    try {
        const {package_name, package_des, package_Amouunt, package_Weight, package_Length, package_width, package_Height, package_Weight_vol, tot_weight_vol, tot_weight} = req.body
        const card_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        let date = new Date()
        let day = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate())
        let month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1)
        let year = date.getFullYear()
        let fullDate = `${year}-${month}-${day}`

        const weight_data = await mySqlQury(`SELECT * FROM tbl_weight_rate WHERE min_weight <= '${tot_weight}' AND max_weight >= '${tot_weight}' AND module = '${card_data[0].module}'`)
        if (weight_data == "") {
            req.flash('errors', `Weight Currenty unavailale`)
            return res.redirect("back")
        }

        await mySqlQury(`UPDATE tbl_cart SET package_name = '${package_name}', package_des = '${package_des}', package_Amouunt = '${package_Amouunt}', package_Weight = '${package_Weight}'
                        , package_Length = '${package_Length}', package_width = '${package_width}', package_Height = '${package_Height}', package_Weight_vol = '${package_Weight_vol}', 
                        tot_weight_vol = '${tot_weight_vol}', date = '${fullDate}', weight_price = '${weight_data[0].price}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        
        res.redirect("/packers_and_movers/pam_details")
    } catch (error) {
        console.log(error);
    }
})

router.post("/check_addresh/ajex", auth, async(req, res)=>{
    try {
        const card_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)

        const weight_data = await mySqlQury(`SELECT * FROM tbl_weight_rate WHERE min_weight <= '${req.body.weight_vol}' AND max_weight >= '${req.body.weight_vol}' AND module = '${card_data[0].module}'`)
        
        let weight, min, max, weight_error
        if (weight_data == "") {
            weight = await mySqlQury(`SELECT * FROM tbl_weight_rate WHERE module = '${card_data[0].module}'`)
            min = weight[0].min_weight
            max = weight[weight.length - 1].max_weight
            weight_error = 0;
        } else {
            weight_error = 1;
        }
        
        const addresh = await mySqlQury(`SELECT * FROM tbl_rates WHERE id = '${card_data[0].rate_price_id}' `)

        if (addresh != "") {
            res.json({data:"success",  addresh, weight_error, min, max})
        } else {
            res.json({data:"error", addresh})
        }
    } catch (error) {
        console.log(error);
    }
})


// ============== pam_shifter ================ //

router.get('/pam_shifter', auth, async(req, res) => {
    try {
        const shifter_list = await mySqlQury(`SELECT * FROM tbl_shift_express`)
        if (shifter_list == "") {
            req.flash('errors', `Shifter Currenty unavailale`)
            return res.redirect("back")
        }
        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        
        if (req.user.role == '1') {
            res.render('pam_shifter', {
                auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, shifter_list
            })

        } else {

            res.render('customer_shifter', {
                auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, shifter_list, cart_data
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_shifter', auth, async(req, res) => {
    try {
        const {shifter} = req.body

        await mySqlQury(`UPDATE tbl_cart SET shifter = '${shifter}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        
        res.redirect('/packers_and_movers/pam_date_time')
    } catch (error) {
        console.log(error);
    }
})


// ============= pam_date_time ================= //

router.get('/pam_date_time', auth, async(req, res) => {
    try {
        let date = new Date()
        let day = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate())
        let month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1)
        let year = date.getFullYear()
        let fullDate = `${year}-${month}-${day}`
        let hour = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours())

        const time_list = await mySqlQury(`SELECT * FROM tbl_time_management`)
        if (time_list == "") {
            req.flash('errors', `Shifter Timing Currenty unavailale`)
            return res.redirect("back")
        }

        let convert_time = []
        for (let dlen = 0; dlen < time_list.length;){
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

            dlen++
        }
        console.log(convert_time);


        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        if (req.user.role == '1') {
            res.render('pam_date_time', {
                auth_data: req.user, language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, fullDate, time_list, hour, convert_time
            })
            
        } else {

            res.render('customer_date_time', {
                auth_data: req.user, language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, fullDate, time_list, hour, cart_data, convert_time
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/add_time_ajax', async(req, res) => {
    try {
        let date = new Date()
        let day = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate())
        let month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1)
        let year = date.getFullYear()
        let fullDate = `${year}-${month}-${day}`
        let hour = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours())

        const time_list = await mySqlQury(`SELECT * FROM tbl_time_management`)

        let convert_time = []
        for (let dlen = 0; dlen < time_list.length;){
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
            dlen++
        }
        console.log(convert_time);

        res.json({fullDate, hour, time_list, convert_time})
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_date_time', auth, async(req, res) => {
    try {
        const {date, time} = req.body

        let today_date = new Date()
        let today_day = (today_date.getDate() < 10 ? '0'+today_date.getDate() : today_date.getDate())
        let tomorrow_day = (today_date.getDate()+1 < 10 ? '0'+(today_date.getDate()+1) : today_date.getDate()+1)
        let today_month = (today_date.getMonth()+1 < 10 ? '0'+(today_date.getMonth()+1) : today_date.getMonth()+1)
        let today_year = today_date.getFullYear()

        const pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '2'`)
        
        if (`${today_year}-${today_month}-${today_day}` == date) {
            await mySqlQury(`UPDATE tbl_cart SET date = '${date}', time = '${time}', date_price = '${pricing_data[0].today_price}' WHERE created_by = '${req.user.tbl_admin_id}'`)

        } else if (`${today_year}-${today_month}-${tomorrow_day}` == date) {
            await mySqlQury(`UPDATE tbl_cart SET date = '${date}', time = '${time}', date_price = '${pricing_data[0].tomorrow_price}' WHERE created_by = '${req.user.tbl_admin_id}'`)

        } else {
            await mySqlQury(`UPDATE tbl_cart SET date = '${date}', time = '${time}', date_price = '${pricing_data[0].dayaftertomorrow_price}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        }

        res.redirect('/packers_and_movers/pam_details')
    } catch (error) {
        console.log(error);
    }
})


// =============== pam_details ================== //

router.get('/pam_details', auth, async(req, res) => {
    try {
        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        const product = cart_data[0].product_name.split(',')
        
        const pickup_address = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE id = '${cart_data[0].pickup_address}'`)
        const delivery_address = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE id = '${cart_data[0].delivery_address}'`)
        const time_list = await mySqlQury(`SELECT * FROM tbl_time_management WHERE id = '${cart_data[0].time}'`)
        
        const package_details_list = await mySqlQury(`SELECT tbl_package_details.*, (select tbl_weight_unit.symbol from tbl_weight_unit where tbl_package_details.start_symbol = tbl_weight_unit.id) as s_symbol,
                                                            (select tbl_weight_unit.symbol from tbl_weight_unit where tbl_package_details.end_symbol = tbl_weight_unit.id) as e_symbol
                                                            FROM tbl_package_details`)
        
        const coupon_list = await mySqlQury(`SELECT * FROM tbl_coupon WHERE module = '${cart_data[0].module}' AND find_in_set('${cart_data[0].customer}', tbl_coupon.customer)`)
        
        const pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${cart_data[0].module}'`)

        if (pricing_data[0].floor_no == "") {
            req.flash('errors', `Pricing Not Available`)
            return res.redirect("back")
        }
        if (pricing_data[0].floor_price == "" ) {
            req.flash('errors', `Pricing Not Available`)
            return res.redirect("back")
        }

        const floor_no = pricing_data[0].floor_no.split(',')
        const floor_price = pricing_data[0].floor_price.split(',')

        const pickup_floor = cart_data[0].pickup_floor
        const pickup_price = floor_price[floor_no.indexOf(pickup_floor)]
        let pic_price, del_price;
        if (pickup_price == undefined) {
            pic_price = 0;
        } else {
            pic_price = pickup_price
        }

        const delivery_floor = cart_data[0].delivery_floor
        const delivery_price = floor_price[floor_no.indexOf(delivery_floor)]
        if (delivery_price == undefined) {
            del_price = 0;
        } else {
            del_price = delivery_price;
            
        }

        const pickup_elevator = (cart_data[0].pickup_checkbox == 'on' ? pricing_data[0].elevator_discount : "0")
        const delivery_elevator = (cart_data[0].delivery_checkbox == 'on' ? pricing_data[0].elevator_discount : "0")

        let distance_price = parseFloat(cart_data[0].address_price) + parseFloat(pic_price) + parseFloat(del_price) - parseFloat(pickup_elevator) - parseFloat(delivery_elevator)

        // ========== product_total ============ //

        let product_qty, start_time, end_time, product_list, product_total_sum, shift_express_data, other_price, Total_Price, insurance_data, all_category_data, package_name,
            pack_weight, product_tots

        if (cart_data[0].module == "2") {
            product_qty = cart_data[0].product_qty.split(',')
            start_time = time_list[0].start_time.split(':')
            end_time = time_list[0].end_time.split(':')

            product_list = await mySqlQury(`SELECT tbl_product.*, (select tbl_sub_category.name from tbl_sub_category where tbl_product.subcategory_name = tbl_sub_category.id) as s_category,
                                                    (select tbl_category.name from tbl_category where tbl_product.category_name = tbl_category.id) as category
                                                    FROM tbl_product`)
            
            const product_total = cart_data[0].product_price.split(',')
            product_total_sum = 0;
            for (let c = 0; c < product_total.length;) {
                product_total_sum += parseFloat(product_total[c])
                c++
            }

            shift_express_data = await mySqlQury(`SELECT * FROM tbl_shift_express WHERE id = '${cart_data[0].shifter}'`)
            other_price = (parseFloat(cart_data[0].date_price) + parseFloat(shift_express_data[0].price) + parseFloat(distance_price)).toFixed(2)

            Total_Price = (parseFloat(product_total_sum) + parseFloat(other_price)).toFixed(2)

            await mySqlQury(`UPDATE tbl_cart SET total_price = '${Total_Price}' WHERE created_by = '${req.user.tbl_admin_id}'`)
            
            insurance_data = await mySqlQury(`SELECT * FROM tbl_insurance WHERE start_price <= '${product_total_sum}' AND end_price > '${product_total_sum}' AND module = '${cart_data[0].module}'`)

        } else {
            product_qty = ""
            start_time = ""
            end_time = ""
            
            all_category_data = await mySqlQury(`SELECT  tbl_sub_category.*, (select tbl_category.name from tbl_category where tbl_sub_category.category_name = tbl_category.id) as category_full_name
                                                        FROM tbl_sub_category WHERE module = '${cart_data[0].module}' `)

            package_name = cart_data[0].package_name.split(",").length

            product_list = await mySqlQury(`SELECT tbl_cart.id, tbl_cart.package_name, tbl_cart.package_des, tbl_cart.package_Amouunt, tbl_cart.package_weight, 
                                                    tbl_cart.package_Length, tbl_cart.package_width, tbl_cart.package_Height, tbl_cart.tot_weight_vol, tbl_cart.package_Weight_vol FROM tbl_cart
                                                    WHERE created_by = '${req.user.tbl_admin_id}'`)

            let product_amo_len = product_list[0].package_Amouunt.split(",").length
            let product_amount = product_list[0].package_Amouunt.split(",")
            let product_weigth = product_list[0].package_weight.split(",")

            pack_weight = 0;
            for (let a = 0; a < product_amo_len;){
                pack_weight += parseFloat(product_weigth[a])
                a++
            }

            product_tots = 0;
            for (let b = 0; b < product_amo_len;){
                product_tots += parseFloat(product_amount[b])
                b++
            }
            product_total_sum = product_tots;
            
            other_price = parseFloat(distance_price) + parseFloat(cart_data[0].diss_weight_price)
            Total_Price = (parseFloat(other_price) + parseFloat(cart_data[0].weight_price)).toFixed(2)

            await mySqlQury(`UPDATE tbl_cart SET total_price = '${Total_Price}' WHERE created_by = '${req.user.tbl_admin_id}'`) 

            insurance_data = await mySqlQury(`SELECT * FROM tbl_insurance WHERE start_price <= '${product_total_sum}' AND end_price > '${product_total_sum}' AND module = '${cart_data[0].module}'`) 
            
        }

        const delivery_type_list = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE module = '${cart_data[0].module}' `)
        if (delivery_type_list == "") {
            req.flash('errors', `Delivery Type Not Available`)
            return res.redirect("back")
        }

        let premium_charged, damage_payout;
        if (insurance_data == "") {
            premium_charged = 0
            damage_payout = 0
        } else {
            if (insurance_data[0].premium_percentage == '1') {
                premium_charged = (parseFloat(product_total_sum) * parseFloat(insurance_data[0].premium_charged) / 100).toFixed(2)
            } else {
                premium_charged = (insurance_data[0].premium_charged).toFixed(2)
            }
    
            if (insurance_data[0].damage_percentage == '1') {
                damage_payout = (parseFloat(product_total_sum) * parseFloat(insurance_data[0].damage_payout) / 100).toFixed(2)
            } else {
                damage_payout = (insurance_data[0].premium_charged).toFixed(2)
            }
        }

        const transaction_method_list = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE status = '1'`)

        if (req.user.role == '1') {
            res.render('pam_details', {
                auth_data: req.user, module_list: req.module, package_name, all_category_data, language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, cart_data, product, product_qty, product_list, pickup_address, delivery_address, start_time, end_time, package_details_list,
                coupon_list, delivery_type_list, product_total_sum, other_price, Total_Price, date_price:cart_data[0].date_price, shift_express_data:shift_express_data[0].price, pack_weight, product_tots,
                distance_price, pickup_floor, pickup_price, delivery_floor, delivery_price, pickup_elevator, delivery_elevator, insurance_data, premium_charged, damage_payout, transaction_method_list
            })

        } else if (cart_data[0].module == "2") {
                
            res.render('customer_details', {
                auth_data: req.user, module_list: req.module, package_name, all_category_data, language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, cart_data, product, product_qty, product_list, pickup_address, delivery_address, start_time, end_time, package_details_list,
                coupon_list, delivery_type_list, product_total_sum, other_price, Total_Price, date_price:cart_data[0].date_price, shift_express_data:shift_express_data[0].price, pack_weight, product_tots,
                distance_price, pickup_floor, pickup_price, delivery_floor, delivery_price, pickup_elevator, delivery_elevator, insurance_data, premium_charged, damage_payout, transaction_method_list
            })
        } else {
            res.render('customer_details', {
                auth_data: req.user, module_list: req.module, package_name, all_category_data, language: req.lang, lang: req.lan, social: req.social,
                general_data: req.general[0], notification_data: req.notification, cart_data, product, product_qty, product_list, pickup_address, delivery_address, start_time, end_time, package_details_list,
                coupon_list, delivery_type_list, product_total_sum, other_price, Total_Price, date_price:cart_data[0].date_price, pack_weight, product_tots,
                distance_price, pickup_floor, pickup_price, delivery_floor, delivery_price, pickup_elevator, delivery_elevator, insurance_data, premium_charged, damage_payout, transaction_method_list
            })
            
        }

    } catch (error) {
        console.log(error);
    }
})

router.get('/select_coupon/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`UPDATE tbl_cart SET coupon = '${req.params.id}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        
        const coupon_data = await mySqlQury(`SELECT * FROM tbl_coupon WHERE id = '${req.params.id}'`)
        let coupon = (coupon_data[0].discount_amount).toFixed(2)
        
        res.json({coupon_price:coupon})
    } catch (error) {
        console.log(error);
    }
})

router.get('/remove_coupon/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`UPDATE tbl_cart SET coupon = '0' WHERE created_by = '${req.user.tbl_admin_id}'`)
        const coupon_data = await mySqlQury(`SELECT * FROM tbl_coupon WHERE id = '${req.params.id}'`)
        
        res.json({coupon_price:coupon_data[0].discount_amount})
    } catch (error) {
        console.log(error);
    }
})

router.get('/select_delivery_type/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`UPDATE tbl_cart SET delivery_type = '${req.params.id}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        const delivery_type = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE id = '${req.params.id}'`)

        res.json({delivery_type_price:delivery_type[0].price})
    } catch (error) {
        console.log(error);
    }
})

router.post('/save_and_pay', auth, async(req, res) => {
    try {
        const {insurance_id, insurance_price, payment, coupon} = req.body
        console.log(req.body);

        if (coupon == "0") {
            await mySqlQury(`UPDATE tbl_cart SET coupon = '0', total_price = '${payment}', insurance_id = '${insurance_id}', insurance_price = '${insurance_price}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        } else {
            await mySqlQury(`UPDATE tbl_cart SET total_price = '${payment}', insurance_id = '${insurance_id}', insurance_price = '${insurance_price}' WHERE created_by = '${req.user.tbl_admin_id}'`)
        }

        res.json({ok: 'done'})
    } catch (error) {
        console.log(error);
    }
})



router.post('/paypal_payment', auth, async(req, res)=>{
    try {
        const {paypal_total_amount, paypal_payment_type, type} = req.body;

        let transaction_data = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE id = '5' `)
        let paypalid = transaction_data[0].secret_id
        let paypalsecret = transaction_data[0].secret_key

        if (type == "1") {

            if (transaction_data[0].payment_type == "1") {
                paypal.configure({
                    'mode': 'sandbox', 
                    'client_id': paypalid,
                    'client_secret': paypalsecret
                });

            } else {
                paypal.configure({
                    'mode': 'live', 
                    'client_id': paypalid,
                    'client_secret': paypalsecret
                });
            }

            let currency = req.general[0].site_currency
            let payment_amount = paypal_total_amount.split(`${currency}`).join("");

            let payment = payment_amount.trim();
            // var payment_amount = paypal_total_amount.split(/(\d+)/)

            let id = paypal_payment_type

            let create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": process.env.FULLPORT + "/packers_and_movers/payment_place_order/" + id,
                    "cancel_url": process.env.FULLPORT + "/packers_and_movers/pam_details"
                },
                "transactions": [{
                    // "item_list": {
                    //     "items": [{
                    //         "name": "item",
                    //         "sku": "item",
                    //         "price": "1.00",
                    //         "currency": "USD",
                    //         "quantity": 1
                    //     }]
                    // },
                    "amount": {
                        "total": payment,
                        "currency": "USD"
                    },
                    "description": "This is the payment description."
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    console.log("Create Payment Response");
                    let links = payment.links;
                    let counter = links.length; 
                    for (let paypal_len = 0; paypal_len < counter; paypal_len++){
                        if (links[paypal_len].method == 'REDIRECT') {
                            res.redirect( links[paypal_len].href )
                        }
                    }
                }
            });
            
        } else {

            if (transaction_data[0].payment_type == "1") {
                paypal.configure({
                    'mode': 'sandbox', 
                    'client_id': paypalid,
                    'client_secret': paypalsecret
                });

            } else {
                paypal.configure({
                    'mode': 'live', 
                    'client_id': paypalid,
                    'client_secret': paypalsecret
                });
            }

            let payment = req.body.hidden_order_tot;
            // var payment_amount = paypal_total_amount.split(/(\d+)/)

            let id = type +','+ req.body.payment_id + ',' + req.body.paypal_payment_type

            let create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": process.env.FULLPORT + "/packers_and_movers/customer_payment/" + id,
                    "cancel_url": process.env.FULLPORT + "/packers_and_movers/pam"
                },
                "transactions": [{
                    // "item_list": {
                    //     "items": [{
                    //         "name": "item",
                    //         "sku": "item",
                    //         "price": "1.00",
                    //         "currency": "USD",
                    //         "quantity": 1
                    //     }]
                    // },
                    "amount": {
                        "total": payment,
                        "currency": "USD"
                    },
                    "description": "This is the payment description."
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    console.log("Create Payment Response");
                    let links = payment.links;
                    let counter = links.length; 
                    for (let paypal_len = 0; paypal_len < counter; paypal_len++){
                        if (links[paypal_len].method == 'REDIRECT') {
                            res.redirect( links[paypal_len].href )
                        }
                    }
                }
            });

        }

    } catch (error) {
        console.log(error);
    }
})



router.post("/paystack_payment", auth, async(req, res)=>{
    try {
        const {paystack_total_amount, paystack_payment_type, paystack_order_id, type} = req.body;

        if (type == "1") {
           

            let transaction_data = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE id = '4' `)
            let paystackid = transaction_data[0].secret_id;
            const paystack = require('paystack')(paystackid);

            const options = {
                amount: paystack_total_amount * 100, 
                email: req.user.tbl_admin_email,

                callback_url: process.env.FULLPORT + "/packers_and_movers/check_paystack_payment/" + type +','+ paystack_payment_type,
                // callback_url: "http://192.168.1.2:5000/packers_and_movers/check_paystack_payment/" + paystack_payment_type,

                //redirect_url: 'http://192.168.1.2:5000/packers_and_movers/pam_details',
                metadata: {
                    custom_fields: [
                        {
                            display_name: 'Order ID',
                            variable_name: 'order_id',
                            value: '12345'
                        }
                    ]
                }
            };

            paystack.transaction.initialize(options, (error, body) => {
                if (!error) {
                    const authorization_url = body.data.authorization_url;
                    console.log('reference id:', body.data.reference);
                    res.redirect(authorization_url);
                }

            });
            
        } else {

            let transaction_data = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE id = '4' `)
            let paystackid = transaction_data[0].secret_id;
            const paystack = require('paystack')(paystackid);

            const options = {
                amount: paystack_total_amount * 100, 
                email: req.user.tbl_admin_email,

                callback_url: process.env.FULLPORT + "/packers_and_movers/check_paystack_payment/" + type +','+ paystack_payment_type +','+ paystack_order_id,
                metadata: {
                    custom_fields: [
                        {
                            display_name: 'Order ID',
                            variable_name: 'order_id',
                            value: '12345'
                        }
                    ]
                }
            };

            paystack.transaction.initialize(options, (error, body) => {
                if (!error) {
                    const authorization_url = body.data.authorization_url;
                    console.log('reference id:', body.data.reference);
                    res.redirect(authorization_url);
                }

            });
            
        }

        

    } catch (error) {
        console.log(error);
    }
})

router.get("/check_paystack_payment/:id", auth, async(req, res)=>{
    try {
        let order_id = req.params.id.split(",")
        console.log(order_id);

        const reference = req.query.reference;
        
        let transaction_data = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE id = '4' `)
        let paystackid = transaction_data[0].secret_id;
        
        const paystackVerifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;

        const headers = {
          'accept': 'application/json',
          'Authorization': `Bearer ${paystackid}`,
          'cache-control': 'no-cache'
        };

        if (order_id[0] == "1") {

            axios
            .get(paystackVerifyUrl, { headers })
            .then((response) => {

            const data = response.data;
            if (data.status === true && data.data.status === 'success') {
                console.log("cuss paystack");
            res.redirect("/packers_and_movers/payment_place_order/" + transaction_data[0].id);
            
            } else {
                console.log('Transaction was Cancelled');
                res.redirect('/packers_and_movers/pam_details',)
            }
            })
            .catch((error) => {
                console.error('Error:', error);
            
            res.status(500).json({ error: 'An error occurred' });
            });
            
        } else {

            axios
            .get(paystackVerifyUrl, { headers })
            .then((response) => {
            const data = response.data;
            if (data.status === true && data.data.status === 'success') {

            res.redirect("/packers_and_movers/customer_payment/" + order_id[0] +','+ order_id[1] +','+ order_id[2]);
            
            } else {
                console.log('Transaction was Cancelled');
                res.redirect('/packers_and_movers/pam_details',)
            }
            })
            .catch((error) => {
                console.error('Error:', error);
            
            res.status(500).json({ error: 'An error occurred' });
            });
            
        }

        
            
    } catch (error) {
        console.log(error);
    }
})

router.post('/razorpay_payment', auth, async(req, res) => {
    try {
        console.log("razorpay");
        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${req.user.tbl_admin_email}'`)
        let transaction_data = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE id = '6' `)

        let razorpay_id = transaction_data[0].secret_id
        let razorpay_key = transaction_data[0].secret_key
        let id = transaction_data[0].id

        let instance = new Razorpay({
            key_id: razorpay_id,
            key_secret: razorpay_key,
        });
        
        const options = {
            amount: parseFloat(cart_data[0].total_price) * 100,
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        
        instance.orders.create(options, function(err, order) {
            if (err) {
                console.log(err);
            } else {
                res.send({
                    success:true,
                    order:order.id, 
                    paypalid:razorpay_id, 
                    amount:cart_data[0].total_price,
                    sitetitle: req.general[0].site_title,
                    name: customer_data[0].first_name +' '+ customer_data[0].last_name,
                    raz_id:id, 
                    port:process.env.FULLPORT
                })
            }
        });
            
    } catch (error) {
        console.log(error);
    }
})

router.post('/coustomer_razorpay_payment', auth, async(req, res) => {
    try {
        const amount = req.body;
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${req.user.tbl_admin_email}'`)

        console.log("customer razorpay");
        let transaction_data = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE id = '6' `)
        let razorpay_id = transaction_data[0].secret_id
        let razorpay_key = transaction_data[0].secret_key

        let instance = new Razorpay({
            key_id: razorpay_id,
            key_secret: razorpay_key,
        });

        let options = {
            amount: parseFloat(amount.amount) * 100,
            currency: "INR",
            receipt: "order_rcptid_11"
        };
    
        instance.orders.create(options, function(err, order) {
            if (err) {
                console.log(err);
            } else {
                res.status(200).send({
                    success:true,
                    order:order.id, 
                    amount:amount,
                    sitetitle: req.general[0].site_title,
                    name: customer_data[0].first_name +' '+ customer_data[0].last_name,
                    paypalid:razorpay_id, 
                    port:process.env.FULLPORT
                })
            }
        });
            
    } catch (error) {
        console.log(error);
    }
})

router.post("/stripe_payment", async(req, res)=>{
    try {
        const {stripe_total_amount, stripe_payment_type, stripe_order_id, type} = req.body;

        let transaction_data = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE id = '8' `)
        let stripe_key = transaction_data[0].secret_key;
        
        if (type == "1") {
            
            const stripe = require('stripe')(stripe_key);
            const dynamicPrice = stripe_total_amount * 100; 
            const price = await stripe.prices.create({
                unit_amount: dynamicPrice,
                currency: 'inr',
                product_data: {
                    name: 'test',
                },
            });

            const priceId = price.id;

            const session = stripe.checkout.sessions.create({
                customer: 'cus_OlMq2DmXRtzvVC',
                payment_method_types: ['card'], 
                mode: "payment",
                line_items: [{
                    price: priceId,
                    quantity: 1,
                }],

                success_url: process.env.FULLPORT + "/packers_and_movers/payment_place_order/" + stripe_payment_type,
                cancel_url: process.env.FULLPORT + '/packers_and_movers/pam_details',

                }).then(session => {
                    console.log('session data'+ session.url)
                    res.redirect(session.url)
                }).catch(error => {
                    console.error("Error creating Stripe Checkout session:", error);
                    res.status(500).send("Error creating session");
            });
            console.log(session);
            
        } else {

            const stripe = require('stripe')(stripe_key);
            const dynamicPrice = stripe_total_amount * 100; 
            const price = await stripe.prices.create({
                unit_amount: dynamicPrice,
                currency: 'inr',
                product_data: {
                    name: 'test',
                },
            });
              
            const priceId = price.id;
        
            const session = stripe.checkout.sessions.create({
                customer: 'cus_OlMq2DmXRtzvVC',
                payment_method_types: ['card'], 
                mode: "payment",
                line_items: [{
                    price: priceId,
                    quantity: 1,
                }],
            
                success_url: process.env.FULLPORT + "/packers_and_movers/customer_payment/" + type +','+ stripe_payment_type +','+ stripe_order_id ,
                cancel_url: process.env.FULLPORT + '/packers_and_movers/pam',
                
                }).then(session => {
                    console.log('session data'+ session.url)
                    res.redirect(session.url)
                }).catch(error => {
                    console.error("Error creating Stripe Checkout session:", error);
                    res.status(500).send("Error creating session");
            });
            console.log(session);
            
        }

    } catch (error) {
        console.log(error);
    }
})

router.get("/customer_payment/:id", auth, upload.single('payment_image'), async(req, res)=>{
    try {
        console.log(11111);
        let order = req.params.id.split(",")
        const order_list = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${order[2]}'`)

        console.log(order);
        let image, payment_type_amount, payment_type;
        if (!req.file) {
            image = 0;
        } else {
            image = req.file.filename;
        }

        if (order[1] == "3") {
            payment_type_amount = 0;
            payment_type = 0;
        } else {
            payment_type_amount = order_list[0].total_price
            payment_type = 1;
        }

        await mySqlQury(`UPDATE tbl_order SET payment_status = '${payment_type}', payment_method = '${order[1]}', paid_amount = '${payment_type_amount}', payment_image = '${image}'  WHERE id = '${order[2]}'`)
        
        if (order[1] == "6") {
            console.log(111);
            res.send({success:"true"})
        } else {   
            res.redirect("/packers_and_movers/pam")
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/payment_place_order/:id', auth, upload.single('payment_image'), async(req, res) => {
    try {
        console.log(111);
        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)

        let image, payment_type_amount, payment_type;
        if (!req.file) {
            image = 0;
        } else {
            image = req.file.filename;
        }

        if (req.params.id == "3") {
            payment_type_amount = 0;
            payment_type = 0;
        } else {
            payment_type_amount = cart_data[0].total_price
            payment_type = 1;
        }

        let pass = '';
        let str = '1234567890';
        
        for (let i = 1; i <= 7;) {
            const char = Math.floor(Math.random() * str.length);
            pass += str.charAt(char)
            i++
        }
        
        const order_list = await mySqlQury(`SELECT * FROM tbl_order ORDER BY ID DESC LIMIT 1`)
        
        let orderid, all_id, order_id;
        if (order_list != "") {
            orderid = order_list[0].order_all_id;
            all_id = order_list[0].order_all_id;
        } else {
            all_id = '0';
        }

        if (order_list == "") {
            order_id = '000001'
        } else if (order_list[0].order_all_id == "") {
            order_id = '000001'
        } else if (orderid < 9) {
            order_id = '00000' + (parseFloat(orderid) + (parseFloat(1)))
        } else if (orderid > 10) {
            order_id = '0000' + (parseFloat(orderid) + (parseFloat(1)))
        } else if (orderid < 100) {
            order_id = '0000' + (parseFloat(orderid) + (parseFloat(1)))
        } else if (orderid > 100) {
            order_id = '000' + (parseFloat(orderid) + (parseFloat(1)))
        } else if (orderid > 1000) {
            order_id = '00' + (parseFloat(orderid) + (parseFloat(1)))
        } else if (orderid > 10000) {
            order_id = '0' + (parseFloat(orderid) + (parseFloat(1)))
        } else {
            order_id = (parseFloat(orderid) + (parseFloat(1)))
        }

        const  full_order_id = cart_data[0].profix + order_id
        const order_allid = parseFloat(all_id) + parseFloat(1);

        const new_order_data = await mySqlQury(`INSERT INTO tbl_order (created_by, order_id, tracking_id, customer, pickup_address, delivery_address, pickup_floor, pickup_checkbox, delivery_floor, delivery_checkbox, category_id
            ,product_name, product_qty, product_price, shifter, date, time, coupon, delivery_type, distance, date_price, address_price, insurance_price, total_price, payment_status, payment_method, paid_amount, payment_image, order_all_id
            ,module, package_name, package_des, package_Amouunt, package_weight, package_Length, package_width, package_Height, package_Weight_vol, tot_weight_vol, weight_price, diss_weight_price, carrier_id) 
            VALUE ('${cart_data[0].created_by}', '${full_order_id}', '${pass}', '${cart_data[0].customer}'
            ,'${cart_data[0].pickup_address}', '${cart_data[0].delivery_address}', '${cart_data[0].pickup_floor}', '${cart_data[0].pickup_checkbox}', '${cart_data[0].delivery_floor}', '${cart_data[0].delivery_checkbox}', '${cart_data[0].category_id}'
            ,'${cart_data[0].product_name}', '${cart_data[0].product_qty}', '${cart_data[0].product_price}', '${cart_data[0].shifter}', '${cart_data[0].date}', '${cart_data[0].time}', '${cart_data[0].coupon}', '${cart_data[0].delivery_type}'
            ,'${cart_data[0].distance}', '${cart_data[0].date_price}', '${cart_data[0].address_price}', '${cart_data[0].insurance_price}', '${cart_data[0].total_price}', '${payment_type}', '${req.params.id}', '${payment_type_amount}', '${image}', '${order_allid}'
            ,'${cart_data[0].module}','${cart_data[0].package_name}','${cart_data[0].package_des}','${cart_data[0].package_Amouunt}','${cart_data[0].package_weight}','${cart_data[0].package_Length}'
            ,'${cart_data[0].package_width}','${cart_data[0].package_Height}','${cart_data[0].package_Weight_vol}','${cart_data[0].tot_weight_vol}','${cart_data[0].weight_price}','${cart_data[0].diss_weight_price}', '0' )`)
        
        // // ============== test email ================ //
        const order_data = await mySqlQury(`SELECT tbl_order.*, (select tbl_delivery_type.type from tbl_delivery_type where tbl_order.delivery_type = tbl_delivery_type.id) as delivery_type_name,
                                                                (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as transaction_method,
                                                                (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as shipping_status_name,
                                                                (select tbl_customer_address.first_name from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_firstname,
                                                                (select tbl_customer_address.last_name from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_lastname,
                                                                (select tbl_customer_address.country_code from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_country_code,
                                                                (select tbl_customer_address.phone_no from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_phone_no,
                                                                (select tbl_customer_address.email from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_email,
                                                                (select tbl_customer_address.address from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_fulladdress,
                                                                (select tbl_customer_address.city from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_city,
                                                                (select tbl_customer_address.state from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_state,
                                                                (select tbl_customer_address.country from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_country,
                                                                (select tbl_customer_address.pincode from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_pincode,
                                                                (select tbl_customer_address.latitude from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_latitude,
                                                                (select tbl_customer_address.longitude from tbl_customer_address where tbl_order.pickup_address = tbl_customer_address.id) as pickup_longitude,
                                                                (select tbl_customer_address.first_name from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_first,
                                                                (select tbl_customer_address.last_name from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_lastname,
                                                                (select tbl_customer_address.country_code from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_country_code,
                                                                (select tbl_customer_address.phone_no from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_phone_no,
                                                                (select tbl_customer_address.email from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_email,
                                                                (select tbl_customer_address.address from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_fulladdress,
                                                                (select tbl_customer_address.city from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_city,
                                                                (select tbl_customer_address.state from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_state,
                                                                (select tbl_customer_address.country from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_country,
                                                                (select tbl_customer_address.pincode from tbl_customer_address where tbl_order.delivery_address = tbl_customer_address.id) as delivery_pincode
                                                                FROM tbl_order WHERE id = '${new_order_data.insertId}'`)
                                                                
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${order_data[0].customer}'`)
        let customer_address_data = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE customer_id = '${customer_data[0].id}'`)

        let product_name = order_data[0].product_name.split(',')
        let product_qty = order_data[0].product_qty.split(',')
        let product_price = order_data[0].product_price.split(',')
        
        let shifter_data = await mySqlQury(`SELECT * FROM tbl_shift_express WHERE id = '${order_data[0].shifter}'`)
        let coupon_data = await mySqlQury(`SELECT * FROM tbl_coupon WHERE id = '${order_data[0].coupon}'`)
        let delivery_type_data = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE id = '${order_data[0].delivery_type}'`)
        
        let pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${cart_data[0].module}'`)
        let floor_no = pricing_data[0].floor_no.split(',')
        let floor_price = pricing_data[0].floor_price.split(',')
        
        let package_name, product_list, product_total_sum
        if (cart_data[0].module != "2") {
            
            package_name = cart_data[0].package_name.split(",").length
            
            product_list = await mySqlQury(`SELECT tbl_cart.id, tbl_cart.package_name, tbl_cart.package_des, tbl_cart.package_Amouunt, tbl_cart.package_weight, 
            tbl_cart.package_Length, tbl_cart.package_width, tbl_cart.package_Height, tbl_cart.tot_weight_vol, tbl_cart.package_Weight_vol FROM tbl_cart
            WHERE created_by = '${req.user.tbl_admin_id}'`)

            product_total_sum = product_list[0].tot_weight_vol
            
        } else {
            
            product_total_sum = 0;
            for (let i = 0; i < product_price.length; ) {
                product_total_sum += parseFloat(product_price[i])
                i++
            }

            product_list = await mySqlQury(`SELECT tbl_product.*, (select tbl_sub_category.name from tbl_sub_category where tbl_product.subcategory_name = tbl_sub_category.id) as s_category,
                                                                        (select tbl_category.name from tbl_category where tbl_product.category_name = tbl_category.id) as category
                                                                        FROM tbl_product`)
                
        }
        
        const data = await ejs.renderFile(__dirname + "/../views" + "/email_page.ejs", {general_data: req.general[0], language: req.lang, lang: req.lan, notification_data: req.notification, order_data, customer_address_data,
                        product_name, product_qty, product_price, product_total_sum, product_list, shifter_data, coupon_data, delivery_type_data, pricing_data, floor_no, floor_price, package_name})
                    
        const module_list = await mySqlQury(`SELECT * FROM tbl_module WHERE id = '${order_data[0].module}'`)

        if (req.general[0].email_status == "1") {
            let mailTransporter = nodemailer.createTransport({
                host: req.general[0].email_host,
                port: req.general[0].email_port,
                secure: true,
                service: 'gmail',
                auth: {
                    user: req.general[0].email_id,
                    pass: req.general[0].email_password
                }
            });

            let mailDetails = {
                from: req.general[0].email_id,
                to: customer_data[0].email,
                subject: module_list[0].name,
                attachments: [{
                    filename: 'Logo.png',
                    path: __dirname + '/../public' +'/uploads/'+ req.general[0].site_logo,
                    cid: 'logo'
                }],
                html: data
            };

            mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    console.log('Error Occurs');
                } else {
                    console.log('Email sent successfully');
                }
            });
        }
    
        // ========= sms ============ //

        if (req.general[0].sms_status == "1") {

            let auth_key = req.general[0].auth_key
            let template_id = req.general[0].sms_template_id

            const options = {
                method: 'POST',
                url: 'https://control.msg91.com/api/v5/flow/',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authkey: auth_key
                },
                data: {
                    template_id: template_id,
                    short_url: '1',
                    recipients: [{mobiles: customer_address_data[0].country_code + customer_address_data[0].phone_no, ORDER: order_data[0].order_id}]
                }
            };
              
            axios
                .request(options)
                .then(function (response) {
                  console.log(response.data);
                })
                .catch(function (error) {
                  console.error(error);
                });
        }

        // ============ notification  ============== //

        let date = new Date()
        let day = date.getDate()
        let month = date.getMonth()+1
        let year = date.getFullYear()
        let fullDate = `${year}-${month}-${day}`
        let newtime = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

        const customer_tbl_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${customer_data[0].email}'`)
        
        await mySqlQury(`INSERT INTO tbl_notification (date, time, sender, notification, received, invoice, type, fix, notification_type, driver_id) VALUE
            ('${fullDate}', '${newtime}', '${req.user.tbl_admin_id}', 'There is a new order, please check it.', '0', '${order_data[0].order_id}', '${cart_data[0].profix}', '1', '1', '0')`)
        
        if (req.general[0].order_auto_approved == "1") {
            let lat = order_data[0].pickup_latitude
            let lon = order_data[0].pickup_longitude

            const zone_name = await mySqlQury(`SELECT * FROM tbl_zone WHERE zone_type = '${order_data[0].module}' GROUP BY zone_name `)
            
            let name_li_len = zone_name.length
            let name_list = []
            for (let c = 0; c < name_li_len; ){
                let name =  zone_name[c].zone_name
                name_list.push(name)
                c++
            }
    
            let zone_let = name_list.length
            let zone = []
            for (let a = 0; a < zone_let; ){
                const zone_lat_lon = await mySqlQury(`SELECT tbl_zone.zone_name, tbl_zone.latitude, tbl_zone.longitude FROM tbl_zone WHERE zone_type = '${order_data[0].module}' AND zone_name = '${name_list[a]}' `)
                zone.push(zone_lat_lon)
                a++
            }
    
            let zone_co_len = zone.length
            let carrier = [];
            for (let b = 0; b < zone_co_len; ){

                const point = { lat , lon };
                const polygon = zone[b]
                let count = geolib.isPointInPolygon(point, polygon)
                if (count === true) {
                    let z_name = zone[b]
                    carrier.push(z_name[0].zone_name)
                }
                b++
            }

            const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE zone = '${carrier}' `)

            let carrier_id = [];
            for (let list = 0; list < carrier_list.length; ){
                const carrier_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${carrier_list[list].email}' `)
                carrier_id.push(carrier_admin[0].id)
                list++
            }
            console.log(carrier_id);

            let carrier_len = carrier_id.length

            for (let carr = 0; carr < carrier_len;) {

                let message = {
                    app_id: req.general[0].onesignal_app_id,
                    contents: {"en": "Thank you for your order. Your order ID for future reference is "+ order_data[0].order_id + "."},
                    headings: {"en": req.general[0].site_title},
                    included_segments: ["Subscribed Users"],
                    content_available: true,
                    filters: [
                        {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "customer"}, 
                        {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": carrier_id[carr]},
                    ]
                }
                sendNotification(message);

                carr++
            }

        }
        
        const amin_id = await mySqlQury(`SELECT * FROM tbl_admin WHERE role = '1'`)

        for (let adrole = 1; adrole < amin_id.length; adrole++) {
             
            let role_detail = await mySqlQury(`SELECT * FROM tbl_role_permission WHERE email = '${amin_id[adrole].email}' `)
            let role = role_detail[0].order_per.split(",")[0]

            if (role == "1") {
                let message = {
                    app_id: req.general[0].onesignal_app_id,
                    contents: {"en": "Thank you for your order. Your order ID for future reference is "+ order_data[0].order_id + "."},
                    headings: {"en": req.general[0].site_title},
                    included_segments: ["Subscribed Users"],
                    content_available: true,
                    filters: [
                        {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "admin"},
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": amin_id[adrole].id},
                    ]
                }
                sendNotification(message);
            }
        }
        
        let message = {
            app_id: req.general[0].onesignal_app_id,
            contents: {"en": "Thank you for your order. Your order ID for future reference is "+ order_data[0].order_id + "."},
            headings: {"en": req.general[0].site_title},
            included_segments: ["Subscribed Users"],
            content_available: true,
            filters: [
                {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "customer"}, 
                {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": customer_tbl_admin[0].id},
            ]
        }
        sendNotification(message);

        if (req.params.id == "6") {
            res.send({success:"true", order_id})
        } else {
            
            res.redirect('/packers_and_movers/confirm_order/'+order_id)
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/confirm_order/:id', auth, async(req, res) => {
    try {
        console.log("confirm_order_page");
        const cart_data = await mySqlQury(`SELECT * FROM tbl_cart WHERE created_by = '${req.user.tbl_admin_id}'`)
        const order = await mySqlQury(`SELECT * FROM tbl_order WHERE order_id = '${cart_data[0].profix+req.params.id}'`)

        res.render('confirm_order', {
            auth_data: req.user, language: req.lang, lang: req.lan, module_list: req.module, social: req.social,
            general_data: req.general[0], notification_data: req.notification, cart_data, order
        })
    } catch (error) {
        console.log(error);
    }
})



module.exports = router