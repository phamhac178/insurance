const express = require("express")
const {userControllers} = require("../controllers/userController")
const router = express.Router();
router.get("/getCustomerAccounts", userControllers.getCustomerAccounts)
router.get("/ViewCustomerAccountInformation", userControllers.ViewCustomerAccountInformation)
router.post("/addCustomerAccount", userControllers.AddCustomerAccount)
router.put("/EditCustomerAccount/:account_id", userControllers.EditCustomerAccount)
module.exports = router