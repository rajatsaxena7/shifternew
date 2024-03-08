const express = require('express')
const app = express()
const router = express.Router()
const countryCodes = require('country-codes-list')
const { mySqlQury } = require('../middleware/db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth')
const languages = require("../public/language/languages.json")
const frontend_lng = require("../middleware/frontend_auth")
const { json } = require('body-parser')
const multer  = require('multer')
const axios = require('axios');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({storage:storage});


router.get('/log_in', frontend_lng, async(req, res) => {
    try {
        const login_data = await mySqlQury(`SELECT * FROM tbl_admin`)
        
        if (login_data == "") {
            const hash = await bcrypt.hash('123', 10)
            await mySqlQury(`INSERT INTO tbl_admin (first_name, email, password, role) VALUE 
            ('admin', 'admin@admin.com', '${hash}', '1')`)
        }

        res.render('log_in',{
            auth_data : '1', language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
            general_data: req.general[0], notification_data: ''
        })
    } catch (error) {
        console.log(error);
    }
})


router.get('/validate_domain', frontend_lng, async(req, res) => {
    try {
        const login_data = await mySqlQury(`SELECT * FROM tbl_admin`)
        
        if (login_data == "") {
            const hash = await bcrypt.hash('123', 10)
            await mySqlQury(`INSERT INTO tbl_admin (first_name, email, password, role) VALUE 
            ('admin', 'admin@admin.com', '${hash}', '1')`)
        }

        res.render('validate_domain',{
            auth_data : '1', language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
            general_data: req.general[0], notification_data: ''
        })
    } catch (error) {
        console.log(error);
    }
})



router.post('/log_in', async(req, res) => {
    try {
        const {email, password} = req.body

        const login_data = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${email}'`)
        // const driver_login_data = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${email}'`)

        if (login_data == "") {
            req.flash('errors', `your email is not register`)
            return res.redirect("/")     
        }

        const hash_pass = await bcrypt.compare(password, login_data[0].password)
        if (!hash_pass) {
            req.flash('errors', `your password is wrong`)
            return res.redirect("/")
        }

        const lang = req.cookies.langs

        if (lang == undefined) {
            const lang_data = jwt.sign({lang : 'en'}, process.env.TOKEN_KEY)
            res.cookie("langs", lang_data)
        }

        if (login_data[0].role == '1') {
            const role_list = await mySqlQury(`SELECT status FROM tbl_role_permission WHERE email = '${login_data[0].email}' `)
            
            if (role_list == "" || role_list == null) {
                const token = jwt.sign({tbl_admin_id:login_data[0].id, tbl_admin_email:login_data[0].email, role:login_data[0].role}, process.env.TOKEN_KEY)
                res.cookie("jwt", token, {expires : new Date(Date.now() + 60000 * 60)})

                req.flash('success', `login successfully`)
                return res.redirect("/index")
                
            }

            if (role_list != "" || role_list != null) {

                if (role_list[0].status == "1") {

                    const token = jwt.sign({tbl_admin_id:login_data[0].id, tbl_admin_email:login_data[0].email, role:login_data[0].role}, process.env.TOKEN_KEY)
                    res.cookie("jwt", token, {expires : new Date(Date.now() + 60000 * 60)})
    
                    req.flash('success', `login successfully`)
                    return res.redirect("/index")
                    
                } else {
                    req.flash('errors', `Your Account Deactivate.!`)
                    return res.redirect("/")
                }  
                
            }
 
        }

        if(login_data[0].role == '3'){
            const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${login_data[0].email}'`)
            const driver_doc = await mySqlQury(`SELECT * FROM tbl_driver_document WHERE driver_id = '${driver_data[0].id}'`)
            if (driver_data[0].approved == '0' || driver_doc[0].status == "0") {

                if (driver_data[0].approved == '0') {
                    
                    req.flash('errors', `waiting for approval.!`)
                    return res.redirect("/")
                } else if (driver_doc[0].status == "0") {
                    
                    req.flash('errors', `waiting for Licence approval.!`)
                    return res.redirect("/")
                }

            } else{

                const token = jwt.sign({tbl_admin_id:login_data[0].id, tbl_admin_email:login_data[0].email, role:login_data[0].role}, process.env.TOKEN_KEY)
                res.cookie("jwt", token, {expires : new Date(Date.now() + 60000 * 60)})

                req.flash('success', `login successfully`)
                return res.redirect("/order/carrier_dashboard")
            }
        }
        
        const token = jwt.sign({tbl_admin_id:login_data[0].id, tbl_admin_email:login_data[0].email, role:login_data[0].role}, process.env.TOKEN_KEY)
        res.cookie("jwt", token, {expires : new Date(Date.now() + 60000 * 60)})
        
        if(login_data[0].role == '2') {
            console.log(111111111111);
            req.flash('success', `login successfully`)
            return res.redirect("/packers_and_movers/pam")
        }
        
        if (login_data[0].role == '5') {
            req.flash('success', `login successfully`)
            return res.redirect("/order/carrier_dashboard")
        }

        // req.flash('success', `login successfully`)
        // res.redirect("/index")
    } catch (error) {
        console.log(error);
    }
})

router.post("/lang/:id", async(req, res)=>{
    try {
        const lang_data = jwt.sign({lang : req.params.id}, process.env.TOKEN_KEY)
        res.cookie("langs", lang_data)

        res.status(200).json(lang_data)
    } catch (error) {
        console.log(error);
    }
})

router.post("/language_ajex", async(req, res)=>{
    try {
        const lang = req.cookies.langs

        let lan, langs
        if (lang == undefined) {
            lan = "en";
            langs = languages.en

        } else {
            const decode_lang = await jwt.verify(lang, process.env.TOKEN_KEY)
            lan = decode_lang.lang
            
            if (decode_lang.lang == 'in') {
                langs = languages.in

            } else if(decode_lang.lang == 'de') {
                langs = languages.de
              
            } else if(decode_lang.lang == 'en') {
                langs = languages.en
              
            } else if(decode_lang.lang == 'pt') {
                langs = languages.pt
              
            } else if(decode_lang.lang == 'es') {
                langs = languages.es
              
            } else if(decode_lang.lang == 'fr') {
                langs = languages.fr
              
            } else if(decode_lang.lang == 'cn') {
                langs = languages.cn
              
            } else if(decode_lang.lang == 'ae') {
                langs = languages.ae
    
            }
        }
        
        res.json({lan, langs})
    } catch (error) {
        console.log(error);
    }
})


// ============== sign_up ============== //

router.get('/sign_up', frontend_lng, async(req, res) => {
    try {
        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)
        
        res.render('sign_up', {
            auth_data : '1', language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
            general_data: req.general[0], notification_data: '',
            nameCode, CountryCode
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/sign_up/ajax', frontend_lng, async(req, res) => {
    try {
        const {email, country_code, phone} = req.body

        const tbl_customer = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${email}'`)
        if (tbl_customer != "") {
            return res.json({error: 'email'})
        }

        const tbl_customer_phone = await mySqlQury(`SELECT * FROM tbl_customer WHERE country_code = '${country_code}' AND phone_no = '${phone}'`)
        if (tbl_customer_phone != "") {
            return res.json({error: 'phone_no'})
        }

        // =========== otp ========== //

        let otp_result = '';
        let characters = '0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
            otp_result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        // =========== email ========== //

        let mailTransporter = nodemailer.createTransport({
                host: req.general[0].email_host,
                port: req.general[0].email_port,
                secure: false,
                auth: {
                    user: req.general[0].email_id,
                    pass: req.general[0].email_password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            let mailDetails = {
                from: req.general[0].email_id,
                to: email,
                subject: 'OTP for verification',
                text: 'Your '+ req.general[0].site_title +' otp is '+ otp_result +''
            };
            mailTransporter.sendMail(mailDetails, function(err, data) {
                if (err) {
                    console.log('Error Occurs:', err);
                } else {
                    console.log('Email sent successfully');
                }
            });

        // ========= sms ============ //
        
        if (req.general[0].sms_status == "1") {

            let auth_key = req.general[0].auth_key
            let template_id = req.general[0].otp_template_id

            let pho_no = country_code + phone
            const options = {
                method: 'POST',
                url: 'https://control.msg91.com/api/v5/otp?template_id='+ template_id +'&mobile='+ pho_no +'&otp=' + otp_result,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authkey: auth_key
                },
                data: {Param1: 'value1'}
            };
              
            axios
                .request(options)
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.error(error);
                });

            // const client = require('twilio')(accountSid, authToken);
            
            // client.messages.create({
            //     body: 'Your '+ req.general[0].site_title +' otp is '+ otp_result +'',
            //     from: req.general[0].twilio_phone_no,
            //     to: country_code + phone
            // })
            // .then(message => console.log(message.sid))
            // .catch((error) => {console.log(error);})

        }

        res.json({error: '', otp: otp_result})
    } catch (error) {
        console.log(error);
    }
})

router.post('/sign_up', async(req, res) => {
    try {
        const {first_name, last_name, email, country_code, phone_no, password} = req.body

        const hash = await bcrypt.hash(password, 10)

        await mySqlQury(`INSERT INTO tbl_customer (first_name, last_name, email, country_code, phone_no, module) VALUE 
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '2')`)
        await mySqlQury(`INSERT INTO tbl_admin (first_name, last_name, email, country_code, phone_no, password, role, profile_img) VALUE 
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${hash}', '2', '')`)

        req.flash('success', `sign up successfully`)
        res.redirect("/log_in")
    } catch (error) {
        console.log(error);
    }
})


// ============== enterprise_singup ================ //

router.get('/driver_singup', frontend_lng, async(req, res) => {
    try {
        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)
        
        res.render('sing_up_driver', {
            auth_data : '1', language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
            general_data: req.general[0], notification_data: '', nameCode, CountryCode
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_driver_singup', upload.single('carrier_img'), async(req, res) => {
    try {
        const {first_name, last_name, email, country_code, phone_no, license_number, password} = req.body

        const admin_email = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${email}'`)
        
        if (admin_email != "") {
            req.flash('errors', 'your email is already registered.')
            return res.redirect("/driver_singup")
        }

        const admin_phone = await mySqlQury(`SELECT * FROM tbl_admin WHERE phone_no = '${phone_no}'`)
        if (admin_phone != "") {
            req.flash('errors', 'your Phone No is already registered.')
            return res.redirect("/driver_singup")
        }

        const general = await mySqlQury(`SELECT * FROM tbl_general_settings `)

        let appro, commission, comm_amount;
        if (general[0].driver_autoapproved == "1") {
            appro = 1
            commission = general[0].default_carrier_commission
            comm_amount = general[0].default_wallet_min_balance
        } else {
            appro = 0
            commission = 0
            comm_amount = 0
        }

        const hash = await bcrypt.hash(password, 10)
        
        await mySqlQury(`INSERT INTO tbl_driver (first_name, last_name, email, country_code, phone_no, license_number, approved, carrier_commission, carrier_min_balance_for_withdraw, tot_balance, tbl_Withdraw, driver_total_bal) VALUE
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${license_number}', '${appro}', '${commission}', '${comm_amount}', '0', '0', '0')`)
        await mySqlQury(`INSERT INTO tbl_admin (first_name, last_name, email, country_code, phone_no, password, role, profile_img) VALUE 
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${hash}', '3', '')`)

        const carrier = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${email}'`)

        await mySqlQury(`INSERT INTO tbl_driver_document (driver_id, type, image, status) VALUE ('${carrier[0].id}', '1', '${req.file.filename}', '0')`)
        
        req.flash('success', `Your information will be sent to the administration for approval.!`)
        res.redirect("/")
    } catch (error) {
        console.log(error);
    }
})

router.get("/driver_signup", auth, async(req, res)=>{
    try {
        const driver_detail = await mySqlQury(`SELECT * FROM tbl_carrier WHERE carrier_id = '${req.user.tbl_admin_id}'`)
        
        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)

        res.render("driver_signup", {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan,
            general_data: req.general[0], notification_data: req.notification, nameCode, CountryCode, driver_detail
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_carrier_driver", auth, async(req, res)=>{
    try {
        const {first_name, last_name, email, country_code, phone_no, License_no, password} = req.body;

        const hash = await bcrypt.hash(password, 10)
        
        await mySqlQury(`INSERT INTO tbl_carrier (first_name, last_name, email, country_code, phone_no, license_number, password, carrier_id) VALUE 
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${License_no}', '${hash}', '${req.user.tbl_admin_id}')`)
        await mySqlQury(`INSERT INTO tbl_admin (first_name, last_name, email, country_code, phone_no, password, role, profile_img) VALUE 
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${hash}', '5', '')`)
        
        res.redirect("/driver_signup")
    } catch (error) {
        console.log(error);
    }
})

router.post("/edit_carrier_driver/:id", auth, async(req, res)=>{
    try {
        const {edit_first_name, edit_last_name, edit_email, edit_email_vol, edit_country_code, edit_phone_no, edit_License_no, edit_password} = req.body;
        
        const tbl_admin = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${edit_email_vol}'`)

        if (edit_password == "") {

            await mySqlQury(`UPDATE tbl_carrier SET first_name = '${edit_first_name}',last_name = '${edit_last_name}', email = '${edit_email}', country_code = '${edit_country_code}'
            , phone_no = '${edit_phone_no}', license_number = '${edit_License_no}' WHERE id = '${req.params.id}'`)

            await mySqlQury(`UPDATE tbl_admin SET first_name = '${edit_first_name}',last_name = '${edit_last_name}', email = '${edit_email}', country_code = '${edit_country_code}'
            , phone_no = '${edit_phone_no}' WHERE id = '${tbl_admin[0].id}'`)
            
        } else {
            
            const hash = await bcrypt.hash(edit_password, 10)
            await mySqlQury(`UPDATE tbl_carrier SET first_name = '${edit_first_name}',last_name = '${edit_last_name}', email = '${edit_email}', country_code = '${edit_country_code}'
            , phone_no = '${edit_phone_no}', license_number = '${edit_License_no}', password = '${hash}' WHERE id = '${req.params.id}'`)

            await mySqlQury(`UPDATE tbl_admin SET first_name = '${edit_first_name}',last_name = '${edit_last_name}', email = '${edit_email}', country_code = '${edit_country_code}'
            , phone_no = '${edit_phone_no}', password = '${hash}' WHERE id = '${tbl_admin[0].id}'`)
            
        }

        res.redirect("/driver_signup")
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_driver_detail/:id", auth, async(req, res)=>{
    try {

        await mySqlQury(`DELETE FROM tbl_carrier WHERE id = '${req.params.id}'`)

        res.redirect("/driver_signup")
    } catch (error) {
        console.log(error);
    }
})

router.post("/driver_check", auth, async(req, res)=>{
    try {
        const driver_detail = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.body.email}'`)
        const driver_detail_phone = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.body.phone}'`)

        const admin_detail = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.email}'`)
        const admin_detail_phone = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.phone}'`)

        let email = 0;
        let phone = 0;
        if (driver_detail != "") {
            email = 1;
        } 
        if (admin_detail != "") {
            email = 1;
        }
        
        if (driver_detail_phone != "") {
            phone = 1;
        } 
        if (admin_detail_phone != "") {
            phone = 1;
        }

        res.json({email, phone})
    } catch (error) {
        console.log(error);
    }
})

router.post("/edit_driver_check", auth, async(req, res)=>{
    try {
        let email, phone;
        if (req.body.email_phone == "0" && req.body.email_id == "0" && req.body.phone_id == "0") {
            email = 0;
            phone = 0;
        } else {
            email = 0;
            phone = 0;
            let driver_detail, driver_detail_phone, admin_detail, admin_detail_phone;
            if (req.body.email_phone == "1") {

                driver_detail = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.body.data_email}'`)
                driver_detail_phone = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.body.data_phone}'`)
                admin_detail = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.data_email}'`)
                admin_detail_phone = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.phone}'`)

            }
            if (req.body.email_id == "1") {
                
                driver_detail = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.body.data_email}'`)
                admin_detail = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.data_email}'`)
                driver_detail_phone = "";
                admin_detail_phone = "";
            }
            if (req.body.phone_id == "1") {
                
                driver_detail = "";
                admin_detail = "";
                driver_detail_phone = await mySqlQury(`SELECT * FROM tbl_carrier WHERE email = '${req.body.data_phone}'`)
                admin_detail_phone = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.data_phone}'`)
            }
            
            if (driver_detail != "") {
                email = 1;
            } 
            if (admin_detail != "") {
                email = 1;
            }

            if (driver_detail_phone != "") {
                phone = 1;
            } 
            if (admin_detail_phone != "") {
                phone = 1;
            }
            
        }

        res.json({email, phone})
    } catch (error) {
        console.log(error);
    }
})


// =========== forget_password ============== //

router.get('/forget_password', frontend_lng, async(req, res) => {
    try {

        res.render('forget_password', {
            auth_data : '1', general_data: req.general[0], language: req.frontend_lang, lang: req.frontend_lan, social: req.social,
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/forget_pass/ajax/:id', async(req, res) => {
    try {
        let otp_result = '';
        let characters = '0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
            otp_result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        const all_general_settings = await mySqlQury(`SELECT * FROM tbl_general_settings`)
        const email_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE email = '${req.params.id}'`)

        if (email_data != "") {
            // =========== email ========== //
    
            let mailTransporter = nodemailer.createTransport({
                // host: 'smtp.ethereal.email',
                // port: 465,
                host: all_general_settings[0].email_host,
                port: all_general_settings[0].email_port,
                secure: true,
                service: 'gmail',
                auth: {
                    user: all_general_settings[0].email_id,
                    pass: all_general_settings[0].email_password
                }
            });
             
            let mailDetails = {
                from: all_general_settings[0].email_id,
                to: email_data[0].email,
                subject: 'Sign Up OTP',
                text: 'Your '+ all_general_settings[0].site_title +' otp is '+ otp_result +''
            };
            
            mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    console.log('Error Occurs');
                } else {
                    console.log('Email sent successfully');
                }
            });
    
            

            return res.json({data:otp_result})
        }

        const phone_data = await mySqlQury(`SELECT * FROM tbl_customer WHERE phone_no = '${req.params.id}'`)

        if (phone_data != "") {
            // ========= sms ============ //

            let auth_key = req.general[0].auth_key
            let template_id = req.general[0].otp_template_id

            let pho_no = phone_data[0].country_code + phone_data[0].phone_no
            const options = {
                method: 'POST',
                url: 'https://control.msg91.com/api/v5/otp?template_id='+ template_id +'&mobile='+ pho_no +'&otp=' + otp_result,
                headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  authkey: auth_key
                },
                data: {Param1: 'value1'}
            };
              
            axios
                .request(options)
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.error(error);
                });

            return res.json({data:otp_result})
        }


        res.json({data:'error'})
    } catch (error) {
        console.log(error);
    }
})

router.post('/forget_pass', async(req, res) => {
    try {
        const {user, password} = req.body

        const hash = await bcrypt.hash(password, 10)

        await mySqlQury(`UPDATE tbl_admin SET password = '${hash}' WHERE phone_no = '${user}'`)
        
        req.flash('success', `password update successfully`)
        res.redirect("/log_in")
    } catch (error) {
        console.log(error);
    }
})


// ================ log out =============== //

router.get("/logout", (req, res) => {
    res.clearCookie("jwt")

    res.redirect('/log_in');
});


module.exports = router