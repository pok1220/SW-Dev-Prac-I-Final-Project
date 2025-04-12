const express = require("express");
const {getUsers,getUser,putUser,deleteUser} = require('../controller/users')

const router = express.Router();
const {protect,authorize} = require('../middleware/auth')

router.route('/').get(getUsers);
router.route('/:id').get(getUser).put(protect,authorize('admin'),putUser).delete(protect,authorize('admin'),deleteUser);

module.exports = router;