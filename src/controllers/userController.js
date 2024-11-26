const { mssql, poolPromise } = require("../config/db");
const bcrypt = require('bcrypt');

const getCustomerAccounts = async (req, res)=>{
  try {
    const pool = await poolPromise;

    // Query to retrieve all customer accounts
    const result = await pool.request().query("SELECT * FROM accounts WHERE role = 'customer'");

    if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'No customer accounts found.' });
    }

    // Return the customer accounts as JSON
    res.status(200).json(result.recordset);
} catch (error) {
    console.error("Error fetching customer accounts", error);
    res.status(500).json({ message: 'Error fetching customer accounts', error: error.message });
}
}

const ViewCustomerAccountInformation = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT ui.*, a.*
        FROM user_info ui
        INNER JOIN accounts a ON ui.account_id = a.id  -- -- Hoặc nếu sử dụng account_id thì đổi lại
        WHERE a.role = 'customer'
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).send({ message: "Interval Error Server", error: error });
  }
};

const AddCustomerAccount = async (req, res) => {
    const {user_name, password ,role ,active_date } = req.body;

    try {
        const pool = await poolPromise;

        // Kiểm tra nếu email đã tồn tại
        const existingCustomer = await pool.request()
            .input('user_name', mssql.VarChar, user_name)
            .query('SELECT * FROM accounts WHERE user_name = @user_name;');

        if (existingCustomer.recordset.length > 0) {
            return res.status(400).json({ message: 'user_name already exists' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);  // Tạo salt
        const hashedPassword = await bcrypt.hash(password, salt);  // Mã hóa mật khẩu

        // Kiểm tra nếu mật khẩu đã được mã hóa thành công và không bị rỗng
        if (!hashedPassword || hashedPassword === '') {
            return res.status(400).json({ message: 'Password hashing failed' });
        }
        // Assuming `active_date` is coming as '24/11/2001'
        const formatDate = (dateStr) => {
          const parts = dateStr.split('/');
          return `${parts[2]}-${parts[1]}-${parts[0]}`;  // Converts to '2001-11-24'
        };

        const formattedDate = formatDate(active_date); // Now '2001-11-24'

        // Chèn khách hàng mới vào bảng [accounts]
        await pool.request()
            .input('user_name', mssql.VarChar, user_name)
            .input('password', mssql.VarChar, hashedPassword)  // Mã hóa mật khẩu trước khi chèn
            .input('role', mssql.VarChar, role)
            .input('active_date', mssql.Date, active_date,formattedDate)
            .query(`
                INSERT INTO accounts 
                (user_name, password, role, active_date) 
                VALUES 
                (@user_name, @password, @role, @active_date)
            `);

        res.status(201).json({ message: 'Customer added successfully' });
    } catch (error) {
        console.error("Error adding customer", error);
        res.status(500).json({ message: 'Error adding customer', error: error.message });
    }
};

const EditCustomerAccount = async (req, res) => {
  const { user_name, password, role, active_date } = req.body;
  const { account_id } = req.params; // Assuming you're passing the account ID in the URL parameter for editing

  try {
      const pool = await poolPromise; 

      // Check if the account exists with the provided account_id
      const existingAccount = await pool.request()
          .input('account_id', mssql.Int, account_id)
          .query('SELECT * FROM accounts WHERE id = @account_id;');

      if (existingAccount.recordset.length === 0) {
          return res.status(404).json({ message: 'Account not found' });
      }

      // If a new password is provided, hash it
      let hashedPassword = null;
      if (password) {
          const salt = await bcrypt.genSalt(10); // Create salt
          hashedPassword = await bcrypt.hash(password, salt); // Hash password

          // Check if password hashing is successful
          if (!hashedPassword || hashedPassword === '') {
              return res.status(400).json({ message: 'Password hashing failed' });
          }
      }

      // Format the active_date if provided (assuming the format is '24/11/2001')
      let formattedDate = null;
      if (active_date) {
          const formatDate = (dateStr) => {
              const parts = dateStr.split('/');
              return `${parts[2]}-${parts[1]}-${parts[0]}`; // Converts to '2001-11-24'
          };
          formattedDate = formatDate(active_date); // '2001-11-24'
      }

      // Update the account details in the database
      const query = `
          UPDATE accounts
          SET
              user_name = @user_name,
              ${password ? 'password = @password,' : ''}
              ${role ? 'role = @role,' : ''}
              ${active_date ? 'active_date = @active_date' : ''}
          WHERE id = @account_id;
      `;

      const request = pool.request()
          .input('user_name', mssql.VarChar, user_name)
          .input('account_id', mssql.Int, account_id);

      if (password) request.input('password', mssql.VarChar, hashedPassword);
      if (role) request.input('role', mssql.VarChar, role);
      if (active_date) request.input('active_date', mssql.Date, formattedDate);

      // Execute the update query
      await request.query(query);

      res.status(200).json({ message: 'Customer account updated successfully' });
  } catch (error) {
      console.error("Error updating customer", error);
      res.status(500).json({ message: 'Error updating customer account', error: error.message });
  }
};





















































const userControllers = {
    getCustomerAccounts,
    ViewCustomerAccountInformation,
    AddCustomerAccount,
    EditCustomerAccount
};
  module.exports = {
  userControllers,
};
