const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const multer  = require('multer')
const { mySqlQury } = require('../middleware/db')



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)

    }
})

const upload = multer({storage : storage});


// ============ category =========== //

router.get('/category', auth, async(req, res) => {
    try {
        const category_list1 = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '1'`)
        const category_list2 = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '2' `)
        const category_list3 = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '3' `)
        
        res.render('category', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, category_list1, category_list2, category_list3
        })
    } catch (error) {
        console.log(error);
    }
})



router.post('/add_category', auth, upload.single('image'), async(req, res) => {
    try {
        const {name, status, category_nodule_id} = req.body
        const image = req.file.filename
        
        if (status == 'on') {
            await mySqlQury(`INSERT INTO tbl_category (name, image, status, module) VALUE ('${name}', '${image}', '${status}', '${category_nodule_id}')`)
        } else {
            await mySqlQury(`INSERT INTO tbl_category (name, image, status, module) VALUE ('${name}', '${image}', 'off', '${category_nodule_id}')`)
        }

        req.flash('success', 'category add successfully')
        res.redirect('/allcategory/category')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_category/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const { hidden_image, name, status} = req.body;

        let category_status;
        if (status == 'on') {
            category_status = 'on';
        } else {
            category_status = 'off';
        }

        if (hidden_image == 0) {
            await mySqlQury(`UPDATE tbl_category SET name = '${name}', status = '${category_status}' WHERE id = '${req.params.id}'`);
        } else {
            const image = req.file.filename;
            await mySqlQury(`UPDATE tbl_category SET image = '${image}', name = '${name}', status = '${category_status}' WHERE id = '${req.params.id}'`);
        }

        req.flash('success', 'category update successfully');
        res.redirect('/allcategory/category');
    } catch (error) {
        console.log(error);
    }
});
 

router.get('/delete_category/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_category WHERE id = '${req.params.id}'`)

        req.flash('success', 'data deleted successfully')
        res.redirect('/allcategory/category')
    } catch (error) {
        console.log(error);
    }
})


// =========== sub_category ============= //

router.get('/sub_category', auth, async(req, res) => {
    try {
        const category_list1 = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '1'`)
        const category_list2 = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '2'`)
        const category_list3 = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '3'`)

        const sub_category_list1 = await mySqlQury(`SELECT tbl_sub_category.*, (select tbl_category.name from tbl_category where tbl_sub_category.category_name = tbl_category.id) as c_name FROM tbl_sub_category WHERE module = '1' `)
        const sub_category_list2 = await mySqlQury(`SELECT tbl_sub_category.*, (select tbl_category.name from tbl_category where tbl_sub_category.category_name = tbl_category.id) as c_name FROM tbl_sub_category WHERE module = '2' `)
        const sub_category_list3 = await mySqlQury(`SELECT tbl_sub_category.*, (select tbl_category.name from tbl_category where tbl_sub_category.category_name = tbl_category.id) as c_name FROM tbl_sub_category WHERE module = '3' `)
        
        res.render('sub_category', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, category_list1, category_list2, category_list3, sub_category_list1, sub_category_list2, sub_category_list3
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/category/ajax', auth, async(req, res) => {
    try {
        const category_list = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '${req.body.modellist}'`)

        res.json({category_list})
    } catch (error) {
        console.log(error);
    }
})



router.post('/add_subcategory', auth, upload.single('image'), async(req, res) => {
    try {
        const {category_name, name, status, sub_category_nodule_id} = req.body
        console.log(req.body);

        if (status == 'on') {
            await mySqlQury(`INSERT INTO tbl_sub_category (image, category_name, name, status, module) VALUE ('${req.file.filename}', '${category_name}', '${name}', 'on', '${sub_category_nodule_id}')`)
        } else {
            await mySqlQury(`INSERT INTO tbl_sub_category (image, category_name, name, status, module) VALUE ('${req.file.filename}', '${category_name}', '${name}', 'off', '${sub_category_nodule_id}')`)
        }

        req.flash('success', 'sub category add successfully')
        res.redirect('/allcategory/sub_category')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_subcategory/:id', auth, upload.single('image'), async(req, res) => {
    try {
        const {hidden_image, category_name, name, status} = req.body
       let category_status;
        if (status == 'on') {
            category_status = 'on'
        } else {
             category_status = 'off'
        }

        if (hidden_image == 0) {
            await mySqlQury(`UPDATE tbl_sub_category SET category_name = '${category_name}', name = '${name}', status = '${category_status}' WHERE id = '${req.params.id}'`)
        } else {
            const image = req.file.filename
            await mySqlQury(`UPDATE tbl_sub_category SET image = '${image}', category_name = '${category_name}', name = '${name}', status = '${category_status}' WHERE id = '${req.params.id}'`)
        }

        req.flash('success', 'sub category update successfully')
        res.redirect('/allcategory/sub_category')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_subcategory/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_sub_category WHERE id = '${req.params.id}'`)

        req.flash('success', 'sub category deleted successfully')
        res.redirect('/allcategory/sub_category')
    } catch (error) {
        console.log(error);
    }
})


module.exports = router