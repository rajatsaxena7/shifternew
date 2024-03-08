const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')
const multer  = require('multer')
let sendNotification = require("../middleware/send");
const nodemailer = require('nodemailer');
const countryCodes = require('country-codes-list')
const bcrypt = require('bcrypt');
const mysql = require("mysql")
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

router.get('/order_list', auth, async(req, res) => {
    try {

        let order_list1, order_list2, order_list3, driver_list, carrier_auto_list
        if (req.user.role == '1' || req.user.role == '4') {
            
            order_list1 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                    (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                    (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                    (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                    (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                    FROM tbl_order WHERE module = '1' ORDER BY id DESC`)
            
            order_list2 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                    (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                    (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                    (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                    (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                    FROM tbl_order WHERE module = '2' ORDER BY id DESC`)
            
            order_list3 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                    (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                    (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                    (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                    (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                    FROM tbl_order WHERE module = '3' ORDER BY id DESC`)

            driver_list = await mySqlQury(`SELECT * FROM tbl_carrier`)
            
        } else {

            if (req.general[0].order_auto_approved == "1") {
                const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)

                const order1 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '0' AND module = '1' ORDER BY id DESC`)

                const order_unapp1 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = 'Unapproved' AND module = '1' ORDER BY id DESC`)
                
                const order11 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND module = '1' ORDER BY id DESC`)

                order_list1 = order1.concat(order_unapp1, order11)

                const order2 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '0' AND module = '2' ORDER BY id DESC`)

                const order_unapp2 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = 'Unapproved' AND module = '2' ORDER BY id DESC`)
                
                const order22 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND module = '2' ORDER BY id DESC`)

                order_list2 = order2.concat(order_unapp2, order22)

                const order3 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '0' AND module = '3' ORDER BY id DESC`)

                const order_unapp3 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = 'Unapproved' AND module = '3' ORDER BY id DESC`)
                
                const order33 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND module = '3' ORDER BY id DESC`)

                order_list3 = order3.concat(order_unapp3, order33)

                carrier_auto_list = await mySqlQury(`SELECT id FROM tbl_driver WHERE approved = '1' AND email = '${req.user.tbl_admin_email}'`)
                
            } else {

                const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)

                order_list1 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND module = '1' ORDER BY id DESC`)

                order_list2 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND module = '2' ORDER BY id DESC`)

                order_list3 = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                        (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                        (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                        (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                        (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                        FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND module = '3' ORDER BY id DESC`)


            }


            

            driver_list = await mySqlQury(`SELECT * FROM tbl_carrier WHERE carrier_id = '${req.user.tbl_admin_id}'`)
        }
        
        const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1'`)
        const transaction_method_list = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE status = '1'`)
        
        res.render('order_list', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, carrier_list, transaction_method_list, order_list1, order_list2, order_list3, driver_list, carrier_auto_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.get("/driver_order_list", auth, async(req, res)=>{
    try {
        const driver_list = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.user.tbl_admin_email}'`)

        const order_list = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                    (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                    (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                    (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                    (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as payment_name
                                                                    FROM tbl_order WHERE assigned_driver = '${driver_list[0].id}' AND module = '1' ORDER BY id DESC`)
                                                                    
        const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1'`)
        const transaction_method_list = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE status = '1'`)
        
        res.render("driver_order_list", {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, order_list, carrier_list, transaction_method_list, driver_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/assigned_driver_ajex", auth, async(req, res)=>{
    try {
        const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1' AND id = '${req.body.carrier_id}'`)

        const carrier_id = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${carrier_list[0].email}'`)
        const driver_list = await mySqlQury(`SELECT * FROM tbl_carrier WHERE carrier_id = '${carrier_id[0].id}'`)

        let driver_chech;
        if (driver_list != "") {
            driver_chech = 1 ;
        } else {
            driver_chech = 0 ;
        }

        res.json({driver_list, auth_data: req.user, driver_chech})
    } catch (error) {
        console.log(error);
    }
})

// ============ add_carrier ================== //

router.post('/add_carrier/:id', auth, async(req, res) => {
    try {
        const {carrier} = req.body

        const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1' AND id = '${req.body.carrier}' `)
        let carrier_id = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${carrier_list[0].email}'`)

        await mySqlQury(`UPDATE tbl_order SET carrier_id = '${carrier}', unapproved_reason = '' WHERE id = '${req.params.id.split(",")[0]}'`)

        await mySqlQury(`UPDATE tbl_notification SET received = '${carrier_id[0].id}' WHERE notification_type = '1' AND invoice = '${req.params.id.split(",")[1]}'`)

        let message = {
            app_id: req.general[0].onesignal_app_id,
            contents: {"en": "There is a new order, please check it."},
            headings: {"en": req.general[0].site_title},
            included_segments: ["Subscribed Users"],
            content_available: true,
            filters: [
                {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "carrier"},
                {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": carrier_id[0].id},
            ]
        }
        sendNotification(message);
        
        req.flash('success', 'carrier data add successfully')
        res.redirect('/order/order_list')
    } catch (error) {
        console.log(error);
    }
})

// ============ add_carrier ================== //

router.post('/add_driver/:id', auth, async(req, res) => {
    try {
        const {driver} = req.body

        const driver_list = await mySqlQury(`SELECT * FROM tbl_carrier WHERE id = '${driver}' `)
        let driver_id = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${driver_list[0].email}'`)
        
        await mySqlQury(`UPDATE tbl_order SET assigned_driver = '${driver}' WHERE id = '${req.params.id.split(",")[0]}'`)
        
        await mySqlQury(`UPDATE tbl_notification SET driver_id = '${driver_id[0].id}' WHERE notification_type = '1' AND invoice = '${req.params.id.split(",")[1]}'`)

        let message = {
            app_id: req.general[0].onesignal_app_id,
            contents: {"en": "There is a new order, please check it."},
            headings: {"en": req.general[0].site_title},
            included_segments: ["Subscribed Users"],
            content_available: true,
            filters: [
                {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "driver"},
                {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": driver_id[0].id},
            ]
        }
        sendNotification(message);

        req.flash('success', 'Driver add successfully')
        res.redirect('/order/order_list')
    } catch (error) {
        console.log(error);
    }
})


router.get('/shipment_tracking/:id', auth, async(req, res) => {
    try {
        const shipping_status_list = await mySqlQury(`SELECT * FROM tbl_shipping_status WHERE active = '1'`)
        const order_list = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)
        
        res.render('pam_shipment_tracking', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, shipping_status_list, order_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/order_payment/:id', auth, async(req, res)=>{
    try {
        const {order_enter_amount} = req.body;
        const order_list = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)

        const orderamount = (parseFloat(order_list[0].paid_amount) + parseFloat(order_enter_amount)).toFixed(2)
        await mySqlQury(`UPDATE tbl_order SET paid_amount = '${orderamount}' WHERE id = '${order_list[0].id}'`)

        res.redirect('/order/order_list')
    } catch (error) {
        console.log(error);
    }
})

router.post('/shipment_tracking/:id', auth, async(req, res) => {
    try {
        const {address, city, state, country, delivery_status, message} = req.body 
        const date_time = new Date()

        const old_order_data = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)

        await mySqlQury(`INSERT INTO tbl_tracking_history (order_id, address, city, state, country, delivery_status, date_time, message, type) VALUE
        ('${old_order_data[0].id}', '${address}', '${city}', '${state}', '${country}', '${delivery_status}', '${date_time}', '${message}', '1')`)

        await mySqlQury(`UPDATE tbl_order SET shipping_status = '${delivery_status}' WHERE id = '${req.params.id}'`)

        const order_data = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)

        const module_list = await mySqlQury(`SELECT * FROM tbl_module WHERE id = '${order_data[0].module}'`)
        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${order_data[0].customer}'`)


        
        // ============= email ============= //

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
                text: `Your order Status is Updated. You can track your package using the tracking number ${order_data[0].order_id}.`
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
                    recipients: [{mobiles: customer_data[0].country_code + customer_data[0].phone_no, ORDER: order_data[0].order_id}]
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

        // ============== notification =============== //

        let date = new Date()
        let day = date.getDate()
        let month = date.getMonth()+1
        let year = date.getFullYear()
        let fullDate = `${year}-${month}-${day}`
        let newtime = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

        const customer_tbl_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${customer_data[0].email}'`)
        
        const carrier_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE id = '${order_data[0].carrier_id}'`)
        const carrier_tbl_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${carrier_data[0].email}'`)
        console.log(order_data[0].order_id);

        const notification = await mySqlQury(`SELECT * FROM tbl_notification WHERE notification_type = '1' AND invoice = '${order_data[0].order_id}'`)

        if (req.user.role == '1') {

            // "Login_ID": '<%= auth_data.tbl_admin_id %>',
            //         "subscription_user_Type": page_topic,

            await mySqlQury(`INSERT INTO tbl_notification (date, time, sender, notification, received, invoice, type, fix, notification_type, driver_id) VALUE
                ('${fullDate}', '${newtime}', '${notification[0].sender}', 'The order status has been updated, please check it', '${notification[0].received}', '${notification[0].invoice}', '${notification[0].type}', '1', '0', '${notification[0].driver_id}')`)
            
            let message = {
                app_id: req.general[0].onesignal_app_id,
                contents: {"en": "The order status has been updated, please check it."},
                headings: {"en": req.general[0].site_title},
                included_segments: ["Subscribed Users"],
                filters: [
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "customer"}, 
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": customer_tbl_admin[0].id},
                    {"operator": "OR"},
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "carrier"},
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": carrier_tbl_admin[0].id}

                ]
            }
            sendNotification(message);
        } else {

            await mySqlQury(`INSERT INTO tbl_notification (date, time, sender, notification, received, invoice, type, fix, notification_type, driver_id) VALUE
                ('${fullDate}', '${newtime}', '${notification[0].sender}', 'The order status has been updated, please check it', '${notification[0].received}', '${notification[0].invoice}', '${notification[0].type}', '1', '0', '${notification[0].driver_id}')`)

            let message = {
                app_id: req.general[0].onesignal_app_id,
                contents: {"en": "The order status has been updated, please check it."},
                headings: {"en": req.general[0].site_title},
                included_segments: ["Subscribed Users"],
                filters: [
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "customer"}, 
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": customer_tbl_admin[0].id}
                ]
            }
            sendNotification(message);
        }

        
        req.flash('success', 'tracking data add successfully')

        if (req.user.role == '5') {
            
            res.redirect('/order/driver_order_list')
        } else {
            
            res.redirect('/order/order_list')
        }

    } catch (error) {
        console.log(error);
    }
})



// ============= Payout ============== //

router.get("/add_payout", auth, async(req, res)=>{
    try {
        const general_dataa = await mySqlQury(`SELECT * FROM tbl_general_settings`)

        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)

       res.render("add_payout", { auth_data: req.user, permission: req.per, module_list: req.module, language: req.lang, lang: req.lan, general_data: req.general[0], notification_data: req.notification, general_dataa, driver_data}) 
    } catch (error) {
        console.log(error);
    }
})

router.post("/edit_payment/:id", auth, async(req, res)=>{
    try {
        const {wallet_amout, wallet_type, driver_upi_id, driver_ac_no, driver_ifc, driver_ac_type, driver_paypal_email} = req.body

        let driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)

        let driver_amount = driver_data[0].tot_balance
        let total_amount = (parseFloat(driver_amount) - parseFloat(wallet_amout)).toFixed(2);

        let Withdraw = driver_data[0].tbl_Withdraw
        let driver_Withdraw = (parseFloat(Withdraw) + parseFloat(wallet_amout)).toFixed(2);

        let fulldate = new Date()
        let day = (fulldate.getDate() < 10 ? '0'+fulldate.getDate() : fulldate.getDate())
        let month = (fulldate.getMonth()+1 < 10 ? '0'+(fulldate.getMonth()+1) : fulldate.getMonth()+1)
        let year = fulldate.getFullYear()
        let date = `${year}-${month}-${day}`

        await mySqlQury(`UPDATE tbl_driver SET tot_balance = '${total_amount}', tbl_Withdraw = '${driver_Withdraw}' WHERE email = '${req.user.tbl_admin_email}'`);
        
        await mySqlQury(`INSERT INTO tbl_driver_payment (driver_id, payment_photo, wallet_amout, wallet_type, driver_email, payment_status, driver_upi_id, driver_ac_no, driver_ifc, driver_ac_type, driver_paypal_email, driver_name, driver_lname, payment_date) VALUE 
        ('${req.user.tbl_admin_id}', '${'1'}', '${wallet_amout}', '${wallet_type}', '${req.user.tbl_admin_email}', '${2}', '${driver_upi_id}', '${driver_ac_no}', '${driver_ifc}', '${driver_ac_type}', '${driver_paypal_email}', '${driver_data[0].first_name}', '${driver_data[0].last_name}', '${date}')`);

        res.redirect("/order/add_payout")
                    
    } catch (error) {
        console.log(error);
    }
})

// ============= Payout List ============== //

router.get("/add_payout_list", auth, async(req, res)=>{
    try {
        const general_data_list = await mySqlQury(`SELECT * FROM tbl_general_settings`)
        let driver_payment_list = await mySqlQury(`SELECT * FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' ORDER BY id DESC`)

        res.render("add_payout_list", {auth_data: req.user, module_list: req.module, permission: req.per, language: req.lang, lang: req.lan, general_data: req.general[0], notification_data: req.notification, driver_payment_list, general_data_list})
    } catch (error) {
        console.log(error);
    }
})

// ============= Edit Carrier Profile ============== //

router.get("/carrier_profile", auth, async(req, res)=>{
    try {
        const customer_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.user.tbl_admin_email}'`)
        const gPhoto = await mySqlQury(`SELECT * FROM tbl_general_settings`)

        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)
        
        res.render("carrier_profile", {auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, nameCode, CountryCode, customer_data, gPhoto, message: req.flash('message')})
        
    } catch (error) {
        console.log(error);
    }
})

router.post("/edit_Carrier/ajex", auth, async(req, res)=>{
    try {
        const { password, c_password} = req.body

        if (password != c_password) {
            res.json({error: 'password'})
        }
        
    } catch (error) {
        console.log(error);
    }
})

router.post("/edit_carrier_profile/:id", auth, upload.single('profile_img'), async(req, res)=>{
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

            await mySqlQury(`UPDATE tbl_driver SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', country_code = '${country_code}',
            phone_no = '${phone_no}' WHERE email = '${req.user.tbl_admin_email}'`);

            res.redirect("/order/carrier_profile")

        } else if (password != c_password) {

            req.flash("message", "Passowrd not match")
            res.redirect("/order/carrier_profile")

        } else {

            const hash = await bcrypt.hash(password, 10)

            await mySqlQury(`UPDATE tbl_admin SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', country_code = '${country_code}',
            phone_no = '${phone_no}', password = '${hash}', role = '${role}', profile_img = '${image}' WHERE id = '${req.params.id}'`);

            await mySqlQury(`UPDATE tbl_driver SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', country_code = '${country_code}',
            phone_no = '${phone_no}' WHERE email = '${req.user.tbl_admin_email}'`);

            res.redirect("/order/carrier_profile")
        }
        
    } catch (error) {
        console.log(error);
    }
})

// =========== carrier dashoard ============= //

router.get("/carrier_dashboard", auth, async(req, res)=>{
    try {
        let date = new Date()
        let day = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate())
        let month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1)
        let year = date.getFullYear()
        let order_full_Date = `${year}-${month}-${day}`
        
        let driver_data, pending, rejected, delivered, pickup, progress, tot_dayliy_driver_order, tot_driver_order;
        if (req.user.role == "3") {
            driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)
            
            pending = await mySqlQury(`SELECT COUNT(*) as tot_pending FROM tbl_order WHERE shipping_status =1 AND module = '1' AND carrier_id = '${driver_data[0].id}' `)
            rejected = await mySqlQury(`SELECT COUNT(*) as tot_rejected FROM tbl_order WHERE shipping_status =2 AND module = '1' AND carrier_id = '${driver_data[0].id}' `)
            delivered = await mySqlQury(`SELECT COUNT(*) as tot_delivered FROM tbl_order WHERE shipping_status =3 AND module = '1' AND carrier_id = '${driver_data[0].id}' `)
            pickup = await mySqlQury(`SELECT COUNT(*) as tot_pickup FROM tbl_order WHERE shipping_status =4 AND module = '1' AND carrier_id = '${driver_data[0].id}' `)
            progress = await mySqlQury(`SELECT COUNT(*) as tot_progress FROM tbl_order WHERE shipping_status =5 AND module = '1' AND carrier_id = '${driver_data[0].id}' `)
            
        } else if (req.user.role == "5") {

            const driver_list = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.user.tbl_admin_email}'`)

            tot_dayliy_driver_order = await mySqlQury(`SELECT COUNT(*) as tot_dayliy_driver_order FROM tbl_order WHERE date = '${order_full_Date}' AND module = '1' AND assigned_driver = '${driver_list[0].id}' `)
            tot_driver_order = await mySqlQury(`SELECT COUNT(*) as tot_driver_order FROM tbl_order WHERE module = '1' AND assigned_driver = '${driver_list[0].id}' `)

            pending = await mySqlQury(`SELECT COUNT(*) as tot_pending FROM tbl_order WHERE shipping_status =1 AND module = '1' AND assigned_driver = '${driver_list[0].id}' `)
            rejected = await mySqlQury(`SELECT COUNT(*) as tot_rejected FROM tbl_order WHERE shipping_status =2 AND module = '1' AND assigned_driver = '${driver_list[0].id}' `)
            delivered = await mySqlQury(`SELECT COUNT(*) as tot_delivered FROM tbl_order WHERE shipping_status =3 AND module = '1' AND assigned_driver = '${driver_list[0].id}' `)
            pickup = await mySqlQury(`SELECT COUNT(*) as tot_pickup FROM tbl_order WHERE shipping_status =4 AND module = '1' AND assigned_driver = '${driver_list[0].id}' `)
            progress = await mySqlQury(`SELECT COUNT(*) as tot_progress FROM tbl_order WHERE shipping_status =5 AND module = '1' AND assigned_driver = '${driver_list[0].id}' `)
            
            driver_data = "1";
        }
        
        let order_list = await mySqlQury(`SELECT * FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' ORDER BY id DESC`)

        let order_data = await mySqlQury(`SELECT tbl_order.*, (select tbl_customer.first_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_fname,
                                                                (select tbl_customer.last_name from tbl_customer where tbl_order.customer = tbl_customer.id) as customer_lname,
                                                                (select tbl_product.name from tbl_product where tbl_order.product_name = tbl_product.id) as p_name,
                                                                (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name
                                                                FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' ORDER BY id DESC`)

        const pam_pending = await mySqlQury(`SELECT COUNT(*) as tot_pending FROM tbl_order WHERE shipping_status =1 AND module = '2' AND carrier_id = '${driver_data[0].id}' `)
        const pam_rejected = await mySqlQury(`SELECT COUNT(*) as tot_rejected FROM tbl_order WHERE shipping_status =2 AND module = '2' AND carrier_id = '${driver_data[0].id}' `)
        const pam_delivered = await mySqlQury(`SELECT COUNT(*) as tot_delivered FROM tbl_order WHERE shipping_status =3 AND module = '2' AND carrier_id = '${driver_data[0].id}' `)
        const pam_pickup = await mySqlQury(`SELECT COUNT(*) as tot_pickup FROM tbl_order WHERE shipping_status =4 AND module = '2' AND carrier_id = '${driver_data[0].id}' `)
        const pam_progress = await mySqlQury(`SELECT COUNT(*) as tot_progress FROM tbl_order WHERE shipping_status =5 AND module = '2' AND carrier_id = '${driver_data[0].id}' `)
        
        const int_pending = await mySqlQury(`SELECT COUNT(*) as tot_pending FROM tbl_order WHERE shipping_status =1 AND module = '3' AND carrier_id = '${driver_data[0].id}' `)
        const int_rejected = await mySqlQury(`SELECT COUNT(*) as tot_rejected FROM tbl_order WHERE shipping_status =2 AND module = '3' AND carrier_id = '${driver_data[0].id}' `)
        const int_delivered = await mySqlQury(`SELECT COUNT(*) as tot_delivered FROM tbl_order WHERE shipping_status =3 AND module = '3' AND carrier_id = '${driver_data[0].id}' `)
        const int_pickup = await mySqlQury(`SELECT COUNT(*) as tot_pickup FROM tbl_order WHERE shipping_status =4 AND module = '3' AND carrier_id = '${driver_data[0].id}' `)
        const int_progress = await mySqlQury(`SELECT COUNT(*) as tot_progress FROM tbl_order WHERE shipping_status =5 AND module = '3' AND carrier_id = '${driver_data[0].id}' `)
        
        res.render("carrier_dashboard", {auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, order_list:order_list.length, order_data, order_full_Date, driver_data, pending_order:pending[0].tot_pending, rejected_order:rejected[0].tot_rejected,
            delivered_order:delivered[0].tot_delivered, pickup_order:pickup[0].tot_pickup, progress_order:progress[0].tot_progress, pam_pending, pam_rejected, pam_delivered, pam_pickup, pam_progress, int_pending, int_rejected, int_delivered, int_pickup, int_progress,
            tot_driver_order, tot_dayliy_driver_order
        })
                 

    } catch (error) {
        console.log(error);
    }
})

// =========== Print Barcoad ============= //

router.post("/barcoad/:id", auth, async(req, res)=>{
    try {
        
        const driver_data = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)
            
        const package_name = driver_data[0].package_name.split(",").length

        const product_list = driver_data[0].product_name.split(",")

        const product_qty_list = driver_data[0].product_qty.split(",")

        const main_name = driver_data[0].category_id.split(",")
        
        let product = await mySqlQury(`SELECT * FROM tbl_product`)

        const pickup_addres = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE id = '${driver_data[0].pickup_address}'`)
        const deliver_addres = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE id = '${driver_data[0].delivery_address}'`)

        res.json({general_data: req.general[0], product_list, product_qty_list, product, driver_data, pickup_address : pickup_addres[0], deliver_address : deliver_addres[0],
            main_name, package_name
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/deliver_shipment/:id', auth, async(req, res) => {
    try {
        const order_list = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)
        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1'`)
        
        res.render('pam_deliver_shipment', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, order_list, driver_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/deliver_shipment/:id', auth, upload.single('image'), async(req, res) => {
    try {
        const {driver_id, person_receives} = req.body
        const image = req.file.filename
        const date_time = new Date()
        
        const order_data = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)

        await mySqlQury(`INSERT INTO tbl_tracking_history (order_id, delivery_status, date_time, driver_id, person_receives, image, type) VALUE
        ('${order_data[0].id}', '3', '${date_time}', '${driver_id}', '${person_receives}', '${image}', '2')`)

        await mySqlQury(`UPDATE tbl_order SET shipping_status = '3' WHERE id = '${req.params.id}'`)

        const carrier_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE id = '${order_data[0].carrier_id}'`)
        const carrier_tbl_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${carrier_data[0].email}'`)

        let carrier_commission, carrier_full_data
        if (req.user.role == "1" || req.user.role == "4") {
            
            carrier_full_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE id = '${order_data[0].carrier_id}'`)
            carrier_commission = carrier_full_data[0].carrier_commission

        } else if (req.user.role == "5") {
            
            const driver_data = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.user.tbl_admin_email}'`)
            const admin_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE id = '${driver_data[0].carrier_id}'`)
            carrier_full_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${admin_data[0].email}'`)
            carrier_commission = carrier_full_data[0].carrier_commission


        } else if (req.user.role == "3") {
            
            carrier_full_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)
            carrier_commission = carrier_full_data[0].carrier_commission
        }

        // var driver_commission = carrier_full_data[0].carrier_commission
        let customer_amount = order_data[0].total_price
        let amount = ((carrier_commission / 100 ) * customer_amount).toFixed(2)
        
        let driver_amount = carrier_full_data[0].tot_balance
        let total_amount = (parseFloat(driver_amount) + parseFloat(amount)).toFixed(2);

        let driver_bal = carrier_full_data[0].driver_total_bal
        let driver_total_balance = (parseFloat(driver_bal) + parseFloat(amount)).toFixed(2);

        await mySqlQury(`UPDATE tbl_driver SET tot_balance = '${total_amount}', driver_total_bal = '${driver_total_balance}' WHERE email = '${carrier_full_data[0].email}'`);

        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${order_data[0].customer}'`)
        const module_list = await mySqlQury(`SELECT * FROM tbl_module WHERE id = '${order_data[0].module}'`)

        // =========== payout ============= //

        // await mySqlQury(``)

        // ============= email ============= //

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
                text: `Your Order No ${order_data[0].order_id} is Delivered.`
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
                    recipients: [{mobiles: customer_data[0].country_code + customer_data[0].phone_no, ORDER: order_data[0].order_id}]
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


        // ============== notification =============== //

        const notification = await mySqlQury(`SELECT * FROM tbl_notification WHERE notification_type = '1' AND invoice = '${order_data[0].order_id}'`)

        let date = new Date()
        let day = date.getDate()
        let month = date.getMonth()+1
        let year = date.getFullYear()
        let fullDate = `${year}-${month}-${day}`
        let newtime = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

        
        const customer_tbl_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${customer_data[0].email}'`)
        
        

        if (req.user.role == '1') {

            await mySqlQury(`INSERT INTO tbl_notification (date, time, sender, notification, received, invoice, type, fix, notification_type, driver_id) VALUE
                ('${fullDate}', '${newtime}', '${notification[0].sender}', 'The shipment has been delivered, please check it.', '${notification[0].received}', '${notification[0].invoice}', '${notification[0].type}', '1', '0', '${notification[0].driver_id}')`)
            
            let message = {
                app_id: req.general[0].onesignal_app_id,
                contents: {"en": "The shipment has been delivered, please check it"},
                headings: {"en": req.general[0].site_title},
                included_segments: ["Subscribed Users"],
                filters: [
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "customer"}, 
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": customer_tbl_admin[0].id},
                    {"operator": "OR"},
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "carrier"},
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": carrier_tbl_admin[0].id}
                ]
            }
            sendNotification(message);
        } else {

            await mySqlQury(`INSERT INTO tbl_notification (date, time, sender, notification, received, invoice, type, fix, notification_type, driver_id) VALUE
                ('${fullDate}', '${newtime}', '${notification[0].sender}', 'The shipment has been delivered, please check it.', '${notification[0].received}', '${notification[0].invoice}', '${notification[0].type}', '1', '0', '${notification[0].driver_id}')`)

            let message = {
                app_id: req.general[0].onesignal_app_id,
                contents: {"en": "The shipment has been delivered, please check it"},
                headings: {"en": req.general[0].site_title},
                included_segments: ["Subscribed Users"],
                filters: [
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "customer"}, 
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": customer_tbl_admin[0].id}
                ]
            }
            sendNotification(message);
        }

        req.flash('success', 'deliver data add successfully')
        
        if (req.user.role == '5') {
            
            res.redirect('/order/driver_order_list')
        } else {
            
            res.redirect('/order/order_list')
        }

    } catch (error) {
        console.log(error);
    }
})

router.get('/print_shipment/:id', auth, async(req, res) => {
    try {
        const order_list = await mySqlQury(`SELECT tbl_order.*, (select tbl_delivery_type.type from tbl_delivery_type where tbl_order.delivery_type = tbl_delivery_type.id) as delivery_type_name,
                                                                (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as shipping_status_name,
                                                                (select tbl_time_management.start_time from tbl_time_management where tbl_order.time = tbl_time_management.id) as start_time,
                                                                (select tbl_time_management.end_time from tbl_time_management where tbl_order.time = tbl_time_management.id) as end_time,
                                                                (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as transaction_method,
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
                                                                FROM tbl_order WHERE id = '${req.params.id}'`)

        
        let start_time, end_time, start_time_val, end_time_val, product_name, product_qty, product_price, product_total_sum, product_list, package_name
        if (order_list[0].module == "2") {

            start_time = order_list[0].start_time.split(':')
            end_time = order_list[0].end_time.split(':')
            start_time_val = (parseInt(start_time[0]) < 13 ? start_time[0]+" AM" : start_time[0]+" PM")
            end_time_val = (parseInt(end_time[0]) < 13 ? end_time[0]+" AM" : end_time[0]+" PM")
            
            product_name = order_list[0].product_name.split(',')
            product_qty = order_list[0].product_qty.split(',')
            product_price = order_list[0].product_price.split(',')

            product_total_sum = 0;
            for (let product_len = 0; product_len < product_name.length; product_len++) {
                product_total_sum += parseFloat(product_price[product_len])
            }

            product_list = await mySqlQury(`SELECT tbl_product.*, (select tbl_sub_category.name from tbl_sub_category where tbl_product.subcategory_name = tbl_sub_category.id) as s_category,
                                                                        (select tbl_category.name from tbl_category where tbl_product.category_name = tbl_category.id) as category
                                                                        FROM tbl_product`)

        } else {
            
            package_name = order_list[0].package_name.split(",").length

            
            product_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.package_name, tbl_order.package_des, tbl_order.package_Amouunt, tbl_order.package_weight, 
                                                    tbl_order.package_Length, tbl_order.package_width, tbl_order.package_Height, tbl_order.tot_weight_vol, tbl_order.package_Weight_vol FROM tbl_order
                                                    WHERE id = '${order_list[0].id}'`)
            
            product_total_sum = order_list[0].tot_weight_vol;
            
        }

        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${order_list[0].customer}'`)
        const customer_address_data = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE customer_id = '${customer_data[0].id}'`)

                                                        
        const shifter_data = await mySqlQury(`SELECT * FROM tbl_shift_express WHERE id = '${order_list[0].shifter}'`)
        const coupon_data = await mySqlQury(`SELECT * FROM tbl_coupon WHERE id = '${order_list[0].coupon}'`)
        const delivery_type_data = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE id = '${order_list[0].delivery_type}'`)

        const pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${order_list[0].module}'`)
        const floor_no = pricing_data[0].floor_no.split(',')
        const floor_price = pricing_data[0].floor_price.split(',')

        const pickup_floor = order_list[0].pickup_floor
        const pickup_price = floor_price[floor_no.indexOf(pickup_floor)]
        let pic_price, del_price;
        if (pickup_price == undefined) {
            pic_price = 0;
        } else {
            pic_price = pickup_price
        }

        const delivery_floor = order_list[0].delivery_floor
        const delivery_price = floor_price[floor_no.indexOf(delivery_floor)]
        if (delivery_price == undefined) {
            del_price = 0;
        } else {
            del_price = delivery_price;
            
        }
        console.log(pic_price);
        console.log(delivery_floor);

        const pickup_elevator = (order_list[0].pickup_checkbox == 'on' ? pricing_data[0].elevator_discount : "0")
        const delivery_elevator = (order_list[0].delivery_checkbox == 'on' ? pricing_data[0].elevator_discount : "0")

        const pickup_floor_price =  parseFloat(pic_price) + parseFloat(del_price) - parseFloat(pickup_elevator) - parseFloat(delivery_elevator)

        if (req.user.role == '1') {
            res.render('pam_print_shipment', {
                auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, order_list, customer_address_data, product_list, product_name, product_qty, product_price, product_total_sum,
                shifter_data, coupon_data, delivery_type_data, floor_no, floor_price, pricing_data, start_time_val, end_time_val, package_name, pickup_floor_price
            })
            
        } else if (req.user.role == '2') {
            
            
            res.render('print', {
                auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, order_list, customer_address_data, product_list, product_name, product_qty, product_price, product_total_sum,
                shifter_data, coupon_data, delivery_type_data, floor_no, floor_price, pricing_data, start_time_val, end_time_val, package_name, pickup_floor_price
            })
            
        } else {
            res.render('customer_print', {
                auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module, social: req.social,
                general_data: req.general[0], notification_data: req.notification, order_list, customer_address_data, product_list, product_name, product_qty, product_price, product_total_sum,
                shifter_data, coupon_data, delivery_type_data, floor_no, floor_price, pricing_data, start_time_val, end_time_val, package_name, pickup_floor_price
            })
            
        }

    } catch (error) {
        console.log(error);
    }
})

router.get("/customer_order_traking/:id", auth, async(req, res)=>{
    try {
        const order_detail = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)
        const carrier_detail = await mySqlQury(`SELECT * FROM tbl_driver WHERE id = '${order_detail[0].carrier_id}'`)
        const driver_detail = await mySqlQury(`SELECT * FROM tbl_carrier WHERE id = '${order_detail[0].assigned_driver}'`)

        const tracking_list = await mySqlQury(`SELECT tbl_tracking_history.*, (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_tracking_history.delivery_status = tbl_shipping_status.id) as shipping_status_name
        FROM tbl_tracking_history WHERE order_id = '${order_detail[0].id}'`)
        
        res.render("customer_order_traking", {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module, social: req.social,
            general_data: req.general[0], notification_data: req.notification, order_detail, carrier_detail, driver_detail, tracking_list
        })
    } catch (error) {
        console.log(error);
    }
})

// ============= unapproved ============== //

router.post('/add_unapproved/:id', auth, async(req, res) => {
    try {
        const {unapproved_reason} = req.body

        const unapp_reason = mysql.escape(unapproved_reason);

        await mySqlQury(`UPDATE tbl_order SET carrier_id = 'Unapproved', unapproved_reason = ${unapp_reason} WHERE id = '${req.params.id}'`)

        req.flash('success', 'order unapproved successfully')
        res.redirect('/order/order_list')
    } catch (error) {
        console.log(error);
    }
})



// ================ view order ================== //

router.get('/view_order/:id', auth, async(req, res) => {
    try {
        const order_data = await mySqlQury(`SELECT tbl_order.*, (select tbl_delivery_type.type from tbl_delivery_type where tbl_order.delivery_type = tbl_delivery_type.id) as delivery_type_name,
                                                                (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                (select tbl_time_management.start_time from tbl_time_management where tbl_order.time = tbl_time_management.id) as start_time,
                                                                (select tbl_time_management.end_time from tbl_time_management where tbl_order.time = tbl_time_management.id) as end_time,
                                                                (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as transaction_method,
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
                                                                FROM tbl_order WHERE id = '${req.params.id}'`)
        
        let start_time, end_time, start_time_val, end_time_val, product_name, product_qty, product_price, product_total_sum, product_list, package_name
        if (order_data[0].module == "2") {

            start_time = order_data[0].start_time.split(':')
            end_time = order_data[0].end_time.split(':')
            start_time_val = (parseInt(start_time[0]) < 13 ? start_time[0]+" AM" : start_time[0]+" PM")
            end_time_val = (parseInt(end_time[0]) < 13 ? end_time[0]+" AM" : end_time[0]+" PM")

            product_name = order_data[0].product_name.split(',')
            product_qty = order_data[0].product_qty.split(',')
            product_price = order_data[0].product_price.split(',')

            product_total_sum = 0;
            for (let product_len = 0; product_len < product_price.length; ) {
                product_total_sum += parseFloat(product_price[product_len])
                product_len++
            }

            product_list = await mySqlQury(`SELECT tbl_product.*, (select tbl_sub_category.name from tbl_sub_category where tbl_product.subcategory_name = tbl_sub_category.id) as s_category,
                                                                    (select tbl_category.name from tbl_category where tbl_product.category_name = tbl_category.id) as category
                                                                    FROM tbl_product`)

            

        } else {
            
            package_name = order_data[0].package_name.split(",").length
            
            product_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.package_name, tbl_order.package_des, tbl_order.package_Amouunt, tbl_order.package_weight, 
                                                    tbl_order.package_Length, tbl_order.package_width, tbl_order.package_Height, tbl_order.tot_weight_vol, tbl_order.package_Weight_vol FROM tbl_order
                                                    WHERE id = '${order_data[0].id}'`)
            
            product_total_sum = order_data[0].tot_weight_vol;
            
        }
        
        const shifter_data = await mySqlQury(`SELECT * FROM tbl_shift_express WHERE id = '${order_data[0].shifter}'`)
        const coupon_data = await mySqlQury(`SELECT * FROM tbl_coupon WHERE id = '${order_data[0].coupon}'`)
        const delivery_type_data = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE id = '${order_data[0].delivery_type}'`)

        const pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${order_data[0].module}'`)
        const floor_no = pricing_data[0].floor_no.split(',')
        const floor_price = pricing_data[0].floor_price.split(',')

        const pickup_floor = order_data[0].pickup_floor
        const pickup_price = floor_price[floor_no.indexOf(pickup_floor)]
        let pic_price, del_price;
        if (pickup_price == undefined) {
            pic_price = 0;
        } else {
            pic_price = pickup_price
        }

        const delivery_floor = order_data[0].delivery_floor
        const delivery_price = floor_price[floor_no.indexOf(delivery_floor)]
        if (delivery_price == undefined) {
            del_price = 0;
        } else {
            del_price = delivery_price;
            
        }

        const pickup_elevator = (order_data[0].pickup_checkbox == 'on' ? pricing_data[0].elevator_discount : "0")
        const delivery_elevator = (order_data[0].delivery_checkbox == 'on' ? pricing_data[0].elevator_discount : "0")

        const pickup_floor_price =  parseFloat(pic_price) + parseFloat(del_price) - parseFloat(pickup_elevator) - parseFloat(delivery_elevator)

        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${order_data[0].customer}'`)
        
        res.render('view_order', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, order_data:order_data[0], start_time_val, end_time_val, product_name, product_qty, 
            product_price, product_list, product_total_sum, shifter_data, coupon_data, delivery_type_data, floor_no, floor_price, package_name, 
            customer_data, pickup_floor_price
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_quotation/:id', auth, async(req, res) => {
    try {
        const {add_quotation} = req.body
        const order_data = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)

        if (parseFloat(order_data[0].total_price) < parseFloat(add_quotation)) {
            const differences_amount = (parseFloat(add_quotation) - parseFloat(order_data[0].total_price)).toFixed(2)
            await mySqlQury(`UPDATE tbl_order SET differences_amount = '${parseFloat(order_data[0].differences_amount) + parseFloat(differences_amount)}', diff_amount_type = '+', total_price = '${add_quotation}' WHERE id = '${req.params.id}'`)
            
        } else {
            const differences_amount = (parseFloat(order_data[0].total_price) - parseFloat(add_quotation)).toFixed(2)
            await mySqlQury(`UPDATE tbl_order SET differences_amount = '${parseFloat(order_data[0].differences_amount) - parseFloat(differences_amount)}', diff_amount_type = '-', total_price = '${add_quotation}' WHERE id = '${req.params.id}'`)
            
        }

        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${order_data[0].customer}'`)

        // ============= email ============= //

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
                text: `Your order Status is Updated. You can track your package using the tracking number ${order_data[0].order_id}.`
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
                    recipients: [{mobiles: customer_data[0].country_code + customer_data[0].phone_no, ORDER: order_data[0].order_id}]
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

        // ============== notification =============== //

        let date = new Date()
        let day = date.getDate()
        let month = date.getMonth()+1
        let year = date.getFullYear()
        let fullDate = `${year}-${month}-${day}`
        let newtime = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

        
        const customer_tbl_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${customer_data[0].email}'`)
        
        const carrier_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE id = '${order_data[0].carrier_id}'`)
        const carrier_tbl_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${carrier_data[0].email}'`)
        console.log(carrier_tbl_admin);

        const notification = await mySqlQury(`SELECT * FROM tbl_notification WHERE notification_type = '1' AND invoice = '${order_data[0].order_id}'`)

        if (req.user.role == '1') {

            await mySqlQury(`INSERT INTO tbl_notification (date, time, sender, notification, received, invoice, type, fix, notification_type, driver_id) VALUE
                ('${fullDate}', '${newtime}', '${notification[0].sender}', 'We have received your request for an estimate. We will be in touch shortly with a detailed quote.', '${notification[0].received}', '${notification[0].invoice}', '${notification[0].type}', '1', '0', '${notification[0].driver_id}')`)
            
            let message = {
                app_id: req.general[0].onesignal_app_id,
                contents: {"en": "We have received your request for an estimate. We will be in touch shortly with a detailed quote."},
                headings: {"en": req.general[0].site_title},
                included_segments: ["Subscribed Users"],
                filters: [
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "customer"}, 
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": customer_tbl_admin[0].id},
                    {"operator": "OR"},
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "carrier"},
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": carrier_tbl_admin[0].id}
                ]
            }
            sendNotification(message);
        } else {

            await mySqlQury(`INSERT INTO tbl_notification (date, time, sender, notification, received, invoice, type, fix, notification_type, driver_id) VALUE
                ('${fullDate}', '${newtime}', '${notification[0].sender}', 'We have received your request for an estimate. We will be in touch shortly with a detailed quote.', '${notification[0].received}', '${notification[0].invoice}', '${notification[0].type}', '1', '0', '${notification[0].driver_id}')`)

            let message = {
                app_id: req.general[0].onesignal_app_id,
                contents: {"en": "We have received your request for an estimate. We will be in touch shortly with a detailed quote."},
                headings: {"en": req.general[0].site_title},
                included_segments: ["Subscribed Users"],
                filters: [
                    {"field": "tag", "key": "subscription_user_Type", "relation": "=", "value": "customer"}, 
                    {"operator": "AND"}, {"field": "tag", "key": "Login_ID", "relation": "=", "value": customer_tbl_admin[0].id}
                ]
            }
            sendNotification(message);
        }

        req.flash('success', 'quotation add successfully')  
        res.redirect('/order/view_order/'+ req.params.id +'')
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_payment', auth, async(req, res) => {
    try {
        const order_data = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.body.order_id}'`)

        const total_amount = order_data[0].total_price;
        const paid_amount = order_data[0].paid_amount;

        const total = parseFloat(total_amount) - parseFloat(paid_amount);
        // await mySqlQury(`UPDATE tbl_order SET payment_method = '${req.body.data_payment_method}', paid_amount = '${order_data[0].total_price}' WHERE id = '${req.body.data_order_id}'`)
        
        res.json({total})
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_bank_payment/:id', auth, upload.single('payment_image'), async(req, res) => {
    try {
        const {payment_amount} = req.body;
        const order_data = await mySqlQury(`SELECT * FROM tbl_order WHERE id = '${req.params.id}'`)
        const total = parseFloat(order_data[0].paid_amount) + parseFloat(payment_amount)

        await mySqlQury(`UPDATE tbl_order SET paid_amount = '${total}', payment_image = '${req.file.filename}' WHERE id = '${req.params.id}'`)

        res.redirect("/order/order_list")
    } catch (error) {
        console.log(error);
    }
})

router.get('/view_tracking/:id', auth, async(req, res) => {
    try {
        const order_list = await mySqlQury(`SELECT tbl_order.*, (select tbl_delivery_type.type from tbl_delivery_type where tbl_order.delivery_type = tbl_delivery_type.id) as delivery_type_name,
                                                                (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_order.shipping_status = tbl_shipping_status.id) as status_name,
                                                                (select tbl_time_management.start_time from tbl_time_management where tbl_order.time = tbl_time_management.id) as start_time,
                                                                (select tbl_time_management.end_time from tbl_time_management where tbl_order.time = tbl_time_management.id) as end_time,
                                                                (select tbl_transaction_method.title from tbl_transaction_method where tbl_order.payment_method = tbl_transaction_method.id) as transaction_method,
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
                                                                FROM tbl_order WHERE id = '${req.params.id}'`)

        let start_s_time, end_s_time, start_time_val, end_time_val, product_s_name, product_s_qty, product_s_price, product_total_sum, product_list, package_name;
        if (order_list[0].module == "2") {

            start_s_time = order_list[0].start_time;

            end_s_time = order_list[0].end_time.split(':')

            start_time_val = (parseInt(start_s_time[0]) < 13 ? start_s_time[0]+" AM" : start_s_time[0]+" PM")
            end_time_val = (parseInt(end_s_time[0]) < 13 ? end_s_time[0]+" AM" : end_s_time[0]+" PM")

            product_s_name = order_list[0].product_name.split(',')
            product_s_qty = order_list[0].product_qty.split(',')
            product_s_price = order_list[0].product_price.split(',')
            
            product_total_sum = 0;
            for (let product_len = 0; product_len < product_s_price.length ; ) {
                product_total_sum += parseFloat(product_s_price[product_len])
                product_len++
            }

            product_list = await mySqlQury(`SELECT tbl_product.*, (select tbl_sub_category.name from tbl_sub_category where tbl_product.subcategory_name = tbl_sub_category.id) as s_category,
                                                                    (select tbl_category.name from tbl_category where tbl_product.category_name = tbl_category.id) as category
                                                                    FROM tbl_product`)

        } else  {

            package_name = order_list[0].package_name.split(",").length
            
            product_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.package_name, tbl_order.package_des, tbl_order.package_Amouunt, tbl_order.package_weight, 
                                                    tbl_order.package_Length, tbl_order.package_width, tbl_order.package_Height, tbl_order.tot_weight_vol, tbl_order.package_Weight_vol FROM tbl_order
                                                    WHERE id = '${order_list[0].id}'`)
            
            product_total_sum = order_list[0].tot_weight_vol;

        }

        const customer_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE id = '${order_list[0].customer}'`)
        const customer_address_data = await mySqlQury(`SELECT * FROM tbl_customer_address WHERE customer_id = '${customer_data[0].id}' AND email = '${customer_data[0].email}'`)
                                                        
        const shifter_data = await mySqlQury(`SELECT * FROM tbl_shift_express WHERE id = '${order_list[0].shifter}'`)
        const coupon_data = await mySqlQury(`SELECT * FROM tbl_coupon WHERE id = '${order_list[0].coupon}'`)
        const delivery_type_data = await mySqlQury(`SELECT * FROM tbl_delivery_type WHERE id = '${order_list[0].delivery_type}'`)

        const pricing_data = await mySqlQury(`SELECT * FROM tbl_pricing WHERE module = '${order_list[0].module}'`)
        const floor_no = pricing_data[0].floor_no.split(',')
        const floor_price = pricing_data[0].floor_price.split(',')

        const pickup_floor = order_list[0].pickup_floor
        const pickup_price = floor_price[floor_no.indexOf(pickup_floor)]
        let pic_price, del_price;
        if (pickup_price == undefined) {
            pic_price = 0;
        } else {
            pic_price = pickup_price
        }

        const delivery_floor = order_list[0].delivery_floor
        const delivery_price = floor_price[floor_no.indexOf(delivery_floor)]
        if (delivery_price == undefined) {
            del_price = 0;
        } else {
            del_price = delivery_price;
            
        }

        const pickup_elevator = (order_list[0].pickup_checkbox == 'on' ? pricing_data[0].elevator_discount : "0")
        const delivery_elevator = (order_list[0].delivery_checkbox == 'on' ? pricing_data[0].elevator_discount : "0")

        const pickup_floor_price =  parseFloat(pic_price) + parseFloat(del_price) - parseFloat(pickup_elevator) - parseFloat(delivery_elevator)

        const tracking_list = await mySqlQury(`SELECT tbl_tracking_history.*, (select tbl_shipping_status.status_name from tbl_shipping_status where tbl_tracking_history.delivery_status = tbl_shipping_status.id) as shipping_status_name
        FROM tbl_tracking_history WHERE order_id = '${order_list[0].id}'`)

        console.log(order_list[0].carrier_id);


        res.render('view_tracking', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, order_list, customer_address_data, product_list, product_s_name, product_s_qty, product_s_price, product_total_sum,
            shifter_data, coupon_data, delivery_type_data, floor_no, floor_price, pricing_data, start_time_val, end_time_val, tracking_list, package_name, pickup_floor_price
        })
    } catch (error) {
        console.log(error);
    }
})



module.exports = router