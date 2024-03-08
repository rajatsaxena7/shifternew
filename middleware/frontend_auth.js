const express = require('express');
const jwt = require('jsonwebtoken');
const Language = require("../public/language/languages.json")
const { mySqlQury } = require('../middleware/db');
const { json } = require('body-parser');

const frontend_auth = async(req, res, next) => {
    try{
        const langs = req.cookies.langs
        
        if (langs == undefined) {
            let data = Language.en
            req.frontend_lang = data
            let lang = {lang: "en"}
            req.frontend_lan = lang
            
        } else {
            const decode_lang = await jwt.verify(langs, process.env.TOKEN_KEY)
            req.frontend_lan = decode_lang

            if (decode_lang.lang == "en") {
                let data = Language.en
                req.frontend_lang = data
    
            } else if(decode_lang.lang == "in") {
                let data = Language.in
                req.frontend_lang = data
                
            } else if(decode_lang.lang == "de") {
                let data = Language.de
                req.frontend_lang = data
            
            } else if(decode_lang.lang == "pt") {
                let data = Language.pt
                req.frontend_lang = data
    
            } else if(decode_lang.lang == "es") {
                let data = Language.es
                req.frontend_lang = data
    
            } else if(decode_lang.lang == "fr") {
                let data = Language.fr
                req.frontend_lang = data
    
            } else if(decode_lang.lang == "cn") {
                let data = Language.cn
                req.frontend_lang = data
    
            } else if(decode_lang.lang == "ae") {
                let data = Language.ae
                req.frontend_lang = data
    
            }

        }

        const general_data = await mySqlQury(`SELECT * FROM tbl_general_settings`)
        req.general = general_data

        const notification_data = await mySqlQury(`SELECT * FROM tbl_notification ORDER BY id DESC LIMIT 10`)
        req.notification = notification_data

        const social_containt = await mySqlQury(`SELECT * FROM tbl_social_containt`)
        req.social = social_containt
        
        next();
    }catch(error){
        console.log(error);
        req.flash("errors", "You Are Not Authorized, Please Login First ...")
        return res.redirect("/log_in")
    }
}

module.exports = frontend_auth